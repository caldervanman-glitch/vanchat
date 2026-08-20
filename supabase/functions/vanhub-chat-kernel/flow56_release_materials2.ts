// @ts-nocheck
import * as base from './flow56_release_materials.ts'
import {clean,canon,requirements} from './core.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const prompt=base.prompt
export const review=base.review
export const faq=base.faq

const MATERIAL_RE=/\b(?:boards?|sheets?|panels?|plywood|ply|osb|mdf|plasterboard|timber|lumber|chipboard|hardboard|cement boards?|insulation boards?|sheet material|building materials?)\b/i
const SITE_PATTERN='builders merchant|builder merchant|storage unit|storage depot|building site|construction site|warehouse|workshop|factory|apartment|merchant|storage|depot|shop|store|yard|home|house|flat|site|office'
function isMaterial(j){return !!j?.q?.materials||MATERIAL_RE.test((j?.inventory||[]).join(' '))}
function siteCanon(v){let s=canon(v);if(s==='builder merchant')return'builders merchant';return s}
function robustSitePair(text){let x=String(text||'').match(new RegExp(`\\b(${SITE_PATTERN})\\s+(?:to|into)\\s+(${SITE_PATTERN})\\b`,'i'));return x?[siteCanon(x[1]),siteCanon(x[2])]:null}
function complete(m){return !!(clean(m?.quantity)&&clean(m?.material_type)&&clean(m?.dimensions)&&clean(m?.dimension_unit)&&clean(m?.collection_site)&&clean(m?.delivery_site)&&clean(m?.handling))}
function summary(m){return [`${m.quantity} ${m.material_type} board/sheet item(s)`,m.dimensions,m.thickness&&`thickness ${m.thickness}`,`collection site ${m.collection_site}`,`delivery site ${m.delivery_site}`,`handling ${m.handling}`].filter(Boolean).join('; ')}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(isMaterial(j)){
    const pair=robustSitePair(message),m=j.q.materials||{}
    if(pair){m.collection_site=pair[0];m.delivery_site=pair[1]}
    j.q.materials=m;j.q.specialist??={}
    j.q.specialist.site_access=(m.collection_site&&m.delivery_site)?`collection: ${m.collection_site}; delivery: ${m.delivery_site}`:null
    j.q.specialist.handling=complete(m)?summary(m):null
    r.f=requirements(j,r.f)
    if(!complete(m))r.f.handling='missing'
  }
  return r
}
