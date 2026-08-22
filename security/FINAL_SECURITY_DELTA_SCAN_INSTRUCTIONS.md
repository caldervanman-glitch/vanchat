# Final post-torture security delta scan instructions

Use this file only after human chatbot torture testing is complete and the release candidate has been frozen.

## Purpose

Do **not** repeat the original full PR #1 review from scratch. The original Codex Security review already covered the PR through frozen head:

`1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27`

Published report:

`security/vanchat-pr1-report/security/reports/vanchat-pr1-security-review.md`

Report publication commit:

`ada7885a67292bd57e36a2912c43757c5de55a3a`

The final security task is a **targeted security diff scan** from the previously reviewed release head `1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27` to the final frozen HEAD of `fix/mixed-load-specialists-v48` after human torture testing and all resulting fixes are finished.

At scan time, resolve and record the exact final HEAD SHA. Do not use the SHA that happened to be current when this instruction file was written.

## Scan mode

Use `$security-diff-scan`.

Repository: `caldervanman-glitch/vanchat`

Base security-reviewed release SHA: `1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27`

Head: resolve the final frozen SHA of `fix/mixed-load-specialists-v48` at scan time.

Do not merge, promote production, or make unrelated code changes during the scan.

## Original findings that MUST be revalidated

The first review returned BLOCK with five reportable findings. Treat them as explicit regression targets, not merely background context.

1. **High — refinery/vector privileged operations lacked operator authorization.**
   - Revalidate `vanhub-vector-audit`, `vanhub-vector-distill`, `vanhub-refinery-adjudicate`, and the QA-only vector fallback if present.
   - Supabase gateway JWT verification is only an outer control; prove application-level operator authorization occurs **before** OpenAI access or construction/use of a Supabase service-role client.
   - Verify requests without the operator credential and requests with only an ordinary project JWT cannot reach privileged operations.
   - Verify the raw operator credential is not committed to GitHub. A one-way SHA-256 verifier may be committed; the raw token is held in Supabase Vault as `vanhub_operator_token`.

2. **Medium — route recovery could promote stale or substring-matched endpoints.**
   - Revalidate `flow56_release_controller53.ts` and `flow56_release_controller54.ts` plus direct callers.
   - Both endpoints of a recovered complete route must be grounded together in the current customer message.
   - A new complete current-message route must not retain a stale endpoint.
   - Location matching must be token/phrase bounded: e.g. `ham` must not prove `Birmingham`.

3. **Medium — QA expectation runner lacked operator authorization.**
   - Revalidate `vanhub-chat-expectation-runner` including the secure wrapper actually deployed.
   - Prove operator authorization occurs before the reviewed runner can create a service-role client or write QA state.
   - Revalidate `private.qa_expectation_invoke` and every helper that injects `x-vanhub-operator-token`.
   - Every SECURITY DEFINER helper capable of injecting the operator token must be inaccessible to `public`, `anon`, and `authenticated`; it may be executable by `service_role`/database owner only.

4. **Medium — model-normalized ISO date could mismatch the customer's literal date.**
   - Revalidate `flow56_release_controller40.ts` and subsequent date controllers.
   - A model ISO must not be promoted merely because a human date phrase exists. The literal customer phrase must deterministically resolve to that exact ISO, or the model fallback must be rejected.
   - Relative/weekday dates may continue through existing deterministic date parsing; do not weaken supported date UX simply to close the finding.

5. **Medium — model-only container counts could replace canonical inventory.**
   - Revalidate `flow56_release_controller33.ts` and downstream requirements recomputation.
   - Approximate box/bag/crate count promotion must require the count + compatible container noun in the actual current customer message. Model `evidence` is a locator, never proof.

## Post-review behavioural changes that require security delta review

Human torture testing after the first security baseline changed the candidate. Include these paths and their direct sinks:

- driver-risk-note retention and exact customer wording
- long carry, stairs, parking and ambiguous-endpoint access notes
- motorbike make/model-before-condition gate
- appliance plumbing warnings and driver notes
- dismantling/reassembly size flow and optional media/photo prompting
- multi-stop route persistence
- confirm-candidate projection of route/risk information into driver-visible job data
- any further chatbot changes made after this file was written

Trace material data through the full affected path where applicable:

`customer message -> extractor candidate -> deterministic reducer -> draft state -> review -> confirm payload -> privileged RPC -> jobs / driver-visible output`

Look specifically for stored XSS / unsafe rendering risks in driver-visible notes, authorization mistakes, privilege expansion, request replay/idempotency regressions, malformed payload handling, and accidental trust of model/retrieval data as customer evidence.

## Required Supabase runtime evidence

The first report had partial coverage because deployed gateway settings and production DB policies were unavailable to Codex. The final scan must not repeat that gap if Supabase access is available.

Inspect the deployed Supabase project `adpphssfoxpyzzonqofz` and record, at minimum:

- `verify_jwt` for each privileged refinery/vector/QA function
- the actual deployed entrypoint/wrapper for each reviewed function
- that the operator-auth wrapper precedes OpenAI/service-role actions
- function ACLs (`proacl` or equivalent) for operator-token-injecting SECURITY DEFINER helpers
- relevant RLS / RPC privileges for the confirm/job-creation path if it changed in the final delta

Expected privileged Edge configuration after remediation:

- `vanhub-vector-audit`: `verify_jwt=true` + operator token
- `vanhub-vector-distill`: `verify_jwt=true` + operator token
- `vanhub-refinery-adjudicate`: `verify_jwt=true` + operator token
- `vanhub-chat-expectation-runner`: `verify_jwt=true` + operator token
- `vanhub-vector-audit-fallback` if retained: `verify_jwt=true` + operator token

Expected database helper boundary:

- operator-token-injecting SECURITY DEFINER helpers: no execute for `PUBLIC`, `anon`, or `authenticated`; `service_role` only (database owner/superuser remains implicit).

Do not print or store the Vault operator token in the report.

## Release deployment context

Production must remain unchanged during torture testing/security review unless the operator explicitly changes this policy.

Expected production baseline before final promotion:

- customer-facing `vanhub-chat`: v47
- customer-facing `vanhub-chat-confirm`: v5

The isolated kernel and confirm candidate may have higher version numbers. Resolve their actual deployed versions and pinned GitHub SHAs at final scan time; do not rely on historical version numbers in this document.

## Coverage rule

Review every source file changed since `1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27` that can affect a security boundary, plus the smallest set of direct callers/sinks required to validate the path.

Do not re-audit unrelated files that are byte-identical to the already-reviewed baseline unless a changed caller, configuration, or trust relationship makes them newly relevant.

## Validation standard

For each original finding and any new candidate issue:

- identify actor and attacker capability
- identify exact source -> transformations -> control -> sink
- prove runtime/deployment reachability where configuration matters
- state counterevidence
- separate exploitable vulnerability from hardening
- reject false positives explicitly
- use conservative severity

For the authorization findings, test both denial and legitimate service paths. A fix is not complete if it blocks the intended refinery/QA workflow.

For evidence-grounding findings, add or run exact regression/replay cases demonstrating that malicious or stochastic model candidates cannot change canonical state without current-message customer evidence.

## Required output

Return:

1. exact baseline SHA and final frozen HEAD SHA
2. Supabase deployed versions/settings inspected
3. status of original Findings 1-5: `fixed`, `still vulnerable`, or `needs review`, with evidence
4. any new findings introduced since the original review
5. changed-source coverage list
6. runtime/deployment proof gaps, if any
7. final verdict: `PASS`, `PASS WITH HARDENING`, or `BLOCK RELEASE`

A High/Critical finding, an unresolved operator-authorization path, or a broken evidence-grounding invariant blocks production promotion.
