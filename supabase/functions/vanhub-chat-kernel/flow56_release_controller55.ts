// @ts-nocheck
import * as base from './flow56_release_controller54.ts'
import {canon,clean} from './core_release_controller49.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_LOAD=/^(?:full\s+house|whole\s+house|house\s+contents?|general\s+belongings?|all\s+(?:my|our)\s+stuff|everything|not\s+much|a\s+few\s+(?:bits|things)|bits\s+and\s+pieces|multiple\s+(?:items|pieces)(?:\s+of\s+furniture)?|some\s+(?:furniture|items|things|stuff|sofas?|boxes|bags)|a\s+few\s+(?:boxes|bags)|boxes|bags|furniture|items|things|stuff|(?:a\s+)?van\s*load|(?:a\s+)?van\s+full(?:\s+of\s+(?:stuff|things|items|belongings))?|one\s+van\s+load)$/i
const SPECIFIC_ITEM=/\b(?:sofas?|armchairs?|wardrobes?|beds?|mattresses?|tables?|chairs?|drawers?|dressers?|bookcases?|desks?|fridges?|freezers?|washing\s+machines?|dishwashers?|pianos?|safes?|tvs?|televisions?|cabinets?|sideboards?|motorbikes?|bikes?)\b/i
const CONTAINER_COUNT=/\b\d+(?:\s*(?:-|to)\s*\d+)?\s*(?:boxes?|bags?|crates?|cartons?)\b/i
const INHERENT_NOTABLE=/\b(?:piano|safe|motorbike|motorcycle|scooter|aquarium|pool table|snooker table|machine|machinery)\b/i
const EXPLICIT_NOTABLE=/\b(?:heavy|very heavy|extremely heavy|awkward|large|very large|oversized|bulky|two[- ]person|two[- ]man lift|needs? two|requires? two)\b/i

function quoteGradeHouseLoad(j){
  const inv=(Array.isArray(j?.inventory)?j.inventory:[])
    .map(x=>String(x||'').trim())
    .filter(x=>x&&!VAGUE_LOAD.test(canon(x)))
  const named=inv.filter(x=>SPECIFIC_ITEM.test(x)).length
  const containers=inv.some(x=>CONTAINER_COUNT.test(x))
  return named>=2||(named>=1&&containers)
}

function stripUngroundedCurrentHeavy(j,j0,candidate){
  if(!['house_move','flat_move'].includes(j?.category))return
  const prior=new Set((j0?.heavy_or_awkward_items||[]).map(canon))
  const reject=new Set()
  for(const x of candidate?.heavy_add||[]){
    const value=String(x?.value||'').trim(),evidence=String(x?.evidence||'').trim()
    if(!value||prior.has(canon(value)))continue
    if(INHERENT_NOTABLE.test(value)||INHERENT_NOTABLE.test(evidence))continue
    if(EXPLICIT_NOTABLE.test(value)||EXPLICIT_NOTABLE.test(evidence))continue
    reject.add(canon(value))
  }
  if(reject.size)j.heavy_or_awkward_items=(j.heavy_or_awkward_items||[]).filter(x=>!reject.has(canon(x)))
}

function highValueComplete(h){
  if(!h)return false
  const valueNeeded=!!(clean(h.value_signal)||clean(h.declared_value))
  return !!((!valueNeeded||clean(h.declared_value))&&clean(h.dimensions)&&clean(h.weight)&&clean(h.fragility_details))
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j

  // Model heavy_add is only a candidate label. Ordinary household furniture is
  // not evidence of being heavy/awkward unless the customer's own wording says
  // so (or the item is inherently specialist). Do not let that inference skip
  // the explicit notable-items question.
  stripUngroundedCurrentHeavy(j,j0,candidate)

  if(['house_move','flat_move'].includes(j?.category)){
    // A bedroom/property-size label alone is not volume evidence, but a real
    // list containing multiple named furniture items (or a named item plus a
    // quantified box/bag count) is quote-grade even when q.house_volume is null.
    if(quoteGradeHouseLoad(j))r.f.volume='known'
    r.f.notable=(j?.q?.notable!=null||(j?.heavy_or_awkward_items||[]).length>0)?'known':'missing'
  }

  // Later generic requirements() recomputations can turn dimweight back to NA
  // when the extractor omits job_type/category even though the deterministic
  // high-value layer has already captured customer evidence in q.high_value.
  // Reassert only this specialist gate; do not recompute the requirements map.
  if(j?.q&&Object.prototype.hasOwnProperty.call(j.q,'high_value')){
    r.f.dimweight=highValueComplete(j.q.high_value)?'known':'missing'
  }
  return r
}
