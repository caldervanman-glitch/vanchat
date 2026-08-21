// @ts-nocheck
import * as base from './flow56_release_controller14.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt
export const reduce=base.reduce

export function hazard(j,flags=[]){
  const h=base.hazard(j,flags)
  if(h)return h
  const s=[...(flags||[]),...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.additional_notes].filter(Boolean).join(' ').toLowerCase()
  if(/\b(?:leaking|leaks?|leaked)\s+(?:petrol|gasoline|diesel|fuel)\b|\b(?:petrol|gasoline|diesel|fuel)\s+(?:is\s+)?(?:leaking|leaks?|leaked)\b/i.test(s))return 'a fuel leak'
  return null
}
