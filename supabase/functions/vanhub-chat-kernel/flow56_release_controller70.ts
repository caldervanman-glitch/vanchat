// @ts-nocheck
import * as base from './flow56_release_controller69.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
const CONDITION_ONLY=/\b(?:does(?:n't| not)|do\s+not|won't|will\s+not|cannot|can't)\s+(?:run|roll|steer|brake)(?:\s+or\s+(?:run|roll|steer|brake))*\b|\b(?:non[- ]?running|non[- ]?rolling|not\s+running|not\s+rolling)\b/i
const REAL_LOADING=/\b(?:winch|wheel\s*skates?|skates?|forklift|ramp|tail\s*lift|crane|hoist|flatbed|trailer|recovery\s+(?:truck|vehicle)|loading\s+equipment|loaded?\s+(?:with|using|by)|push(?:ed|ing)?\s+(?:it\s+)?(?:on|onto)|roll(?:ed|ing)?\s+(?:it\s+)?(?:on|onto))\b/i
const norm=v=>String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()
function primitiveKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function impaired(v){return ['rolls','steers','brakes'].some(k=>v?.[k]==='no')}
function bogusLoadingFact(candidate,current){
  for(const x of candidate?.facts||[]){
    if(x?.k!=='vehicle.loading'||!['operational','approximate'].includes(String(x?.kind||'')))continue
    const value=String(x?.v||'').trim()
    if(!value||norm(value)!==norm(current))continue
    if(CONDITION_ONLY.test(value)&&!REAL_LOADING.test(value))return true
  }
  return false
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const v=j?.q?.vehicle||{},before=j0?.q?.vehicle?.loading??null,current=v.loading
  if(current&&before==null&&bogusLoadingFact(candidate,current)){
    // "does not run or roll" is vehicle condition evidence, not a method for
    // getting the vehicle onto the transporter. Reject only the newly added
    // candidate value itself; a deterministic/previous genuine loading plan is
    // left intact.
    v.loading=null
    if(VEHICLE_CATS.has(j?.category)&&primitiveKnown(v)&&impaired(v))r.f['vehicle.condition']='missing'
  }
  return r
}
