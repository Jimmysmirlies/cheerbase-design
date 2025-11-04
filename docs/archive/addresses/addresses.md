
# 1) High-level data model (frontend-facing)

**Address**

* `id`, `companyId?` (null = ad-hoc)
* `label` (e.g., “HQ Warehouse”)
* `attention?` (contact name)
* `email?`, `phone?`
* `line1`, `line2?`, `city`, `region`, `postalCode`, `country` (ISO-2)
* `notes?` (delivery instructions)
* `isDefaultShipping?` (company only)
* `isDefaultBilling?`  (company only)
* `active` (soft archive)
* `lastUsedAt?`, `lastValidatedAt?`, `validationStatus?: 'ok'|'warn'|'fail'`
* `legacyAddressId?` (mirror)

**Usage note:** Shipments store `addressId` (or a nested address to create ad-hoc).

---

# 2) API surface (NestJS)

**Addresses**

* `GET /v1/addresses?companyId=&active=&country=&q=&limit=&cursor=`
* `POST /v1/addresses`

  ```json
  { "companyId":"?", "label":"", "attention":"", "email":"", "phone":"",
    "line1":"", "line2":"", "city":"", "region":"", "postalCode":"", "country":"US",
    "notes":"", "isDefaultShipping":false, "isDefaultBilling":false }
  ```
* `PATCH /v1/addresses/:id`
* `POST /v1/addresses/:id/archive` / `POST /v1/addresses/:id/activate`
* `POST /v1/addresses/:id/set-default` `{ "type":"shipping" | "billing" }`
* `GET /v1/companies/:id/addresses` (shortcut for pickers)
* (optional) `POST /v1/addresses/:id/validate` → updates `validationStatus`

**Shipments (integration point)**

* `POST /v1/fulfillments/:id/shipments` accepts:

  * `addressId` **or**
  * `address: { ...fields }` (creates ad-hoc; optional `saveToCompanyBook: true`)

---

# 3) Screens (routes) & what they show

### **/settings/addresses** (Index)

* Filters: Company, Type (Company/Ad-hoc), Country, Active
* Table columns: Label • Company • City/Region/Country • Default (S/B) • Active • Last Used • Actions
* Actions: **New Address**, Archive/Activate, Set Default (S/B), Validate (optional)

### **/settings/addresses/new** (Modal)

* Sections: Basics (company?, label, attention, phone, email), Location (line1, city, region, postal, country), Defaults (if company), Notes
* Save → creates; optional “Set as company default shipping/billing”

### **/settings/addresses/[id]** (Detail) — optional if you prefer modal-only

* Same fields; audit drawer (history of usage/changes)

### **Pickers embedded elsewhere**

* **Shipment Builder** → `AddressPicker` with tabs:

  * Company Addresses • Recent • Ad-hoc
  * Actions: `+ New Address` (inline modal), `[ ] Save to company address book` (if `companyId` known)

---

# 4) Components (reusable)

`src/components/settings/addresses/`

* `AddressTable.tsx` (filters + DataTable)
* `AddressDialog.tsx` (create/edit; country→region behavior)
* `SetDefaultButtons.tsx` (shipping/billing)
* `ArchiveToggle.tsx`
* `AddressCard.tsx` (detail/preview)
* `ValidateBadge.tsx` (ok/warn/fail)

`src/components/pickers/`

* `AddressPicker.tsx`

  * Props: `companyId?`, `value?`, `onChange`, `allowAdHoc`, `onCreateAdHoc`, `showSaveToBookCheckbox?`
  * Tabs: Company | Recent | Ad-hoc
  * Search bar; “New Address” button → `AddressDialog`

`src/components/shared/`

* `CountryRegionSelect.tsx` (country → dynamic region list)
* `PhoneInput.tsx`, `EmailInput.tsx`

---

# 5) Flows

**A) Create company address (Settings)**

* Click **New Address** → modal → save
* If `isDefaultShipping/Billing` toggled → API `set-default` (unset previous)

**B) Use in Shipment**

* Open Shipment Builder → **AddressPicker**
* Pick from **Company** tab or **Recent**
* Or **Ad-hoc**: open modal, enter fields; checkbox “Save to company address book”

**C) Archive**

* Archive hides from pickers by default; toggle “Show archived” to view

**D) Validation (optional)**

* Click **Validate** → calls `POST /addresses/:id/validate` (future service: EasyPost/etc.) → sets `validationStatus`

---

# 6) Validation rules (frontend + service)

* Required: `line1, city, region, postalCode, country`
* Email/phone optional (format-checked if present)
* If `companyId` present and `isDefaultShipping=true` → unset existing default in service
* Prevent duplicate addresses on save (soft dedupe): if same normalized fields under same company, prompt to reuse

---

# 7) Permissions

* **Support**: create/edit addresses for their companies; set defaults
* **Ops**: create/edit (esp. during shipment), save ad-hoc to book
* **Admin**: archive/unarchive, bulk actions

---

# 8) UX micro-details

* Country drives region dropdown; show postal hint (US: ZIP-5/ZIP+4, CA: A1A 1A1)
* Show **Default S/B** chips in tables and pickers
* Address preview line: `Label — attention • line1, city, region • country`
* “Last used” populated when used in a shipment; **Recent** tab sorts by this

---

# 9) Build order

1. **AddressDialog + CountryRegionSelect**
2. **AddressTable** with filters
3. **AddressPicker** (Company/Recent/Ad-hoc) + inline create
4. **SetDefaultButtons** + archive toggle
5. Wire into **Shipment Builder** (`CreateShipmentDto` supports `addressId | address{}`)
6. (Optional) validation badge + endpoint
