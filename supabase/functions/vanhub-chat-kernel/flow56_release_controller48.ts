// @ts-nocheck
import * as base from './flow56_release_controller47.ts'
import {canon} from './core_release_controller47.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function absenceOnlyAmbiguity(v){
  const s=canon(v)
  if(!s)return false
  // Preserve real ambiguity: conflicting alternatives, an unclear value, an
  // invalid value, or a genuine choice that must be resolved by the customer.
  if(/\b(?:ambiguous|unclear|conflict|contradict|did you mean|which one|which location|which date|either|invalid|does not look|doesn't look|could mean)\b/.test(s))return false
  // Model-generated summaries of missing information are not ambiguities. They
  // must fall through to the deterministic objective/prompt instead of being
  // echoed back as robotic prose such as "minimal: no details on...".
  return /\b(?:missing|not provided|not supplied|not given|not specified|still need|no details?|no information|lacks? details?|lacking details?|insufficient details?|minimal)\b/.test(s)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  if(absenceOnlyAmbiguity(r.ambiguity))r.ambiguity=null
  return r
}
