// @ts-nocheck
import * as base from './flow56_release_controller55.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const SEPARABILITY=/\b(?:comes?|come|can|does)\s+apart\b|\b(?:into|in)\s+\d+\s+(?:sections?|pieces?|parts?)\b/i
const RESPONSIBILITY=/\b(?:i|we|customer|seller)\s+(?:will|can|shall|am going to|are going to)\s+(?:take|dismantle|disassemble)|\b(?:driver|drivers|mover|movers|crew)\b.{0,30}\b(?:dismantle|disassemble|take apart)|\balready\s+(?:dismantled|disassembled|taken apart)\b/i

export function prompt(o,j,amb=null){
  if(o==='ask_dismantling'&&j?.q?.controller_separability_only){
    return 'Got it — it can come apart. I still need to know whether it needs dismantling for the move and, if so, whether you or the driver will do it.'
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  if(j.q.controller_separability_only)delete j.q.controller_separability_only
  if(obj==='ask_dismantling'&&SEPARABILITY.test(String(message||''))&&!RESPONSIBILITY.test(String(message||''))&&!j.q.dismantling_mode){
    // Separability is evidence that the item can come apart, not evidence of
    // who will dismantle it. Keep responsibility unresolved and make the retry
    // explicit rather than repeating a generic dismantling question.
    j.q.controller_separability_only=true
    r.f.dismantling='missing'
  }
  return r
}
