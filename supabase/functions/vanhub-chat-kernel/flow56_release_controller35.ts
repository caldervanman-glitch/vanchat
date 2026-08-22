// @ts-nocheck
import * as base from './flow56_release_controller34.ts'
import {canon,clean,nextObjective,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const ACCESS=['floor','stairs','lift','parking','internal_stairs','external_steps','carry_distance','access_notes']
const same=(a,b)=>{try{return JSON.stringify(a)===JSON.stringify(b)}catch{return false}}
const pickAccess=l=>Object.fromEntries(ACCESS.map(k=>[k,l?.[k]??null]))
function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
function dateLabel(iso){try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${iso}T12:00:00Z`))}catch{return iso}}
function currentDateFact(candidate){return (candidate?.facts||[]).some(x=>x?.k==='date.iso_date')}
function dateAmbiguity(v){return typeof v==='string'&&!v.startsWith('__')&&/\b(date|day|friday|saturday|sunday|monday|tuesday|wednesday|thursday)\b/i.test(v)}
function routeKnown(j){return !!(clean(j?.collection?.town)||clean(j?.collection?.postcode))&&!!(clean(j?.delivery?.town)||clean(j?.delivery?.postcode))}
function genericContainer(j){const a=(j?.inventory||[]).map(canon).filter(Boolean);if(a.length!==1)return null;return /^(?:boxes?|bags?)$/.test(a[0])?a[0]:null}
function bareFlights(message){const m=canon(message).match(/^(?:(no)\s+)?(?:(one|two|three|four|five|six|\d+)\s+)?flights?(?:\s+of\s+stairs?)?$/);return m?String(message||'').trim():null}
function applyContextualAccess(j,r,message,obj){const v=bareFlights(message);if(!v)return false;if(obj==='ask_collection_access'){j.collection.internal_stairs=v;r.f=requirements(j,r.f);return true}if(obj==='ask_delivery_access'){j.delivery.internal_stairs=v;r.f=requirements(j,r.f);return true}return false}
function setDateRendering(j,j0,r,message,candidate){
  j.q??={};delete j.q.controller_date_change_ack;delete j.q.controller_rough_count_prompt
  const iso=clean(j.date?.iso_date),old=clean(j0?.date?.iso_date)
  if(validDate(iso)&&(clean(j.q.controller_date_ack_iso)||currentDateFact(candidate)))j.q.controller_date_ack_iso=iso
  if(validDate(iso)&&dateAmbiguity(r.ambiguity)&&currentDateFact(candidate))r.ambiguity=null
  if(candidate?.correction&&validDate(iso)&&iso!==old&&currentDateFact(candidate)){
    if(/^Got it — I’ve updated that\.?$/i.test(clean(j.q.controller_progress_ack)||''))delete j.q.controller_progress_ack
    const t=clean(j.date?.time_preference);j.q.controller_date_change_ack=`Got it — date changed to ${dateLabel(iso)}${t?` at ${t}`:''}.`
  }
}
function specialConversationContext(j,j0,message,obj){
  const s=String(message||'')
  if(obj==='clarify_load'&&genericContainer(j0)&&/\b(?:don't know|dont know|do not know|not sure|unsure)\b/i.test(s)&&/\b(?:exact|amount|number|how many|count)\b/i.test(s))j.q.controller_rough_count_prompt=true
  if(routeKnown(j)&&/\b(?:won't|will not|don't|do not|can't|cannot)\s+(?:have|know|get)\b.{0,35}\bpostcodes?\b|\bpostcodes?\b.{0,35}\b(?:until|not yet|don't know|do not know)\b/i.test(s)){
    const c=clean(j.collection?.town)||clean(j.collection?.postcode),d=clean(j.delivery?.town)||clean(j.delivery?.postcode)
    j.q.controller_progress_ack=`No problem — ${c} to ${d} is enough to continue for now; postcodes can be added later.`
  }
}
function changedAck(j0,j,obj,next){
  if(!obj||next!==obj)return null
  if(j0?.customer_assistance!==j?.customer_assistance||clean(j0?.q?.assistance_detail)!==clean(j?.q?.assistance_detail))return j.customer_assistance===false?'I’ve noted that you cannot help with the lifting.':'I’ve noted the lifting help you have available.'
  if(clean(j0?.q?.fit_access_issue)!==clean(j?.q?.fit_access_issue)||clean(j0?.q?.fit_access_plan)!==clean(j?.q?.fit_access_plan))return 'I’ve noted that fit/access detail.'
  if(!same(pickAccess(j0?.collection),pickAccess(j?.collection))||!same(pickAccess(j0?.delivery),pickAccess(j?.delivery)))return 'I’ve noted those access/parking details.'
  if(clean(j0?.q?.completion)!==clean(j?.q?.completion))return 'I’ve noted that completion/key timing detail.'
  if(clean(j0?.date?.time_preference)!==clean(j?.date?.time_preference))return 'I’ve noted that timing detail.'
  if(!same(j0?.inventory||[],j?.inventory||[]))return 'I’ve noted the load details you added.'
  if(clean(j0?.q?.dismantling_mode)!==clean(j?.q?.dismantling_mode)||j0?.dismantling_required!==j?.dismantling_required)return 'I’ve noted the dismantling detail.'
  if(!same(j0?.q?.multi_stop,j?.q?.multi_stop))return 'I’ve noted the multi-stop route.'
  return null
}

export function prompt(o,j,amb=null){
  if(j?.q?.controller_rough_count_prompt&&o==='clarify_load'){
    const n=genericContainer(j)||'boxes';return `A rough count is fine — roughly how many ${n.replace(/s$/,'')}s are there? It does not need to be exact.`
  }
  const dc=clean(j?.q?.controller_date_change_ack)
  if(dc){const x=structuredClone(j);delete x.q.controller_date_ack_iso;delete x.q.controller_progress_ack;delete x.q.controller_date_change_ack;return `${dc} ${base.prompt(o,x,amb)}`}
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  applyContextualAccess(j,r,message,obj)
  setDateRendering(j,j0,r,message,candidate)
  specialConversationContext(j,j0,message,obj)
  const next=nextObjective(j,r.f),ack=changedAck(j0,j,obj,next)
  if(ack&&!clean(j.q.controller_progress_ack))j.q.controller_progress_ack=ack
  return r
}
