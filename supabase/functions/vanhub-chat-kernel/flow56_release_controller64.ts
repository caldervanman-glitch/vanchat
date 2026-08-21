// @ts-nocheck
import * as base from './flow56_release_controller63.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const DRIVER_FULL_HANDLING=/\b(?:driver|crew|movers?)\b[^.]{0,35}\b(?:will\s+need\s+to|need(?:s)?\s+to|must|has\s+to|have\s+to|will)\b[^.]{0,35}\b(?:do|handle)\b[^.]{0,20}\b(?:the\s+)?(?:lifting|loading|heavy\s+lifting)\b/i

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const detail=String(j?.q?.assistance_detail||'')
  if(j?.customer_assistance===false
    &&/driver\/crew full handling/i.test(detail)
    &&DRIVER_FULL_HANDLING.test(String(message||''))){
    // Full-driver-handling is already accepted canonical state. Do not let
    // stochastic stale extractor facts change the progress acknowledgement.
    j.q.controller_progress_ack='I’ve noted that you cannot help with the lifting.'
  }
  return r
}
