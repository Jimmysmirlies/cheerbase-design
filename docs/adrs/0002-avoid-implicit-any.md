# ADR 0002: Avoid `any` and Unsafely Typed Code

## Status
Accepted

## Context
To maintain type safety across the Mobilytics codebase we rely on TypeScript's strict mode and lint rules that prohibit `any` (and related unsafely typed expressions). Occasional pressure to ship quickly can tempt developers to silence errors by adding explicit `any` annotations, suppressing lint warnings, or returning untyped data. These shortcuts erode the value of static analysis, make it harder to refactor, and increase the likelihood of runtime bugs—especially in shared modules and APIs.

## Decision
We will not introduce new uses of the `any` type (explicit or implicit) or other constructs that disable TypeScript's safety checks (e.g., `// eslint-disable @typescript-eslint/no-unsafe-*`, `as any`). If a type hole is encountered, engineers must either:

1. Model the correct TypeScript type information (interfaces, generics, discriminated unions, etc.), or
2. Isolate the untyped boundary in a narrow adapter that performs runtime validation and returns typed data to the rest of the system.

Existing lint rules that catch unsafe assignments and member access (`@typescript-eslint/no-unsafe-*`) must remain enabled, and suppressions require a code review discussion and explicit justification.

## Consequences
- Development may take slightly longer up front when types are ambiguous, but the payoff is safer refactors and fewer runtime surprises.
- Pull requests introducing `any` or blanket lint disables should be blocked until they adopt stronger typing or add focused adapters/validators.
- In rare cases where third-party libraries expose untyped APIs, we will add type declaration shims or leverage Zod/Valibot/class-validator to enforce runtime contracts before values propagate.
- Existing `any` usage must be scheduled for cleanup; each occurrence should be tracked and replaced with precise types as surrounding context becomes better understood.

## Alternatives Considered
- **Allow `any` when convenient:** rejected because it encourages bypassing type safety, negating TypeScript’s benefits.
- **Disable the strict lint rules:** rejected since it would enable unchecked casting and member access, reintroducing runtime errors we specifically want to avoid.
