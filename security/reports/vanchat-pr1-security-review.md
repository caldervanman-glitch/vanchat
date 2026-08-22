# Security Review: caldervanman-glitch/vanchat PR #1

## Scope

Frozen PR #1 review of all changed source files plus direct supporting code.

- Scan mode: branch_diff
- Target kind: git_revision
- Target ID: caldervanman-glitch-vanchat
- Revision range: 0d7124eda23ed257a13bcf0b3d553c43d748c3d3...1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27
- Revision: 1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: Static validation only; Deno is unavailable and live Edge Function calls were intentionally not made.
- Artifacts reviewed: artifacts/01_context/threat_model.md, artifacts/03_coverage/reviewed_surfaces.md, artifacts/04_reconciliation/validation.md, artifacts/04_reconciliation/attack_paths.md
- Scan context: Production vanhub-chat v47 was not changed. Candidate deployment v132 controller wiring was supplied by the user because checked-in kernel imports are stale.

Limitations and exclusions:
- Per-function Edge gateway configuration is not in the repository.
- Database RPC definitions and production table policies are unavailable.

### Scan Summary

| Field | Value |
| --- | --- |
| Reportable findings | 5 |
| Severity mix | high: 1, medium: 4 |
| Confidence mix | high: 2, medium: 3 |
| Coverage | partial |
| Validation mode | Focused static source/control/sink tracing with repository and official Supabase authentication documentation. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

The release adds chatbot reducers, QA automation, and vector/refinery functions. Primary assets are customer booking integrity, private vector material, canonical policy state, Supabase service-role credentials, and OpenAI quota.

### Assets

- customer job drafts
- private vector-store content
- refinery and adjudication records
- Supabase service-role access
- OpenAI API capacity

### Trust Boundaries

- public or authenticated caller to Edge Function
- customer text and model candidates to canonical booking state
- Edge Function to Supabase service role
- Edge Function to OpenAI

### Attacker Capabilities

- send crafted chatbot messages
- obtain an ordinary project JWT or public key where deployment permits
- invoke exposed Edge Functions repeatedly

### Security Objectives

- require evidence-grounded booking state
- restrict privileged QA and refinery operations to operators
- prevent private knowledge disclosure
- preserve safe qualification gates

### Assumptions

- User-supplied v132 reducer deployment mapping is authoritative.
- Missing deployment configuration is a verification gap, not evidence of protection.

## Findings

| Finding | Severity | Confidence | Detailed write-up |
| --- | --- | --- | --- |
| [New refinery endpoints expose privileged operations without application authorization](#finding-1) | high | medium | inline below |
| [Route recovery can promote stale or substring-matched endpoints](#finding-2) | medium | medium | inline below |
| [QA expectation runner can be reached without an operator authorization check](#finding-3) | medium | medium | inline below |
| [Model-normalized date can satisfy the booking gate without matching the customer phrase](#finding-4) | medium | high | inline below |
| [Model-only container counts can replace canonical inventory](#finding-5) | medium | high | inline below |

### Confidence Scale

| Label | Meaning |
| --- | --- |
| high | Direct evidence supports the finding with no material unresolved blocker. |
| medium | Evidence supports a plausible issue, but material runtime or reachability proof remains. |
| low | Evidence is incomplete and the item is retained only for explicit follow-up. |

<a id="finding-1"></a>

### [1] New refinery endpoints expose privileged operations without application authorization

| Field | Value |
| --- | --- |
| Severity | high |
| Confidence | medium |
| Confidence rationale | The source-to-privilege path is direct, but the repository lacks the deployed per-function gateway configuration. |
| Category | authorization-bypass |
| CWE | CWE-862, CWE-200, CWE-269, CWE-770 |
| Affected lines | supabase/functions/vanhub-vector-audit/index.ts:17, supabase/functions/vanhub-vector-audit/index.ts:7-15, supabase/functions/vanhub-vector-distill/index.ts:9-13, supabase/functions/vanhub-vector-distill/index.ts:27, supabase/functions/vanhub-refinery-adjudicate/index.ts:7-9, supabase/functions/vanhub-refinery-adjudicate/index.ts:34 |

#### Summary

Three new Edge Function handlers accept POST requests without checking caller identity, role, resource ownership, or an operator secret, then use OpenAI credentials and, in two cases, a Supabase service-role client.

#### Validation

All three handlers reach OpenAI or service-role operations after only request shape validation. No in-handler authorization control exists.

Validation method: Static source/control/sink trace

- **Disposition:** reportable

Limitations:
- Deployment gateway configuration is absent.

#### Dataflow

POST body to handler, no authorization guard, OpenAI and service-role operations, private content disclosure or state mutation.

#### Reachability

Supabase defaults to valid user JWT gateway checks; the handlers themselves accept any request that reaches them. Public deployment would make the path broader.

Preconditions:
- Function is deployed and reachable by a project user or publicly.

Existing controls:
- Gateway JWT verification may exist but is not role or resource authorization.

Limitations:
- No deployed function configuration was available.

#### Severity

**High** — Any ordinary authenticated project user can reach these handlers under Supabase's default JWT setting, while the handlers expose private vector content and service-role state changes. Per-function deployment configuration is absent, reducing confidence but not supplying an authorization control.

High severity applies when the functions are deployed with default user-JWT access or public access; an independently enforced operator-only gateway plus a matching in-handler authorization check would lower it.

#### Remediation

Require an operator-only authorization mechanism before any OpenAI or service-role action. Verify a signed caller credential in the handler, enforce an allowlisted role or service identity, bind requested vector-store or refinery resources to that role, and rate-limit expensive actions.

Tests:
- Verify a normal user JWT and a request without the operator credential receive 403 before any OpenAI or database call.
- Verify an operator credential can access only the configured vector store and approved refinery domains.

Preventive controls:
- Keep a checked-in per-function deployment policy.
- Use a shared operator-auth wrapper for privileged Edge Functions.

<a id="finding-2"></a>

### [2] Route recovery can promote stale or substring-matched endpoints

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | medium |
| Confidence rationale | The route merge and substring controls are direct; reliability depends on a reachable model candidate shape and unavailable deployment data. |
| Category | data-authenticity |
| CWE | CWE-20, CWE-345 |
| Affected lines | supabase/functions/vanhub-chat-kernel/flow56_release_controller53.ts:32-53, supabase/functions/vanhub-chat-kernel/flow56_release_controller54.ts:31-49 |

#### Summary

Controller 53 fills a missing endpoint while retaining an unrelated prior endpoint, and controller 54 accepts substring matches as location evidence. Both can promote a route that the customer did not supply as a complete pair.

#### Validation

The changed controls independently validate endpoint fragments but do not bind the recovered route to one customer statement.

Validation method: Static source/control/sink trace

- **Disposition:** reportable

#### Dataflow

Candidate facts and message to route recovery, endpoint writes and known statuses, normal review/persistence flow.

#### Reachability

The reducer chain is supplied as the deployed v132 candidate path.

Preconditions:
- One endpoint exists or a substring candidate is emitted.

Existing controls:
- Customer review.

Limitations:
- No downstream dispatch/RPC validator is present in the repository.

#### Severity

**Medium** — Synthetic pickup or delivery endpoints can be marked quote-grade and influence dispatch or pricing. Model candidate shape and customer review limit likelihood, but the canonical location boundary is crossed.

Severity would rise with automatic dispatch from the draft and fall if a downstream route-consistency validator rejects retained endpoints that do not occur in the same customer statement.

#### Remediation

Require both endpoints to be parsed as a single customer-grounded route statement. Use token-boundary equality rather than substring containment, and clear or reconfirm a retained endpoint when a new complete route appears.

Tests:
- A candidate value `ham` must not match `Birmingham`.
- A Manchester-to-York correction must not preserve a stale Leeds pickup.

Preventive controls:
- Use a shared route parser that returns evidence spans for both endpoints.

<a id="finding-3"></a>

### [3] QA expectation runner can be reached without an operator authorization check

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | medium |
| Confidence rationale | The migration and handler prove the missing application authorization control, but the deployed key format and verify_jwt setting are not checked in. |
| Category | authorization-bypass |
| CWE | CWE-862, CWE-284 |
| Affected lines | supabase/migrations/202608211955_private_qa_expectation_invoke.sql:13-27, supabase/functions/vanhub-chat-expectation-runner/index.ts:27-32, supabase/functions/vanhub-chat-expectation-runner/index.ts:179-194 |

#### Summary

The new migration calls the QA runner with a credential named `qa_runner_publishable_key`, while the runner performs no in-handler operator authorization before using a service-role client to invoke fixtures and write QA records.

#### Validation

The runner has no handler-level role check. Supabase documents that modern publishable keys are not valid bearer JWTs, so a successful intended call requires either a legacy public JWT or disabled gateway JWT verification.

Validation method: Static trace plus official Supabase authentication documentation

- **Disposition:** reportable

Limitations:
- The deployed function configuration and key format are unavailable.

#### Dataflow

Request body to runner, no role check, service-role client, kernel invocation, QA run and result writes.

#### Reachability

The migration's public-key-named credential demonstrates that the runner relies on gateway behavior rather than an operator authorization control.

Preconditions:
- Runner is deployed and callable with the configured gateway policy.

Existing controls:
- Fixture allowlist and limit of 50 reduce blast radius.

Limitations:
- Key format and gateway setting unavailable.

#### Severity

**Medium** — The runner can be used to pollute QA state and consume model and database capacity. Fixture and request limits constrain scope, but the public-key credential class and missing role check make the operator boundary inadequate.

Severity would rise if the function is public or a legacy anonymous JWT is accepted as its bearer credential, and fall if deployment proves a non-public operator gateway plus handler-level service authentication.

#### Remediation

Use a dedicated non-public service credential or signed workload token and verify it in the handler before constructing the service-role client. Do not use a publishable project key as a bearer credential; keep an explicit operator-only function policy in version control.

Tests:
- Reject requests with no credential, a publishable key, and an ordinary user JWT before service-role client creation.
- Accept only the configured workload credential and assert no QA rows are written on denial.

Preventive controls:
- Use a shared internal-job authentication wrapper.
- Add a deployment test that confirms the expected per-function JWT policy.

<a id="finding-4"></a>

### [4] Model-normalized date can satisfy the booking gate without matching the customer phrase

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | high |
| Confidence rationale | The ISO/date-phrase checks are visibly independent and the reducer writes the model ISO to canonical state. |
| Category | data-authenticity |
| CWE | CWE-20 |
| Affected lines | supabase/functions/vanhub-chat-kernel/flow56_release_controller40.ts:18-29 |

#### Summary

Controller 40 separately validates an ISO date's shape and the presence of human date text, then restores the model ISO without proving that it represents the customer-supplied date.

#### Validation

The candidate ISO can be shape-valid and unrelated to the literal date phrase, then survive into requirements and review state.

Validation method: Static trace and focused local reducer comparison

- **Disposition:** reportable

#### Dataflow

Message and model facts to controller 40, canonical ISO assignment, requirements known, normal review/persistence flow.

#### Reachability

The candidate reducer chain is supplied as deployed v132 context.

Preconditions:
- Model emits a mismatched shape-valid ISO date.

Existing controls:
- Review and confirmation.

Limitations:
- Database job creation validation is absent from the repository.

#### Severity

**Medium** — A mismatched but well-formed model date becomes known state and can advance review readiness. Confirmation gives the customer a compensating control, but the evidence-grounding invariant is still broken.

Severity would rise if confirmation obscures the date or booking creation uses the draft automatically, and fall if database validation recomputes the date from the original customer phrase.

#### Remediation

Derive the ISO date deterministically from the verified customer phrase, or validate that the candidate ISO exactly corresponds to the parsed phrase before writing it.

Tests:
- A phrase for 5 September paired with a different ISO date must leave the date requirement missing.

Preventive controls:
- Keep normalized values and evidence phrases bound in the reducer state.

<a id="finding-5"></a>

### [5] Model-only container counts can replace canonical inventory

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | high |
| Confidence rationale | The control directly compares two model-controlled values rather than the customer message and then replaces canonical inventory. |
| Category | data-authenticity |
| CWE | CWE-345 |
| Affected lines | supabase/functions/vanhub-chat-kernel/flow56_release_controller33.ts:29-37, supabase/functions/vanhub-chat-kernel/flow56_release_controller33.ts:67-78 |

#### Summary

The approximate-container fallback accepts an extractor-provided number because it appears in extractor-provided evidence, without proving the number appeared in the latest customer message.

#### Validation

The fallback condition reads `canon(ev).includes(num)` instead of the message, then replaces the generic inventory item and recomputes requirements.

Validation method: Static branch trace

- **Disposition:** reportable

#### Dataflow

Customer/model candidate to controller 33 fallback, canonical inventory replacement, requirements recomputation, normal review/persistence flow.

#### Reachability

The user-supplied v132 mapping makes this reducer reachable in the candidate deployment.

Preconditions:
- Prior generic boxes or bags, clarify_load objective, approximate candidate.

Existing controls:
- Customer review before confirmation.

Limitations:
- Deployed bundle mapping is user-supplied because repository index wiring is stale.

#### Severity

**Medium** — This crosses the release's explicit evidence-grounding boundary and can make a vague load look quote-grade. Customer review reduces the chance of final harm, but does not correct the unauthorized state transition.

Severity would rise with evidence that review is skipped or drivers act on the draft automatically, and fall if a downstream persistence guard rejects model-only inventory values.

#### Remediation

Require a literal, token-bounded match for the complete count and container phrase in the current message before replacing generic inventory. Treat extractor evidence only as a locator, not as proof.

Tests:
- A message without a count must not turn boxes into a numbered inventory item even when the candidate includes a plausible number.

Preventive controls:
- Centralize current-message evidence validation for every reducer candidate.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| QA runners and private invocation migration | service-role QA execution | Reported | Expectation runner lacks an operator authorization decision. Evidence: artifacts/03_coverage/reviewed_surfaces.md, artifacts/04_reconciliation/validation.md |
| Refinery and vector endpoints | private vector content and service-role state | Reported | Three new privileged handlers lack application authorization. Evidence: artifacts/03_coverage/reviewed_surfaces.md, artifacts/04_reconciliation/attack_paths.md |
| Evidence and route/date reducers | canonical booking integrity | Reported | Five reportable trust-boundary locations were retained after validation. Evidence: artifacts/04_reconciliation/validation.md, artifacts/04_reconciliation/attack_paths.md |
| Remaining controller chain | qualification and safety gates | No issue found | The other changed reducer wrappers were read in full and no security path survived. Evidence: artifacts/03_coverage/reviewed_surfaces.md |
| Existing session UUID authority | session authorization | Not applicable | The issue predates this diff; the changed kernel line is unrelated spam matching. Evidence: artifacts/03_coverage/reviewed_surfaces.md |

## Open Questions And Follow Up

- What are the deployed per-function verify_jwt and gateway policies for the four new privileged Edge Functions?
  - Follow-up prompt: Verify deployed Supabase function configuration for vanhub-vector-audit, vanhub-vector-distill, vanhub-refinery-adjudicate, and vanhub-chat-expectation-runner against frozen head 1c7778f.
- Per-function Edge gateway and verify_jwt configuration are absent from the repository.
  - Follow-up prompt: Review deferred unit deployment-gateway-verification and close its stated proof gap. Paths: supabase/functions/vanhub-vector-audit/index.ts, supabase/functions/vanhub-vector-distill/index.ts, supabase/functions/vanhub-refinery-adjudicate/index.ts, supabase/functions/vanhub-chat-expectation-runner/index.ts.
- The database RPC definitions and production table policies used by job confirmation are not present in the repository.
  - Follow-up prompt: Review deferred unit database-rpc-verification and close its stated proof gap. Paths: supabase/functions/vanhub-chat-kernel/index.ts, supabase/functions/vanhub-chat-confirm/index.ts.

