# Production v46 — high-value / fragile item qualification

Released: 2026-08-21

## Runtime
- Supabase function: `vanhub-chat`
- Production function version: `46`
- Engine: `56`
- Runtime Git commit: `fdacff5e91c4615d98feb13e9d72e60acf533b0f`
- Bundle SHA256: `bf54f25e8c076c173dd0cafe1b8d7812474c2a094fa760fb6903741da75d40af`

## Behaviour added
- High-value signals such as `very expensive`, explicit values, or similar wording are quote-critical rather than chatter.
- Valuable/fragile items require approximate replacement value (when value is signalled), dimensions, approximate weight, glass/removable-component details, collection access, delivery access, and actual lifting assistance before contact/review.
- Customer statements such as `will need two strong experienced men` are retained as handling-risk signals but do not set authoritative crew size.
- Ordinary glass cabinets still get fragile-item size/weight/access qualification, but do not require declared value unless high value is actually signalled.
- Final review surfaces declared value and reminds the accepting driver to confirm their own goods-in-transit cover/terms and handling suitability.
- Glass-door/shelf descriptive text is kept as fragility detail rather than becoming an extra inventory item.
- `12am` is explicitly clarified as midnight versus 12pm/noon before being committed for this risk class.

## Verification
- Isolated deterministic gate: 500/500, zero failures.
- Production deterministic gate: 500/500, zero failures.
- Exact production replay: `i need a very expensive glass cabinet moving from bd11 to hx6. will need two strong experienced men` correctly returns `ask_dimweight` before date/time.
- Full isolated flow verified £20,000 value, 6ft x 3ft x 18in, ~100kg, fixed glass doors/removable shelves, qualified access, no customer lifting help, midnight clarification and clean final review.

Regression cases: `tests/regression/high-value-fragile.md`.
