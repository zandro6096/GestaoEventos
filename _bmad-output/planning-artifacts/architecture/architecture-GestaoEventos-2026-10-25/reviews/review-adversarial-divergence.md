# Adversarial Divergence Review — Final Pass

Target: latest `ARCHITECTURE-SPINE.md`.  
Lens: distinguish model preview from export preview; inspect their work items/tokens, diagrams, state transitions and active-version semantics.

## Verdict

Pass. The new distinction is consistent across AD-21, AD-24, state conventions and the two workflow diagrams. Model preview validates a draft mapping against a bounded authorized sample and cannot issue an export token or create a data snapshot. Export preview requires the active published version, creates the exact-data snapshot and token, and export generation consumes that snapshot. AD-20 defines one active published version and invalidates export-preview tokens when the model changes before confirmation; confirmed work remains pinned to its version.

No remaining material divergences found in these paths or in the surrounding upload, authorization, state and accessible UX rules.

## Consistency Checks Passed

- **Model preview:** work item names a draft mapping revision; worker evaluates a bounded authorized sample; UI waits for ready state before publish; no export snapshot/token is produced.
- **Export preview:** work item references filters and a currently active published model/version; worker runs the shared projection; resulting snapshot and token are tied to requester, structure, filters and version.
- **Export generation:** confirmation rechecks the active version; the confirmed work item references the export-preview snapshot; the worker reads exact snapshot rows and the pinned template version.
- **State and retries:** model preview, export preview, upload validation and export generation have separate status lifecycles; outbox/work-item processing is idempotent with conditional terminal ownership.
- **Diagrams:** upload validation and model preview show staging/version validation; export diagram shows separate preview and generation phases; deployment/worker runtime remains consistently .NET 10.
- **Accessibility:** distinct readiness states let the UI announce template validation, mapping preview, report preview and final generation separately, with no unsupported cancellation action.

## Minor Wording Note

AD-20's phrase “Preview tokens” could be made even more precise as “Export-preview tokens.” AD-21 and AD-24 already state that model preview issues no export token, so this is not a blocking divergence.
