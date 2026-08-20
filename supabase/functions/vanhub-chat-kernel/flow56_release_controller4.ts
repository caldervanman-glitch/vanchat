// @ts-nocheck
import * as base from './flow56_release_controller3.ts'
import {canon,clean,requirements} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const UNKNOWN=/^(?:i\s+)?(?:don't know|dont know|do not know|not sure|unsure|no idea|unknown|haven't a clue|havent a clue)$/i

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(obj==='ask_vehicle_identity'&&UNKNOWN.test(canon(message))&&!clean(j?.q?.vehicle?.identity)){
    j.q??={};j.q.vehicle??={};
    j.q.vehicle.identity='unknown - customer does not know make/model'
    j.q.unknown=(j.q.unknown||[]).filter(x=>x!=='vehicle.identity')
    r.f=requirements(j,r.f)
    r.f['vehicle.identity']='known'
    r.ambiguity=null
    if(j.q.controller_retry_objective==='ask_vehicle_identity')delete j.q.controller_retry_objective
  }
  return r
}
