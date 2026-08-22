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
function toks(v){return norm(v).split(/[^a-z0-9]+/).filter(Boolean)}
function phrasePresent(hay,needle){const h=toks(hay),n=toks(needle);if(!n.length||n.length>h.length)return false;outer:for(let i=0;i<=h.length-n.length;i++){for(let k=0;k<n.length;k++)if(h[i+k]!==n[k])continue outer;return true}return false}
function groundedRoute(candidate,message){
  for(const fact of candidate?.facts||[]){
    if(fact?.k!=='specialist.site_access'||fact?.kind!=='operational')continue
    const value=String(fact?.v||'').trim()
    if(!value||!phrasePresent(message,value))continue
    const evidence=String(fact?.evidence||'').trim()
    if(evidence&&!phrasePresent(message,evidence))continue
    const m=value.match(/^(.+?)\s+to\s+(.+?)$/i)
    if(!m)continue
    const collection=m[1].trim(),delivery=m[2].trim()
    if(!quoteGradeLocation({town:collection})||!quoteGradeLocation({town:delivery}))continue
    if(!phrasePresent(message,`${collection} to ${delivery}`))continue
    return {collection,delivery}
  }
  return null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!VEHICLE_CATS.has(j?.category))return r

  // Recover a complete route only when BOTH endpoints occur together as one
  // token-bounded current-message route. A new complete customer route is
  // authoritative over stale retained town values; model evidence alone is
  // never sufficient.
  const route=groundedRoute(candidate,message)
  if(!route)return r

  j.collection??={};j.delivery??={}
  j.collection.town=route.collection
  j.delivery.town=route.delivery
  r.f['collection.location']='known'
  r.f['delivery.location']='known'
  return r
}
