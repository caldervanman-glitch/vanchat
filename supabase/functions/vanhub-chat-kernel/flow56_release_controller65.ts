// @ts-nocheck
import * as base from './flow56_release_controller64.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const GENERIC_WARDROBE=/^(?:a |an |one |1 )?wardrobe$/i
const WARDROBE_DETAIL=/\b((?:(?:large|small|single|double|triple|two[- ]door|three[- ]door|four[- ]door)\s+){1,2}wardrobe)\b/i

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(obj!=='ask_furniture'||j?.category!=='furniture_move')return r

  const detail=String(message||'').match(WARDROBE_DETAIL)?.[1]?.trim()
  if(!detail)return r
  let promoted=false
  j.inventory=(j.inventory||[]).map(item=>{
    if(!promoted&&GENERIC_WARDROBE.test(String(item||'').trim())){
      promoted=true
      return detail
    }
    return item
  })
  if(promoted){
    // The customer supplied this description literally in the current turn.
    // Preserve it even if the extractor downgraded the same phrase to an
    // approximate candidate. This is not model inference and does not relax
    // evidence validation for other facts.
    r.f.furniture='known'
  }
  return r
}
