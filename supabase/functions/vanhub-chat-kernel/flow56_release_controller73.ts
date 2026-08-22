// @ts-nocheck
import * as base from './flow56_release_controller72.ts'
import * as core from './core_release_controller50.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq

const HOUSE=new Set(['house_move','flat_move'])
const DISMANTLE_FURNITURE=/\b(?:wardrobes?|beds?|bunk beds?|cots?|cribs?|large tables?|dining tables?|desks?|bookcases?|shelving units?|large sofas?|sectional sofas?|corner sofas?)\b/i
const CARRY=/\b(\d+(?:\.\d+)?\s*(?:m|metres?|meters?|yards?|ft|feet))\b/i
const BAD_FRIDGE_DISMANTLE=/For the (?:american )?fridge(?: freezer)?, is it already dismantled, will you take it apart, or should the driver allow for dismantling\?/i

function normaliseCarry(l){
  if(!l||core.clean(l.carry_distance))return
  const text=[l.parking,l.access_notes].filter(Boolean).join(' ')
  if(!/\b(?:away|carry|from|to)\b/i.test(text))return
  const m=text.match(CARRY)
  if(m)l.carry_distance=m[1]
}

function stopList(v){return Array.isArray(v)?v.map(core.clean).filter(Boolean):[]}
function multiStopRoute(j){
  const ms=j?.q?.multi_stop||{}
  const collections=stopList(ms.collections),deliveries=stopList(ms.deliveries)
  if(collections.length+deliveries.length<3)return null
  const parts=[]
  if(collections.length)parts.push(`Collections: ${collections.join(' → ')}`)
  if(deliveries.length)parts.push(`Deliveries: ${deliveries.join(' → ')}`)
  return `Multi-stop — ${parts.join('; ')}`
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j

  // Human QA found a stale post-reducer field-status bug: quote-grade house
  // volume could be accepted into the current state while `f.volume` remained
  // `missing`, causing the customer to be asked the same question again.
  // Re-evaluate only a stale `missing` status using the canonical volumeKnown()
  // rule; never manufacture volume from bedroom/property size alone.
  if(HOUSE.has(j?.category)&&r.f?.volume==='missing'&&core.volumeKnown(j))r.f.volume='known'

  // A distance embedded in grounded parking/access text (for example
  // "street parking about 40 metres away") is quote-critical. Promote the
  // literal distance into the dedicated carry field while retaining the
  // original wording.
  normaliseCarry(j.collection)
  normaliseCarry(j.delivery)

  return r
}

export function prompt(o,j,amb=null){
  const actual=base.prompt(o,j,amb)
  if(o!=='ask_dismantling'||HOUSE.has(j?.category)||amb||!BAD_FRIDGE_DISMANTLE.test(actual))return actual

  const candidates=(j?.inventory||[]).filter(x=>DISMANTLE_FURNITURE.test(String(x)))
  const replacement=candidates.length
    ?`For the ${candidates[0]}, is it already dismantled, will you take it apart, or should the driver allow for dismantling?`
    :'Does anything need removing or taking apart for access — for example doors, handles or other removable parts — or is it ready to move as-is?'

  // Replace only the misleading appliance fragment. Any acknowledgement added
  // by earlier controllers (lifting help, fit/access, progress, etc.) remains.
  return actual.replace(BAD_FRIDGE_DISMANTLE,replacement)
}

export function review(j){
  const s=base.review(j),route=multiStopRoute(j)
  if(route)s.route=route
  return s
}
