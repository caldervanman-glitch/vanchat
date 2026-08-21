// @ts-nocheck
import * as base from './flow56_release_controller37.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const esc=s=>String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
const locationKnown=x=>!!clean(x?.postcode||x?.town||x?.address_text)

function explicitRouteTown(message,side,value){
  const v=clean(value);if(!v)return false
  const e=esc(v).replace(/\\\s+/g,'\\s+')
  const s=String(message||'')
  if(side==='collection')return new RegExp(`\\bfrom\\s+(?:the\\s+)?${e}\\b`,'i').test(s)||new RegExp(`\\bcollect(?:ion|ing)?(?:\\s+[^,.;]{0,50})?\\s+(?:from\\s+)?${e}\\b`,'i').test(s)
  return new RegExp(`\\bto\\s+(?:the\\s+)?${e}\\b`,'i').test(s)||new RegExp(`\\bdeliver(?:y|ed|ing)?(?:\\s+to)?\\s+${e}\\b`,'i').test(s)
}

function restoreExplicitRouteTowns(j,candidate,message){
  let changed=false
  for(const side of ['collection','delivery']){
    j[side]??={}
    if(clean(j[side].town))continue
    const fact=(candidate?.facts||[]).find(x=>x?.k===`${side}.town`&&['operational','correction'].includes(x?.kind)&&clean(x?.v))
    if(!fact||!explicitRouteTown(message,side,fact.v))continue
    // The candidate value itself must be literal current-turn customer evidence.
    if(!canon(message).includes(canon(fact.v)))continue
    j[side].town=clean(fact.v);changed=true
  }
  return changed
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const changed=restoreExplicitRouteTowns(j,candidate,message)
  if(changed){
    r.f=requirements(j,r.f)
    if(/postcodes?/i.test(String(r.ambiguity||''))&&locationKnown(j.collection)&&locationKnown(j.delivery))r.ambiguity=null
  }
  return r
}
