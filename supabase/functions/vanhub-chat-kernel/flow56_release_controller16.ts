// @ts-nocheck
import * as base from './flow56_release_controller15.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function relativeAmbiguity(a){
  const s=String(a||'').toLowerCase()
  return /\b(?:location|address)\b/.test(s)&&/\b(?:ambiguous|without town|without.*postcode|town or postcode|specific location)\b/.test(s)&&/\b(?:my\s+(?:house|home|place|nan'?s?|nana'?s?|mum'?s?|mom'?s?|dad'?s?|friend'?s?|brother'?s?|sister'?s?|partner'?s?)|home|work)\b/.test(s)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  if(relativeAmbiguity(r.ambiguity))r.ambiguity=null
  return r
}
