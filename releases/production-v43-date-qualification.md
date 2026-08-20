# Production v43 — date qualification patch

Deployed 2026-08-20.

## Runtime

- Supabase Edge Function: `vanhub-chat`
- Production version: **43**
- Engine: **56**
- Exact runtime Git commit: `3d5a2db5ebcba939fe2815e5de80370519a6db6b`
- Production bundle SHA-256: `e64306fd66124329c10e11be4e2d6b7080d29ecf91c1a1bf5e56b682f913a982`
- Previous production rollback point: v42

## Behaviour fixed

The intake engine previously allowed date wording such as `a week yesterday` to become a past canonical date and advanced without qualification. It also silently canonicalised colloquial relative dates such as `two weeks on friday`.

Production v43 now:

- rejects past dates before qualification can advance;
- keeps `date.iso_date` null for past/invalid date answers;
- gives clean customer-facing past-date wording;
- holds complex relative future dates as pending candidates;
- asks the customer to confirm the resolved calendar date;
- moves the date into canonical state only after explicit confirmation.

## Verification

- production deterministic gate: **500/500**
- `a week yesterday` -> remains `ask_date`, canonical date null
- explicit past date `19 August` -> rejected as passed
- `two weeks on friday` -> asks `Just to confirm, do you mean Friday 4 September 2026?`
- explicit `yes` -> date becomes canonical and qualification advances

See `tests/regression/date-qualification-v43.md`.
