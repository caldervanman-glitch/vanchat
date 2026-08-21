// @ts-nocheck
import * as base from './flow56_release_controller43.ts'
import {canon,clean,requirements,nextObjective} from './core_release_highvalue.ts'

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
const PROPERTY_SIZE_ONLY=/^(?:\d+|one|two|three|four|five|six|seven|eight|nine)\s*(?:bed|beds|bedroom|bedrooms)\s*(?:house|flat|home)?$/i

function meaningfulInventory(j){
  return (Array.isArray(j?.inventory)?j.inventory:[]).map(x=>String(x||'').trim()).filter(x=>x&&!VAGUE_LOAD.test(canon(x)))
}
function vagueOnlyInventory(j){
  const all=(Array.isArray(j?.inventory)?j.inventory:[]).map(x=>String(x||'').trim()).filter(Boolean)
  return !all.length||all.every(x=>VAGUE_LOAD.test(canon(x)))
}
function quoteGradeHouseLoad(j){
  const inv=meaningfulInventory(j)
  const named=inv.filter(x=>SPECIFIC_ITEM.test(x)).length
  const containers=inv.some(x=>CONTAINER_COUNT.test(x))
  return named>=2||(named>=1&&containers)
}
function weakHouseVolume(v){
  const x=canon(v)
  return !x||VAGUE_LOAD.test(x)||PROPERTY_SIZE_ONLY.test(x)
}
function enforceFinalQuoteGrade(j,r){
  r.f=requirements(j,r.f)
  const vague=vagueOnlyInventory(j)
  if(vague){
    r.f.inventory='missing'
    if(j.category==='furniture_move')r.f.furniture='missing'
  }
  if(['house_move','flat_move'].includes(j.category)){
    r.f.volume=quoteGradeHouseLoad(j)?'known':'missing'
    // Keep a literal bedroom/property-size descriptor in state as context if
    // the extractor captured it, but never let it satisfy quote-grade volume.
    if(!clean(j?.q?.house_volume)||weakHouseVolume(j.q.house_volume))r.f.volume='missing'
  }
  // Vague load language is the highest-value unresolved fact on this turn.
  // Clarify the load before asking lower-value time/access questions.
  if(vague)r.objective='ask_inventory'
  else r.objective=nextObjective(j,r.f)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  enforceFinalQuoteGrade(r.j,r)
  return r
}
