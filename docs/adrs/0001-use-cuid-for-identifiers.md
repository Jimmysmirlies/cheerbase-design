# ADR 0001: Adopt CUID Identifiers

## Status
Accepted

## Context
Our services currently generate record identifiers for relational data. The initial NestJS App API used `uuid()` defaults in Prisma. UUIDs are widely supported but have two drawbacks for our workload:

1. Most database engines do not preserve insert order for UUID primary keys, which can lead to index fragmentation and less predictable pagination.
2. UUID v4 values are entirely random; when exposed to clients, they can be cumbersome to work with in logs and error messages.

We want identifiers that remain globally unique, are URL-safe when surfaced via APIs, and offer better index locality without a hard dependency on sequential IDs.

## Decision
Use Prisma's `cuid()` helper for primary keys instead of `uuid()`. New tables that require globally unique string identifiers should default to `@id @default(cuid())`.

## Consequences
- CUIDs maintain uniqueness guarantees while clustering more closely in database indexes compared to random UUID v4, improving write performance for growing tables.
- Generated IDs are URL-safe and shorter, making them easier to communicate and debug.
- Because CUIDs are non-sequential, they still avoid revealing record counts or creation patterns to API consumers.
- Existing tables that already rely on UUIDs will require migration plans before switching, but new tables can immediately standardise on CUIDs.

## Alternatives Considered
- **Continue using UUID v4** – Simple and well understood but keeps the fragmentation and verbosity issues outlined above.
- **Use ULID** – Provides monotonic ordering and readability, but Prisma's first-class support for ULID currently requires additional client configuration compared to built-in `cuid()`.
