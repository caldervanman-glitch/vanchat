# VanHub refinery knowledge pipeline

This directory is the **sanitised, version-controlled release view** of the private VanHub OpenAI vector-store knowledge.

## Source boundary

The private OpenAI vector store remains the source for raw/refined call material and trade scenarios. Raw transcripts, customer names, phone numbers, email addresses, precise addresses and other identifying material must **never** be committed to this public repository.

`vector-store-manifest.json` records the safe provenance inventory only.

## Release pipeline

1. Enumerate every file in the configured vector store.
2. Retrieve each file through the vector-store parsed-content API.
3. Split every source deterministically into paragraph-safe parts of about 18k characters.
4. Distil every part into candidate operational knowledge under a strict structured-output schema.
5. Deterministically redact emails, phone numbers, URLs, postcodes and address-like strings before candidate knowledge is persisted.
6. Cross-source adjudicate candidates against current VanHub policy and evidence-grounding architecture.
7. Generate synthetic regression conversations from adjudicated rules.
8. Run those refinery-derived regressions alongside deterministic selftests, the fixed acceptance corpus and persistence/idempotency gates.

## Critical evidence rule

Refinery/vector retrieval is **policy and questioning context only**. It is never customer evidence. A retrieved rule may tell the bot what to ask or what assumption to avoid, but an operational field may change only when the current customer conversation contains acceptable supporting evidence.

## Promotion rule

No single model-generated distillation is canonical. Distilled units are candidates until cross-source adjudication removes overstatements, contradictions, obsolete policy and unsafe inference. Only adjudicated, sanitised knowledge and synthetic tests belong in GitHub release inputs.
