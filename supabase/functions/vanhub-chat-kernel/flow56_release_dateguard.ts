// @ts-nocheck
import * as base from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/0582abcb191521fc1ee3e3a5cb8da7d7906616fe/supabase/functions/vanhub-chat-kernel/flow56_release.ts'
import {requirements} from './core.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const review=base.review

const PAST_DATE='__PAST_DATE__'

export function prompt(o,j,amb=null){
  if(amb===PAST_DATE)return 'That sounds like a date in the past. What future date do you need the move?'
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const result=base.reduce(j0,f0,message,obj,candidate,direct,media)
  if(obj==='ask_date'&&/\byesterday\b/i.test(String(message||''))){
    result.j.date.iso_date=null
    result.j.q??={}
    delete result.j.q.pending_date_iso
    delete result.j.q.pending_date_text
    result.f=requirements(result.j,result.f)
    result.ambiguity=PAST_DATE
  }
  return result
}
