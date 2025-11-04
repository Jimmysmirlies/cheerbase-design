Totally—here’s the updated plan answering your four bullets, and a tight **MyDHL (DHL Express) integration doc** you can hand to your devs.

---

# Answers to your 4 questions (updated for **MyDHL API**)

## 1) USPS (Tracking Subscriptions v3.2)

* **Webhook JSON shape:** USPS states **Subscriptions – Tracking 3.2** notifications “follow the modernized Tracking API response” (same fields as a Tracking v3.2 GET). v3.2 also introduces **Scan Event Extract** for MID-based subs (extra attributes). In practice you’ll receive a top-level tracking record plus an array of scan events (codes/descriptions/timestamps/location). ([developers.usps.com][1])
* **Signing:** USPS’s public docs for Subscriptions (3.0/3.2) don’t publish an HMAC signature header; the catalog emphasizes HTTPS and a listener URL you register. Plan to secure your endpoint yourself (e.g., shared bearer in header + secret path + IP/User-Agent logging). If your portal tenant exposes additional signing, use it—otherwise assume **no carrier signature**. ([developers.usps.com][1])
* **Payload drift:** USPS surfaces the same data through multiple legacy paths (`TrackResponse.TrackInfo`, “scan event extract,” postage-provider relays). Field casing and nesting are inconsistent (`trackingNumber` vs `TrackID`, `eventCode` vs `EventCode`, arrays vs single objects). Our adapter therefore probes several key variants before normalising into `NormalisedTrackingEvent`. Tests cover the permutations we have captured so far—add new examples here as they appear.
* **Local replay:** Run `pnpm tracking:replay-usps` to post the sample payload in `scripts/fixtures/usps/sample-webhook.json` against your local API. Set `USPS_WEBHOOK_SECRET`/`USPS_WEBHOOK_URL` env vars to override defaults.

## 2) DHL — which stack?

* Your account is **MyDHL API (DHL Express)** → use **DHL Express – MyDHL API** for labels/rates/pickups. For **tracking**, the cleanest path is **DHL Shipment Tracking – Unified** (same carrier family, API-Key auth) and optionally **Unified Push** for webhooks. (MyDHL REST docs focus on shipping flows; Unified is the official cross-division tracking surface). ([DHL Developer Portal][2])

## 3) Canada Post (XML + bilingual)

* **Yes, XML.** Map: `pin`, `expected-delivery-date`, service names (`service-name`, `service-name-2`), and each event under `significant-events/occurrence` (`event-identifier`, `event-date`, `event-time`, `event-description`, `event-site`, `event-province`, `signatory-name?`).
* Use `Accept-Language: en-CA|fr-CA` for the UI language, but persist **both** service names so you can localize later without refetching.

## 4) Chit Chats (polling only)

* **No documented webhooks.** Poll either the **public JSON** endpoint (`/tracking/<shipment_id>.json`) for lightweight reads or their private shipments API if you’re also creating labels.
* **Rate limit:** **2,000 requests / 5 minutes** (HTTP 429 + `Retry-After`). Use a rolling queue (token-bucket/backoff), batch IDs where possible, and increase cadence only for parcels nearing delivery.

---

# Integration doc — **DHL Express (MyDHL API) + Tracking via Unified**

## Credentials & environments

* **MyDHL (Express) REST**

  * **API Key** and **API Secret** (issued in MyDHL portal under *DHL EXPRESS – MyDHL API*). Auth is **HTTP Basic** using `base64(API_KEY:API_SECRET)` in the `Authorization` header. ([API Support][3])
  * **Base URLs (REST):**

    * **Test:** `https://express.api.dhl.com/mydhlapi/test`
    * **Prod:** `https://express.api.dhl.com/mydhlapi` ([DHL Developer Portal][4])
* **DHL Shipment Tracking – Unified** (for tracking + optional push)

  * **API Key** (header: `DHL-API-Key: <key>`).
  * **Base:** `https://api-eu.dhl.com/track/shipments` (+ query params like `trackingNumber=`; some shipments need `service=ecommerce|express`).
  * **Unified Push** for webhooks (subscribe to tracking events). ([DHL Developer Portal][2])

## Auth examples

**MyDHL REST (Basic):**

```
Authorization: Basic <base64(API_KEY:API_SECRET)>
Accept: application/json
Content-Type: application/json
```

(Per DHL support article for MyDHL Express). ([API Support][3])

**DHL Unified Tracking (API Key):**

```
DHL-API-Key: <YOUR_UNIFIED_API_KEY>
Accept: application/json
```

([DHL Developer Portal][2])

## Core endpoints you’ll use

* **Labels / Shipments (MyDHL):** create, retrieve shipment labels, docs, pickups (all under the MyDHL base above; exact paths are in the portal spec). Use **MyDHL** for anything “shipping.” ([DHL Developer Portal][4])
* **Tracking (Unified):**
  `GET /track/shipments?trackingNumber=<AWB>&service=express` → JSON status + events.
  **Webhooks:** use **Unified Push** to receive delivery events to your HTTPS listener. ([DHL Developer Portal][2])

> Why split? You already have **MyDHL** credentials for shipping. DHL’s **Unified** APIs are the canonical tracking layer across Express/eCommerce/Parcel and provide **Push**; this keeps your tracking pipeline consistent and future-proof.

## Webhooks (Unified Push)

* **Subscribe** in Unified Push (per doc) to get delivery, routing, and scan events. You’ll register your HTTPS URL; events POST as JSON. (Keep your own shared secret and verify headers you configure; DHL docs do not specify HMAC by default.) ([DHL Developer Portal][5])

## Polling fallback (if you don’t enable Push right away)

* Poll `GET /track/shipments?trackingNumber=<AWB>&service=express`
* Implement **429 + `Retry-After`** backoff; cache last event timestamp to avoid duplicate processing. (DHL support notes sensible limits and the expectation you don’t hammer a single shipment—“~10 fetches per shipment per day” guidance.) ([API Support][6])

## Data you should store (MyDHL + Unified)

```json
{
  "carrier": "dhl_express",
  "mydhl": {
    "environment": "test|prod",
    "api_key": "…",
    "api_secret": "…"
  },
  "unified_tracking": {
    "api_key": "…",
    "webhook": {
      "listener_url": "https://your.app/webhooks/dhl",
      "secret": "shared-secret-you-verify",
      "subscription_id": "…"
    }
  },
  "defaults": {
    "locale": "en-US",
    "timezone": "America/Toronto"
  }
}
```

## Normalized tracking model (works for USPS / DHL / CPC / Chit Chats)

```json
{
  "carrier": "dhl_express",
  "tracking_number": "JD014600003838282828",
  "status": "delivered|out_for_delivery|in_transit|exception|info_received",
  "status_code": "DELIVERED",
  "summary": "Delivered - Signed for by SMITH",
  "estimated_delivery": "2025-10-28",
  "delivered_at": "2025-10-26T13:42:00-04:00",
  "events": [
    {
      "code": "DELIVERED",
      "description": "Delivered",
      "timestamp": "2025-10-26T13:42:00-04:00",
      "location": { "city": "Toronto", "province": "ON", "country": "CA" },
      "signed_by": "SMITH"
    }
  ],
  "source": "push|poll",
  "last_polled_at": "2025-10-26T14:00:00Z"
}
```

## Minimal job plan

* **Push-first:** Enable **Unified Push** → upsert events by `trackingNumber` (idempotency on `(trackingNumber, eventTime, code)`), stop tracking on terminal states. ([DHL Developer Portal][5])
* **Poll fallback:**

  * New shipments: poll **daily** until first scan.
  * In-transit: every **6–12h**.
  * “Out for delivery”: **hourly** until terminal.
  * Backoff on 429/5xx; respect `Retry-After`. ([API Support][6])

## Quick test checklist (Express labels + Unified tracking)

1. **Create label** in **MyDHL test**; capture the AWB from the response. ([DHL Developer Portal][4])
2. **Track** the same AWB via **Unified** `GET /track/shipments?trackingNumber=&service=express`. ([DHL Developer Portal][2])
3. **(Optional)** Subscribe webhook in **Unified Push**; confirm your listener receives JSON and your auth guard passes. ([DHL Developer Portal][5])

---

# Copy-paste references

* **DHL Express – MyDHL API (REST overview & base URLs)** (Basic auth; shipping flows): ([DHL Developer Portal][4])
* **How to authorize MyDHL API calls (Basic header format)**: ([API Support][3])
* **DHL Shipment Tracking – Unified (GET)**: ([DHL Developer Portal][2])
* **Unified Push (webhooks)**: ([DHL Developer Portal][5])
* **USPS Subscriptions – Tracking 3.2** (payload follows modernized Tracking response): ([developers.usps.com][1])
* **Canada Post tracking (XML, fields & headers)**:
* **Chit Chats API (public JSON + limits)**:

---

If you want, I’ll drop **Express/FastAPI code stubs** next:

* USPS v3.2 webhook listener (Bearer guard + idempotency)
* DHL Unified Push listener
* Canada Post XML → normalized JSON mapper
* Chit Chats polling worker with token-bucket scheduler

[1]: https://developers.usps.com/apis?page=1&utm_source=chatgpt.com "API Catalog | devportal"
[2]: https://developer.dhl.com/api-reference/shipment-tracking?language_content_entity=en&utm_source=chatgpt.com "Shipment Tracking - Unified"
[3]: https://support-developer.dhl.com/support/solutions/articles/47001224429-how-to-authorize-a-mydhl-express-api-call-using-the-api-key-on-postman-?utm_source=chatgpt.com "How to authorize a MyDHL Express API call using the API key ..."
[4]: https://developer.dhl.com/api-reference/dhl-express-mydhl-api?language_content_entity=en&utm_source=chatgpt.com "DHL Express - MyDHL API"
[5]: https://developer.dhl.com/api-reference/shipment-tracking-unified-push?language_content_entity=en&utm_source=chatgpt.com "Shipment Tracking - Unified - Push"
[6]: https://support-developer.dhl.com/support/solutions/articles/47001248773-how-many-calls-per-day-may-i-receive-when-making-an-upgrade-rate-limit-request-?utm_source=chatgpt.com "How many calls per day may I receive when making an ..."
