# Route specificity regressions

These are release-blocking behavioural cases for the customer intake engine.

## Broad route must be challenged

Input sequence:

1. `i need a pianow moving later`
2. `yorkshire to london`

Expected:

- `pianow` is deterministically normalised to canonical `piano` without a redundant typo-confirmation question.
- The second turn must NOT advance to date.
- `Yorkshire` and `London` are treated as too broad for quote-grade routing.
- The reply asks for collection and delivery postcodes if available and explicitly explains that postcodes generally get better results because drivers can judge the route more accurately.
- If postcodes are unavailable, a specific town/local area may satisfy an ordinary Request Quotes flow.

## One-sided broad route

Input: `sofa West Yorkshire to Croydon tomorrow`

Expected: collection remains unresolved and the bot asks for a collection postcode or specific town/local area. Croydon may remain accepted.

## Specific towns remain usable

Input: `pianow Halifax to Leeds tomorrow`

Expected: Halifax and Leeds are accepted as specific endpoints for an ordinary quote request. The next unresolved piano-specific question may be asked.

## Postcodes satisfy route immediately

Input: `sofa HX1 to SW1A tomorrow`

Expected: route is accepted without locality refinement.

## Fixed-price invariant

For `public.create_fixed_price_job(jsonb)`, BOTH `collection_outward_postcode` and `delivery_outward_postcode` are mandatory. Town-only fixed-price endpoints must be rejected at the database boundary even if an alternate UI attempts to submit them.

## Geography safety

Do not fuzzy-correct towns, addresses or postcodes. Transport vocabulary may use bounded typo correction, but geography must be supplied or clarified by the customer.
