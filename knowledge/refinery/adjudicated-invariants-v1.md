# VanHub refinery canonical invariants v1

Status: **full-source canonical release input**.

Coverage: **28/28 vector-store files, 37/37 deterministic source parts, 402,385 source characters, 378 sanitised candidate knowledge units, 27 represented domains, 1 deterministic PII redaction**. Raw calls/transcripts are not stored in this public repository.

## Authority and provenance

The release hierarchy is deliberately strict:

1. Literal/current customer evidence and deterministic reducer rules.
2. Manually reviewed VanHub canonical release invariants in this file.
3. Model-adjudicated refinery output as candidate engineering analysis only.
4. Sanitised distilled refinery units.
5. Raw/private call, trade-scenario and historic material in the vector store.

A more frequent historic pattern does not outrank current product policy. Retrieved RAG/refinery knowledge can influence caution, risk recognition and the next useful question; it is **never customer evidence** and must never populate an operational field without compatible customer evidence.

The model adjudicator is not a publication authority. Manual review of the full corpus caught over-generalisation around exact dates, helper-driven crew reduction, completion-day questioning and specialist handling. Those outputs were not promoted.

## Route
- Town/area is sufficient for qualification; postcode is optional but useful for quote precision.
- Keep collection and delivery directionally grounded. Never swap or mirror locations without literal evidence.
- Preserve every explicit multi-stop collection/delivery and the item allocation/stop order where supplied.
- Short mileage does not imply a quick or simple job.
- Recurring deliveries are separate jobs unless the current customer explicitly defines a reusable route/scope.
- Static congestion, clean-air, ferry, toll or route-charge statements from refinery material are not current-policy authority.

## Date and time
- A precise date is **not mandatory** when the customer gives a bounded, operationally useful date window and explicitly states flexibility, e.g. `any day next week, I'm flexible`.
- Never collapse alternatives or ranges such as `Thursday or Friday` to a single date without evidence.
- Exact confirmed dates are required before claiming a firm booking/driver commitment, not before useful qualification or quote-request intake.
- Preserve explicit time windows as windows; do not collapse `9am to 10am` to one time.
- Unusual house/flat start times such as 9pm require confirmation before progressing beyond that ambiguity.
- Urgent/same-day language is a scheduling-risk signal. The intake bot may capture urgency but must not pretend it has checked live driver availability unless a real availability service has actually been invoked.
- Customer deadlines may be captured and highlighted but not guaranteed.

## Inventory and volume
- `full house`, bedroom count, `van full`, `one van load`, `not much`, `some items`, `multiple pieces`, `a few things`, `boxes` without useful quantity/context and similar language are not quote-grade inventory.
- Obtain significant bulky furniture/appliances plus useful box, bag and loose-item scale.
- Approximate quantities are acceptable when the noun and scale are clear.
- A storage-unit label such as `big unit` or `part full` is not volume evidence; obtain actual items/boxes.
- Customer confidence that everything fits in one trip is weak capacity evidence, not a capacity fact.
- Never invent quantities, weights, vehicle fit or previous-job inventory from refinery knowledge.
- Late material additions/removals or added stops reopen affected fit, handling, route and readiness requirements.
- Loose/unboxed contents must not be silently treated as packed boxes.
- For single-item/small jobs, keep inventory questioning item-specific rather than injecting whole-house questions.

## Access, stairs, parking and carry
- Internal stairs, external entrance steps, floor, lift, parking and carry distance are separate quote facts.
- Lack of mention never means easy access, ground floor, no stairs or short carry.
- Useful qualitative evidence can be quote-grade; do not force false numeric precision where the customer has supplied a clear practical description.
- Explicit symmetric wording such as `driveways both ends` or `loading bays both ends` can apply to both ends.
- `parking outside` does not by itself prove a short carry.
- Window-only access, narrow gates/tracks, restricted lifts, loading bays and similar anomalies are hard planning constraints when explicitly stated.
- Managed/commercial/high-rise/care-site restrictions are risk prompts only when relevant customer context exists; do not invent site rules from refinery knowledge.

## Assistance and manpower
- Assistance is usable only when someone is explicitly able and willing to lift/load/unload/carry the relevant items.
- `loads of us helping`, `plenty of help`, `people will be there` and similar language do not satisfy lifting assistance.
- Partial assistance remains item/task specific; boxes-help does not establish sofa-help.
- Helper capability can inform planning but **must never automatically reduce paid/professional crew**. Actual professional handling needs remain dependent on item, access, safety and driver requirements.
- Presence of a trolley/equipment does not prove a helper can safely manoeuvre a bulky item.
- Crew size must not be invented from scenarios, item labels or RAG.

## Dismantling and reassembly
- Separability and responsibility are different facts.
- `it comes apart into three sections` proves separability only; it does not identify who dismantles it.
- Customer responsibility requires literal compatible customer-responsibility wording such as `I'll take it apart`.
- Driver/crew responsibility requires literal compatible driver/crew wording such as `the movers need to dismantle it`.
- Already dismantled requires explicit already-dismantled wording.
- Reassembly is separate and must not be inferred from dismantling.
- Fixed/bolted/installed wording is a reason to clarify preparation responsibility; it does not prove the driver will perform the work.

## Packing
- Packing state matters where loose/unboxed contents change handling effort, loading time or item scale.
- Do not normalise loose belongings into boxes or assume boxes are uniform in size/weight.
- Approximate counts are acceptable; vague counts remain insufficient.
- Fragile/dense contents can trigger relevant packing/weight questions, but detailed loading techniques remain advisory trade knowledge.
- Photos/video can supplement difficult descriptions but do not automatically replace missing quote-critical facts.

## Appliances
- Moving an appliance is separate from disconnection/reconnection.
- For washing machines/dishwashers, establish whether already disconnected and whether disconnection/reconnection is expected when relevant.
- Do not promise that an independent driver will perform plumbing, gas or electrical work.
- Do not provide regulated gas/electrical instructions from static refinery knowledge.

## Completion, keys and deadlines
- Completion deadlines, move-out deadlines and key waits are completion constraints, not ordinary time preferences.
- Preserve hard leave-by times and key/completion waits without inventing durations.
- Ask the practical question: whether unloading/access may be delayed by completion or keys. Do not probe legal funds clearance or other unnecessary conveyancing details.
- A bounded flexible date window does not prevent useful qualification.
- Do not commit a half-day/fixed schedule when explicit key-wait uncertainty makes that commitment unsupported.

## Quote readiness
- Readiness depends on quote-critical customer evidence, not refinery scenarios, historic prices or model confidence.
- Do not infer price, crew size, vehicle size or mandatory handling method from scenarios, previous jobs or RAG.
- Keep single-item questioning relevant.
- Material changes after readiness reopen affected qualification fields.
- Historic prices, deposits, booking fees, driver-sourcing practices and platform policy are not current authority.
- Uncertainty can be explicitly preserved for driver quoting/manual review; the chatbot must not manufacture certainty merely to finish intake.

## Customer understatement / vague language
Treat phrases such as `van full`, `not much`, `won't take long`, `only two minutes away`, `plenty of help`, `loads of us helping`, `easy access` and `a few bits` as questioning risk signals, not facts.

The bot should not accuse the customer. It should obtain the concrete quote-critical detail hidden by the vague phrase.

`full house` and similar labels must trigger item/volume clarification; they must **not** be translated into an assumed volume or vehicle size.

## House and flat moves
- Bedroom count alone is not enough.
- Obtain real significant load, access at both ends, assistance, dismantling/reassembly and completion constraints where relevant.
- Specialist items inside a house move do not automatically replace the overall house-move category.
- Flat moves retain floor/lift/stair/access qualification and must not assume lift availability.

## Courier, business and seller collections
- Capture route, usable date/window, quantity/type, packaging/readiness and relevant loading constraints.
- Preserve explicit carton/pallet quantities and full time windows.
- Singular quantity can only be inferred when literal wording establishes one item.
- Shop/seller/auction appointment or collection windows are operational constraints; clarify readiness/reference requirements only when relevant.
- Do not invent seller/site rules from historic examples.

## Specialist and vehicle transport
- A specialist label is a trigger for relevant qualification, not proof of weight, crew, handling technique or vehicle requirement.
- Gather the facts that affect feasibility: dimensions/weight where relevant, condition, running/rolling status, access, loading readiness and any explicit specialist constraint.
- Non-running/non-rolling vehicles or motorbikes need a viable loading plan before readiness.
- Vehicle suitability is not proven by labels such as `Luton` or `one van`.
- House moves containing a motorbike remain house moves unless the overall job evidence says otherwise.
- Medical/clinical/infectious/diagnostic materials require specialist/manual routing; do not coach ordinary drivers from static trade knowledge.
- Detailed handling methods such as strap configuration, stillage, glass-edge protection, pool-table dismantling technique, aquarium preparation or towing mechanics remain **advisory reference knowledge**, not canonical customer-state facts or generic procedural instructions.
- Static legal thresholds/licensing rules in refinery material are not current-law authority.

## Vehicle-document and condition references
- Keys, paperwork or condition photos can be useful operational handoff questions for vehicle transport where relevant.
- They are not universal prerequisites for every transport enquiry and must not displace more fundamental route/condition/loading qualification.

## Safety
- Safety/manual-review triggers require explicit current-customer evidence.
- Do not invent hazards from silence or from retrieved trade scenarios.
- Explicit retained fuel in powered equipment and explicitly regulated/medical/infectious material require specialist/manual suitability handling.
- Detailed trade techniques remain reference knowledge rather than customer-chat procedural coaching unless a separately verified current operating policy promotes them.

## Waste
- Keep disposal/clearance scope distinct from ordinary removals and preserve mixed destinations.
- Gather practical type/volume and explicit hazard indicators.
- Static waste licensing, disposal, paperwork or penalty statements are not current authority.

## Animal and passenger requests
- Live-animal transport must not be treated as ordinary goods transport without relevant suitability/welfare qualification.
- Do not infer containment or transport suitability from species alone.
- A request for a customer/passenger to ride in a vehicle is a separate suitability/insurance question, not an assumed included service. Preserve the request and route it for appropriate confirmation rather than promising carriage.

## Handoff
- Review/driver handoff must preserve quote-critical facts and unresolved uncertainty.
- Preserve key waits, chain deadlines, alternative dates, access constraints, multi-stop allocation and specialist constraints.
- Summaries may compress but must never introduce new operational facts, guarantees or handling promises.

## Release use
These invariants are release inputs, not customer facts. They generate and judge regression conversations and define deterministic reducer boundaries.

Any future refinery ingestion follows the same pipeline: **private source → sanitised candidate → adjudication analysis → manual/deterministic canonical rule → regression test**. A model-generated refinery rule cannot promote itself into the release contract.
