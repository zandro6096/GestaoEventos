# Architecture Spine Review — Final Rubric Pass

**Verdict: pass. No remaining rubric findings.** The latest revision explicitly separates the draft model-preview from the active-version export-preview and subsequent generation. Each has its own typed work item, state lifecycle, authorization rule and output; only export-preview creates the exact-data snapshot/token.

## Confirmed checks

- **Preview scope and versioning:** `model-preview` tests an unpublished draft mapping against a bounded authorized sample, creates no export snapshot and cannot issue an export token. `export-preview` requires an active published model version, creates a scoped exact-data snapshot, and generation consumes that snapshot. Confirmation revalidates the active version; once accepted, a generation item pins its version.
- **Timeout path:** template validation, model-preview, export projection/snapshot creation and workbook generation run through typed SQS work items on .NET 10 Lambda workers. The HTTP API handles authorization and metadata.
- **Durable dispatch and retries:** work items and outbox events share a MySQL transaction; an EventBridge-scheduled dispatcher works independently of HTTP. Idempotency keys, leases, attempt-specific object keys, conditional terminal transitions, bounded retries, DLQ and reconciliation are specified.
- **Snapshot lifecycle and limits:** private encrypted snapshot stores exact rows and a minimal sample; the client receives only the bounded sample and opaque token after readiness. Snapshot bytes stay out of SQS, DB audit and logs. Terminal cleanup and lifecycle expiry are required; snapshot row/byte caps and exact TTL are deployment prerequisites.
- **Upload validation:** versioned staging objects, authorized finalize, exact version capture, asynchronous server-side validation, immutable accepted copy and publish gating are clear.
- **Permissions:** active Estrutura, catalog fields and Group scope are checked in configuration, preview, worker processing, status and download. Scope loss fails the export as a whole and blocks new downloads.
- **Workbook integrity:** mappings cannot overwrite formula cells or overlap; repeated formula expansion requires processor-fixture proof. Formulas and VBA remain inert; output does not claim to calculate formulas.
- **Resource and operations:** upload/output bytes, archive expansion, preview rows/bytes, sheet/row counts, processing time, queue concurrency and retention are bounded before production; alarms/recovery and dev/preview/prod resources are represented.
- **Prior findings:** dispatcher ownership, formula-cell collision, direct-upload validation, post-preview authorization, retry races, URL TTL/reuse/logging, audit privacy, parity manifest, and split upload/export flows are resolved.
- **Runtime support:** API .NET 8 uplift before 2026-11-10 is explicitly deferred with a deadline and approved-plan condition; new workers/dispatcher use verified supported .NET 10 Lambda.

## Rubric checklist

- **Scope and altitude:** Pass. FR-1–FR-10 and UJ-1/UJ-2 map to client, API, work items, worker, storage and operations.
- **AD quality:** Pass. Decisions have enforceable rules and close divergence points across independently built units.
- **Codebase fit:** Pass. Expo feature layering, Clean Architecture/CQRS, dynamic authorization, SQL-first preference and current frequency/CSV behavior are respected.
- **Inherited consistency:** Pass. Parent AD-1 through AD-18 remain by original IDs without weakening.
- **Technology currency:** Pass with explicit deferrals. Existing stack versions are grounded in the repo, .NET 10 is verified, and package/library selections pending compatibility evidence are not silently bound.
- **Operational envelope:** Pass. Runtime lanes, S3/SQS, IAM, CORS, encryption, lifecycle, observability, recovery and rollback appear.
- **Deferred coverage:** Pass. Exact resource limits, TTL, workbook library approval, SDK package set, permission/API identifiers, and existing API runtime uplift all have revisit conditions.

## Disposition

No changes requested by this review. Production remains gated on the explicitly deferred compatibility, file-limit and retention decisions.
