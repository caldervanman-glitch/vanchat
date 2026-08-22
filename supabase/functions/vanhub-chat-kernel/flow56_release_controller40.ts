// @ts-nocheck
import * as base from './flow56_release_controller39.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const MONTHS={january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11,jan:0,feb:1,mar:2,apr:3,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11}
function validIso(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
function literal(v,message){const a=canon(v),b=canon(message);return !!a&&!!b&&b.includes(a)}
function pad(n){return String(n).padStart(2,'0')}
function literalDateIso(v){
  const s=canon(v);if(!s)return null
  let m=s.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/)
  if(m)return `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`
  m=s.match(/\b(\d{1,2})[\/.](\d{1,2})[\/.](20\d{2})\b/)
  if(m)return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`
  let day,mon,year
  m=s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)(?:\s+(20\d{2}))?\b/)
  if(m){day=Number(m[1]);mon=MONTHS[m[2]];year=m[3]?Number(m[3]):null}
  else{
    m=s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(20\d{2}))?\b/)
    if(!m)return null;mon=MONTHS[m[1]];day=Number(m[2]);year=m[3]?Number(m[3]):null
  }
  const now=new Date(),today=`${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())}`
  if(year==null)year=now.getUTCFullYear()
  let d=new Date(Date.UTC(year,mon,day));if(d.getUTCFullYear()!==year||d.getUTCMonth()!==mon||d.getUTCDate()!==day)return null
  let iso=`${year}-${pad(mon+1)}-${pad(day)}`
  if(!m?.[3]&&iso<today){year++;d=new Date(Date.UTC(year,mon,day));if(d.getUTCMonth()!==mon||d.getUTCDate()!==day)return null;iso=`${year}-${pad(mon+1)}-${pad(day)}`}
  return iso
}
function restoreExplicitCandidateDate(j,candidate,message){
  if(clean(j?.date?.iso_date))return false
  const facts=candidate?.facts||[]
  const iso=facts.find(x=>x?.k==='date.iso_date'&&['operational','correction'].includes(x?.kind)&&validIso(x?.v))
  const human=facts.find(x=>x?.k==='date.original_text'&&['operational','correction'].includes(x?.kind)&&clean(x?.v)&&literal(x.v,message))
  if(!iso||!human)return false
  const expected=literalDateIso(human.v)
  // Relative/weekday dates are handled by deterministic parsing earlier in the
  // chain. This model-restoration fallback is only allowed for absolute dates
  // whose literal customer phrase deterministically maps to the same ISO.
  if(!expected||expected!==String(iso.v))return false
  j.date??={original_text:null,iso_date:null,alternative_iso_dates:[],flexibility:null,time_preference:null}
  j.date.iso_date=String(iso.v);j.date.original_text=clean(human.v);j.q??={};j.q.controller_date_ack_iso=String(iso.v)
  return true
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(restoreExplicitCandidateDate(j,candidate,message))r.f=requirements(j,r.f)
  return r
}
