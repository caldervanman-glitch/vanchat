// @ts-nocheck
import * as base from './flow56_release_controller10.ts'
import {requirements} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function reassemblyAnswer(message){
  const s=String(message||'')
  if(/\b(?:do not|don't|dont|won't|will not)\s+need\s+(?:it|them|anything)?\s*(?:to be )?reassembled\b|\bno\s+reassembly\b|\b(?:we|i|customer)\s+(?:will|'ll|can)\s+reassemble\b|\bwe(?:'ll| will)\s+put\s+(?:it|them)\s+back\s+together\b/i.test(s))return false
  if(/\b(?:need|want|require)\s+(?:the\s+)?driver\s+to\s+reassemble\b|\bdriver\s+(?:must|needs? to|will)\s+reassemble\b|\b(?:yes|yeah|yep),?\s*(?:please\s*)?(?:reassemble|put (?:it|them) back together)\b/i.test(s))return true
  return null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const ans=reassemblyAnswer(message)
  if(ans!==null){j.reassembly_required=ans;r.f=requirements(j,r.f)}
  return r
}
