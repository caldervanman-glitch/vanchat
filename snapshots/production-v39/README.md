# Production `vanhub-chat` v39 rollback snapshot

Captured immediately before engine56 production promotion.

## Deployed production metadata

- Supabase project: `adpphssfoxpyzzonqofz`
- Function: `vanhub-chat`
- Function id: `09efff70-ef2d-4d56-ae58-d465f84bc5a4`
- Deployment version: `39`
- Status at capture: `ACTIVE`
- `verify_jwt`: `false`
- Supabase bundle SHA-256: `7557119b12306484fbfc60f2f479de47bc05c245b359efe6aa161db8d4c6f5de`
- Files returned by Supabase: `index.ts`, `schema.ts`

## Source preservation

The production `index.ts` source returned by Supabase is preserved in escaped response form across these ordered files:

1. `get-edge-function-response.part-001.txt` — beginning of the Supabase response and beginning of `index.ts`
2. `get-edge-function-response.part-002.txt` — middle of `index.ts`
3. `get-edge-function-response.part-003a.txt` — remainder of `index.ts` through the `Deno.serve` entrypoint

The production `schema.ts` is also stored separately as `schema.ts` in this directory for direct use.

To reconstruct `index.ts`, concatenate parts 001, 002 and 003a in order, extract the `index.ts` content string beginning at the first `files[0].content` value, and JSON-unescape it. The original deployed bundle identity is recorded above so a rollback can be checked against the v39 capture.

Do not delete this snapshot after production promotion. Supabase's Dashboard Edge Function editor does not provide version-control rollback, so this repository is the durable rollback record.
