// @ts-nocheck
import * as base from './flow56_release_controller19.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function hasRelativePlace(message){
  return /\b(?:my\s+(?:house|home|place|nan'?s?|nana'?s?|grandma'?s?|gran'?s?|mum'?s?|mom'?s?|dad'?s?|friend'?s?|brother'?s?|sister'?s?|partner'?s?|work)|our\s+(?:house|home|place)|home|work)\b/i.test(String(message||''))
}
function explicitRouteAmbiguity(text){
  const s=String(text||'').toLowerCase()
  return /\b(?:collection|delivery|locations?|addresses?|route)\b/.test(s)&&/\b(?:unknown|ambiguous|missing|not provided|without|need(?:s)? clarification|vague|too broad|not specific)\b/.test(s)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  if(hasRelativePlace(message)&&explicitRouteAmbiguity(r.ambiguity))r.ambiguity=null
  return r
}
