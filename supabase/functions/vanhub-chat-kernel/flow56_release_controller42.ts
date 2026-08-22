// @ts-nocheck
import * as base from './flow56_release_controller41.ts'
import {clean} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

export function hazard(j,flags=[]){
  const inv=(j?.inventory||[]).join(' '),s=[...(flags||[]),j?.q?.specialist?.handling].filter(Boolean).join(' ')
  if(/\bgenerator\b/i.test(inv)&&(/\b(?:still\s+has|contains?|with)\b.{0,25}\bfuel\b/i.test(s)||/\bfuel\b.{0,25}\b(?:in it|remaining|inside|in the tank|not drained)\b/i.test(s)))return 'fuel remaining in powered equipment'
  return base.hazard(j,flags)
}

function staleDateAmbiguity(ambiguity,j){
  if(!clean(j?.date?.iso_date)||typeof ambiguity!=='string')return false
  return /\bdate\b.{0,50}\b(?:lack|missing|explicit|full|reference|day)\b|\b(?:day|date)\s+(?:is\s+)?(?:unclear|ambiguous|unspecified)\b/i.test(ambiguity)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  if(staleDateAmbiguity(r.ambiguity,r.j))r.ambiguity=null
  return r
}
