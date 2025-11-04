# Extended Documentation Suite – Sensor Hardware Orders

This suite adds every supporting doc needed for developers and designers to implement and maintain the Sensor Hardware Order UI & workflow system efficiently.

---

## 1. UX Interaction Rules & Copy Tone

### 1.1 Interaction Tempo

* Inline autosave for small edits (notes, quantities).
* Explicit commit buttons (`Save`, `Mark Ready`, `Ship`) for state changes.
* Animations <200 ms; keep focus state visible after action.

### 1.2 Drawer vs. Modal

* **Drawer**: complex edit flows (shipment builder, automation forms).
* **Modal**: confirmations, single-field edits, warnings.

### 1.3 Validation & Feedback

* Inline validation on blur; toast success on save.
* Show skeleton loaders for async content >300 ms.
* Always reflect backend truth after save (no silent optimistic errors).

### 1.4 Timelines

* Courier events → neutral gray icons.
* Business events → brand color icons.
* Sort newest first, show relative time (“2 h ago”).

### 1.5 Tone of Voice

* Confident, calm, succinct.
* Verb-based CTAs: `Ship`, `Deliver`, `Assign`.
* Neutral messages: “Shipment delivered successfully.”
* Avoid humor; focus on clarity.

### 1.6 Empty & Error States

* Always include illustration/icon + 1‑line explanation + CTA.
  Example: “No shipments yet. Create your first shipment.”

---

## 2. Frontend Architecture & Folder Structure

```
/app
  /support/orders
  /ops/fulfillment
/components
  /ui           # buttons, chips, modals
  /domain       # OrderCard, ShipmentForm, AutomationFormset
  /layout       # Sidebar, Header, PageHeader
/lib
  /api          # axios or fetch wrappers
  /hooks        # useOrders, useFulfillment, useTracking
/styles         # tailwind tokens, global.css
/types          # shared TS interfaces
```

**Guidelines**

* One component per file; export default.
* Components receive data via props; data fetching via hooks in `/lib/hooks`.
* Shared state uses React Query; each feature defines its query keys.

---

## 3. State & Event Architecture

### 3.1 Event Flow

```
Order Created → Payment Received → FulfillmentOrder Created
   → Shipment Drafted → Shipment Ready → Shipment In Transit
   → Shipment Delivered → Automation Steps Execute → Fulfillment Completed
```

### 3.2 Event Sources

| Event           | Producer             | Consumer                       |
| --------------- | -------------------- | ------------------------------ |
| Payment         | Stripe webhook       | Order API / UI refresh         |
| Shipment status | Courier webhook/poll | Fulfillment & UI timeline      |
| Automation      | Worker task          | Fulfillment status + event log |

### 3.3 State Change Rules

* Orders auto-create FulfillmentOrder on `paid`.
* Fulfillment becomes `awaiting_shipment` when any shipment = ready.
* `in_transit` when a shipment ships; `completed` when all delivered & automation done.

---

## 4. API Reference Summary

### 4.1 Orders

`GET /api/orders` – list
`GET /api/orders/:id` – full details (includes shipments)
`POST /api/orders` – create draft
`PATCH /api/orders/:id` – update status

### 4.2 Fulfillment Orders

`GET /api/fulfillments`
`GET /api/fulfillments/:id`
`PATCH /api/fulfillments/:id` (status transitions)

### 4.3 Shipments

`POST /api/shipments` create
`PATCH /api/shipments/:id` update status/tracking
`GET /api/shipments/:id`

### 4.4 Automation Steps

`POST /api/automation`
`GET /api/automation/:shipment_item_id`

**Common errors**: 400 invalid field, 404 not found, 409 invalid transition, 500 internal.

---

## 5. Design QA & Accessibility Checklist

| Area           | Check                                     |
| -------------- | ----------------------------------------- |
| Layout         | Uses 8 px grid, consistent padding/radius |
| Color          | Chips use defined token palette           |
| Contrast       | AA compliant (≥4.5:1)                     |
| Focus          | Visible 2 px ring primary‑400             |
| Copy           | Sentence case, verb first                 |
| Keyboard       | Tab order logical, drawers trap focus     |
| Responsiveness | Works ≥768 px; collapses sidebar <1024 px |
| Loading        | Skeletons >300 ms delay                   |
| Empty/Error    | Each view has fallback with CTA           |

---

## 6. Developer Onboarding & Mock Data

### 6.1 Quick Start

```
git clone <repo>
cd apps/backoffice-support
npm i
npm run dev
```

.env:

```
NEXT_PUBLIC_API_BASE=https://staging.api
```

### 6.2 Mock Data Seeds

`/mock/orders.json`, `/mock/fulfillments.json`, `/mock/shipments.json` – shape matches API spec.

### 6.3 API Mocks (MSW)

* Mock handlers return data from `/mock` folder.
* Enables UI dev without backend.

### 6.4 Screenshots Map

Provide Figma export with labeled screens (support dashboard, order detail, ops board, shipment builder).

---

## 7. Metrics & Monitoring Plan

| Metric                   | Description                                | Source            |
| ------------------------ | ------------------------------------------ | ----------------- |
| Orders created           | count per day                              | backend analytics |
| Paid → Shipped lead time | avg hours                                  | event timestamps  |
| Shipped → Delivered      | avg hours                                  | courier webhooks  |
| Automation success rate  | #success / #attempts                       | worker logs       |
| SLA violations           | shipments delivered after 5/10 day targets | ops dashboard     |
| Webhook errors           | failed courier events                      | logs + alert      |

**Visualization**: Grafana/Metabase dashboards; alerts via Slack.

---

## 8. Architectural Decision Records (ADRs)

**ADR‑001 Order‑Centric Domain** – all business interactions modeled as Orders with typed items.
**ADR‑002 Fulfillment Automation Layer** – automation attached per shipment item to isolate logistics from business logic.
**ADR‑003 Stripe Checkout Integration** – synchronous checkout flow, webhooks update payment status.
**ADR‑004 Courier Tracking Architecture** – webhooks + periodic poller, updates FulfillmentShipment.last_tracked_at.
**ADR‑005 Frontend Stack Choice** – Next.js + Tailwind + shadcn for fast delivery and unified design tokens.

---

## 9. Implementation Order (for PM)

1. Build shared token library (colors, typography, spacing).
2. Scaffold Support and Ops dashboards.
3. Implement API fetch hooks.
4. Add Shipment Builder & Automation Formset.
5. Integrate timelines and courier tracking.
6. QA & accessibility pass.
7. Metrics instrumentation.

---

## 10. File Deliverables Summary

| File                                          | Purpose                             |
| --------------------------------------------- | ----------------------------------- |
| `Sensor Hardware Orders – Product UI Spec.md` | Core design & component spec        |
| `UX Interaction Rules & Copy Tone.md`         | Micro-interaction & language guide  |
| `Frontend Architecture.md`                    | Folder structure + code conventions |
| `State & Event Architecture.md`               | Lifecycle diagrams + rules          |
| `API Reference.md`                            | Endpoint list + payload shapes      |
| `UI QA & Accessibility Checklist.md`          | Verification before merge           |
| `Onboarding & Mock Data.md`                   | Setup + seeds for devs              |
| `Metrics & Monitoring.md`                     | Ops visibility plan                 |
| `ADRs/ADR-001..005.md`                        | Design rationale archive            |

---

**End of Extended Documentation Suite** — this set ensures the team can start implementation, testing, and maintenance with no ambiguity.
