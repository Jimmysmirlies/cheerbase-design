# Routes, Pages & Screens

> Related references:
> - [ADR-0009 Frontend Data Access](../../adrs/0009-frontend-data-access.md)
> - [ADR-0010 Frontend Data Loading](../../adrs/0010-frontend-data-loading.md)
> - [ADR-0011 Frontend Collection UX](../../adrs/0011-frontend-collection-ux.md)
> - [Delivery Backlog](../../roadmap-todo.md#frontend-alignment-adr000900100011)

## App Shell

* `/app/(app)/layout.tsx` → **AppShell** (Sidebar + Topbar + Breadcrumbs host)
* `/app/page.tsx` → Redirect → `/support/orders`

## Support

* `/support/orders/page.tsx` → **SupportOrdersDashboard**
* `/support/orders/new/page.tsx` → **NewOrderWizard**
* `/support/orders/[id]/page.tsx` → **OrderDetail**

## Operations

* `/ops/fulfillment/page.tsx` → **FulfillmentBoard**
* `/ops/fulfillment/[id]/page.tsx` → **FulfillmentDetail** (Shipment Builder)
* `/ops/shipments/[id]/page.tsx` → **ShipmentDetail** (audit + automation list)
* `/ops/shipments/[id]/automation/page.tsx` → **AutomationEditor** (stacked scenarios)
* `/ops/tracking/page.tsx` → **TrackingAndReturns** (shipments in flight, return queue)

## Settings

* `/settings/price-book/page.tsx` → **PriceBookIndex**
* `/settings/price-book/products/[id]/page.tsx` → **ProductDetail**
* `/settings/addresses/page.tsx` → **AddressesIndex**
* `/settings/shipping/page.tsx` → **ShippingConfig**

## System (optional / future)

* `/reports/page.tsx` → **ReportsIndex** (audit, SLA charts)
* `/sandbox/page.tsx` → **ComponentPlayground** (dev only)

---

# Layout & Navigation Components (`src/components/layout/`)

* `AppShell.tsx` (grid layout)
* `Sidebar.tsx` (groups, active state, badges)
* `Topbar.tsx` (search slot, env badge, user menu)
* `Breadcrumbs.tsx`
* `PageHeader.tsx` (title, actions, breadcrumbs)
* `ActionBar.tsx` (sticky page/footer actions)

---

# UI Primitives (`src/components/ui/`)

* **Feedback**: `ToastRegion`, `Banner`, `ErrorBanner`, `Skeleton`, `IllustratedEmpty`
* **Overlay**: `Modal`, `Drawer`, `ConfirmDialog`, `AuditDrawer`
* **Display**: `Card`, `DataTable` (virtualized), `KPIBar`, `StatusChip`, `Tag`, `ProgressBar`
* **Inputs**: `TextInput`, `NumberInput`, `MoneyInput`, `Select`, `Combobox`, `DateInput`, `Switch`
* **Utilities**: `CopyButton`, `TimeAgo`, `Money`, `Pill`

---

# Domain Components

## Support – Orders (`src/components/support/`)

* `OrdersTable.tsx` (filters, row actions)
* `OrderCard.tsx` (alt list/grid)
* `OrderHeader.tsx` (chips + totals)
* `OrderItemsTable.tsx`
* `OrderShipmentsSummary.tsx` (cards with tracking + automation badges)
* `OrderTimeline.tsx` (wraps `EventTimeline` with business/courier lanes)
* **New Order Wizard**

  * `CompanyPicker.tsx` (search legacy via API facade)
  * `OrderItemsFormset.tsx` (dynamic rows)
  * `OrderReview.tsx`
  * `CheckoutPanel.tsx` (shows link, “Send”, copy)

## Operations – Fulfillment (`src/components/ops/`)

* **Board**

  * `FulfillmentBoard.tsx` (kanban)
  * `FulfillmentCard.tsx`
* **Detail (Shipment Builder)**

  * `OrderItemSidebar.tsx` (ordered/fulfilled/remaining)
  * `ShipmentList.tsx`
  * `ShipmentForm.tsx` (address, courier, tracking, dates)
  * `AllocationGrid.tsx`
  * `QuantitySplitDrawer.tsx` (cap by remaining)
  * `TrackingDrawer.tsx` (courier + business events)
* **Shipment Detail**

  * `ShipmentHeader.tsx`
  * `ShipmentItemsTable.tsx`
  * `ShipmentAutomationList.tsx` (step chips, counts)
* **Automation**

  * `AutomationFormset.tsx` (scenario selector + delegates)
  * `AutomationStep.FirstTime.tsx` (device assignments, deadline)
  * `AutomationStep.Replacement.tsx` (old/new device, asset, notes)
  * `AutomationStep.Return.tsx` (expected devices, receivedAt)
  * `AutomationSummary.tsx` (icons: A/R/↩︎)

## Settings – Price Book & Agreements (`src/components/settings/price-book/`)

* `PriceBookTable.tsx` (Product list + active price badges)
* `ProductDetailCard.tsx` (domain, category, defaults, Stripe map)
* `PriceEntriesTable.tsx` (currency, region, amount, effective, Stripe)
* `EditProductDialog.tsx`
* `PriceEntryDialog.tsx` (create/edit, Save & Sync)
* `StripeSyncButton.tsx` (all / selection / single)
* **Company Agreements**

  * `CompanyAgreementsTable.tsx`
  * `PriceAgreementDialog.tsx` (create/edit)
  * `AgreementStripeBadge.tsx` (synced/unsynced/failed)

## Settings – Addresses & Shipping (`src/components/settings/`)

* `AddressTable.tsx`, `AddressDialog.tsx`
* `ShippingCouriersTable.tsx`, `ShippingWebhookConfig.tsx`

---

# Cross-Domain Widgets

* `EventTimeline.tsx` (generic; two lanes with `kind: 'courier' | 'business' | 'system'`)
* `SearchGlobal.tsx` (orders / shipments / companies)
* `MetricsStrip.tsx` (fetch `/orders/metrics`)
* `StripeStatusPill.tsx` (synced/unsynced/failed)
* `UnsyncedWarning.tsx` (used before checkout)

---

# Hooks (`src/hooks/`) — minimal contract for pages

* **Support**:
  `useOrders()`, `useOrder(id)`, `useCreateOrder()`, `useCheckout(orderId)`, `useOrdersMetrics()`
* **Fulfillment/Shipments**:
  `useFulfillment(id)`, `useFulfillments(filter)`, `useCreateShipment()`, `useUpdateShipment()`, `useAllocate()`
* **Automation**:
  `useAutomationSteps(shipmentItemId)`, `useCreateAutomationStep()`, `useDeleteAutomationStep()`
* **Price Book**:
  `useProducts(filter)`, `useProduct(id)`, `usePriceEntries(productId)`, `useUpsertProduct()`, `useUpsertPriceEntry()`, `useStripeSync()`
* **Agreements**:
  `useCompanyAgreements(companyId, productId?)`, `useUpsertAgreement()`, `useDeactivateAgreement()`
* **Addresses/Shipping**:
  `useAddresses(companyId?)`, `useUpsertAddress()`, `useCouriers()`, `useSaveCourierConfig()`
* **Timeline**:
  `useEvents({orderId?, shipmentId?})`

---

# Types (`src/types/`) — enums & DTOs

* `OrderStatus`, `FulfillmentStatus`, `ShipmentStatus`, `AutoScenario`, `EventKind`
* DTOs for create/update of Orders, Shipments, Automation, Products, PriceEntries, Agreements

---

# Error/Empty/Loading Patterns

* `IllustratedEmpty` on all index pages
* `ErrorBanner` with retry hooks
* `Skeleton` rows for tables/cards
* Global `ToastRegion` for mutations

---

# File Path Skeleton (quick copy)

```
src/
  app/(app)/layout.tsx
  app/support/orders/{page.tsx,new/page.tsx,[id]/page.tsx}
  app/ops/fulfillment/{page.tsx,[id]/page.tsx}
  app/ops/shipments/[id]/{page.tsx,automation/page.tsx}
  app/ops/tracking/page.tsx
  app/settings/price-book/{page.tsx,products/[id]/page.tsx}
  app/settings/addresses/page.tsx
  app/settings/shipping/page.tsx

  components/layout/{AppShell,Sidebar,Topbar,Breadcrumbs,PageHeader,ActionBar}.tsx
  components/ui/{Card,DataTable,StatusChip,KPIBar,Modal,Drawer,Banner,ErrorBanner,Skeleton,IllustratedEmpty,ConfirmDialog}.tsx

  components/support/{OrdersTable,OrderCard,OrderHeader,OrderItemsFormset,OrderItemsTable,OrderShipmentsSummary,OrderTimeline,CompanyPicker,CheckoutPanel}.tsx

  components/ops/{FulfillmentBoard,FulfillmentCard,OrderItemSidebar,ShipmentList,ShipmentForm,AllocationGrid,QuantitySplitDrawer,TrackingDrawer,ShipmentHeader,ShipmentItemsTable,ShipmentAutomationList}.tsx
  components/ops/automation/{AutomationFormset,AutomationStep.FirstTime,AutomationStep.Replacement,AutomationStep.Return,AutomationSummary}.tsx

  components/settings/price-book/{PriceBookTable,ProductDetailCard,PriceEntriesTable,EditProductDialog,PriceEntryDialog,StripeSyncButton,CompanyAgreementsTable,PriceAgreementDialog,AgreementStripeBadge}.tsx
  components/settings/{AddressTable,AddressDialog,ShippingCouriersTable,ShippingWebhookConfig}.tsx

  components/shared/{EventTimeline,SearchGlobal,MetricsStrip,StripeStatusPill,UnsyncedWarning}.tsx

  hooks/{use-orders,use-fulfillments,use-shipments,use-automation,use-products,use-pricebook,use-agreements,use-addresses,use-shipping,use-events,use-metrics}.ts
  types/index.ts
```

---

# Build Order (suggested sprints)

1. **AppShell + StatusChip + DataTable + KPIBar** (foundation)
2. **Support** (Dashboard, New Order, Order Detail)
3. **Ops** (Fulfillment Board, Fulfillment Detail, Shipment Detail)
4. **Automation** (Formset + scenarios)
5. **Settings** (Price Book + Agreements; Addresses; Shipping)
6. **Tracking & Returns** (table + timeline), polish & tests
