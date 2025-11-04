# 🧭 Guiding Principles

1. **Keep it operational, not CRM-heavy.** Support/Ops should find hardware, assets, and relationships fast.
2. **Keep the hierarchy logical:**
   **Company → Campaign → Asset → Device** (temporary attachment).
3. **Surface relationships bidirectionally** (Company ↔ Devices, Device ↔ Asset, etc.) with tabs.
4. **Avoid deep nesting** — top-level sections + contextual detail pages.
5. **Unify data browsing and action patterns** (list → detail → related tabs → edit modals).

---

# 🧩 Updated Sidebar Structure (conceptual)

```
SUPPORT
  Orders
  New Order
OPERATIONS
  Fulfillment
  Tracking & Returns
CUSTOMERS
  Companies
  Campaigns
HARDWARE
  Devices
  Assets
SETTINGS
  Price Book
  Addresses
  Shipping
```

*(You can feature-toggle sections as they go live.)*

---

# 🏢 Companies

### Overview

**Companies** are your customers — they manage sub-vendors, assets, campaigns, and temporarily hold devices.

### Pages

* `/companies` → **CompaniesIndex**

  * Table: Company • Parent Vendor • Active Campaigns • Devices Assigned • Outstanding Orders
  * Filters: Active/Inactive, Tier (Customer / Sub-vendor), Region
  * Actions: View, Edit, New Company
* `/companies/[id]` → **CompanyDetail**

  * **Header:** Logo, Contact info, Type (Customer/Vendor), Status, Account manager
  * **Tabs:**

    1. **Overview** — metrics: active assets, campaigns, devices, orders
    2. **Sub-Vendors** — nested companies table
    3. **Campaigns** — linked campaigns with filters (active, scheduled)
    4. **Assets** — all assets owned by this company (cards / table)
    5. **Devices** — current device assignments (temporary)
    6. **Orders** — order list (linked to Support Orders)
    7. **Addresses** — company address book (reuse existing component)
  * Actions: Edit company, Add sub-vendor, New campaign

### UI Notes

* Think “CRM-light”: actionable data grid, no heavy timeline.
* Sub-vendors nested one level deep, not infinite recursion.

---

# 🎯 Campaigns

### Overview

Campaigns group assets, devices, and time-bound targeting info.

### Pages

* `/campaigns` → **CampaignsIndex**

  * Table: Name • Company • Status (Upcoming/Active/Ended) • Assets • Devices • Start/End dates
  * Filters: Company, Status, Date range
  * Actions: View, New Campaign
* `/campaigns/[id]` → **CampaignDetail**

  * Header: campaign name, status, date range, company, created by
  * Tabs:

    1. **Overview** — timeline view, summary KPIs (assets, devices, probe data stats)
    2. **Assets** — all assets in campaign (select/unselect)
    3. **Devices** — all devices currently attached to campaign
    4. **Performance (future)** — aggregated sensor metrics or engagement KPIs
  * Actions: Add asset, Assign device, End campaign

---

# 🚚 Assets

### Overview

Assets are **physical things** (billboards, trucks, kiosks, etc.) that host devices.

### Pages

* `/assets` → **AssetsIndex**

  * Table: Asset • Company • Campaign (if active) • Device Attached? • Type • Location
  * Filters: Type (Billboard/Truck/Other), Active Campaign, Company
  * Actions: View, Add Asset, Assign Device
* `/assets/[id]` → **AssetDetail**

  * Header: name, type, company, active campaign
  * Tabs:

    1. **Overview** — static info: dimensions, category, location, notes
    2. **Device Assignment** — current device attached (with detach/reassign)
    3. **Campaigns** — history of campaigns this asset has participated in
  * Actions: Edit asset, Assign device, Detach device

---

# 🔌 Devices

### Overview

Devices are your hardware sensors.
They’re **owned by you**, but **temporarily assigned** to companies/assets/campaigns.

### Pages

* `/devices` → **DevicesIndex**

  * Table: Device ID (serial) • Model • Status • Assigned To (Company/Asset) • Last Probe • Firmware
  * Filters: Status (In Stock / Assigned / In Transit / Returned), Model, Region
  * Actions: View, Mark Returned, Assign to Asset/Company
* `/devices/[id]` → **DeviceDetail**

  * Header: Device info (serial, model, firmware, ownership)
  * Tabs:

    1. **Assignments** — timeline of where it’s been assigned (Company, Asset, Campaign)
    2. **Health** — probe frequency, last ping, battery, etc. (if data available)
    3. **Fulfillment History** — shipments that included this device
  * Actions: Assign to company/asset, Mark returned to warehouse

---

# 🔁 Relationships (how screens link together)

| From            | →                   | Action                                             |
| --------------- | ------------------- | -------------------------------------------------- |
| Company Detail  | Campaigns tab       | “Create Campaign” → pre-fills company              |
| Company Detail  | Assets tab          | “Add Asset”                                        |
| Company Detail  | Devices tab         | “Assign Device” (opens device picker modal)        |
| Asset Detail    | Device tab          | “Detach / Reassign Device”                         |
| Campaign Detail | Devices tab         | “Assign from available devices”                    |
| Device Detail   | Assignments         | Click row → open associated company/asset/campaign |
| Device Detail   | Fulfillment History | Open shipment detail (existing flow)               |

---

# 🧱 Shared Components

`src/components/companies/`

* `CompaniesTable.tsx`
* `CompanyDetailHeader.tsx`
* `CompanyTabs/{Overview,Campaigns,Assets,Devices,Orders,Addresses}.tsx`
* `CompanyDialog.tsx` (new/edit)

`src/components/campaigns/`

* `CampaignsTable.tsx`
* `CampaignDetailHeader.tsx`
* `CampaignTabs/{Overview,Assets,Devices,Performance}.tsx`
* `CampaignDialog.tsx` (create/edit)

`src/components/assets/`

* `AssetsTable.tsx`
* `AssetDetailHeader.tsx`
* `AssetTabs/{Overview,DeviceAssignment,Campaigns}.tsx`
* `AssetDialog.tsx` (create/edit)
* `DeviceAssignmentDrawer.tsx`

`src/components/devices/`

* `DevicesTable.tsx`
* `DeviceDetailHeader.tsx`
* `DeviceTabs/{Assignments,Health,FulfillmentHistory}.tsx`
* `DeviceAssignDialog.tsx`
* `DeviceReturnDialog.tsx`

Shared pickers:

* `CompanyPicker`, `AssetPicker`, `DevicePicker`, `CampaignPicker` (all use similar searchable table modal).

---

# 🗄️ API Surfaces (high-level)

### Companies

* `GET /v1/companies` → list/search (mirror + legacy)
* `GET /v1/companies/:id` → details + stats
* `POST /v1/companies` (create new local, optionally push to legacy)
* `PATCH /v1/companies/:id`
* `GET /v1/companies/:id/subvendors`
* `GET /v1/companies/:id/campaigns`
* `GET /v1/companies/:id/assets`
* `GET /v1/companies/:id/devices`

### Campaigns

* `GET /v1/campaigns?companyId=&status=`
* `POST /v1/campaigns`
* `PATCH /v1/campaigns/:id`
* `GET /v1/campaigns/:id`
* `POST /v1/campaigns/:id/assets`
* `POST /v1/campaigns/:id/devices`

### Assets

* `GET /v1/assets?companyId=&campaignId=`
* `POST /v1/assets`
* `PATCH /v1/assets/:id`
* `GET /v1/assets/:id`
* `POST /v1/assets/:id/assign-device` / `detach-device`

### Devices

* `GET /v1/devices?status=&companyId=`
* `GET /v1/devices/:id`
* `POST /v1/devices/:id/assign` `{ companyId, assetId?, campaignId? }`
* `POST /v1/devices/:id/return`
* `GET /v1/devices/:id/assignments`

---

# 🔮 How It Feels (UX)

* Sidebar stays lean; “CUSTOMERS” and “HARDWARE” groups divide responsibility clearly.
* All entity pages follow the same layout pattern:

  * Header (summary, actions)
  * Tabs (Overview + Related data)
  * Consistent action modals (“Assign”, “Create”, “Attach”)
* Support sees **cross-links** everywhere — click through relationships without deep nesting.

---

# ✅ TL;DR — Recommended UX flow

| Entity       | List → Detail Tabs                                                         | Key Actions                                 |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------- |
| **Company**  | Overview / Sub-vendors / Campaigns / Assets / Devices / Orders / Addresses | Add sub-vendor, New campaign, Assign device |
| **Campaign** | Overview / Assets / Devices / Performance                                  | Add asset, Assign device                    |
| **Asset**    | Overview / Device / Campaigns                                              | Assign or detach device                     |
| **Device**   | Overview / Assignments / Health / Fulfillment                              | Assign to asset/company, Mark returned      |

