# 0010 – Frontend Data Loading Strategy

## Status
Accepted

## Context
- The app mixes purely client-side fetching with server-rendered pages, causing duplicate requests and flashes of loading states.
- Next.js App Router encourages server components for initial data and client components for interactivity, but we lack guidance on when to load where.
- Phase 2+ features rely on reliable SSR for SEO and faster first paint while still leveraging React Query for mutations and cache hydration.

## Decision
Adopt a hybrid data loading pattern:

1. **Server Components First**: Route-level pages fetch initial data on the server via the same resource clients (using `cache: 'no-store'` or revalidation when required). The data is passed to client components as props.
2. **Client Hooks Hydrate**: Matching React Query hooks accept an `initialData` option so the cache is primed from the server payload and mutations reuse the same store.
3. **Refetch Policies**: Hooks opt into background refetch (`refetchOnWindowFocus: false`, `refetchOnReconnect: false`, manual refresh actions) unless real-time updates are critical.
4. **Error Surface**: Server loaders throw for fatal failures (rendering Next error pages), while client hooks present inline toasts/forms for recoverable issues.

## Consequences
- Pages render with data immediately, reducing loading spinners and improving perceived performance.
- All fetch logic still flows through the shared API clients, keeping behaviour consistent regardless of render layer.
- Developers must export async page components (awaiting `params`) and wire the `initialData` plumbing when introducing new hooks.
- We should add docs and examples for the pattern (company detail, settings list) and ensure our testing strategy covers both server and client flows.
