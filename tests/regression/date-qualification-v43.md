# Date qualification regression cases — production v43

These cases are release invariants for the customer intake engine.

## Past dates must not qualify

Given the bot is asking for the move date:

- `a week yesterday` must remain on `ask_date`, must not set `date.iso_date`, and must tell the customer the wording sounds like a date in the past.
- An explicit past calendar date such as `19 August` (when the London-local current date is 20 August 2026) must not qualify and should state the resolved calendar date has passed.

## Complex relative dates require confirmation

Given the bot is asking for the move date:

- `two weeks on friday` may be resolved to a candidate date, but that date must remain pending rather than canonical.
- The bot must ask a calendar-date confirmation, e.g. `Just to confirm, do you mean Friday 4 September 2026?`
- Only an explicit confirmation such as `yes`/`correct` may move the pending date into `date.iso_date` and advance qualification.
- If the customer says `no`, the pending date must be cleared and the bot must ask for a new future date.

The same confirmation principle applies to wording such as `a week on Friday`, `a fortnight on Tuesday`, and `next Friday`, where colloquial interpretation can surprise the customer.

## Simple dates should remain low-friction

Clear future inputs such as `tomorrow`, a bare weekday where the deterministic resolver has one intended upcoming date, or an explicit calendar date do not need an extra confirmation turn unless another ambiguity is present.
