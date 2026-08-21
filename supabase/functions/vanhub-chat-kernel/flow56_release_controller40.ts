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

function validIso(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
function literal(v,message){const a=canon(v),b=canon(message);return !!a&&!!b&&b.includes(a)}
function restoreExplicitCandidateDate(j,candidate,message){
  if(clean(j?.date?.iso_date))return false
  const facts=candidate?.facts||[]
  const iso=facts.find(x=>x?.k==='date.iso_date'&&['operational','correction'].includes(x?.kind)&&validIso(x?.v))
  const human=facts.find(x=>x?.k==='date.original_text'&&['operational','correction'].includes(x?.kind)&&clean(x?.v)&&literal(x.v,message))
  if(!iso||!human)return false
  // The model's normalized ISO is accepted only when its paired human date phrase is literal current-turn customer evidence.
  j.date??={original_text:null,iso_date:null,alternative_iso_dates:[],flexibility:null,time_preference:null}
  j.date.iso_date=String(iso.v);j.date.original_text=clean(human.v);j.q??={};j.q.controller_date_ack_iso=String(iso.v)
  return true
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(restoreExplicitCandidateDate(j,candidate,message))r.f=requirements(j,r.f)
  return r
}
