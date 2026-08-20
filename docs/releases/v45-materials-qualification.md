# Production v45 — materials transport qualification

Released 2026-08-21.

## Runtime

- Supabase Edge Function: `vanhub-chat` v45
- Engine: 56
- Exact runtime Git commit: `94b0eb95b61e5fed2a0e1b17c9cfbcc711ca33eb`
- Production bundle SHA-256: `40c805bcf7bb8af0e4d806da819d1da0bb6c69a5ebbe8efd31e3cccf014ea7e2`
- Previous production: v43/v44 path remains available in Git history for rollback.

## Live-test defect fixed

Original customer input:
`7 boards 8x4 hx1 to hx3 tomorrow 9am help with lifting`

Previous behaviour incorrectly:
- swallowed HX1/HX3 into inventory
- repeated the route question
- accepted `8x4` without units
- classified seven boards as `single_item`
- did not establish collection/delivery site type
- did not establish loading/unloading/carry responsibility
- could proceed toward contact with insufficient transport detail

## v45 behaviour

- outward postcode prefixes such as HX1/HX3 are accepted as route evidence
- route codes are removed from inventory text
- board/sheet/material loads use an `other_transport` materials qualification path
- dimensions without units are not assumed
- material/type is required
- collection and delivery site types are required
- handling responsibility is required
- `kerbside to kerbside` is recognised as no carry beyond the vehicle at either end
- vague `help with lifting` does not satisfy handling
- non-kerbside load/unload/carry statements survive canonical state and review
- precise known site descriptions are not degraded by incidental later wording
- bare clock times such as `9am` are deterministically retained on materials turns

## Verification

- isolated kernel: 500/500 deterministic self-test
- production v45: 500/500 deterministic self-test
- production replay confirmed HX1 collection, HX3 delivery, 2026-08-22 for `tomorrow`, `9am`, inventory `7 boards 8x4`, and incomplete dimension-unit gate
- isolated kerbside-to-kerbside flow reached contact only after quantity/type/dimensions/site/handling were complete
- isolated non-kerbside flow retained: `merchant staff load, driver unloads and carries them 20m into the house, 3 outside steps`

Regression specification: `tests/materials-transport-regressions.md`.
