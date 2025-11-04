# Module Ground Truth & Test Matrix

This reference captures the business “must be true” statements for each core domain and maps them to the specs that enforce those expectations. Update this file whenever the business rules change or when new coverage lands so support and engineering can confirm behaviour without reading every test.

## Payments

### Business ground truth
- Stripe is the system of record for charge authorisation; an order is considered paid only after the associated Stripe payment intent succeeds.
- On `payment_intent.succeeded` we must mark the order `PAID`, record the payment on the invoice, publish `order.paid`, and append an order timeline event.
- Replaying the webhook for an already-paid order must be idempotent (no duplicate payments or events).
- Invoice reconciliation errors surface to operators in tests (rethrow in `NODE_ENV=test`) but downgrade to logging in non-test environments.

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| First-time payment intent succeeds | `apps/app-api/src/payments/__tests__/payments.service.spec.ts` | Verifies order mutation, invoice reconciliation, event emission. |
| Replayed payment for paid order | Same unit suite | Ensures idempotency, no extra events. |
| Invoice reconciliation failure handling | Same unit suite | Asserts rethrow in test, log-only otherwise. |
| Stripe checkout + webhook happy path | `apps/app-api/test/service-integration/payments.integration.spec.ts` | Exercises HTTP surfaces and Stripe worker helpers. |
| Order fulfillment cascade from payment | `apps/app-api/test/order-fulfillment-flow.e2e-spec.ts` | Full flow: payment → automation → shipment. |

## Invoices

### Business ground truth
- Every order has at most one open invoice; `recordStripePayment` must either locate the invoice or create it via the sequence service.
- Manual payments must not allow overpayment, negative amounts, or actions on void invoices.
- Invoices publish `invoice.issued` and `invoice.paid` domain events and append order timelines.

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Stripe payment allocation | Covered indirectly via payments specs | Documented reliance on payments suite; explicit invoice unit specs still TODO. |
| Manual payment guard rails | TODO | Track in `docs/testing/todos.md` (Manual invoice payment suite). |
| Invoice event emission | TODO | Pending once invoice-specific unit tests are authored. |

## Orders

### Business ground truth
- Draft orders require at least one item and a consistent currency across all lines.
- Checkout is only supported when every line item price source is `LIST`.
- Order payment status transitions: `PENDING_PAYMENT` → `PAID` (on Stripe success) → downstream fulfillment; no other transitions currently allowed.
- Timeline events must mirror every major transition (creation, payment, fulfillment update).

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Draft guard rails | `apps/app-api/src/orders/__tests__/orders.service.spec.ts` | Validates empty/mixed currency rejection. |
| Checkout eligibility checks | Same unit suite | Blocks paid orders and bespoke pricing. |
| End-to-end order lifecycle | `apps/app-api/test/order-fulfillment-flow.e2e-spec.ts` | Covers draft → checkout → paid → fulfilled. |

## Automation

### Business ground truth
- Automation scenarios execute asynchronously via BullMQ; they must enqueue domain-specific jobs, record telemetry, and fan out to the legacy bridge (currently stubbed).
- Every automation run records metrics in the job monitor; failures escalate to dead-letter queues after configured retries.
- Automation may rehydrate state from the API before invoking outbound calls (no direct DB writes).

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Shipment automation via queues | `apps/app-api/test/service-integration/automation-tracking.integration.spec.ts` | Validates queue wiring, telemetry assertions. |
| Legacy bridge stub coverage | TODO | Pending implementation of real bridge calls (tracked in roadmap). |
| Unit coverage of executor invariants | `apps/app-api/src/automation/__tests__/automation.executor.spec.ts` | Ensures payload validation and job creation. |

## Tracking

### Business ground truth
- Courier events (USPS, DHL, Chit Chats, Canada Post) normalize into our tracking schema and must update shipment status idempotently.
- Tracking updates append shipment timeline entries and trigger automation follow-ups when status changes to delivered or exception states.

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Courier webhook ingestion | `apps/app-api/test/service-integration/courier-ingestion.integration.spec.ts` | POST payloads per courier; checks normalization + response codes. |
| Automation follow-up after delivered | `apps/app-api/test/service-integration/automation-tracking.integration.spec.ts` | Ensures automation trigger on delivered status. |
| Unit parsing for courier adapters | TODO | Pending adapter modularization; see `docs/testing/todos.md`. |

## AuthZ / AuthN

### Business ground truth
- Admin users may create support agents; support agents must be forbidden from managing users or privileged resources.
- Session tokens carry roles; guards enforce the role matrix at controller level.
- Legacy Google OAuth and JWT issuance remain source of identity; tests should avoid mocking guard internals where possible.

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Guard unit coverage | existing guard specs under `apps/app-api/src/auth/__tests__` | Verifies role guards and policy helpers. |
| Support role restriction | `apps/app-api/test/service-integration/authz.integration.spec.ts` | Admin creates support agent; support agent forbidden from user creation. |
| Login/session flows (UI) | TODO | To be covered when Playwright auth suites land. |

## Job Monitor

### Business ground truth
- Every queued, retry, success, and failure path must upsert a job run record with accurate attempt counts and timestamps.
- Job events append to `jobRunEvent` when the run exists; missing runs should log but not throw.
- Retried jobs must compute the next availability timestamp based on BullMQ delay/attempt metadata.

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Record queued runs idempotently | `apps/app-api/src/jobs/__tests__/job-monitor.service.spec.ts` | Upsert assertions. |
| Mark failures and retries | Same unit suite | Validates finishedAt, next run scheduling, lastError tracking. |
| Append events for existing jobs | Same unit suite | Confirms no-op when missing. |
| Service-level telemetry | `apps/app-api/test/service-integration/job-monitor.integration.spec.ts` | Integration coverage when workers run (suite added alongside automation specs). |

## Sequences

### Business ground truth
- Sequence service allocates monotonic, prefixed references per domain (orders, invoices, payments).
- It must be atomic under concurrent requests (transaction + `SELECT FOR UPDATE` semantics).

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Sequential issuance per key | `apps/app-api/src/common/sequence/__tests__/sequence.service.spec.ts` | Ensures ordering and prefixing. |
| Concurrency guard | Same unit suite | Simulates contended allocations via mocked Prisma transaction. |

## Domain Events

### Business ground truth
- Events are persisted before emission; immediate emit tries once and defers to dispatcher on failure.
- `eventBus.maxAttempts` controls retries before dead-lettering.
- Payload `null` maps to `Prisma.JsonNull`; undefined payloads remain null in storage.

### Test matrix
| Scenario | Spec | Notes |
| --- | --- | --- |
| Happy-path emit | `apps/app-api/src/events/__tests__/domain-event.service.spec.ts` | Ensures persistence + deliveredAt update. |
| Immediate emit failure | Same unit suite | Verifies lastError + retry handling. |
| Dead-letter exhaustion | Same unit suite | Tests dead-letter flag. |
| Dispatcher retry integration | TODO | Coverage to be added once dispatcher harness is finished (`docs/testing/todos.md`). |

---

**Updating this document**
- When you add a new rule or spec, update both the ground truth bullet list and the matrix row.
- If a scenario is intentionally untested, mark it as TODO with a backlog reference so we can triage it explicitly.
