// @ts-nocheck
import * as base from './flow56_release_controller17.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function explicitlyPacked(message){
  return /\b(?:all|everything|all the loose (?:items|belongings))\s+(?:is |will be |are )?(?:boxed|packed|bagged)\b|\bfully (?:boxed|packed)\b/i.test(String(message||''))
}
function actualLooseEvidence(text){
  return /\b(?:loose|unboxed|unpacked|individual|not boxed|not packed|hundreds? of (?:bits|items|pieces)|lots? of (?:bits|items|pieces))\b/i.test(String(text||''))
}
function heavyOnly(text){
  return /\b(?:heavy|awkward|large|bulky)\b/i.test(String(text||''))&&!actualLooseEvidence(text)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(explicitlyPacked(message)&&heavyOnly(j?.q?.loose_items))j.q.loose_items='none'
  return r
}
