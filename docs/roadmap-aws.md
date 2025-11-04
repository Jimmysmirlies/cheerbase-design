# AWS Platform Roadmap (Aligned with Application Rollout)

This roadmap tracks the infrastructure work needed to support the Mobilytics rollout milestones. It mirrors the product phases (internal dogfooding → support rollout → hardened production) and references the AWS architecture plan for technical detail.

## Phase 0 – Sandbox & Dogfood (Weeks 0‑4)
Goal: deliver a disposable but representative AWS environment so the support team can exercise the platform end-to-end while feature work continues.

- [ ] Create a new AWS account (or member account) dedicated to the app platform; configure consolidated billing and baseline guardrails (Config, GuardDuty, CloudTrail).
- [ ] Bootstrap a sandbox Terraform root (separate state bucket + DynamoDB lock) with core modules: VPC, ECS (API + workers), RDS, ElastiCache, S3/CloudFront for the support UI.
- [ ] Stand up manual deployment runbooks:
  - Terraform apply via AWS SSO/`aws-vault`.
  - Docker build/push to ECR and `aws ecs update-service --force-new-deployment`.
  - `aws s3 sync` for the support UI + CloudFront invalidation.
- [ ] Seed Secrets Manager/SSM with test credentials; document manual rotation.
- [ ] Configure CloudWatch logs + basic alarms (API 5xx, ECS task failures, queue backlog) and wire alerts to Slack/email.
- [ ] Import sanitized seed data and run service integration tests against the sandbox environment.
- [ ] Enable support dogfooding: allow limited admin accounts to exercise order → payment → fulfillment flows via the cloud stack.
- [ ] Establish secure engineer access: stand up AWS Client VPN (or confirm SSM-only approach), integrate with AWS SSO, and document onboarding/offboarding steps.
- [ ] Document “start/stop” workflow: Phase 0 environment comes up with `terraform apply` and is torn down with `terraform destroy` when idle to control cost (no compromises to the baseline Terraform topology).

## Phase 1 – Hardened Dev/Staging (Weeks 4‑8)
Goal: promote the sandbox into a durable `dev` environment, add `staging`, and introduce guardrails while product work continues.

- [ ] Rename or rebuild the sandbox as the long-lived `dev` workspace (clean destroy/reapply if needed for pristine state).
- [ ] Create a staging workspace mirroring dev; enable stricter IAM policies (read-only roles for support, write roles for platform).
- [ ] Add AWS WAF to CloudFront distributions (rate limiting + IP allow/deny lists) and enable AWS Shield Advanced if required.
- [ ] Expand metrics/alarms (RDS storage, replica lag, Redis memory, SLO latency) and integrate PagerDuty/alert routing.
- [ ] Implement automated backups & PITR validation (RDS snapshots, Redis node replacement drill).
- [ ] Build CI automation for infrastructure + deploys (GitHub Actions or selected provider) once the repo’s final GitHub org is confirmed.
- [ ] Prepare blue/green deployment strategy for ECS services (task definition revision rollback, health check gates).
- [ ] Validate staging with smoke + regression suites; rehearse disaster recovery steps (restore from snapshot, rotate secrets).
- [ ] Collect sizing data (API baseline RPS, expected concurrency, job throughput, storage growth) to right-size RDS/ECS/Redis before production.
- [ ] Introduce parameterized Terraform workspaces/var-files so ephemeral environments can be spun up and destroyed on demand (per PR or feature branch). No permanent stage/dev required unless we deliberately keep one running.

## Phase 2 – Production Launch (Weeks 8‑12)
Goal: deliver production-ready infrastructure with formal change management, observability, and support tooling.

- [ ] Provision `prod` workspace with encrypted resources (KMS CMKs for Secrets Manager, SSM, S3).
- [ ] Finalize IAM boundaries: least-privilege deploy role, break-glass operations role, read-only dashboards for support.
- [ ] Implement secret rotation playbooks (Stripe keys, USPS credentials) and integrate with AWS Secrets Manager rotation lambdas where feasible.
- [ ] Enable client-facing portal hostnames (even if the app is a placeholder) so DNS/TLS are validated before the UI ships.
- [ ] Complete operational runbooks (worker restart, DLQ processing, stuck job triage) and publish them under `docs/runbooks/`.
- [ ] Run load and failover tests (queue surge, RDS AZ failover, Redis primary swap) with rollback procedures documented.
- [ ] Coordinate cutover: update Route53, monitor 24–48 hours, and keep rollback plan (switch DNS back, redeploy legacy).

## Phase 3 – Continuous Improvement (Post-launch)
Goal: iterate on cost, resiliency, and shared infrastructure as the product expands.

- [ ] Evaluate MemoryDB vs Redis once queue durability requirements are known.
- [ ] Add cross-region disaster recovery (read replicas, S3 replication, CloudFront failover).
- [ ] Integrate third-party observability (Datadog/Honeycomb) if selected; expand tracing coverage.
- [ ] Introduce automated compliance checks (AWS Config custom rules, Terraform drift detection).
- [ ] Onboard the future client-facing portal to the same pipelines, ensuring isolation (separate CloudFront distribution, IAM scope, WAF rules).
- [ ] Periodically review cost + scaling footprints (rightsizing ECS, RDS, Redis) based on usage data.

---

**Reference documents:**  
- `docs/architecture/aws-platform-plan.md` – detailed architecture and deployment plan.  
- `docs/roadmap-todo.md` – product roadmap and phased deliverables.  
- `docs/backlog-misc.md` – outstanding QA/testing tasks tied to infrastructure readiness.
