# VanHub chatbot release state

## Confirmed deployed state

- Supabase project: `adpphssfoxpyzzonqofz`
- Production Edge Function: `vanhub-chat` deployment v39, internal engine 39.
- Isolated Edge Function: `vanhub-chat-kernel` deployment v22, source declares `ENGINE = 55`.
- `private.intake_turns` contains persisted isolated turns through engine54. No engine55 or engine56 turns were present when this repository was initialised.
- The previous handoff referred to a local engine56 candidate, but no recoverable engine56 source was found in Supabase or the other connected GitHub repositories.

## Release rule

Production v39 is frozen until all isolated release gates pass.

## Engine56 delta

Engine56 is being reconstructed explicitly from the last recoverable kernel55 source and verified refinery-derived requirements. It must not be presented as the previously lost local artefact.

Required changes:

1. Contact qualification matches the real job creation rule: name plus either a valid phone number or valid email address.
2. LLM output remains candidate-only. Deterministic evidence validation owns canonical state.
3. File-search retrieval is available only on risk/specialist/refinery-triggered turns. Retrieved knowledge is policy/context only and cannot itself become customer evidence.
4. Helper presence does not equal capable lifting assistance. Vague claims such as “loads of help” or “plenty of help” do not resolve manpower.
5. Partial lifting help is retained explicitly and must not imply reduced crew.
6. “Easy access” cannot satisfy internal stairs, external steps or carry/parking requirements.
7. Parking, long carries, internal stairs, external steps, dismantling, loose/unboxed contents and appliance plumbing survive into review output.
8. Vague volume claims such as “van full”, “small load”, “not much”, and one-vehicle assumptions do not satisfy volume.
9. Customer duration/distance/vehicle optimism remains contextual only.
10. Washing machines and dishwashers require disconnect/reconnect clarification.
11. Unusual fit/access issues such as window-only access, doorways narrower than the item, or required door/feet removal create a hard qualification requirement until the handling plan is explicit.
12. Completion/key waits, pianos, safes, motorbikes, retailer/marketplace collections and specialist loads are retrieval triggers.

## Vector knowledge

OpenAI vector store: `vs_6a84539e4a348191956211ede0cf1a26`

The Responses API currently supports `file_search` with `vector_store_ids` alongside structured response output. Engine56 uses it only when deterministic risk-trigger logic fires.
