// @ts-nocheck
import * as base from './flow56_release_controller62.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_LOAD=/\b(?:stuff|things|items?|furniture|bits\s+and\s+pieces|van\s*load|full\s+house|house\s+contents?)\b/i
const ABSENCE_SUMMARY=/\b(?:unspecified|not\s+specified|missing|no\s+details?)\b[^.]{0,140}\b(?:property\s+types?|volumes?|dates?|access|addresses?)\b/i
const REAL_CHOICE=/\b(?:conflict|contradict|did\s+you\s+mean|which\s+(?:one|location|date)|either|invalid|could\s+mean|whether|or)\b/i

function genericVagueLoadMissingSummary(r,message){
  if(!r?.ambiguity||r?.f?.inventory!=='missing')return false
  const m=String(message||''),a=String(r.ambiguity||'')
  return VAGUE_LOAD.test(m)&&ABSENCE_SUMMARY.test(a)&&!REAL_CHOICE.test(a)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  // Model summaries of absent property/volume/date/access details are not a
  // customer ambiguity. For an explicitly vague load, keep the deterministic
  // clarify-load question. Genuine alternatives/choices remain untouched.
  if(genericVagueLoadMissingSummary(r,message))r.ambiguity=null
  return r
}
