# Engine56 production release

Released to Supabase production `vanhub-chat` on 2026-08-20.

## Runtime identity

- Supabase project: `adpphssfoxpyzzonqofz`
- Production Edge Function: `vanhub-chat`
- Production deployment version: `40`
- Production status: `ACTIVE`
- `verify_jwt`: `false` (preserved from production v39)
- Production bundle SHA-256: `f492240fb604d7a0de21bff8b6d2bcdfdd21ff41f9e75b76b305aef71a81a94e`
- Exact tested runtime source commit: `89049d67ba740e341de2d6a80ec6c284de8bc9c4`
- Engine constant: `56`

Production is pinned to the exact source commit above via the Edge Function import wrapper. The moving branch head is not the runtime dependency.

## Release gates passed

- Production URL self-test: **500 / 500**, zero failures.
- Simple production smoke: `microwave Halifax to Leeds tomorrow` persisted engine56 canonical state, route Halifax→Leeds, date `2026-08-21`, and correctly advanced to time.
- Risk-triggered retrieval: simple microwave smoke recorded retrieval `false`; washing-machine risk smoke recorded retrieval `true`.
- Appliance/access production smoke: washing machine with explicit no stairs/no outside steps/van at door at both ends preserved those access facts and stopped at appliance disconnect/reconnect clarification.
- Refinery/adversarial flows passed on the identical isolated runtime before promotion: vague vanload, helper capability, partial lifting help, explicit no-help, washing-machine plumbing, completion/key waits and hard move-out deadlines, window-only/doorway fit issues, American fridge access, fuel-leaking motorbike, oxygen cylinders.
- Canonical completion state preserves both key-wait and hard-deadline evidence without turning the deadline into move-start time.
- Model-generated context notes are stripped before deterministic reduction; only customer-grounded context may survive canonicalisation.
- Attachments/media persistence passed.
- Phone-only confirmation path passed end-to-end as non-live `awaiting_review` without fake email; shared confirm function wording corrected.
- Atomic idempotency passed: simultaneous same-key requests returned the same response with one persisted turn / one revision increment.
- Concurrency passed: simultaneous different messages produced one successful mutation and one stale-revision rejection rather than overwrite.
- Final synthetic-job hygiene check: **0 synthetic jobs remaining**.

## Rollback

Previous production `vanhub-chat` v39 was captured before promotion.

Rollback artefacts are under:

`snapshots/production-v39/`

Captured v39 identity:

- deployment version: `39`
- bundle SHA-256: `7557119b12306484fbfc60f2f479de47bc05c245b359efe6aa161db8d4c6f5de`
- function id: `09efff70-ef2d-4d56-ae58-d465f84bc5a4`

The snapshot directory contains the recovered deployed source representation, direct `schema.ts`, metadata and reconstruction instructions.

## Deferred architecture

The production engine released here is the hardened customer intake foundation. The eventual chatbot gateway remains separately documented: Get a quote / Post a job / Advertise empty space / Sign up as a driver, including the Framer CMS requirement for public driver profile pages.
