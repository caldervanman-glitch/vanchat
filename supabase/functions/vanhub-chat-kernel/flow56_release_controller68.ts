// @ts-nocheck
import * as base from './flow56_release_controller67.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_LOAD=/\b(?:stuff|things|items?|furniture|bits\s+and\s+pieces|van\s*load|van\s+full|house\s+contents?)\b/i
const SAME_ROUTE_AMBIGUITY=/\b(?:towns?|locations?|route|specific\s+locations?|various\s+specific\s+locations?)\b/i
const REAL_CONFLICT=/\b(?:conflict|contradict|did\s+you\s+mean|which\s+(?:one|location|place)|either|invalid|could\s+mean|or)\b/i
const norm=v=>String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()
function endpoint(l){return norm(l?.postcode||l?.town||l?.address_text)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const c=endpoint(j?.collection),d=endpoint(j?.delivery),a=String(r?.ambiguity||'')
  if(r?.f?.inventory==='missing'
    &&VAGUE_LOAD.test(String(message||''))
    &&c&&d&&c===d
    &&SAME_ROUTE_AMBIGUITY.test(a)
    &&!REAL_CONFLICT.test(a)){
    // An explicit same-town route (for example "York to York") is valid
    // customer evidence. A model-generated warning that the town could contain
    // several specific addresses must not displace the higher-value load
    // clarification when the customer has supplied only "stuff"/"items".
    // No location is invented or upgraded here; both canonical endpoints were
    // already grounded by the customer message.
    r.ambiguity=null
  }
  return r
}
