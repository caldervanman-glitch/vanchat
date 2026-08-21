// @ts-nocheck
import * as base from './flow56_release_controller65.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
const norm=v=>String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()
function fitValues(j){return [clean(j?.q?.fit_access_issue),clean(j?.q?.fit_access_plan)].filter(Boolean)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const msg=clean(String(message||''))
  if(obj!=='ask_dismantling'||!msg||r?.f?.fit_access!=='known')return r

  const current=fitValues(j),prior=fitValues(j0)
  const acceptedLiteral=current.some(v=>norm(v)===norm(msg))
  const alreadyPresent=prior.some(v=>norm(v)===norm(msg))
  if(acceptedLiteral&&!alreadyPresent){
    // The base reducer has already accepted the customer's exact current
    // sentence as canonical fit/access evidence. Acknowledge that progress
    // deterministically rather than depending on the extractor's separate
    // dismantling interpretation. No model-only fact is promoted here.
    j.q??={}
    j.q.controller_progress_ack='I’ve noted that fit/access detail.'
  }
  return r
}
