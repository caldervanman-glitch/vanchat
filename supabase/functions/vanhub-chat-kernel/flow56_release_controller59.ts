// @ts-nocheck
import * as base from './flow56_release_controller58.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const REL_PERSON=/(?:nan|nans|nan's|gran|grans|gran's|grandma|grandad|mum|mums|mum's|mom|moms|mom's|mam|mams|mam's|dad|dads|dad's|parents?|friend|friends|friend's|mate|mates|mate's|sister|sisters|sister's|brother|brothers|brother's|aunt|aunts|aunt's|auntie|aunties|auntie's|uncle|uncles|uncle's|cousin|cousins|cousin's|daughter|daughters|daughter's|son|sons|son's)/i
function hasRelativeEndpoint(message){
  const s=String(message||'')
  if(/\b(?:from|to)\s+(?:my|our|the)\s+(?:house|home|place)\b/i.test(s))return true
  const m=s.match(/\b(?:from|to)\s+(?:my|our|the)\s+([^,.;]{1,30})/i)
  return !!(m&&REL_PERSON.test(m[1]))
}
function locationOnlyAmbiguity(v){
  const s=String(v||'').toLowerCase()
  if(!s)return false
  if(!/\b(?:collection|delivery|location|address|town|postcode)\b/.test(s))return false
  return !/\b(?:date|time|item|load|inventory|vehicle|condition|identity|weight|dimension|safety|hazard|conflict|contradict|did you mean)\b/.test(s)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  // "my house", "my nan's", etc. describe endpoint relationships/property
  // context, not geographic locations. When the extractor reports only that
  // those locations are unclear, keep the normal intake order instead of
  // echoing a robotic ambiguity string. Route remains missing and will still
  // be collected after useful load detail is known.
  if(hasRelativeEndpoint(message)&&locationOnlyAmbiguity(r.ambiguity))r.ambiguity=null
  return r
}
