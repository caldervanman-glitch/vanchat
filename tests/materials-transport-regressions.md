# Materials transport regression cases

These cases came from live human testing and are release-blocking for the customer intake engine.

## Outward postcode route

Input:
`7 boards 8x4 hx1 to hx3 tomorrow 9am help with lifting`

Required:
- `HX1` becomes collection outward postcode.
- `HX3` becomes delivery outward postcode.
- Neither postcode remains embedded in inventory.
- The bot must not ask the route again.

## Ambiguous dimensions

Input contains `8x4` with no unit.

Required:
- Do not assume feet.
- Ask whether the dimensions are feet, metres, centimetres, etc.
- Ask what the boards/sheets are made of.
- Thickness may be collected when known.

## Site type

For board/sheet/building-material transport, collect both endpoint types, e.g. builders merchant/shop, warehouse, storage unit/depot, yard, house, building site.

Dense example:
`7 boards 8x4 ft plywood HX1 to HX3 tomorrow 9am, builders merchant to house, help with lifting`

Required:
- collection site = builders merchant
- delivery site = house
- the `HX1 to HX3` route must not interfere with parsing `builders merchant to house`.

## Handling responsibility

`help with lifting` alone is insufficient.

The bot must establish who loads/unloads and whether the driver carries the load between the vehicle and its resting place.

### Kerbside-to-kerbside

Input:
`kerbside to kerbside`

Required interpretation:
- load/unload at the vehicle only
- no driver carry beyond the vehicle at either end

### Non-kerbside example

Input:
`merchant staff load, driver unloads and carries them 20m into the house, 3 outside steps`

Required:
- handling gate becomes known
- the full statement survives canonical state and driver review
- a previously known precise site such as `builders merchant` must not be degraded to `merchant` by incidental later wording.

## Quote readiness

A building-material load must not reach contact/review until all are known:
- useful quantity
- material/type
- dimensions with units
- collection endpoint
- delivery endpoint
- collection site type
- delivery site type
- loading/unloading/carry responsibility
- date/time according to normal intake rules

Outward postcode prefixes such as `HX1` and `HX3` are valid route evidence. For fixed-price jobs, collection and delivery outward postcodes are mandatory.
