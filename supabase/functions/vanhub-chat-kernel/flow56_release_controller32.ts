// @ts-nocheck
import * as base from './flow56_release_controller31.ts'
import {requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const WD={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6}
const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
function londonToday(){const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),x=Object.fromEntries(p.map(v=>[v.type,v.value]));return `${x.year}-${x.month}-${x.day}`}
function addDays(iso,n){const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function explicitTime(message){const m=String(message||'').match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i);if(!m)return null;const h=String(Number(m[1])),mins=m[2]?`:${m[2]}`:'';return `${h}${mins}${m[3].toLowerCase()}`}
function weekdayDate(message){const s=String(message||''),m=s.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);if(!m)return null;const day=m[1].toLowerCase(),today=londonToday(),d=new Date(`${today}T12:00:00Z`);let delta=(WD[day]-d.getUTCDay()+7)%7;const same=/\b(today|tonight)\b/i.test(s);if(delta===0&&!same)delta=7;return{iso:addDays(today,delta),text:(s.match(new RegExp(`\\b${day}\\b(?:\\s+(?:at\\s+)?)?(?:1[0-2]|0?[1-9])?(?::[0-5]\\d)?\\s*(?:am|pm)?`,'i'))||[])[0]?.trim()||m[0]}}
function normalizeDate(j,r,message){
  j.date??={original_text:null,iso_date:null,alternative_iso_dates:[],flexibility:null,time_preference:null}
  const wd=weekdayDate(message),tm=explicitTime(message)
  if(wd){j.date.iso_date=wd.iso;j.date.original_text=wd.text||j.date.original_text||null;if(tm)j.date.time_preference=tm}
  else if(typeof j.date.iso_date==='string'){
    const m=j.date.iso_date.match(/^(\d{4}-\d{2}-\d{2})(?:T|\s)/);if(m)j.date.iso_date=m[1]
    if(tm)j.date.time_preference=tm
  }
  if(j.date.iso_date&&!/^\d{4}-\d{2}-\d{2}$/.test(j.date.iso_date))j.date.iso_date=null
  r.f=requirements(j,r.f)
}
function fullDriverHandling(message){return /\b(?:driver|drivers|movers?|crew)\b.{0,35}\b(?:will|would|needs? to|need to|has to|have to|does|do)\b.{0,25}\b(?:all (?:the )?)?(?:lifting|loading|unloading|carrying|handling)\b|\b(?:all (?:the )?)?(?:lifting|loading|unloading|carrying|handling)\b.{0,35}\b(?:by|for)\s+(?:the\s+)?(?:driver|drivers|movers?|crew)\b/i.test(String(message||''))}
function applyDriverHandling(j,r,message){if(!fullDriverHandling(message))return;j.q??={};j.customer_assistance=false;j.q.assistance_detail=`driver/crew full handling: ${String(message||'').trim()}`;r.f.assistance='known';j.q.controller_progress_ack='I’ve noted that the driver/crew will need to do the lifting.'}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  normalizeDate(j,r,message)
  applyDriverHandling(j,r,message)
  return r
}
