// @ts-nocheck
import * as base from './flow56_release_controller51.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const MATERIAL='(?:plywood|ply|osb|mdf|plasterboard|timber|lumber|wood|chipboard|hardboard|cement|insulation|metal|steel|composite)'
function explicitMaterialQuantity(message){
  const s=String(message||'')
  let m=s.match(new RegExp(`\\b(\\d{1,4})\\s+(?:${MATERIAL}\\s+)?(?:boards?|sheets?|panels?)\\b`,'i'))
  if(!m)m=s.match(new RegExp(`\\b(\\d{1,4})\\s+(?:boards?|sheets?|panels?)\\s+of\\s+${MATERIAL}\\b`,'i'))
  if(!m)return null
  const n=Number(m[1]);return Number.isInteger(n)&&n>0&&n<=9999?String(n):null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const m=j?.q?.materials
  if(m&&!String(m.quantity||'').trim()){
    const n=explicitMaterialQuantity(message)
    if(n){
      m.quantity=n
      j.q.specialist??={}
      j.q.specialist.quantity=n
    }
  }
  return r
}
