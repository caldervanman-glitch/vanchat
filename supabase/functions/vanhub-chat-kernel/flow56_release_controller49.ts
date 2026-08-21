// @ts-nocheck
import * as base from './flow56_release_controller48.ts'
import {canon,relativeHouseholdValue,quoteGradeLocation} from './core_release_controller49.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function relativeLocationAmbiguity(v){
  const s=canon(v)
  if(!s)return false
  const locationContext=/\b(?:collection|delivery|location|town|postcode|address)\b/.test(s)
  const invalidReference=/\b(?:is not|isn't|isnt|not)\s+(?:an?\s+)?(?:actual\s+)?location\b|\bcannot be used as (?:an?\s+)?location\b|\bneeds? (?:a )?(?:town|area|postcode|address)\b/.test(s)
  return locationContext&&invalidReference
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  let scrubbed=false

  for(const side of ['collection','delivery']){
    let sideScrubbed=false
    for(const key of ['town','address_text']){
      if(relativeHouseholdValue(j?.[side]?.[key])){
        j[side][key]=null
        scrubbed=sideScrubbed=true
      }
    }
    // Only repair the route status here. Recomputing every requirement would
    // erase quote-grade protections owned by earlier controllers.
    if(sideScrubbed)r.f[`${side}.location`]=quoteGradeLocation(j[side])?'known':'missing'
  }

  // "delivery.town unclear as 'nans' is not a location" is not a genuine
  // customer choice/conflict. Once the pseudo-location is scrubbed, let the
  // deterministic objective ask the normal route question instead.
  if(scrubbed&&relativeLocationAmbiguity(r.ambiguity))r.ambiguity=null
  return r
}
