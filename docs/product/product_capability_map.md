 
# 🧱 Mobilytics Platform — Product Capability Map  
*(v1.0 — Capability → Domain → Feature Mapping)*  

## 1. Overview  
This document maps high-level **business capabilities** to their underlying **domains** and **features** in the Mobilytics Platform.  
It helps stakeholders understand how the product delivers value and where each feature logically belongs.

---

## Capability 1 — Campaign Management  
**Business Value:** Allow advertisers and operators to plan, launch, and monitor OOH campaigns.  
**Domains:** Campaigns, Assets, Orders, Analytics  
**Features:**  
- *Campaign creation & scheduling* — define campaign details and target window.  
- *Asset assignment* — attach vehicles or billboards to campaigns.  
- *Performance dashboard* — view impressions, dwell time, exposure regions.  
- *Campaign photo gallery* — upload and tag proof-of-performance photos.  

---

## Capability 2 — Asset & Device Management  
**Business Value:** Maintain accurate inventory of hardware sensors and advertising assets.  
**Domains:** Assets, Devices, Shipments  
**Features:**  
- *Device registry* — track serial numbers, firmware, and ownership.  
- *Asset registry* — manage vehicles, billboards, and media surfaces.  
- *Device–asset attachment history* — log when devices are installed/removed.  
- *Shipment tracking* — courier integration for physical movement.  

---

## Capability 3 — Analytics & Measurement  
**Business Value:** Provide quantitative data on real-world audience exposure.  
**Domains:** Analytics, TimescaleDB, Integrations (BlueZoo)  
**Features:**  
- *Hourly/daily metrics API* — impressions, dwell bins, regional aggregates.  
- *Geo heatmaps* — visualize exposure density.  
- *Data source selector* — switch between TimescaleDB and BlueZoo feeds.  

---

## Capability 4 — Retargeting & Demographics  
**Business Value:** Extend OOH audiences into digital channels for greater impact.  
**Domains:** Retarget, Demographics, Integrations (Mogean, Spotzi)  
**Features:**  
- *Retarget export* — generate S3 export and notify partner queue.  
- *Demographics export* — generate audience segmentation by region.  
- *Partner status callbacks* — update when external jobs complete.  

---

## Capability 5 — Orders & Billing  
**Business Value:** Streamline purchase, subscription, and billing workflows.  
**Domains:** Orders, Products, Stripe Integration, Billing  
**Features:**  
- *Stripe checkout* — self-service payments for packages.  
- *Product catalog & pricing tiers* — managed via Stripe + overrides.  
- *Invoice generation* — automatic post-payment.  
- *Subscription tracking* — sync renewals and cancellations.  

---

## Capability 6 — Fulfillment & Logistics  
**Business Value:** Manage the physical deployment of devices and campaigns.  
**Domains:** Fulfillment, Shipments, Tracking  
**Features:**  
- *Fulfillment workflow* — generate shipment tasks post-payment.  
- *Courier tracking adapters* — USPS, DHL, Canada Post, Chit Chats.  
- *Automation jobs* — mark fulfilled orders and trigger notifications.  

---

## Capability 7 — Support & Operations  
**Business Value:** Equip internal teams with tools to manage customers and campaigns.  
**Domains:** Backoffice Support App, Auth, Companies, Contacts  
**Features:**  
- *Support dashboard* — unified search and edit surface.  
- *User impersonation & session guardrails* — safe troubleshooting access.  
- *Contact & company management* — maintain operational contacts.  

---

## Capability 8 — Integrations & Data Exchange  
**Business Value:** Connect Mobilytics data with partner ecosystems.  
**Domains:** Integrations (Stripe, S3, Mogean, Spotzi, BlueZoo)  
**Features:**  
- *Webhook endpoints* — handle partner status updates.  
- *Data export schemas* — standardized CSV/JSON payloads.  
- *Integration monitoring* — log partner success/failure.  

---

## Capability 9 — Platform Foundation  
**Business Value:** Provide security, reliability, and configuration infrastructure.  
**Domains:** Auth, Config, Automation, Monitoring  
**Features:**  
- *Role-based access control* — scoped by company and user role.  
- *Session & token APIs* — CSRF, JWT, and header-based auth.  
- *Job orchestration* — async queue for background jobs.  
- *Audit & logging* — structured event trails for all key actions.  

