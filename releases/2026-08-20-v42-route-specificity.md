# VanHub chat v42 — route specificity and fixed-price postcode invariant

Production Edge Function: `vanhub-chat` v42

Runtime source commit: `13ef86a604a41ae3b5b2284e16299966d950ef6a`

Production bundle hash: `3816280fc255aea28244182fb40121343feb83b634f9db017788c05bcbe438ee`

## Changes

- Broad geographic endpoints such as Yorkshire, West Yorkshire, London, counties and large regions no longer satisfy route qualification without a postcode.
- Ordinary Request Quotes flows may still proceed with a genuinely specific town/local area when a postcode is unavailable.
- Route prompts now explicitly state that postcodes generally get better results because drivers can judge routes more accurately.
- Geography remains excluded from fuzzy typo correction.
- Deterministically resolved vocabulary typos no longer trigger redundant LLM spelling/typo ambiguity prompts.
- Plain `Durham` remains usable as the city; `County Durham` is treated as broad geography.
- `public.create_fixed_price_job(jsonb)` now requires BOTH collection and delivery outward postcodes (and towns) before a fixed-price load can be created.

## Verification

- Isolated kernel v37: 500/500 self-test, zero failures.
- Production v42: 500/500 self-test, zero failures.
- Production smoke sequence `i need a pianow moving later` -> `yorkshire to london` remained on route qualification and gave postcode guidance.
- Isolated recovery sequence `yorkshire to london` -> `halifax to croydon` replaced broad endpoints and advanced to date.
- `West Yorkshire -> Croydon` challenged collection only.
- `Halifax -> Leeds` accepted for ordinary Request Quotes.
- `HX1 -> SW1A` accepted without route refinement.
- Fixed-price function definition verified to contain mandatory delivery-postcode validation.
- Execute grants on the fixed-price SECURITY DEFINER function remain restricted to authenticated/service_role/postgres; anon/PUBLIC execute remains revoked.

## Rollback

For chatbot route behaviour, redeploy production v41 runtime commit `6bf519bc792e2f3a2e381fb7ecb985feedb4cab0` if a regression is found.

For fixed-price postcode validation, restore the previous `create_fixed_price_job(jsonb)` delivery-town-only validation only if explicitly required; this would weaken the fixed-price route invariant and should not be done accidentally.
