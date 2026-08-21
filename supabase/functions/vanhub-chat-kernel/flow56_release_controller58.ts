// @ts-nocheck
import * as base from './flow56_release_controller57.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
function completionAck(j0,j,message){
  if(clean(j0?.q?.completion)===clean(j?.q?.completion))return null
  const s=String(message||'')
  if(/\bkeys?|wait\b/i.test(s))return 'I’ve noted the possible key wait at delivery.'
  const d=s.match(/\b(?:by|before)\s+((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(?:am|pm))\b/i)
  if(d)return `I’ve noted the ${d[1].replace(/\s+/g,'')} move-out deadline.`
  return 'I’ve noted that completion timing detail.'
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const input=structuredClone(j0||{})
  if(input.q)delete input.q.controller_completion_ack
  const r=base.reduce(input,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  const ack=completionAck(j0,j,message)
  if(ack)j.q.controller_completion_ack=ack
  return r
}

export function prompt(o,j,amb=null){
  const p=base.prompt(o,j,amb)
  const ack=clean(j?.q?.controller_completion_ack)
  if(!ack||String(p||'').toLowerCase().includes(ack.toLowerCase()))return p
  return `${ack} ${p}`
}
