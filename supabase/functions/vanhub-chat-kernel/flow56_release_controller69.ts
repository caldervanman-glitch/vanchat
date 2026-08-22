// @ts-nocheck
import * as base from './flow56_release_controller68.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_LOAD=/\b(?:stuff|things|items?|furniture|bits\s+and\s+pieces|van\s*load|van\s+full|house\s+contents?)\b/i
const LOCATION_SUMMARY=/\b(?:towns?|locations?|route|collection|delivery|address(?:es)?)\b/i
const GENUINE_CONFLICT=/\b(?:conflict|contradict|did\s+you\s+mean|which\s+(?:one|location|place|town|address)|either\s+(?:location|place|town|address)|invalid|could\s+mean)\b/i
const norm=v=>String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()
function endpoint(l){return norm(l?.postcode||l?.town||l?.address_text)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const c=endpoint(j?.collection),d=endpoint(j?.delivery),a=String(r?.ambiguity||'')
  if(r?.f?.inventory==='missing'
    &&VAGUE_LOAD.test(String(message||''))
    &&c&&d&&c===d
    &&LOCATION_SUMMARY.test(a)
    &&!GENUINE_CONFLICT.test(a)){
    // Same-town is a valid explicit route. The extractor may phrase missing
    // address/volume detail as an "ambiguity" (including prose with the word
    // "or"), but that is only a summary of absent detail. Keep the canonical
    // route and ask for the vague load first. Genuine conflicting alternatives
    // remain untouched by GENUINE_CONFLICT.
    r.ambiguity=null
  }
  return r
}
