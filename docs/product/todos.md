# Product Docs – TODOs

Purpose: enumerate missing product documents and alignment items that will guide the team and reduce ambiguity across specs and implementations.

Must‑have docs (net new)
- Product Overview index (this README) – done
- Product Brief (vision, personas, KPIs) – done
- Capability Map (capability → domain → features) – done
- Domain Feature Specs (create concise, ADR‑aware specs per domain)
  - Orders & Pricing Resolver
  - Fulfillment & Shipments
  - Automation & Async Processing (BullMQ)
  - Billing & Invoices
  - Contacts & Addresses
  - Price Agreements (resolver integration, Stripe sync)
  - Tracking Adapters (USPS, DHL, Canada Post, Chit Chats)
  - Job Monitor (queues, runs, events)
  - Legacy Integration Bridge (mirrors + constraints)
- UI Surfaces (Backoffice) – navigation map, screen inventory, status semantics, query keys
- API Overview – controller surfaces per domain with links to code
- Data & Audit – identifiers, sequences, domain events, audit trails
- Security & Auth – sessions, roles, permissions, guardrails (internal)
- Roadmap & Release Plan – phases with owners/dependencies
- Glossary – canonical terms and enums (Currency, ShipmentStatus, ContactRole, etc.)

Cross‑repo alignment
- docs/auth/overview.md – added and referenced from READMEs
- docs/config/overview.md – added and referenced from READMEs

Explicit ADR guardrails in product docs
- Call out ADR‑0004 (Prisma style) where schemas are implied
- Call out ADR‑0005 (auth/session/guards) on any endpoint surface
- Call out ADR‑0006 (config via AppConfigService) in integration sections
- Call out ADR‑0007 (service structure/transactions/audit) in flow write‑ups
- Call out strict Stripe sync guardrails in pricing/checkout (pricebook + agreements)

Cross‑linking tasks
- Link each product doc to relevant ADRs and architecture/spec pages for quick navigation
- From Capability Map, link capabilities to code modules and endpoints (API + UI hooks)

Proposed sequence
1) Draft Orders & Pricing, Fulfillment & Shipments domain feature specs
2) Add Backoffice UI Surfaces doc (navigation + status chips)
3) Extend Capability Map with concrete API/UI references
4) Add Glossary and Data & Audit docs
