# Decision and Technology Research Review — Final Verification

**Review date:** 2026-10-25  
**Verdict:** The latest revision closes the prior implementation and technology findings. The .NET 10 workers and dispatcher are supported on current AWS Lambda; the existing `net8.0` shared projects are framework-compatible references for `net10.0` consumers, subject to package-specific build/runtime verification. S3 versioning/finalization, transient snapshot cleanup, SSE-S3, CORS and the Open XML prototype status are accurate. No blocking technical research finding remains.

**Final delta checked:** AD-20 now specifies one active published version per model, atomic pointer switching, preview-token invalidation if a version is replaced/deactivated before confirmation, and immutable version pinning for already confirmed work. This is internally consistent with PRD FR-6 (new version becomes the one used by new exports, history remains identifiable) and FR-7/FR-9 (the selected version is fixed for that export). No technology or cross-version compatibility conflict was introduced.

**Latest delta checked:** AD-21/AD-24 split asynchronous work into `template-validation`, `model-preview`, `export-preview` and `export-generation`. Draft model preview validates mapping against a bounded authorized sample and cannot issue an export token; export preview requires the active published version and creates the exact-data snapshot consumed by export generation. This removes the previous synchronous preview-snapshot concern and keeps draft and published model semantics distinct. Runtime, storage, licensing and SDK selections are unchanged and were rechecked against the sources below; no new current-technology issue was introduced.

## Verified decisions

### .NET runtime and shared project compatibility

- Latest spine labels the API as existing `.NET 8` / `dotnet8` and the new validation/preview/export workers and outbox dispatcher as `.NET 10 LTS` / `dotnet10`. All diagrams and project tree references now show .NET 10 for workers.
- AWS's current C# Lambda guide lists `dotnet10` on Amazon Linux 2023, with the runtime's deprecation in 2028. Microsoft lists .NET 10 as active LTS through November 14, 2028. The recommendation does not depend on a preview runtime. [AWS Lambda C# runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-csharp.html), [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).
- Repository reality: Core, UseCases and Infrastructure projects explicitly target `net8.0`; the current API Lambda also uses `dotnet8`. Microsoft's TFM compatibility rules say a newer framework can consume assets targeting an older compatible framework (their example is `net9.0` consuming `net8.0`). A `net10.0` worker can therefore reference these project outputs at the framework level. Compile and validate the actual dependency graph and runtime behavior when the worker is introduced. [NuGet package compatibility rules](https://learn.microsoft.com/en-us/dotnet/standard/library-guidance/nuget-package-compatibility-rules).
- The existing API uplift remains an explicit Deferred action with a date trigger before .NET 8 support ends November 10, 2026. This is a material inherited deployment risk, but it is visible and outside the worker-specific choice.

### Workbook processing candidate

- NuGet currently lists `DocumentFormat.OpenXml` 3.5.1 as the newest listed stable version, MIT licensed and compatible with .NET 8+. This supports listing it as an open-license prototype candidate for the .NET 10 worker, not as an approved production engine.
- The spine still requires a sanitized `.xlsx`/`.xlsm` compatibility fixture before production approval and avoids claiming that Open XML SDK preserves the sample's formulas, VBA or other package parts. That qualification is accurate. [NuGet: DocumentFormat.OpenXml 3.5.1](https://www.nuget.org/packages/DocumentFormat.OpenXml/3.5.1).

### S3 storage, validation, preview snapshots and transfer

- **Versioning/finalization:** S3 assigns version IDs when versioning is enabled; `CopyObject` can select a particular source `versionId`. The spine captures the uploaded version ID and validates/copies that exact version rather than the mutable current key. The source-object version ID and destination object's version ID being different is immaterial because the immutable template key is recorded. [S3 versioning workflow](https://docs.aws.amazon.com/AmazonS3/latest/userguide/versioning-workflows.html), [CopyObject API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html).
- **Presigned upload:** AWS documents that the URL is a bearer capability and a PUT to an existing key replaces its content. The spine states URLs are replayable until expiry, confines uploads to staging keys and finalizes an exact object version before copying accepted bytes to immutable storage. The five-minute maximum for download URLs is a narrower application policy than AWS's presigning maximum and is supported.
- **CORS:** The spine requires bucket-level S3 CORS origins, methods and headers for web signed transfer in preview/production. S3 exposes bucket CORS configuration and evaluates browser cross-origin requests against those rules. [PutBucketCors API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketCors.html).
- **Encryption:** SSE-S3 applies by default to new S3 objects at no extra encryption charge. The spine correctly chooses that default for the MVP; it does not claim KMS-managed keys. [S3 default encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-bucket-encryption.html).
- **Async template validation and preview projection:** These now run as typed SQS work items on .NET 10 Lambda workers instead of the 30-second API request. The API handles authorization/metadata and returns job state/sample only when complete. AWS documents SQS event source mappings, queue visibility/retry behavior and DLQs; the SAM project implementation remains future work. [SQS Lambda event-source configuration](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-configure.html).
- **Snapshot privacy and retention:** Export preview stores exact projected rows as a private encrypted S3 snapshot and gives the UI a bounded sample/token; export consumes that snapshot and rechecks authorization. Limits for snapshot rows/bytes are to be set from pilot evidence before production. Cleanup explicitly covers current and noncurrent snapshot/output/staging versions, so bucket versioning does not silently defeat expiry. Exact TTL remains a deliberate Deferred data-retention decision, required before production.

## Remaining risk / deferred item

The existing production API still targets `dotnet8`, whose Microsoft support ends November 10, 2026; the spine explicitly requires an API runtime uplift plan before that date. This is not a new-worker design blocker, but it must be treated as a release/operations obligation and not allowed to disappear from planning.

The exact S3/SQS .NET SDK package versions are correctly Deferred because the current solution uses AWS SDK v3 for SES and the worker packaging/dependency graph must be kept coherent. No specific version or package compatibility has been incorrectly committed.
