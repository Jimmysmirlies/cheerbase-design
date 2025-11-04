# 🗺️ Mobilytics Platform — Business & System Context Overview

*(v1.0 — Orientation & Discovery Summary)*

## 1. Business Overview

### 1.1 Company Context

* **Parent Company:** Movia Media — a leader in mobile billboard advertising across North America.
* **Mobilytics Platform:** the SaaS technology arm powering Movia’s analytics, retargeting, and data-driven OOH measurement.
* **Mission:** bridge the gap between *physical* out-of-home media and *digital* ad measurability.

### 1.2 Value Proposition

* Combine **physical presence** (mobile billboards, vehicle wraps, physical media) with **digital intelligence** (sensors, analytics, retargeting).
* Provide advertisers with metrics like impressions, dwell time, exposure zones, and demographics — something traditional OOH couldn’t measure.
* Enable “digital retargeting” of devices exposed to ads through WiFi/BLE sensor data.

### 1.3 Core Business Actors

| Actor                           | Description                                    | Examples                                                                |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| **Advertisers / Agencies**      | Brands buying mobile billboard campaigns.      | Pepsi, Amazon, local advertisers                                        |
| **Media Operators / Resellers** | Manage fleets of trucks or billboards.         | Movia field partners                                                    |
| **Mobilytics Internal Teams**   | Ops, Support, Fulfillment, Analytics, Finance. | Day-to-day users of the backoffice                                      |
| **Technology Partners**         | Data and integration providers.                | Mogean (retargeting), Spotzi (demographics), BlueZoo (sensor analytics) |

---

## 2. System Overview (Legacy Stack)

### 2.1 Legacy Architecture Snapshot

| Component                           | Technology                 | Description                                                                                                                                                                                                                                               |
| ----------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Django 5 Admin & API**            | Python/Django              | Central app managing devices, assets, campaigns, billing, and analytics endpoints.                                                                                                                                                                        |
| **React Customer Dashboard**        | React                      | Legacy client-facing dashboard for advertisers.                                                                                                                                                                                                           |
| **Sensor Data Pipeline**            | Go + Python scripts        | Handles WiFi/BLE probe capture and exports to TimescaleDB.                                                                                                                                                                                                |
| **Firmware & Orchestration System** | C / Go + internal REST API | Custom firmware running on Mobilytics sensors (ESP32/Raspberry Pi class hardware) collecting probe requests and GPS data. Includes a cloud control plane for device management, OTA updates, configuration, and telemetry — currently buggy and unstable. |
| **TimescaleDB**                     | PostgreSQL extension       | Stores aggregated sensor metrics and campaign analytics.                                                                                                                                                                                                  |
| **BlueZoo Integration**             | External API               | Alternative sensor hardware and analytics provider.                                                                                                                                                                                                       |
| **Stripe Integration**              | Billing                    | Handles product checkout, subscriptions, and invoicing.                                                                                                                                                                                                   |
| **Mogean / Spotzi Integrations**    | External APIs              | Receive data exports for retargeting and demographics.                                                                                                                                                                                                    |
| **AWS S3**                          | Data storage               | Holds export files, images, CSVs for partners.                                                                                                                                                                                                            |

---

### 2.2 Firmware & Orchestration Layer (Expanded)

The firmware layer is a foundational part of Mobilytics’ unique value — it enables the physical measurement of audiences in the real world.

**Firmware Responsibilities:**

* Runs on custom sensor devices mounted to assets (e.g., trucks, billboards).
* Captures WiFi/Bluetooth probe requests from nearby mobile devices.
* Logs GPS and movement data for route tracking.
* Periodically uploads data packets to the cloud pipeline for ingestion.

**Orchestration Responsibilities:**

* Remote configuration and status monitoring of all deployed devices.
* OTA (over-the-air) firmware updates and diagnostics.
* Sensor health checks (heartbeat, uptime, data volume).

**Current Challenges:**

| Issue                      | Impact                                                                     |
| -------------------------- | -------------------------------------------------------------------------- |
| **Unstable control plane** | Device status reporting often unreliable or delayed.                       |
| **OTA update failures**    | Devices occasionally lose connectivity after remote updates.               |
| **Telemetry dropouts**     | Intermittent data loss causes analytics gaps.                              |
| **Limited observability**  | No unified logs or metrics for fleet health.                               |
| **Tight coupling**         | Firmware logic and orchestration backend intertwined, difficult to evolve. |

**Migration Implications:**

* Firmware and orchestration will eventually be refactored into a **dedicated device management subsystem**, possibly using MQTT or event-driven telemetry.
* Future goal: **decouple hardware communication** from analytics ingestion, enabling third-party hardware and standardized APIs.

---

### 2.3 Core Data Model (Simplified)

```
Device ─┬─< DeviceHistory >─┬─ Asset ──┬─< CampaignAsset >─> Campaign
        │                    │          │
        └─< Shipment >───────┘          └─< AnalyticsMetrics (TimescaleDB) >
```

* **Device:** physical sensor (hardware, serial, firmware).
* **Asset:** billboard or vehicle that holds a device.
* **Campaign:** customer engagement window linking assets to clients.
* **Analytics:** aggregated metrics from sensor data.
* **Orders / Products / Billing:** via Stripe sync and internal models.

---

## 3. Ecosystem & Data Flow

### 3.1 High-Level Data Journey

```
[ Sensor Device (Firmware) ]
   ↓ WiFi/BLE probes + GPS
[ Firmware Control System (Orchestration) ]
   ↓
[ Go/Python Data Pipeline ]
   ↓
[ TimescaleDB (Analytics Store) ]
   ↓
[ Django API (Analytics & Campaigns) ]
   ↓
→ Customer Dashboard
→ Mogean / Spotzi Exports
→ Stripe Billing
```

### 3.2 Partners & Integrations

| Partner                | Role                             | Interface                    |
| ---------------------- | -------------------------------- | ---------------------------- |
| **BlueZoo**            | Sensor hardware + analytics      | REST API                     |
| **Mogean**             | Retargeting partner              | S3 export + API callbacks    |
| **Spotzi**             | Demographic analytics            | S3 export + API callbacks    |
| **Stripe**             | Payments, billing, subscriptions | Webhooks + checkout sessions |
| **AWS (S3, ECS, RDS)** | Infrastructure & storage         | Managed cloud stack          |

---

## 4. Strengths & Limitations of the Legacy System

| Category                 | Strength                                       | Limitation                                          |
| ------------------------ | ---------------------------------------------- | --------------------------------------------------- |
| **Hardware Integration** | Unique end-to-end hardware + software stack.   | Firmware instability reduces reliability.           |
| **Data Architecture**    | Proven TimescaleDB analytics schema.           | Performance and data quality issues under load.     |
| **Business Logic**       | Mature campaign, asset, and billing logic.     | Hard-coded and difficult to test.                   |
| **Integrations**         | Established relationships with major partners. | Inconsistent API handling and error recovery.       |
| **Infrastructure**       | Fully cloud-hosted (AWS).                      | Mixed environments (Heroku, Vercel) complicate ops. |

---

## 5. Current Business Challenges

* **Firmware Instability:** OTA and telemetry unreliability directly affect analytics accuracy.
* **Scaling Limitations:** Sensor data volume outgrowing the ingestion layer.
* **Operational Inefficiency:** Multiple admin tools and manual processes.
* **Data Visibility:** Limited monitoring, tracing, and alerting.
* **Technical Debt:** Legacy Django code with minimal test coverage.
* **SaaS Growth Blockers:** Multi-tenant and partner features difficult to implement.

---

## 6. Strategic Response — The Migration Initiative

* **Rebuild application layer:** new NestJS API and Next.js frontends.
* **Modernize device orchestration:** decouple firmware comms from analytics ingestion.
* **Standardize analytics ingestion:** Go-based, AWS-native pipeline (Timescale + S3).
* **Consolidate operational workflows:** internal and external dashboards unified.
* **Prepare for SaaS scale:** clear multi-tenant architecture, better onboarding, observability, and testing.

---

## 7. What This Means for Stakeholders

| Audience        | What This Means                                                      |
| --------------- | -------------------------------------------------------------------- |
| **Executives**  | Modernization supports new product lines and revenue scalability.    |
| **Operations**  | Unified tools and stable devices increase efficiency and confidence. |
| **Engineering** | Cleaner architecture, predictable telemetry, and observability.      |
| **Partners**    | Stronger integration reliability, simpler API contracts.             |
| **Clients**     | Trustworthy analytics, faster campaign turnaround, improved UX.      |

---

## 8. Summary

The Mobilytics Platform represents a rare full-stack product — spanning hardware, firmware, analytics, and SaaS.
While the current system has proven commercial success, its technical fragility limits growth.
This modernization is the bridge from a working but brittle prototype ecosystem to a **mature, scalable data platform** for OOH analytics and advertising intelligence.