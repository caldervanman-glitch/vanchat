// @ts-nocheck
import * as base from './flow56_release_controller6.ts'
import {canon,clean} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

function copyForCompare(j){
  const x=structuredClone(j||{});if(x.q){for(const k of Object.keys(x.q))if(k.startsWith('controller_'))delete x.q[k]}
  return x
}
function changed(a,b){try{return JSON.stringify(copyForCompare(a))!==JSON.stringify(copyForCompare(b))}catch{return true}}
function endpoint(l){return clean(l?.postcode)||clean(l?.town)||clean(l?.address_text)}
function correctionAck(j0,j,candidate){
  if(!candidate?.correction)return null
  const c0=endpoint(j0?.collection),c1=endpoint(j?.collection),d0=endpoint(j0?.delivery),d1=endpoint(j?.delivery)
  if(c1&&c1!==c0&&d1&&d1!==d0)return `Got it — route changed to ${c1} to ${d1}.`
  if(c1&&c1!==c0)return `Got it — collection changed to ${c1}.`
  if(d1&&d1!==d0)return `Got it — delivery changed to ${d1}.`
  return 'Got it — I’ve updated that.'
}

export function prompt(o,j,amb=null){
  let p=base.prompt(o,j,amb),ack=clean(j?.q?.controller_progress_ack)
  return ack?`${ack} ${p}`:p
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  // Previous acknowledgement is display-only for one response.
  delete j.q.controller_progress_ack
  if(changed(j0,j)){
    // Any accepted canonical fact is progress, even if it was not the fact we just asked for.
    if(j.q.controller_retry_objective===obj)delete j.q.controller_retry_objective
    const ack=correctionAck(j0,j,candidate);if(ack)j.q.controller_progress_ack=ack
  }
  return r
}
