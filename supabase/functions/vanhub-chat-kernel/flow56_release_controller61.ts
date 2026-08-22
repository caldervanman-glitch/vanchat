// @ts-nocheck
import * as base from './flow56_release_controller60.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_LOAD=/\b(?:stuff|things|items?|furniture|bits\s+and\s+pieces|van\s*load|full\s+house|house\s+contents?)\b/i
const LOAD_AMBIGUITY=/\b(?:unclear|unspecified|not\s+specified|no\s+details?)\b[^.]{0,80}\b(?:stuff|things|items?|load|volume|furniture)\b|\b(?:stuff|things|items?|load|volume|furniture)\b[^.]{0,80}\b(?:unclear|unspecified|not\s+specified|no\s+details?)\b/i
const REAL_CHOICE=/\b(?:conflict|contradict|did\s+you\s+mean|which\s+(?:one|location|date)|either|invalid|could\s+mean)\b/i

function vagueLoadSummaryOnly(r,message){
  if(!r?.ambiguity||r?.f?.inventory!=='missing')return false
  const m=String(message||''),a=String(r.ambiguity||'')
  if(!VAGUE_LOAD.test(m)||REAL_CHOICE.test(a))return false
  return LOAD_AMBIGUITY.test(a)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  // Vague load wording is already a deterministic intake condition. When the
  // model merely restates that "stuff"/"items" are unspecified (sometimes
  // mixed with summaries of other missing fields), do not let that prose
  // replace the canonical clarify-load prompt. Preserve genuine choices or
  // conflicts as ambiguity.
  if(vagueLoadSummaryOnly(r,message))r.ambiguity=null
  return r
}
