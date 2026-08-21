# VanHub Chatbot Production v47

Released: 2026-08-21

## Runtime

- Supabase Edge Function: `vanhub-chat`
- Production version: v47
- Engine constant: 56
- Runtime Git commit: `1e28e7965dd14c52ed60632f35c993f205b887c4`
- Production bundle SHA256: `71fc928844898ccdc1d9c876d9565cf3864e282ec1ce4cbdc88a825bb1ec7812`
- Previous production: v46, bundle `bf54f25e8c076c173dd0cafe1b8d7812474c2a094fa760fb6903741da75d40af`

## Why this release exists

The deterministic 500-case gate was passing while ordinary multi-turn customer conversations still exposed basic progression failures. v47 adds a separate conversation-control layer and treats the 500 rule gate as necessary but not sufficient.

## Verified improvements

- No repeated vehicle make/model question after useful short answers such as `CBR345`.
- Explicit `don't know` branches can progress where the requested detail is optional/unknown-capable.
- Natural house-move openings no longer collapse many missing details into a misleading `one thing` message.
- First route questions are concise; postcode guidance is given when useful rather than as boilerplate.
- Broad geography such as Yorkshire/London is still rejected as too vague.
- UK outward postcode prefixes are accepted as route evidence.
- Relative household descriptions such as `my house`, `my nan's`, `my mum's` are kept as context/property type but never accepted as quote-grade route locations.
- Complex relative dates are resolved to an exact date and confirmed before becoming canonical.
- Past dates are rejected.
- Route corrections such as `actually Bradford not Leeds` update state and are acknowledged without disrupting the current qualification objective.
- Vague load phrases (`some sofas`, `a few boxes`, `multiple pieces`, `van full`) receive specific clarification instead of generic repeats.
- Out-of-order facts such as `all boxed`, `no heavy items`, reassembly choice, appliance readiness and capable lifting help are accepted wherever supplied.
- `easy access` and `loads of us helping` do not satisfy access/assistance gates.
- Capable help such as `me and my brother can both lift and load` does satisfy assistance evidence.
- Appliance phrase `disconnected and no reconnect needed` deterministically becomes disconnected=yes, reconnect=no.
- Cross-field contamination is blocked: `no particularly heavy items` cannot become a loose/unboxed-items value when the customer has explicitly said everything is boxed.
- Non-running/non-rolling vehicle wording is normalized across forms such as `doesn't`, `does not`, `doesnt`, etc. A non-rolling bike requires an explicit loading plan.
- Petrol/fuel leak variants go directly to manual suitability review.
- High-value/fragile glass, materials transport, completion/key waits and hard fit/access rules remain intact.
- Ancillary request to ride with the driver is answered directly and stored separately from the transport category; it does not become passenger transport or lifting assistance. Driver agreement, proper belted seating and insurance/terms are required; child-seat information is recorded where relevant.
- Image/video attachment metadata remains in canonical state.

## Release gates

- Production deterministic self-test: 500/500, zero failures.
- Conversational regression corpus: `tests/conversation/v47-regression.jsonl`.
- Persisted-state inspection performed for house moves, appliances, assistance, completion, fit/access, motorbike recovery, passenger request, relative locations and attachments.
- Same-key idempotency: two simultaneous requests returned the same 200 response, one persisted turn, one revision increment.
- Different-message concurrency: one mutation succeeded, the competing request returned 409 stale revision, one mutation persisted.
- No synthetic jobs were created during the final release test window.

## Release rule going forward

A future release must pass both:

1. deterministic rule self-test; and
2. conversational regression/real-flow gate.

A 500/500 deterministic result alone must never again be treated as evidence that the chatbot is release-ready.
