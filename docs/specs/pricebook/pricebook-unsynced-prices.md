# Price Book – Unsynced Price Guardrails

> Related architecture:
> - [Domain – Orders & Pricing Integration](../../architecture/domain-orders-pricing.md)
> - [Domain – Price Agreements](../../architecture/domain-price-agreements.md)

*Prevents unsynced prices from reaching Stripe checkout while preserving draft flexibility for Support.*

---

## 0) Core rules

1. Draft orders can reference any price (even unsynced) so Support can prepare quotes quickly.
2. Checkout (or invoice finalization) requires every line item to map to a Stripe-synced price.
3. Resolver runs in **strict** mode during checkout; if a candidate lacks `stripePriceId` or `syncStatus!='SYNCED'`, checkout is blocked with actionable errors.
4. Operators receive clear UI guidance and links back to Price Book to resolve sync gaps.

---

## 1) Schema deltas

Fields already defined on `PriceBookEntry` and `PriceAgreement`:

* `syncStatus: 'UNSYNCED' | 'SYNCED' | 'FAILED'`
* `stripePriceId`, `lastSyncedAt`, `lastSyncError`

Additional attributes required for enforcement:

* `Product` derived `syncStatus` (aggregated; used for table filters).
* `Order` table (if exists) adds boolean `hasUnsyncedLines` flag for quick filtering in Support UI (maintained by checkout validation job).
* `OrderAuditEvent` type `UNSYNCED_PRICE_BLOCK` capturing the payload returned from checkout attempt.

---

## 2) Resolver changes

Update `PricingResolverService` (see `pricebook-extended.md`):

* Accept `strictStripe` boolean per item (defaults false).
* `passesStripeGuard` ensures candidate has `stripePriceId` and `syncStatus='SYNCED'` when strict mode is true.
* Return structure includes `syncStatus` so callers can pre-render warnings even in non-strict mode.

Example return payload in draft mode:

```json
{
  "productId": "prod_123",
  "unitAmount": 8900,
  "source": "AGREEMENT",
  "priceAgreementId": "pagmt_1",
  "stripePriceId": null,
  "syncStatus": "UNSYNCED"
}
```

Example failure response in strict mode:

```json
{
  "ok": false,
  "reason": "UNSYNCED",
  "lines": [
    {
      "productId": "prod_123",
      "source": "AGREEMENT",
      "id": "pagmt_1",
      "currency": "USD",
      "region": "US",
      "syncStatus": "UNSYNCED"
    }
  ]
}
```

---

## 3) API adjustments

### 3.1 Pricing quote (`POST /v1/pricing/quote`)

* Accepts `strictStripe` at request level (default `false`).
* Returns `syncStatus` and `stripePriceId` for each line.
* Emits metric `price_quote_unsynced_lines_total` when unsynced lines returned in non-strict mode.

### 3.2 Checkout (`POST /v1/orders/:id/checkout`)

* Server re-fetches current order lines, calls resolver with `strictStripe=true`.
* If any line fails guard, respond `422` with payload:

```json
{
  "code": "UNSYNCED_PRICES",
  "message": "Some prices must be synced to Stripe before checkout.",
  "lines": [
    {
      "orderItemId": "oi_123",
      "productId": "prod_123",
      "source": "AGREEMENT",
      "priceId": "pagmt_1",
      "currency": "USD",
      "region": "US"
    }
  ]
}
```

* Server logs event (`OrderAuditEvent`) and updates `orders.hasUnsyncedLines=true` so Support dashboards can filter.
* If resolver passes, proceed with Stripe checkout/invoice creation, ensuring each line uses provided `stripePriceId`.

### 3.3 Optional just-in-time (JIT) sync

* Feature flag `ALLOW_JIT_STRIPE_PRICE` (default `false`).
* When enabled, checkout may attempt to create Stripe prices on the fly for unsynced candidates, logging `JIT_SYNC` events. Even with JIT, we should prefer explicit sync to keep Finance informed.

---

## 4) Front-end behaviour (Back Office UI)

* **New order wizard**: uses `strictStripe=false`. Line items display badge `Company price – Unsynced` or `Global price – Synced`. Provide tooltip “Sync to Stripe before checkout”.
* **Order detail page**: shows status chip `Unsynced price` when `hasUnsyncedLines=true`. Clicking opens drawer listing affected lines with links to Price Book (prefill filters via query params `productId`, `companyId`, `currency`, `region`).
* **Checkout attempt**: if API returns `UNSYNCED_PRICES`, show inline banner with table of offending lines and CTA `Open Price Book` (new tab) plus secondary `Retry Checkout` button disabled until user confirms sync completion.
* **Price Book index**: include filter `Unsynced` (aggregates agreements + price entries). Global banner summarises “3 prices need Stripe sync before checkout.”
* **Toast**: after successful sync, order detail auto refreshes (React Query invalidate) and removes unsynced badge.

---

## 5) Background tasks & notifications

* Nightly job `orders-unsynced-audit`: scans draft orders older than N days with unsynced lines, posts Slack summary to Support channel.
* Optional cron `pricebook-unsynced-reminder`: emails Finance weekly with list of unsynced agreements/prices affecting active deals.
* Metrics: `orders_checkout_blocked_unsynced_total`, `orders_with_unsynced_lines_gauge`.

---

## 6) Testing & QA

* Resolver unit tests covering strict vs non-strict outputs.
* API integration tests verifying checkout 422 payload and order flagging.
* UI e2e test (Playwright) simulating unsynced price scenario: create product, create price, attempt checkout, sync price, retry.
* Regression test ensuring bespoke (ORDER scope) overrides bypass Stripe requirement but still require note; checkout uses direct amount (no Stripe price) only when invoice path (if allowed by policy).

---

## 7) Rollout plan

1. Introduce resolver changes and API responses behind feature flag `ENFORCE_STRIPE_SYNC=false`.
2. Ship UI indicators (badges, banner) so Support sees unsynced state early.
3. Enable flag in staging; run smoke tests with Finance to ensure flows understood.
4. Communicate cutoff date; turn on enforcement in production (set flag true).
5. Monitor metrics/alerts for first week; provide on-call playbook for clearing stuck syncs.

Once enforcement is live, no unsynced price can reach Stripe checkout, preserving data integrity for Finance and ensuring compliance.
