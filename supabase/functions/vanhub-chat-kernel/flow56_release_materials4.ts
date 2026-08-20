// @ts-nocheck
import * as base from './flow56_release_materials3.ts'
import {requirements} from './core.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const prompt=base.prompt
export const review=base.review
export const faq=base.faq

const MATERIAL_RE=/\b(?:boards?|sheets?|panels?|plywood|ply|osb|mdf|plasterboard|timber|lumber|chipboard|hardboard|cement boards?|insulation boards?|sheet material|building materials?)\b/i
function isMaterial(j){return !!j?.q?.materials||MATERIAL_RE.test((j?.inventory||[]).join(' '))}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(isMaterial(j)&&!j.date?.time_preference){
    const x=String(message||'').match(/\b((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(?:am|pm))\b/i)
    if(x){j.date.time_preference=x[1].replace(/\s+/g,'').toLowerCase();r.f=requirements(j,r.f)}
  }
  return r
}
