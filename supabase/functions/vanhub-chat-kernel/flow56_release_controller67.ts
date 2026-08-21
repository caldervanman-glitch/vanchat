// @ts-nocheck
import * as base from './flow56_release_controller66.ts'
import {today,add} from './core_release_controller50.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const WD={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6}
const NUM={one:1,two:2,three:3,four:4,five:5,six:6}
const CONFIRM='__CONTROLLER_DATE_CONFIRM__:'

function weeksOnWeekday(message){
  const m=String(message||'').match(/\b(\d+|one|two|three|four|five|six)\s+weeks?\s+on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
  if(!m)return null
  const weeks=/^\d+$/.test(m[1])?Number(m[1]):NUM[m[1].toLowerCase()]
  if(!Number.isInteger(weeks)||weeks<1||weeks>12)return null
  const baseIso=today(),d=new Date(`${baseIso}T12:00:00Z`),target=WD[m[2].toLowerCase()]
  let delta=(target-d.getUTCDay()+7)%7
  if(delta===0)delta=7
  // “two weeks on Friday” means the second upcoming Friday. Once the current
  // day has passed Friday, do not add two whole weeks and then seek Friday;
  // that incorrectly jumps to the third upcoming Friday.
  return add(baseIso,delta+(weeks-1)*7)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const expected=weeksOnWeekday(message)
  if(!expected)return r
  j.q??={}
  // This is a literal deterministic relative-date parse from the customer's
  // current message. The model's candidate ISO is not used as evidence.
  j.q.pending_date_iso=expected
  j.q.pending_date_text=String(message||'')
  j.date??={}
  j.date.iso_date=null
  r.f.date='missing'
  r.ambiguity=CONFIRM+expected
  if(j.q.controller_date_ack_iso)delete j.q.controller_date_ack_iso
  return r
}
