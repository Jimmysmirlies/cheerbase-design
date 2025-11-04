# Sensor Hardware Orders – Product UI Spec

*A complete, implementation‑ready plan covering design tokens, status semantics, screens, navigation, data contracts, and reusable components.*

---

## 0) Personas & Principles

* **Support** (frontline): creates Sensor Hardware Orders, sends checkout/invoices, monitors status at a narrative level. Read‑only on shipments & automation.
* **Operations** (warehouse/ops): prepares shipments, allocates quantities, attaches automation steps, updates tracking.
* **Finance/Admin** (secondary): price governance, reconciliation, reporting.

**Principles**: Process‑centric (not CRUD), low cognitive load, strong affordances, visible state & history, safe/undoable actions, auditability.

---

## 1) Design Tokens (Foundations)

### 1.1 Color Palette (with roles)

**Brand / Primary**

* `--color-primary-50:  #eef2ff`
* `--color-primary-100: #e0e7ff`
* `--color-primary-200: #c7d2fe`
* `--color-primary-300: #a5b4fc`
* `--color-primary-400: #818cf8`
* `--color-primary-500: #6366f1` *(primary default)*
* `--color-primary-600: #4f46e5`
* `--color-primary-700: #4338ca`
* `--color-primary-800: #3730a3`
* `--color-primary-900: #312e81`

**Accent / Action (payments)**

* `--color-accent-50:  #fef3c7`
* `--color-accent-100: #fde68a`
* `--color-accent-200: #fcd34d`
* `--color-accent-400: #f59e0b`
* `--color-accent-500: #d97706` *(warning/attention)*

**Success**

* `--color-success-50:  #ecfdf5`
* `--color-success-400: #34d399`
* `--color-success-500: #10b981`
* `--color-success-600: #059669`

**Info**

* `--color-info-50:  #eff6ff`
* `--color-info-400: #60a5fa`
* `--color-info-500: #3b82f6`
* `--color-info-600: #2563eb`

**Warning**

* `--color-warn-50:  #fffbeb`
* `--color-warn-400: #fbbf24`
* `--color-warn-500: #f59e0b`
* `--color-warn-600: #d97706`

**Danger**

* `--color-danger-50:  #fef2f2`
* `--color-danger-400: #f87171`
* `--color-danger-500: #ef4444`
* `--color-danger-600: #dc2626`

**Neutrals** (UI backgrounds, borders, text)

* `--gray-50:  #f9fafb`
* `--gray-100: #f3f4f6`
* `--gray-200: #e5e7eb`
* `--gray-300: #d1d5db`
* `--gray-400: #9ca3af`
* `--gray-500: #6b7280`
* `--gray-600: #4b5563`
* `--gray-700: #374151`
* `--gray-800: #1f2937`
* `--gray-900: #111827`

**Semantic Mappings** (high level)

* Primary actions: `--color-primary-600`
* Pay/Checkout CTA: `--color-info-600`
* Awaiting/Attention states: `--color-warn-500`
* Success/Delivered: `--color-success-600`
* Error/Blocked: `--color-danger-600`
* Cards/bg: `--gray-50` / borders: `--gray-200`

### 1.2 Typography

* Font family: `Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
* Scale (rem): `12, 14, 16, 18, 20, 24, 30`

  * `Display` 30/36, `H1` 24/32, `H2` 20/28, `H3` 18/24
  * `Body` 16/24 (default), `Secondary` 14/20, `Caption` 12/16
* Weights: 600 (headings), 500 (labels/buttons), 400 (body)

### 1.3 Spacing, Sizing & Radius

* Spacing scale (px): `4, 8, 12, 16, 20, 24, 32, 40`
* Container widths: `sm 640, md 768, lg 1024, xl 1280`
* Radii: `sm 6px, md 10px, lg 14px, pill = full`
* Shadows: `xs 0 1px 2px rgba(0,0,0,.04)`, `sm 0 2px 6px rgba(0,0,0,.06)`, `md 0 6px 16px rgba(0,0,0,.08)`

### 1.4 Iconography

* Lucide or Heroicons; consistent stroke 1.5px; status chips include icon + label.

### 1.5 Density & States

* Hover raises shadow one step; focus ring `2px` using `--color-primary-400` on light bg.
* Disabled opacity `.45`; Loading uses spinner at text color.

---

## 2) Status Chip Semantics

### 2.1 Orders

| Status             | Chip color                      | Icon         | Notes                                        |
| ------------------ | ------------------------------- | ------------ | -------------------------------------------- |
| draft              | gray‑300 border / gray‑600 text | file         | not visible to Ops board                     |
| pending_approval   | warn‑400                        | shield‑alert | optional flow                                |
| pending_payment    | warn‑500                        | credit‑card  | Support action: send checkout                |
| payment_processing | info‑400 (striped)              | loader       | read‑only                                    |
| paid               | info‑600                        | badge‑check  | triggers FulfillmentOrder (ready_to_prepare) |
| failed             | danger‑600                      | x‑circle     | retry payment                                |

### 2.2 Fulfillment Orders

| Status            | Chip color  | Icon         | Transition from                          |
| ----------------- | ----------- | ------------ | ---------------------------------------- |
| ready_to_prepare  | primary‑600 | boxes        | created at payment                       |
| awaiting_shipment | info‑600    | truck        | at least one shipment ready              |
| in_transit        | info‑600    | truck        | when any shipment ships                  |
| completed         | success‑600 | check‑circle | all shipments delivered, automation done |
| cancelled         | gray‑400    | slash        | admin only                               |

### 2.3 Shipments

| Status     | Chip color  | Icon          | Data event                  |
| ---------- | ----------- | ------------- | --------------------------- |
| draft      | gray‑400    | pencil        | hidden from Support         |
| ready      | primary‑600 | package‑check | after validation            |
| in_transit | info‑600    | truck         | courier event/label created |
| delivered  | success‑600 | check         | webhook or manual confirm   |
| cancelled  | gray‑400    | slash         | —                           |

---

## 3) Information Architecture (Routes, Links, Data)

### 3.1 Support

1. **Sensor Hardware Orders Dashboard**
   **Route**: `/support/orders`
   **Data**: order id, company, created_at, total, payment status, fulfillment status, progress %, counts (#shipments).
   **Actions**: Create Order, Send Checkout, View Details.
   **Links**: → Order Detail.

2. **Create Order Wizard**
   **Route**: `/support/orders/new`
   **Steps**: Company, Items (formset), Review, Send Checkout.
   **Data**: company, items (product_id, qty, unit_price), taxes, total.
   **Actions**: save draft, send checkout.

3. **Order Detail / Timeline**
   **Route**: `/support/orders/:id`
   **Sections**: Header (chips), Timeline (business + courier), Items table (qty/fulfilled), Fulfillment summary (cards per shipment), Notes thread.
   **Actions**: Send/Copy checkout, Mark invoiced (optional), Open in Ops.
   **Links**: → Fulfillment Detail (ops view, read‑only for Support).

### 3.2 Operations

4. **Fulfillment Pipeline Board**
   **Route**: `/ops/fulfillment`
   **Columns**: Ready to Prepare, Awaiting Shipment, In Transit, Completed.
   **Card**: company, order ref, remaining qty, deadlines, last event.
   **Action**: Open Fulfillment.

5. **Fulfillment Detail / Shipment Builder**
   **Route**: `/ops/fulfillment/:id`
   **Left**: order summary (items w/ remaining).
   **Right**: Shipment form + shipment items grid + Automation Steps accordion.
   **Actions**: Save draft, Mark ready, Mark shipped, Add scenario, Allocate quantities.
   **Links**: → Shipment detail (optional deep link).

6. **Shipment Detail (optional page; drawer is primary)**
   **Route**: `/ops/shipments/:id`
   **Sections**: address/courier, tracking, shipment items, automation steps, timelines.
   **Actions**: edit, set delivered.

7. **Tracking & Returns Dashboard**
   **Route**: `/ops/tracking`
   **Data**: shipments in flight, late deliveries, pending returns, SLA timers.
   **Links**: shipment/order.

### 3.3 Admin/Settings (phaseable)

8. **Price Book Manager** `/settings/pricing`
9. **Company Address Book** `/settings/addresses`
10. **Courier Config & Webhooks** `/settings/shipping`
11. **Products Catalog** `/settings/products`
12. **Users & Permissions** `/settings/access`

---

## 4) Screen Blueprints (Data + Components)

> Each blueprint lists primary components and expected data shape.

### 4.0 App Shell & Navigation (NEW)

* **AppShell** layout with persistent **Sidebar** (left) and **Topbar** (top).
* **Sidebar groups**: Support, Operations, Reports, Settings. Active route highlighted; badges for counts (e.g., in‑transit shipments).
* **Topbar**: product name, environment badge (Staging/Prod), search, user menu.
* **Breadcrumbs** under Topbar: e.g., `Support / Sensor Hardware Orders / Order #12345`.
* **Responsive**: sidebar collapses to rail (<1280px), turns into overlay drawer on mobile.

**Components used**: `AppShell`, `Sidebar`, `Topbar`, `Breadcrumbs`.

**Routes wired**:

```
/app/layout.tsx         → renders <AppShell>
/app/support/orders/*   → inside Support group
/app/ops/fulfillment/*  → inside Operations group
```

### 4.1 Support – Dashboard

* **Header**: `PageHeader(title, actions=[NewOrder])`
* **Filters**: `FilterChips` for payment + fulfillment states
* **List**: `OrderCardList` → card props: `{id, company{name, contact}, created_at, total_cents, payment_status, fulfillment_status, progress, shipments_count}`
* **Empty State**: `IllustratedEmpty` with CTA New Order

### 4.2 Support – Create Order Wizard (COMPLETED SPEC)

**Route**: `/support/orders/new`
**Steps (wizard with progress):**

1. **Company** — `CompanyPicker`; **required** company, contact; optional PO/reference.
2. **Items** — `DynamicFormset` rows `{product_id, product_name, qty, unit_price_cents}`; inline row subtotal; running total; **validation**: qty ≥1; price snapshot required.
3. **Review** — `SummaryCard` (items, taxes, shipping fee optional), terms checkbox.
4. **Checkout** — `CheckoutPanel` with options: `Send Checkout Link` (Stripe), `Copy Link`, or `Mark Invoiced`.

**Events**

* On **Send Checkout** → `POST /api/orders` (draft) → `POST /api/payments/checkout-session` → response `{checkout_url}` → UI shows link + success toast.
* On payment webhook → `payment_status=paid` → auto‑create `FulfillmentOrder` (backend) → Support dashboard updates.

**Error/edge**

* If Stripe fails to create session: show `ErrorBanner` + retry.

### 4.3 Support – Order Detail / Timeline

* **Header**: `OrderHeader` (chips, amounts, company)
* **Timeline**: `EventTimeline` events shape `{type: 'business'|'courier', verb, at, meta}`
* **Items table**: `DataTable` cols: Product, Qty, Fulfilled, Unit Price, Subtotal
* **Fulfillment summary**: `ShipmentSummaryCard[]` each with destination, status chip, tracking link, automation icons
* **Notes**: `CommentThread`
* **Action bar**: `Send Checkout` (if unpaid), `Open in Ops`

### 4.4 Ops – Fulfillment Pipeline Board

* `KanbanBoard` with columns mapping to fulfillment status
* `FulfillmentCard` props: `{id, company, order_id, remaining_map{product_id→qty}, deadlines, last_event}`

### 4.5 Ops – Fulfillment Detail / Shipment Builder

* **Left**: `OrderItemSidebar` rows `{product, ordered, fulfilled, remaining}`
* **Right/Form**: `ShipmentForm` fields `{address_id|freeform, courier, mode, tracking, ship_date, expected_delivery}`
* **Allocation**: `AllocationGrid` rows `{product, allocated, remaining}` + `QuantitySplitDrawer(product_id)`; guard: cannot exceed remaining.
* **Automation**: `AutomationFormset` per shipment item with scenario selector and dynamic sub‑forms.
* **Footer**: `ActionBar` (Save Draft | Mark Ready | Mark Shipped)
* **Right Drawer**: `TrackingDrawer` (courier events, business events, SLA)

### 4.6 Ops – Shipment Detail (optional)

* `ShipmentHeader`, `ShipmentItemsTable`, `AutomationStepList`, `TrackingPanel`

### 4.7 Ops – Tracking & Returns Dashboard

* `KPIBar` (in‑flight, late, pending returns)
* `ShipmentsTable` with filters by courier/status, search by tracking number

### 4.8 Settings – Key Screens

* **Price Book**: `PriceTable`, `PriceEditorDialog`
* **Addresses**: `AddressTable`, `AddressEditor`
* **Shipping**: `CourierTable`, `WebhookStatusCard`

## 5) Reusable Components (Specs & Props)

### 5.1 Structure

* **AppShell** `{sidebar: ReactNode, topbar: ReactNode, children}`
* **Sidebar** `{groups: {label, items: {href, label, icon, badge?}[]}[]}`
* **Topbar** `{title, envBadge?: 'Staging'|'Prod', actions?: ReactNode}`
* **Breadcrumbs** `{items: {href, label}[]}`
* **PageHeader** `{title: string, breadcrumbs?: Crumb[], actions?: ReactNode}`
* **Card** `{title?: string, actions?: ReactNode, children}`
* **TabGroup** `{tabs: {id, label, content}[]}`
* **Drawer** `{open: bool, side: 'right'|'left', onClose}`
* **Modal** `{open: bool, onClose, title, children}`
* **ActionBar** `{primary: ButtonProps, secondary?: ButtonProps[], sticky?: bool}`

### 5.2 Data Display

* **StatusChip** `{kind: 'order'|'fulfillment'|'shipment', value: string}` → maps to color/icon via token tables
* **ProgressBar** `{value: number}`
* **DataTable** `{columns: ColumnDef[], rows: any[], rowKey: string}`
* **EventTimeline** `{events: Event[]}` (grouped by type)
* **ShipmentSummaryCard** `{id, addressLabel, courier, tracking, status, items: {name, qty}[], automation: {assignment?:n, replacement?:n, returns?:n}}`
* **KPIBar** `{metrics: {label, value, trend?}[]}`

### 5.3 Forms

* **DynamicFormset** `{rows, onAdd, onRemove, schema, rowValidation}`
* **CompanyPicker** `{value?, onChange}`
* **AddressPicker** `{companyId, value?, onChange}`
* **CourierSelect** `{value?, onChange, couriers, disabled?}`
* **AllocationGrid** `{items: {product_id, name, remaining, allocated}[], onAllocate(product_id, qty)}`
* **QuantitySplitDrawer** `{product_id, maxQty, onConfirm(splits[])}`
* **AutomationFormset** `{shipmentItemId, steps: Step[], onAdd(step), onUpdate(step), onRemove(id)}`

  * **Step shapes (dynamic)**

    * *First‑Time*: `{scenario:'sensor_vendor_first_time'|'sensor_partner_first_time', device_ids: CUID[], activation_deadline?: ISO}`
    * *Replacement*: `{scenario:'sensor_vendor_replacement'|'sensor_partner_replacement', existing_device_id:CUID, replacement_device_id:CUID, asset_id?:CUID, notes?:string}`
    * *Return*: `{scenario:'sensor_return', device_ids: CUID[], rma_id?: string, notes?: string, received_at?: ISO}`

### 5.4 Feedback

* **Toast** `{title, description?, variant: 'success'|'info'|'warn'|'danger'}`
* **Banner** `{title, description?, variant, actions?}`
* **Dialog** `{title, body, onConfirm}`

### 5.5 Utility

* **CopyButton** `{value}`
* **TimeAgo** `{date}`
* **Money** `{cents, currency}`

### 5.1 Structure

* **PageHeader** `{title: string, breadcrumbs?: Crumb[], actions?: ReactNode}`
* **Card** `{title?: string, actions?: ReactNode, children}`
* **TabGroup** `{tabs: {id, label, content}[]}`
* **Drawer** `{open: bool, side: 'right'|'left', onClose}`
* **ActionBar** `{primary: ButtonProps, secondary?: ButtonProps[], sticky?: bool}`

### 5.2 Data Display

* **StatusChip** `{kind: 'order'|'fulfillment'|'shipment', value: string}` → maps to color/icon via token tables
* **ProgressBar** `{value: number}`
* **DataTable** `{columns: ColumnDef[], rows: any[], rowKey: string}`
* **EventTimeline** `{events: Event[]}` (grouped by type)
* **ShipmentSummaryCard** `{id, addressLabel, courier, tracking, status, items: {name, qty}[], automation: {assignment?:n, replacement?:n, returns?:n}}`
* **KPIBar** `{metrics: {label, value, trend?}[]}`

### 5.3 Forms

* **DynamicFormset** `{rows, onAdd, onRemove, schema, rowValidation}`
* **CompanyPicker** `{value?, onChange}`
* **AddressPicker** `{companyId, value?, onChange}`
* **CourierSelect** `{value, onChange, options}`
* **AllocationGrid** `{items: {product_id, name, remaining, allocated}[], onAllocate(product_id, qty)}`
* **QuantitySplitDrawer** `{product_id, maxQty, onConfirm(splits[])}`
* **AutomationFormset** `{shipmentItemId, steps: Step[], onAdd(step), onUpdate(step), onRemove(id)}`

  * **Step** shape by scenario:

    * *Assignment*: `{scenario: 'first_time'|'partner_first', device_ids: CUID[], activation_deadline?: date}`
    * *Replacement*: `{scenario: 'replacement'|'partner_replacement', existing_device_id, replacement_device_id, asset_id?, notes?}`
    * *Return*: `{scenario: 'return', device_ids: CUID[], rma_id?, notes?, received_at?}`

### 5.4 Feedback

* **Toast** `{title, description?, variant: 'success'|'info'|'warn'|'danger'}`
* **Banner** `{title, description?, variant, actions?}`
* **Dialog** `{title, body, onConfirm}`

### 5.5 Utility

* **CopyButton** `{value}`
* **TimeAgo** `{date}`
* **Money** `{cents, currency}`

---

## 6) State Machines & Transitions

### 6.1 Order

```
draft → pending_approval? → pending_payment → payment_processing → paid → (closed via fulfillment completion)
          ↘ rejected           ↘ failed
```

**Triggers**: creation, send checkout, Stripe events, manual override.

### 6.2 Fulfillment Order

```
ready_to_prepare → awaiting_shipment → in_transit → completed
        ↘ cancelled
```

**Rules**: becomes `ready_to_prepare` when order `paid`. Moves to `awaiting_shipment` when a shipment is `ready`. `in_transit` once any ships. `completed` when all delivered & automation processed.

### 6.3 Shipment

```
draft → ready → in_transit → delivered
      ↘ cancelled
```

**Guards**: cannot allocate beyond remaining qty; `delivered` triggers automation execution.

### 6.4 Automation Execution Hooks (NEW)

**Frontend save path**

* User adds a step in `AutomationFormset` → `POST /api/automation` with body `{shipment_item_id, scenario, ...scenario_fields}`.
* UI writes a **Business Event** to local timeline immediately (optimistic), then confirms from server.

**Backend on `shipment.delivered`**

* Enqueue worker `process_delivery(shipment_id)` with **idempotency_key = shipment.id + delivered_at**.
* For each `FulfillmentAutomationStep` under delivered shipment items:

  * *First‑Time*: assign each `device_id` to company; create Activation Task with deadline (5/10 biz days).
  * *Replacement*: validate pairing, perform asset swap, record `ShipmentDeviceReplacement`.
  * *Return*: record `ReturnExpectation` and queue RMA workflow; if `received_at` present, close expectation.
* Emit Business Events per action; UI timeline updates.

**Error policy**: partial failures logged to event stream with retryable tasks; UI shows warning banner with count.

## 7) Data Contracts (Frontend expectations)

### 7.1 Order (GET `/api/orders/:id`)

```json
{
  "id":"cuid",
  "company":{"id":"cuid","name":"Acme","contact":"jane@acme.com"},
  "created_at":"ISO",
  "total_cents":120000,
  "currency":"USD",
  "payment_status":"pending_payment|paid|failed|...",
  "fulfillment_status":"ready_to_prepare|in_transit|completed|...",
  "items":[{"id":"cuid","product_id":"cuid","name":"Sensor X","qty":10,"unit_price_cents":10000,"fulfilled_qty":4}],
  "shipments":[{"id":"cuid","status":"in_transit","tracking":"TN123","address":"Springfield, USA","items":[{"product":"Sensor X","qty":4}],"automation":{"assignments":4,"replacements":0,"returns":0}}],
  "events":[{"type":"business","verb":"payment_received","at":"ISO","meta":{}}]
}
```

### 7.2 Fulfillment Order (GET `/api/fulfillments/:id`)

```json
{
  "id":"cuid",
  "order_id":"cuid",
  "status":"ready_to_prepare|...",
  "items":[{"fulfillment_item_id":"cuid","order_item_id":"cuid","product":"Sensor X","quantity":10,"fulfilled_quantity":4}],
  "shipments":[{"id":"cuid","status":"ready","courier":"DHL","tracking":"TN","items":[{"shipment_item_id":"cuid","fulfillment_item_id":"cuid","product":"Sensor X","quantity":4}],"automation_steps":[{"id":"cuid","scenario":"sensor_vendor_first_time","device_assignments":["dev1","dev2"],"replacements":[],"returns":[]}]}]
}
```

---

## 8) Validation Rules & UX Safeguards

* Allocation cannot exceed remaining quantity; show inline error + cap control.
* Shipment cannot become **Ready** until it has ≥1 item and a destination + courier.
* Support cannot edit shipment data; show read‑only with tooltip explaining permissions.
* Idempotent automation: repeat processing is safe; log deduped events.
* Timeline separates **Courier** vs **Business** events with color and icon.

---

## 9) Accessibility & i18n

* Minimum contrast AA for chips and CTAs.
* Keyboard navigation for formsets and boards; focus management on drawers/modals.
* All timestamps ISO and localized; copy uses sentence case.

---

## 10) Build Plan (Frontend)

**Stack**: Next.js, Tailwind, shadcn/ui, React Query.

**Routes**: as in §3.

**Feature order**

1. Static shells of Support Dashboard, Order Detail, Fulfillment Board.
2. Shipment Builder with allocation grid and automation formset.
3. Tracking drawer + timelines.
4. Settings (addresses, couriers) as needed.

---

## 11) QA Scenarios (Happy & Edge)

* Pay → auto‑create fulfillment; board shows card in Ready to Prepare.
* Split one item across two shipments; fulfilled qty updates correctly.
* Mark shipment delivered; automation executes; fulfillment completes when all delivered.
* Return scenario: device expected → received; status updates.
* Permissions: Support cannot change shipments.

---

## 12) Open Questions (to decide quickly)

* Do we expose **manual invoice** path alongside Stripe checkout in v1?
* Do Ops need **bulk allocate** (auto‑fill remaining to a shipment)?
* SLA timers: which scenarios use 5 vs 10 business days by default?

---

**End of Spec** — Ready for design tokens → component library → screen builds.
