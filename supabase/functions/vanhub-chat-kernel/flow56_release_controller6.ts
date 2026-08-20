// @ts-nocheck
import * as base from './flow56_release_controller5.ts'
import {clean} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const CONFIRM='__CONTROLLER_DATE_CONFIRM__:'
const WD={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6}
const NUM={a:1,one:1,two:2,three:3,four:4}
function londonToday(){
  const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
  const x=Object.fromEntries(p.map(v=>[v.type,v.value]));return `${x.year}-${x.month}-${x.day}`
}
function addDays(iso,n){const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function weekWeekday(message){
  const s=String(message||'').toLowerCase()
  let m=s.match(/\b(a|one|two|three|four|\d+)\s+weeks?\s+(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
  let weeks=null,day=null
  if(m){weeks=NUM[m[1]]??Number(m[1]);day=m[2].toLowerCase()}
  else {m=s.match(/\b(?:a\s+)?fortnight\s+(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);if(m){weeks=2;day=m[1].toLowerCase()}}
  if(!Number.isFinite(weeks)||weeks<1||weeks>12||!day)return null
  const today=londonToday(),d=new Date(`${today}T12:00:00Z`),delta=(WD[day]-d.getUTCDay()+7)%7
  // 'two weeks on Friday' = the upcoming-or-today Friday plus two weeks.
  return addDays(today,delta+(weeks*7))
}
function label(iso){try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${iso}T12:00:00Z`))}catch{return iso}}

export function prompt(o,j,amb=null){if(typeof amb==='string'&&amb.startsWith(CONFIRM))return `Just to confirm, do you mean ${label(amb.slice(CONFIRM.length))}?`;return base.prompt(o,j,amb)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const iso=weekWeekday(message)
  if(iso){
    j.q??={};j.q.pending_date_iso=iso;j.q.pending_date_text=String(message||'').trim();j.date.iso_date=null
    r.f.date='missing';r.ambiguity=CONFIRM+iso
    if(clean(j.q.controller_date_ack_iso))delete j.q.controller_date_ack_iso
  }
  return r
}
