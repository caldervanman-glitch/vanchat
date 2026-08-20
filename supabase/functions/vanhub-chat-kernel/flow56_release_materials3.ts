// @ts-nocheck
import * as base from './flow56_release_materials2.ts'
import {clean,canon,requirements} from './core.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const prompt=base.prompt
export const review=base.review
export const faq=base.faq

const MATERIAL_RE=/\b(?:boards?|sheets?|panels?|plywood|ply|osb|mdf|plasterboard|timber|lumber|chipboard|hardboard|cement boards?|insulation boards?|sheet material|building materials?)\b/i
function isMaterial(j){return !!j?.q?.materials||MATERIAL_RE.test((j?.inventory||[]).join(' '))}
function complete(m){return !!(clean(m?.quantity)&&clean(m?.material_type)&&clean(m?.dimensions)&&clean(m?.dimension_unit)&&clean(m?.collection_site)&&clean(m?.delivery_site)&&clean(m?.handling))}
function summary(m){return [`${m.quantity} ${m.material_type} board/sheet item(s)`,m.dimensions,m.thickness&&`thickness ${m.thickness}`,`collection site ${m.collection_site}`,`delivery site ${m.delivery_site}`,`handling ${m.handling}`].filter(Boolean).join('; ')}
function explicitSiteChange(text){return /\b(collection|delivery|both)\b/i.test(String(text||''))||/\b(?:builders merchant|builder merchant|storage unit|storage depot|building site|construction site|warehouse|workshop|factory|apartment|merchant|storage|depot|shop|store|yard|home|house|flat|site|office)\s+(?:to|into)\s+(?:builders merchant|builder merchant|storage unit|storage depot|building site|construction site|warehouse|workshop|factory|apartment|merchant|storage|depot|shop|store|yard|home|house|flat|site|office)\b/i.test(String(text||''))}
function handlingFrom(text){
  const s=canon(text)
  if(/\bkerbside\s*(?:to|-|—|–)\s*kerbside\b/.test(s)||/\bkerbside at both ends\b/.test(s))return'kerbside-to-kerbside: driver only needs to load/unload at the vehicle; no carry between the van and the final resting place'
  const hasLoad=/\b(load|loads|loading|loaded)\b/.test(s)
  const hasUnload=/\b(unload|unloads|unloading|unloaded|offload|offloads|offloading|offloaded)\b/.test(s)
  const hasActors=/\b(driver|customer|staff|merchant|seller|recipient|we|i|they|he|she)\b/.test(s)
  if(hasLoad&&hasUnload&&hasActors)return String(text||'').trim()
  return null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const before=j0?.q?.materials?structuredClone(j0.q.materials):null
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(isMaterial(j)){
    const m=j.q.materials||{}
    if(before&&!explicitSiteChange(message)){
      if(clean(before.collection_site))m.collection_site=before.collection_site
      if(clean(before.delivery_site))m.delivery_site=before.delivery_site
    }
    const h=handlingFrom(message);if(h)m.handling=h
    j.q.materials=m;j.q.specialist??={}
    j.q.specialist.site_access=(m.collection_site&&m.delivery_site)?`collection: ${m.collection_site}; delivery: ${m.delivery_site}`:null
    j.q.specialist.handling=complete(m)?summary(m):null
    r.f=requirements(j,r.f)
    if(!complete(m))r.f.handling='missing'
  }
  return r
}
