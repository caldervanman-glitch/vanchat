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

## Raw-source preservation

The exact response returned by Supabase `get_edge_function` was captured as ordered text parts. The parts preserve the response representation rather than manually reformatting the old source, to avoid introducing transcription changes into the rollback artefact.

Reconstruction order:

1. `get-edge-function-response.part-001.txt` — resource lines 1–30
2. `get-edge-function-response.part-002.txt` — resource lines 31–110
3. `get-edge-function-response.part-003.txt` — resource lines 111–230
4. `get-edge-function-response.part-004.txt` — resource lines 231–327

Concatenate the four parts without adding/removing content, parse the connector response JSON, then read the `files` array to recover `index.ts` and `schema.ts`.

Do not delete this snapshot after production promotion. Supabase's Dashboard Edge Function editor does not provide version-control rollback, so this repository is the durable rollback record.
