# High-value / fragile item regression cases

## HV-001 — high-value glass cabinet + customer crew guess
Input: `i need a very expensive glass cabinet moving from bd11 to hx6. will need two strong experienced men`

Required:
- BD11/HX6 accepted as outward postcodes.
- Do not set `men_required=2` merely from the customer's statement.
- Before date/time, ask for approximate replacement value, dimensions with units, approximate weight, and fixed/removable glass details.
- Preserve the crew statement as a quote-risk/handling signal.

## HV-002 — ordinary glass cabinet
Input: `glass cabinet from bd11 to hx6`

Required:
- Ask dimensions, approximate weight, glass/shelf/panel construction and later access/handling.
- Do not require a declared value unless the customer signals high value or supplies a value.

## HV-003 — high-value canonical review
Given approximately `£20,000`, `6ft x 3ft x 18in`, `100kg`, fixed glass doors/removable shelves, no customer lifting help and qualified access:
- final review must include value, dimensions, weight, glass details, access and lifting-help status;
- final review must retain the customer's two-person/experienced-mover claim only as a signal, not an authoritative crew requirement;
- final review must tell the accepting driver to confirm their own goods-in-transit cover/terms and handling suitability for the declared value;
- glass doors/shelves descriptive text must not become a second inventory item.

## HV-004 — ambiguous midnight
When the preferred-time objective receives `12am` for a high-value/fragile job:
- do not commit the time immediately;
- ask whether the customer means midnight (00:00) or 12pm/noon;
- only commit the time after clarification.
