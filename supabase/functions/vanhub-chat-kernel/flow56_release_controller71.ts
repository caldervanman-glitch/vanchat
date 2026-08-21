// @ts-nocheck
import * as base from './flow56_release_controller70.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!candidate?.correction||!j?.q?.controller_date_change_ack)return r

  // The base reducer has already accepted and rendered the corrected date from
  // grounded customer evidence. Do not also prepend the generic date-progress
  // acknowledgement for the same turn, otherwise replies become e.g.
  // "Got it — Saturday ... Got it — date changed to Saturday ...".
  // This changes presentation only: the canonical corrected date/time and the
  // explicit date-change acknowledgement remain untouched.
  delete j.q.controller_date_ack_iso
  if(/timing detail/i.test(String(j.q.controller_progress_ack||'')))delete j.q.controller_progress_ack
  return r
}
