// @ts-nocheck
import * as base from './flow56_release_controller36.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=j=>base.missingContact(j).map(x=>x==='either a phone number or email address'?'phone number or email address':x)
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const DATE_LANGUAGE=/\b(?:today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week)|this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend)|(?:\d{1,2})(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}|20\d{2}-\d{2}-\d{2})\b|\b\d{1,2}[\/.]\d{1,2}(?:[\/.]\d{2,4})?\b/i

const esc=s=>String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
function currentTurnHasDate(message){return DATE_LANGUAGE.test(String(message||''))}
function explicitSingleBusinessItem(j,candidate,message){
  if(j?.category!=='business_delivery'||clean(j?.q?.specialist?.quantity))return false
  const adds=(candidate?.inventory_add||[]).filter(x=>x&&['operational','approximate','correction'].includes(x.kind)&&clean(x.value))
  if(adds.length!==1)return false
  const value=canon(adds[0].value),m=canon(message)
  if(!value||!new RegExp(`\\b(?:a|an|one|1)\\s+${esc(value)}\\b`,'i').test(m))return false
  if(/\b(?:two|three|four|five|six|seven|eight|nine|ten|several|multiple|pair|pairs)\b/i.test(m))return false
  j.q??={};j.q.specialist??={};j.q.specialist.quantity='1'
  return true
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  let changed=explicitSingleBusinessItem(j,candidate,message)
  if(!currentTurnHasDate(message)&&!clean(j.q?.controller_date_change_ack)&&j.q?.controller_date_ack_iso){delete j.q.controller_date_ack_iso;changed=true}
  if(changed)r.f=requirements(j,r.f)
  return r
}
