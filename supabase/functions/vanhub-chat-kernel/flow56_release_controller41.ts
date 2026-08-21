// @ts-nocheck
import * as base from './flow56_release_controller40.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function tidyTime(x){return String(x||'').toLowerCase().replace(/\s+/g,'').replace(/^0/,'')}
function explicitWindow(message){
  const s=String(message||'')
  let m=s.match(/\bbetween\s+(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)?\s+and\s+(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i)
  if(m){const mer1=(m[3]||m[6]).toLowerCase(),a=`${m[1]}${m[2]?`:${m[2]}`:''}${mer1}`,b=`${m[4]}${m[5]?`:${m[5]}`:''}${m[6].toLowerCase()}`;return`${tidyTime(a)} to ${tidyTime(b)}`}
  m=s.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\s*(?:to|-|until)\s*(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i)
  if(m)return`${tidyTime(`${m[1]}${m[2]?`:${m[2]}`:''}${m[3]}`)} to ${tidyTime(`${m[4]}${m[5]?`:${m[5]}`:''}${m[6]}`)}`
  return null
}
function normalizeWindow(j,message){const w=explicitWindow(message);if(!w)return false;j.date??={original_text:null,iso_date:null,alternative_iso_dates:[],flexibility:null,time_preference:null};if(clean(j.date.time_preference)===w)return false;j.date.time_preference=w;return true}
function normalizeFlexibility(j,message){
  if(clean(j?.date?.iso_date)||!clean(j?.date?.original_text))return false
  const txt=[j.date.original_text,j.date.flexibility,message].filter(Boolean).join(' ')
  if(!/\b(?:any\s+day\s+)?next\s+week\b|\b(?:this|next)\s+weekend\b|\bweek\s+(?:commencing|beginning)\b/i.test(txt)||!/\b(?:flexible|any\s+day|anytime|any\s+time)\b/i.test(txt))return false
  if(canon(j.date.flexibility)==='flexible')return false;j.date.flexibility='flexible';return true
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const changed=normalizeWindow(j,message)|normalizeFlexibility(j,message)
  if(changed)r.f=requirements(j,r.f)
  return r
}
