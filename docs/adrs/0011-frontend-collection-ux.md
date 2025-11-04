# 0011 – Frontend Collection UX Standards

## Status
Accepted

## Context
- Tables, dropdowns, and selectors currently use basic primitives that struggle with larger datasets (hundreds of companies, contacts, etc.).
- Upcoming features need richer table capabilities (sorting, filtering, column toggles) and better selection inputs (typeahead, virtualisation).
- We want consistent UX building blocks that scale to tens of thousands of client-side records without rewriting each screen.

## Decision

1. **TanStack Table for Grids**: Standardise all data tables on TanStack Table v8 inside our Shadcn UI wrappers. Tables default to client-side pagination/sorting/filtering. Server-side pagination is deferred until we exceed ~100k rows or hit bandwidth issues.
2. **Table Toolkit**: Provide shared table utilities (column helpers, table toolbar with search/filter slots, pagination controls) under `components/ui/table-toolkit`.
3. **Combobox Selection**: Replace large `<Select>` dropdowns with Shadcn `Command`-based comboboxes, supporting async search and option virtualisation. New `CompanyPicker`/`AddressPicker` components will use this pattern.
4. **Virtualised Lists**: When option sets exceed ~200 items, use `@tanstack/react-virtual` (or equivalent) to virtualise the list. Defaults apply to company/asset/device pickers.

## Consequences
- Users get responsive, accessible tables and pickers even with large datasets.
- Developers assemble tables using common building blocks, reducing repeated configuration.
- Existing dropdowns/tables will be migrated piece by piece as we touch those areas; new screens must start with the shared components.
- Storybook examples and documentation must be added for each shared component to speed onboarding.
