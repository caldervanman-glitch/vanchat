# VanHub chatbot — final post-torture security delta scan

Use this only **after manual chatbot torture testing is complete and the candidate is frozen**.

Do not merge or promote production during this scan.

## Repository and review boundary

- Repository: `caldervanman-glitch/vanchat`
- PR: `#1`
- Base branch: `main`
- Original full security-reviewed release head: `1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27`
- Original published security report commit: `ada7885a67292bd57e36a2912c43757c5de55a3a` on branch `security/vanchat-pr1-report`
- Original report verdict: **BLOCK** (1 High, 4 Medium)
- Final scan target: replace `<FINAL_FROZEN_HEAD>` with the release branch head after all manual torture-test fixes are complete.

Run **`$security-diff-scan`**, not a fresh whole-repository standard scan.

Primary diff:

`1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27...<FINAL_FROZEN_HEAD>`

The goal is to validate remediation of the five original findings and security-review only the delta added after the original full review. Do not rescan unchanged PR files from zero unless a changed file creates a new dependency or attack path into them.

## Required original-finding revalidation

Revalidate each original finding independently against the final frozen head. Do not close a finding because a nearby check exists; prove the complete source/control/sink path is closed.

### Finding 1 — High — privileged refinery/vector endpoints lacked operator authorization

Affected/related surfaces include:

- `supabase/functions/vanhub-vector-audit/**`
- `supabase/functions/vanhub-vector-distill/**`
- `supabase/functions/vanhub-refinery-adjudicate/**`
- `supabase/functions/vanhub-vector-audit-fallback/**`
- `supabase/migrations/20260822102655_security_operator_auth_helpers.sql`

Expected security invariant:

1. Supabase gateway JWT verification remains enabled for these privileged functions.
2. A valid ordinary project JWT alone is insufficient.
3. A separate high-entropy VanHub operator credential is verified **before** any OpenAI call, private vector read, service-role client construction/use, or privileged database mutation.
4. Raw operator credentials are not committed to GitHub. Only a non-secret verification hash may be in source; the actual credential is stored in Supabase Vault and injected by internal callers.
5. Vector-store IDs/resources remain constrained to the intended VanHub store/domain.
6. The old fallback hard-coded QA token path must not remain as a sibling bypass.

Explicitly test/trace:

- no operator credential -> denied before privileged work;
- ordinary user JWT without operator credential -> denied;
- wrong operator credential -> denied;
- valid internal/operator path -> permitted;
- `vanhub-vector-audit-fallback` cannot bypass the same boundary;
- no raw token is present in repository history added by this remediation.

### Finding 2 — Medium — stale/substr-matched route recovery

Affected surfaces:

- `supabase/functions/vanhub-chat-kernel/flow56_release_controller53.ts`
- `supabase/functions/vanhub-chat-kernel/flow56_release_controller54.ts`

Expected security invariant:

- recovered route endpoints must be grounded in the **current customer message**;
- a complete new route statement replaces stale retained endpoints as one pair;
- partial endpoint recovery may only use the retained opposite endpoint when the current customer message explicitly contains the complete `A to B` relation;
- token/phrase boundaries must be used — e.g. `ham` must not match `Birmingham`.

Required controls:

- `Manchester to Sheffield` correction must not retain an earlier Leeds/York endpoint;
- `ham` must not satisfy evidence for `Birmingham`;
- ordinary literal routes must still work.

### Finding 3 — Medium — QA expectation runner lacked operator authorization

Affected surfaces:

- `supabase/functions/vanhub-chat-expectation-runner/**`
- `supabase/migrations/20260822102655_security_operator_auth_helpers.sql`

Expected security invariant:

- gateway JWT verification is enabled;
- handler-level operator authentication occurs before service-role access or QA writes;
- public/publishable/ordinary authenticated credentials alone cannot invoke the runner;
- internal `private.qa_expectation_invoke` reads the operator credential from Vault at call time rather than embedding it in SQL/source;
- denied requests write no QA rows and trigger no kernel/model work.

### Finding 4 — Medium — model-normalized date could mismatch customer date phrase

Affected surface:

- `supabase/functions/vanhub-chat-kernel/flow56_release_controller40.ts`

Expected security invariant:

- the model ISO is never accepted merely because it is well-formed and a separate human date phrase appears in the message;
- this model-restoration fallback may accept only an absolute literal customer date that deterministically resolves to the **same ISO**;
- relative/weekday date handling remains the responsibility of the existing deterministic parser, not model restoration.

Required controls:

- customer `5 September` + model `2026-09-06` -> must not promote the model ISO;
- customer `5 September` + matching `2026-09-05` -> legitimate behavior remains available when applicable.

### Finding 5 — Medium — model-only container count could replace canonical inventory

Affected surface:

- `supabase/functions/vanhub-chat-kernel/flow56_release_controller33.ts`

Expected security invariant:

- extractor evidence is a locator, not proof;
- an approximate `20 boxes` / `30 bags` replacement is allowed only when the complete count + container noun is literally present in the **current customer message**;
- model-supplied evidence containing a number must never establish a customer count by itself.

Required controls:

- customer says no count but model/evidence says `20 boxes` -> canonical state must not become `20 boxes`;
- customer literally says `about 20 boxes` -> legitimate normalization may proceed.

## Post-original-review chatbot delta that must also be scanned

Manual torture testing after the original security review added or changed behavior around:

- driver-visible quote-risk notes;
- multi-stop preservation into confirm/job payloads;
- access/carry-distance preservation;
- vague lifting-help notes and qualification;
- appliance plumbing warnings and driver notes;
- mixed house-move motorbike make/model ordering;
- dismantling/reassembly and optional image prompts;
- candidate confirmation path.

Review at least:

- `supabase/functions/vanhub-chat-kernel/flow56_release_controller73.ts`
- `supabase/functions/vanhub-chat-kernel/flow56_release_controller74.ts`
- current top controller if later torture testing adds controller75+;
- `supabase/functions/vanhub-chat-confirm/driver_notes_v8.ts` or later;
- `supabase/functions/vanhub-chat-confirm-candidate/**`;
- any later files changed between this instruction file and `<FINAL_FROZEN_HEAD>`.

Security questions for that delta:

- Can customer text become stored/rendered HTML/JS (stored XSS) in driver-facing notes/job board?
- Are notes bounded in size and safely serialized?
- Can multi-stop/customer notes modify protected job fields or RPC parameters unexpectedly?
- Does confirm still enforce the correct session/draft/job authorization and idempotency boundary?
- Can an attacker force duplicate jobs, cross-session confirmation, stale-write bypass, or privilege escalation?
- Do optional attachment/image metadata paths introduce unsafe URLs, file references, or trust-boundary changes?

## Deployment facts to verify during the final scan

Do not assume repository defaults. Query the deployed Supabase project and record the actual configuration.

Expected at the security-fix stage:

- production `vanhub-chat` remains the untouched live v47 until final promotion;
- production `vanhub-chat-confirm` remains untouched until final promotion;
- isolated `vanhub-chat-kernel` is the release candidate;
- privileged vector/refinery functions use `verify_jwt=true`;
- `vanhub-chat-expectation-runner` uses `verify_jwt=true`;
- `vanhub-vector-audit-fallback` must also use `verify_jwt=true` after remediation;
- operator-protected functions additionally enforce the application-level operator credential in-handler.

Also inspect current database ACL/RLS for the changed QA/refinery helper path. In particular, verify that `qa_refinery_resume_queue_fire()` is not executable by `PUBLIC`, `anon`, or `authenticated`, and that SECURITY DEFINER helpers expose execute only to the intended privileged role(s).

## Release evidence to consume

Before final security verdict, confirm the final frozen candidate has:

- recorded-extractor replay CI green;
- deterministic selftest 500/500;
- all post-torture regression cases green;
- concurrency/idempotency/stale-write checks green if any persistence/confirm path changed;
- exact Supabase release-candidate pin matches `<FINAL_FROZEN_HEAD>`.

Do not treat these functional results as security proof; use them to ensure remediation did not break legitimate behavior.

## Output required

For each of the five original findings return one of:

- **FIXED — validated**
- **STILL OPEN**
- **NEEDS REVIEW / runtime proof gap**

Then list any **new** findings introduced by the post-review delta.

For every reportable issue include source, attack path, exact location, attacker capability, impact, conservative severity, and whether it blocks release.

Final verdict must be one of:

- **PASS**
- **PASS WITH NON-BLOCKING HARDENING**
- **BLOCK RELEASE**

Any plausible High/Critical, or any unresolved original finding that still crosses a supported security boundary, blocks release.

Do not merge, promote, or deploy production as part of the scan.
