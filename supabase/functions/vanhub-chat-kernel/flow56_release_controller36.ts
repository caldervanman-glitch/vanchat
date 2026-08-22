// @ts-nocheck
import * as base from './flow56_release_controller35.ts'
import {canon,clean,nextObjective,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const ACCESS=['floor','stairs','lift','parking','internal_stairs','external_steps','carry_distance','access_notes']
const BULKY=/\b(?:sofa|wardrobe|bed|mattress|piano|safe|fridge|freezer|washing machine|dishwasher|table|armchair|cabinet)\b/i
const FURN=/\b(?:wardrobe|bed|table|sofa|cabinet|bookcase|desk|fridge|freezer|dresser|drawers|sideboard)\b/i
const same=(a,b)=>{try{return JSON.stringify(a)===JSON.stringify(b)}catch{return false}}
const accessSlice=l=>Object.fromEntries(ACCESS.map(k=>[k,l?.[k]??null]))
function currentDateEvidence(candidate,message){const m=canon(message);return (candidate?.facts||[]).some(x=>x?.k==='date.iso_date'&&clean(x.evidence)&&m.includes(canon(x.evidence)))}
function persistFurnitureDecontamination(j,j0){
  const priorProtected=j0?.q?.dismantling_mode==='already_dismantled'&&/Already dismantled furniture:/i.test(String(j0?.additional_notes||''))&&FURN.test([...(j0?.inventory||[]),j0?.additional_notes].join(' '))
  if(!priorProtected)return false
  j.q??={};if(j.q.materials)delete j.q.materials;j.category='furniture_move';j.q.dismantling_mode='already_dismantled';j.dismantling_required=false
  j.inventory=(j.inventory||[]).filter(x=>!/^(?:dismantled|disassembled|taken apart)(?:\s+into)?\s+(?:panels?|sections?|pieces?)$/i.test(canon(x)))
  return true
}
function partialBulkyHelp(j,message){
  const s=String(message||'')
  if(!/\bhelp\b/i.test(s)||!/\bbut\s+not\b/i.test(s)||!BULKY.test(s))return false
  j.customer_assistance=false;j.q??={};j.q.assistance_detail=`partial assistance only - ${s.trim()}`;return true
}
function timeWindow(s){return String(s||'').match(/\b((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(?:am|pm))\s*(?:to|-|until)\s*((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(?:am|pm))\b/i)}
function deadlineTime(s){return String(s||'').match(/\b(?:by|before)\s+((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(?:am|pm))\b/i)}
function refinedAck(j0,j,message,obj,next){
  if(!obj||next!==obj)return null
  const s=String(message||'')
  if(j0?.customer_assistance!==j?.customer_assistance||clean(j0?.q?.assistance_detail)!==clean(j?.q?.assistance_detail)){
    if(/\bhelp\b/i.test(s)&&/\bbut\s+not\b/i.test(s)&&BULKY.test(s))return `I’ve noted that the help is only partial — ${s.trim()}. Drivers should plan the bulky item without relying on customer lifting help.`
    return j.customer_assistance===false?'I’ve noted that you cannot help with the lifting.':'I’ve noted the lifting help you have available.'
  }
  if(clean(j0?.q?.completion)!==clean(j?.q?.completion)){
    if(/\bkeys?|wait\b/i.test(s))return 'I’ve noted the possible key wait at delivery.'
    const d=deadlineTime(s);if(d)return `I’ve noted the ${d[1].replace(/\s+/g,'')} move-out deadline.`
    return 'I’ve noted that completion timing detail.'
  }
  const w=timeWindow(s);if(w)return `I’ve noted the ${w[1].replace(/\s+/g,'')} to ${w[2].replace(/\s+/g,'')} access window.`
  if(clean(j0?.q?.fit_access_issue)!==clean(j?.q?.fit_access_issue)||clean(j0?.q?.fit_access_plan)!==clean(j?.q?.fit_access_plan))return 'I’ve noted that fit/access detail.'
  const cc=!same(accessSlice(j0?.collection),accessSlice(j?.collection)),dc=!same(accessSlice(j0?.delivery),accessSlice(j?.delivery))
  if(cc||dc)return cc&&dc?'I’ve noted those access/parking details at both ends.':cc?'I’ve noted those access/parking details at collection.':'I’ve noted those access/parking details at delivery.'
  if(clean(j0?.date?.time_preference)!==clean(j?.date?.time_preference))return 'I’ve noted that timing detail.'
  if(!same(j0?.inventory||[],j?.inventory||[]))return 'I’ve noted the load details you added.'
  if(clean(j0?.q?.dismantling_mode)!==clean(j?.q?.dismantling_mode)||j0?.dismantling_required!==j?.dismantling_required)return 'I’ve noted the dismantling detail.'
  if(!same(j0?.q?.multi_stop,j?.q?.multi_stop))return 'I’ve noted the multi-stop route.'
  return null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const stateChanged=persistFurnitureDecontamination(j,j0)|partialBulkyHelp(j,message)
  if(stateChanged)r.f=requirements(j,r.f)
  // Date acknowledgement belongs only to a turn that actually contains the date evidence.
  if(j0?.q?.controller_date_ack_iso&&!currentDateEvidence(candidate,message)&&!clean(j.q?.controller_date_change_ack))delete j.q.controller_date_ack_iso
  const next=nextObjective(j,r.f),ack=refinedAck(j0,j,message,obj,next)
  if(ack)j.q.controller_progress_ack=ack
  return r
}
