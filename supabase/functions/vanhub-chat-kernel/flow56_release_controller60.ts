// @ts-nocheck
import * as base from './flow56_release_controller59.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const FLEX_WINDOW=/\b(?:any\s+day\s+)?next\s+week\b|\b(?:this|next)\s+weekend\b|\bweek\s+(?:commencing|beginning)\b(?:\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+[a-z]+)?)?/i
const FLEX_SIGNAL=/\b(?:i(?:'|’)?m|i\s+am|we(?:'|’)?re|we\s+are)\s+(?:fully\s+|completely\s+|very\s+)?flexible\b|\bany\s+(?:day|time)\b|\banytime\b/i

function recoverBoundedFlexibleDate(j,r,message){
  if(j?.date?.iso_date)return
  const s=String(message||'')
  const window=s.match(FLEX_WINDOW)
  if(!window||!FLEX_SIGNAL.test(s))return

  // A stochastic extractor can put the customer's bounded date window into
  // date.flexibility while omitting date.original_text. Recover only literal
  // current-message evidence; never invent an exact date from the model.
  j.date??={}
  if(!String(j.date.original_text||'').trim())j.date.original_text=window[0]
  j.date.flexibility='flexible'
  r.f.date='known'
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  recoverBoundedFlexibleDate(j,r,message)
  return r
}
