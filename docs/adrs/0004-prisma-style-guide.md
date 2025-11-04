# ADR 0004 – Prisma Schema Style Guide

## Status

Accepted – 2025-01-08

## Context

Our Prisma schema has evolved quickly and different contributors have introduced new models with slightly different conventions. This inconsistency caused a handful of churns (IDs defaulting to the wrong generator, missing audit columns, camelCase table names in the database, etc.) and made it harder to reason about migrations.

We recently aligned Product/PriceBook related models but the work highlighted that we lacked a clearly documented style guide.

## Decision

We adopt the following guidelines for every Prisma model:

1. **Primary key + audit timestamps first**
   - Order fields as `id`, `createdAt`, `updatedAt` (all using `cuid()` ids and `@default(now())`/`@updatedAt` timestamps).
2. **Column order**
   - After the audit trio, list scalar columns (business fields).
   - Follow with relation definitions.
   - End the model with indexes (`@@index`, `@@unique`, …) and the table remap (`@@map`).
3. **Naming**
   - Use camelCase in Prisma models but map every table/column to snake_case via `@@map`/`@map`.
4. **Enums & shared types**
   - Represent currencies and other shared domain values as enums instead of strings.

These rules apply to every new model and any existing model that we touch going forward.

## Consequences

* Schema diffs become predictable — easier reviews, smaller migrations.
* New contributors have a single reference for model layout and naming.
* We eliminate accidental omissions of audit columns and enforce consistent ID generation.

## Alternatives Considered

* “Enforce via linting only”: rejected because Prisma currently lacks built-in linting for ordering and `@map` usage.
* “Document in README only”: rejected since ADRs provide better versioned history and linking from specs.

## Follow-up Work

1. Update schema generator tooling to warn when models miss the required fields.
2. Add a checklist item to PR template referencing this ADR.
