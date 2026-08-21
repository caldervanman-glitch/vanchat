# VanHub refinery adjudicated invariants v1

Status: provisional until all 37/37 vector-store source parts are distilled and reconciled.

Current coverage: 30/37 deterministic source parts, 288 sanitised candidate knowledge units, 26 represented domains. Raw calls/transcripts are not stored in this public repository.

Authority rule: current VanHub release invariants and literal customer evidence override historic calls, synthetic trade scenarios, old pricing/policy and retrieved RAG material. Retrieved knowledge can influence caution and questioning only; it is never customer evidence.

## Route
- Town/area is sufficient for qualification; postcode is optional but useful for quote precision.
- Keep collection and delivery directionally grounded. Never swap or mirror locations without literal evidence.
- Preserve explicit multi-stop collections/deliveries.
- Short mileage does not imply a quick or simple job.
- Static route charges, clean-air rules or ferry assumptions are not current-policy authority.

## Date and time
- A precise date is not mandatory when the customer gives a bounded, operationally useful flexible window and explicitly states flexibility.
- Never collapse alternatives or ranges to a single day without evidence.
- Exact confirmed dates are required before claiming firm driver availability or booking commitment, not before all useful qualification.
- Preserve time windows as windows.
- Unusual house/flat start times require confirmation.
- Customer deadlines may be captured but not guaranteed.

## Inventory and volume
- `full house`, bedroom count, `van full`, `not much`, `some items`, `multiple pieces`, `a few things` and similar language are not quote-grade inventory.
- Obtain significant bulky furniture/appliances plus useful box, bag and loose-item scale.
- Approximate quantities are acceptable when noun and scale are clear.
- Never invent quantities, weights, vehicle fit or previous-job inventory from refinery knowledge.
- Late material additions reopen affected requirements.
- Loose/unboxed contents must not be silently treated as packed boxes.

## Access, stairs, parking and carry
- Internal stairs, external entrance steps, floor, lift, parking and carry distance are separate facts.
- Lack of mention never means easy access, ground floor, no stairs or short carry.
- Useful qualitative access evidence can be quote-grade; do not force false numeric precision.
- Explicit symmetric wording such as `driveways both ends` or `loading bays both ends` can apply to both ends.
- `parking outside` does not prove short carry.
- Managed/commercial/high-rise restrictions are risk prompts only when relevant customer context exists.

## Assistance and manpower
- Assistance is usable only when someone is explicitly able and willing to lift/load/unload/carry relevant items.
- `loads of us helping`, `plenty of help`, `people will be there` and similar language do not satisfy lifting assistance.
- Partial assistance remains item/task specific; boxes-help does not establish sofa-help.
- Customer helpers can inform planning but never alone prove that fewer professional movers or less experienced handling is safe.
- Crew size must not be invented from scenarios or item labels.

## Dismantling and reassembly
- Separability and responsibility are different facts.
- `it comes apart into three sections` does not identify who dismantles it.
- Customer responsibility requires literal customer-responsibility wording.
- Driver/crew responsibility requires literal driver/crew-responsibility wording.
- Already dismantled requires explicit already-dismantled wording.
- Reassembly is separate and must not be inferred from dismantling.

## Packing
- Packing state matters where loose/unboxed contents change handling effort, loading time or item scale.
- Do not normalize loose belongings into boxes or assume boxes are uniform.
- Approximate counts are acceptable; vague counts remain insufficient.
- Photos/video can supplement difficult descriptions but do not automatically replace missing critical facts.

## Appliances
- Moving an appliance is separate from disconnection/reconnection.
- For washing machines/dishwashers, establish whether already disconnected and whether reconnection is expected when relevant.
- Do not promise that an independent driver will perform plumbing, gas or electrical work.
- Do not provide regulated gas/electrical instructions from static refinery knowledge.

## Completion and keys
- Completion deadlines, move-out deadlines and key waits are completion constraints, not ordinary time preferences.
- Preserve hard leave-by times and key/completion waits without inventing durations.
- A flexible date window does not prevent useful qualification, but firm availability must not be promised.

## Quote readiness
- Readiness depends on quote-critical customer evidence, not refinery scenarios or historic prices.
- Do not infer price, crew size, vehicle size or mandatory handling method from scenarios, previous jobs or RAG.
- Keep single-item questioning relevant; do not inject whole-house questions.
- Material changes after readiness reopen affected qualification fields.
- Historic prices, deposits, booking fees and platform policy are not current authority.

## Customer understatement / vague language
Treat these as questioning risk signals, not facts: `van full`, `not much`, `won't take long`, `only two minutes away`, `plenty of help`, `loads of us helping`, `easy access`, `a few bits`.

The bot should not accuse the customer. It should simply obtain the concrete quote-critical detail hidden by the vague phrase.

## House and flat moves
- Bedroom count alone is not enough.
- Obtain real significant load, access at both ends, assistance, dismantling/reassembly and completion constraints where relevant.
- Specialist items inside a house move do not automatically replace the overall house-move category.
- Flat moves retain floor/lift/stair/access qualification and must not assume lift availability.

## Courier and business collections
- Capture route, date/window, quantity/type, packaging/readiness and relevant loading constraints.
- Preserve explicit carton/pallet quantities and full time windows.
- Singular quantity can only be inferred when literal wording establishes one item.
- Shop/seller windows are operational constraints, not arbitrary single times.

## Specialist and vehicle transport
- Specialist labels trigger relevant follow-up; they do not establish weight, handling, crew or vehicle requirements.
- Vehicle suitability is not proven by customer labels such as `Luton` or `one van`.
- Vehicle/motorbike transport should retain explicit identity and running/rolling/steering/braking/loading facts where required.
- Static legal thresholds/licensing rules in refinery material are not current-law authority.

## Safety
- Safety/manual-review triggers require explicit current-customer evidence.
- Do not invent hazards from silence.
- Explicit retained fuel in powered equipment and explicitly regulated/medical/infectious material require specialist/manual suitability handling.
- Detailed trade techniques (ramp loading, motorbike strapping, etc.) remain reference knowledge rather than customer-chat procedural coaching.

## Waste
- Keep disposal/clearance scope distinct from ordinary removals and preserve mixed destinations.
- Gather practical type/volume and explicit hazard indicators.
- Static waste licensing, disposal, paperwork or penalty statements are not current authority.

## Animal transport
- Establish animal, secure containment/carrier status and relevant welfare/handling requirements.
- Do not infer containment or suitability from species alone.

## Handoff
- Review/driver handoff must preserve quote-critical facts and unresolved uncertainty.
- Preserve key waits, chain deadlines, alternative dates, access constraints and specialist handling.
- Summaries may compress but must never introduce new operational facts or guarantees.

## Current release implications
These invariants are intended to generate and judge regression cases. They do not by themselves populate customer job state. Controller/reducer changes must remain deterministic and evidence-grounded.

Seven vector-source parts remain pending final distillation before this document can be marked complete and frozen for release gating.
