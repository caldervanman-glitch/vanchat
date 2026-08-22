// @ts-nocheck
import * as base from './flow56_release_controller45.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const LOCATION_FIELDS=['town','postcode','address_text']
const ALLOWED_KINDS=new Set(['operational','approximate'])

function evidencePresent(ev,message){
  const e=canon(ev),m=canon(message)
  return !!e&&!!m&&m.includes(e)
}
function tokens(v){return canon(v).split(/[^a-z0-9]+/).filter(x=>x.length>1)}
function locationAmbiguity(candidate){
  const a=clean(candidate?.ambiguity)
  return !!a&&/\b(?:collection|delivery|location|route|town|postcode|address|which place|which location|either location)\b/i.test(a)
}
function groundedValues(candidate,message,key){
  const facts=(candidate?.facts||[]).filter(x=>x&&x.k===key)
  if(candidate?.correction||facts.some(x=>x?.kind==='correction')||locationAmbiguity(candidate))return []
  const out=[]
  for(const x of facts){
    if(!ALLOWED_KINDS.has(x?.kind))continue
    const value=clean(x?.v),ev=clean(x?.evidence)
    if(!value||!ev||!evidencePresent(ev,message))continue
    const et=new Set(tokens(ev)),vt=tokens(value)
    if(vt.length&&!vt.every(t=>et.has(t)))continue
    if(!out.some(v=>canon(v)===canon(value)))out.push(value)
  }
  return out
}
function repeatedStops(j,candidate,message,side){
  let chosen=null
  for(const field of LOCATION_FIELDS){
    const values=groundedValues(candidate,message,`${side}.${field}`)
    if(values.length<2)continue
    // The base reducer applies facts sequentially, so the last value otherwise
    // wins. Multi-stop evidence is ordered customer evidence: retain the first
    // stop as the canonical primary endpoint and preserve all stops separately.
    j[side]??={}
    j[side][field]=values[0]
    if(!chosen)chosen=values
  }
  return chosen
}
function endpointLabel(l){return clean(l?.town)||clean(l?.postcode)||clean(l?.address_text)}
function dedupe(xs){
  const out=[]
  for(const x of xs||[]){const v=clean(x);if(v&&!out.some(y=>canon(y)===canon(v)))out.push(v)}
  return out
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const collections=repeatedStops(j,candidate,message,'collection')
  const deliveries=repeatedStops(j,candidate,message,'delivery')
  if(!collections&&!deliveries)return r

  j.q??={}
  const prior=j.q.multi_stop&&typeof j.q.multi_stop==='object'?j.q.multi_stop:{}
  const existingCollections=dedupe(prior.collections)
  const existingDeliveries=dedupe(prior.deliveries)
  const primaryCollection=endpointLabel(j.collection)
  const primaryDelivery=endpointLabel(j.delivery)
  j.q.multi_stop={
    ...prior,
    collections:dedupe(collections||existingCollections.length?collections||existingCollections:[primaryCollection]),
    deliveries:dedupe(deliveries||existingDeliveries.length?deliveries||existingDeliveries:[primaryDelivery])
  }
  r.f=requirements(j,r.f)
  return r
}
