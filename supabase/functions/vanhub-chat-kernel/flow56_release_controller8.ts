// @ts-nocheck
import * as base from './flow56_release_controller7.ts'
import {clean} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

function endpoint(l){return clean(l?.postcode)||clean(l?.town)||clean(l?.address_text)}
function correctionLanguage(message,candidate){
  if(candidate?.correction)return true
  const s=String(message||'').toLowerCase()
  return ['actually','sorry','correction','change that','instead','make that'].some(x=>s.includes(x))
}

export const prompt=base.prompt
export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(correctionLanguage(message,candidate)){
    j.q??={}
    const c0=endpoint(j0?.collection),c1=endpoint(j?.collection),d0=endpoint(j0?.delivery),d1=endpoint(j?.delivery)
    if(c1&&c1!==c0&&d1&&d1!==d0)j.q.controller_progress_ack=`Got it — route changed to ${c1} to ${d1}.`
    else if(c1&&c1!==c0)j.q.controller_progress_ack=`Got it — collection changed to ${c1}.`
    else if(d1&&d1!==d0)j.q.controller_progress_ack=`Got it — delivery changed to ${d1}.`
    else if(!clean(j.q.controller_progress_ack))j.q.controller_progress_ack='Got it — I’ve updated that.'
  }
  return r
}
