// @ts-nocheck
import * as base from './flow56_release_controller70.ts'
import {today} from './core_release_controller50.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const WD={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6}
const MONTH=['January','February','March','April','May','June','July','August','September','October','November','December']
const CORRECTION=/\b(?:sorry\s+)?(?:make|change|move|switch|update)\s+(?:(?:that|it)\s+)?(?:to\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
const TIME=/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i

function sameDayCorrection(message,j0){
  if(!j0?.date?.iso_date)return null
  const m=String(message||'').match(CORRECTION)
  if(!m)return null
  const iso=today(),d=new Date(`${iso}T12:00:00Z`),wanted=WD[m[1].toLowerCase()]
  if(d.getUTCDay()!==wanted)return null
  const tm=String(message||'').match(TIME)?.[1]?.replace(/\s+/g,'').toLowerCase()||null
  const label=`${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  return{iso,label,time:tm}
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const x=sameDayCorrection(message,j0)
  if(!x)return r

  // A literal correction such as “make that Saturday at 1pm”, sent on
  // Saturday, means the current Saturday. The ordinary forward-looking
  // weekday parser intentionally maps bare weekdays to the next occurrence;
  // correction wording is a different semantic case. This override uses only
  // the customer's current words plus today's deterministic calendar date.
  j.date??={}
  j.q??={}
  j.date.iso_date=x.iso
  j.date.original_text=x.time?`${x.label.split(' ')[0]} at ${x.time}`:x.label.split(' ')[0]
  if(x.time)j.date.time_preference=x.time
  r.f.date='known'
  if(x.time)r.f.time='known'
  delete j.q.pending_date_iso
  delete j.q.pending_date_text
  delete j.q.controller_date_ack_iso
  delete j.q.controller_progress_ack
  j.q.controller_date_change_ack=`Got it — date changed to ${x.label}${x.time?` at ${x.time}`:''}.`
  r.ambiguity=null
  return r
}
