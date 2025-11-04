 
# 🧭 Mobilytics Platform — Product Brief  
*(v1.0 — Stakeholder Alignment Document)*  

## 1. Product Vision  
Mobilytics is a **data-driven out-of-home (OOH) advertising platform** that transforms physical media — vehicles, billboards, and other real-world assets — into measurable, targetable digital experiences.  
Our mission is to make outdoor advertising **as accountable and intelligent as digital media** by linking sensors, analytics, and audience data in one unified system.

The platform empowers three user groups:  
1. **Advertisers & Agencies** — launch measurable OOH campaigns with real-time analytics.  
2. **Media Operators** — manage fleets of sensor-equipped assets, monitor performance, and monetize audience data.  
3. **Internal Operations & Support Teams** — fulfill orders, manage sensors and shipments, and ensure data integrity.

---

## 2. Business Context  
- **Parent Company:** Movia Media — a leader in mobile billboard advertising.  
- **SaaS Arm:** Mobilytics — commercializing Movia’s proprietary sensor and analytics technology as a platform.  
- **Market Problem:** OOH media lacks the measurement, attribution, and retargeting sophistication of digital ads.  
- **Opportunity:** Provide advertisers with transparent reach and engagement metrics, and enable operators to run smarter, data-backed campaigns.  

---

## 3. Product Pillars  

| Pillar | Description | Primary Users |
|--------|--------------|---------------|
| **Measure** | Capture and analyze real-world exposure data via WiFi/BLE sensors. | Media Operators, Advertisers |
| **Attribute** | Link exposure data to digital audiences for retargeting and demographic insights. | Advertisers, Partners |
| **Monetize** | Sell campaigns and analytics packages through automated billing and checkout. | Sales & Operations |
| **Support** | Centralize fulfillment, tracking, and customer management with efficient tools. | Support & Operations |
| **Scale** | Deliver this as a SaaS platform for Movia and third-party operators. | Leadership, Engineering |

---

## 4. Current Transition  
Mobilytics is migrating from a **legacy Django-based system** to a **modern AWS-native stack** built on **NestJS + Next.js**.  
This new platform consolidates product logic, billing, and operational workflows under a single codebase, with future phases expanding to analytics and device control.

| Layer | New Stack | Legacy Status | Notes |
|-------|------------|----------------|-------|
| **Application Support API** | ✅ NestJS | 🔸 Replacing Django API | Core business logic and integrations |
| **Support Backoffice App** | ✅ Next.js | 🔸 Replacing Django Admin | For internal teams |
| **Customer Dashboard App** | ✅ Next.js | 🔸 Replacing old React dashboard | For advertisers & clients |
| **Analytics & Sensor Layers** | Planned Migration | 🧱 Django + Go + Timescale | Retained temporarily |
| **Integrations** | AWS-native | 🔗 Stripe, Mogean, Spotzi, BlueZoo | Unified integration layer |

---

## 5. Product Goals (2025–2026)  
1. **Unify all operational workflows** under the new platform.  
2. **Improve reliability** by replacing legacy systems and standardizing data contracts.  
3. **Deliver clear, auditable analytics** to customers via a modern dashboard.  
4. **Enable self-service billing and campaign management** for clients.  
5. **Lay groundwork for open data APIs** and multi-tenant SaaS distribution.  

---

## 6. Success Metrics  

| Category | KPI | Target |
|-----------|-----|--------|
| **Operational Efficiency** | Campaign setup → activation time | ↓ 50% |
| **Data Integrity** | Sensor → analytics data latency | < 10 min |
| **Customer Experience** | Support ticket resolution time | ↓ 40% |
| **Reliability** | System uptime (core API) | > 99.9% |
| **Revenue Growth** | Subscription revenue YoY | +25% |

---

## 7. Personas  

| Persona | Goals | Key Features |
|----------|-------|---------------|
| **Advertiser / Brand** | Measure campaign performance, view demographics, download reports, retarget audiences. | Customer Dashboard |
| **Media Operator / Reseller** | Manage devices and assets, attach campaigns, view exposure metrics. | Customer Dashboard |
| **Support / Ops Staff** | Fulfill orders, manage shipments, billing, and device assignments. | Backoffice Support App |
| **Engineering / Data Teams** | Ensure sensor data ingestion, data quality, and system reliability. | Application Support API & future Analytics Stack |

---

## 8. Roadmap Themes  

| Quarter | Focus | Outcome |
|----------|--------|---------|
| **Q4 2025** | Launch new Backoffice Support app & NestJS API | Replace Django Admin for internal ops |
| **Q1 2026** | Launch Customer Dashboard app | Consolidate client-facing analytics and orders |
| **Q2 2026** | Begin Analytics Layer replatform | Unified metrics API + data validation |
| **Q3 2026** | Introduce Device Monitoring service | Live status, OTA, diagnostics |
| **Q4 2026** | SaaS Expansion | Partner onboarding, white-label support |

---

## 9. Competitive Advantage  
- **Proven field data:** Millions of real-world impressions from Movia’s operations.  
- **Vertical integration:** From sensor firmware → analytics → billing → customer UI.  
- **Data partnerships:** BlueZoo, Mogean, Spotzi enhance measurement and targeting.  
- **Technical renewal:** Modern, testable, documented codebase for scale and multi-tenant SaaS.

---

## 10. Next Steps for Stakeholders  
- Approve **product vision and KPIs** as shared alignment targets.  
- Endorse **migration plan milestones** and funding for analytics replatform.  
- Support **documentation initiative** to define feature specs, ownership, and quality standards.  

