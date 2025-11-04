# ADR 0003: Human-Readable External Identifiers

## Status
Accepted

## Context
ADR 0001 standardised on CUIDs as primary keys for all Prisma models. While CUIDs provide strong uniqueness and index locality, they are not ideal for humans:

- Operations teams need short identifiers for verbal communication (“please check shipment `SHIP-1024`”).
- Customer-facing artefacts (emails, packing slips, dashboards) benefit from predictable, branded identifiers.
- Back-office workflows often require searching or reconciling records using legacy system references that follow simple integer or prefix patterns.

Relying exclusively on opaque CUIDs forces us to expose long, alphanumeric strings to end-users and support teams, increasing the risk of transcription errors and making documentation harder to follow.

## Decision
In addition to each model’s CUID primary key, core business entities (e.g. Fulfillment, Order, Shipment, Invoice, Return) must store a secondary, human-readable identifier. This identifier:

1. Uses a short, descriptive prefix (e.g. `FUL-`, `SHIP-`, `ORD-`) followed by a monotonically increasing integer.
2. Is unique within the model’s table (`@unique` in Prisma).
3. Is treated as the canonical “external reference” for UI surfaces, support tools, notifications, and reporting.
4. Is generated server-side to guarantee sequential numbering and prevent collisions.

Example Prisma model fragment:

```prisma
model Fulfillment {
  id             String @id @default(cuid())
  reference      String @unique @map("fulfillment_ref")
  // ...
}
```

The `reference` field would contain values such as `FUL-000123`.

## Consequences
- APIs and UI components must return both identifiers; client apps should prefer the human-readable reference in user-facing contexts.
- We need a reliable sequence generator per entity (database sequence, table of counters, or monotonic service). This introduces extra infrastructure but keeps the system friendly for humans.
- Migrating existing records requires backfilling references and ensuring numbering continuity.
- When integrating with external systems, we can map directly to the human-readable references without exposing internal CUIDs.

## Alternatives Considered
- **Expose only CUIDs:** rejected due to poor ergonomics for support and customer interactions.
- **Use natural keys (e.g. order numbers from an ERP):** insufficient because not all entities integrate with external systems, and we still want consistent prefixes across products.
- **Generate random short IDs (e.g. nanoid):** improves readability but loses ordering guarantees, complicating reconciliation workflows.
