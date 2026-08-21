// @ts-nocheck
import * as base from './flow56_release_controller11.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function applyCommonFacts(j,r,message){
  const s=String(message||'')
  j.q??={};j.q.appliances??={present:null,disconnected:null,reconnect_requested:null}
  if(/\b(?:all|everything|all the loose (?:items|belongings))\s+(?:is |will be |are )?(?:boxed|packed|bagged)\b|\bfully (?:boxed|packed)\b/i.test(s)){
    j.q.packing='all loose belongings boxed/bagged and ready'
    if(!j.q.loose_items)j.q.loose_items='none'
    r.f.packing='known';r.f.loose_items='known'
  }
  if(/\b(?:no|nothing|not any)\s+(?:particularly\s+)?(?:large|heavy|awkward)(?:\s+(?:items?|things?|pieces?))?\b|\bno heavy items?\b/i.test(s)){
    j.q.notable='none';r.f.notable='known'
  }
  if(/\bno\s+(?:washing machines?|dishwashers?|plumbed appliances?|appliances?)\b/i.test(s)){
    j.q.appliances.present='no'
    if(r.f.appliance_plumbing!=='na')r.f.appliance_plumbing='known'
  }
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  applyCommonFacts(j,r,message)
  return r
}
