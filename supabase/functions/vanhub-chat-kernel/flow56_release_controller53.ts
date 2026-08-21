// @ts-nocheck
import * as base from './flow56_release_controller52.ts'
import {quoteGradeLocation} from './core_release_controller49.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
function norm(v){return String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function groundedRoute(candidate,message){
  const msg=norm(message)
  for(const fact of candidate?.facts||[]){
    if(fact?.k!=='specialist.site_access'||fact?.kind!=='operational')continue
    const value=String(fact?.v||'').trim()
    if(!value||!msg.includes(norm(value)))continue
    const evidence=String(fact?.evidence||'').trim()
    if(evidence&&!msg.includes(norm(evidence)))continue
    const m=value.match(/^(.+?)\s+to\s+(.+?)$/i)
    if(!m)continue
    const collection=m[1].trim(),delivery=m[2].trim()
    if(!quoteGradeLocation({town:collection})||!quoteGradeLocation({town:delivery}))continue
    return {collection,delivery}
  }
  return null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!VEHICLE_CATS.has(j?.category))return r

  // The extractor occasionally classifies a plainly stated "X to Y" route as
  // specialist.site_access instead of collection/delivery fields. Recover only
  // when the exact candidate value (and its evidence, when supplied) occurs in
  // the customer's message. This preserves the evidence-grounded contract and
  // still rejects broad or relational pseudo-locations through quoteGradeLocation.
  const route=groundedRoute(candidate,message)
  if(!route)return r

  j.collection??={}
  j.delivery??={}
  if(r.f?.['collection.location']!=='known'&&!j.collection.postcode&&!j.collection.town&&!j.collection.address_text){
    j.collection.town=route.collection
    r.f['collection.location']='known'
  }
  if(r.f?.['delivery.location']!=='known'&&!j.delivery.postcode&&!j.delivery.town&&!j.delivery.address_text){
    j.delivery.town=route.delivery
    r.f['delivery.location']='known'
  }
  return r
}
