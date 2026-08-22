// @ts-nocheck
import * as base from './flow56_release_controller71.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const PACKING_ONLY=/^(?:all|fully|everything(?: is)?|everything's)?\s*(?:boxed|packed|bagged)(?:\s*(?:up|and ready))?$/i

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!['house_move','flat_move'].includes(j?.category))return r

  const bad=(candidate?.facts||[]).some(x=>x?.k==='notable'&&PACKING_ONLY.test(String(x?.v||'').trim()))
  if(!bad||!PACKING_ONLY.test(String(j?.q?.notable||'').trim()))return r

  // Packing status is not evidence that there are no large/heavy/awkward
  // items. Preserve the grounded packing fact, but reopen the independent
  // notable-items gate when the extractor has copied "all boxed/packed" into
  // `notable`. This removes model-only state; no new customer fact is added.
  j.q.notable=null
  r.f.notable='missing'
  return r
}
