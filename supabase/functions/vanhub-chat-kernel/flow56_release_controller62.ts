// @ts-nocheck
import * as base from './flow56_release_controller61.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const DOMESTIC_APPLIANCE=/\b(?:washing machine|dishwasher)\b/i
const STILL_CONNECTED=/\bstill\s+connected\b|\bnot\s+(?:yet\s+)?disconnected\b/i

function recoverLiteralApplianceConnection(j,r,message){
  const s=String(message||'')
  if(!DOMESTIC_APPLIANCE.test(s)||!STILL_CONNECTED.test(s))return

  // The extractor can occasionally return a correct appliance fact with an
  // abbreviated/non-literal evidence quote (for example by inserting "...").
  // Keep the global evidence check strict and recover only the customer's
  // literal current-message statement that the appliance is still connected.
  j.q??={}
  j.q.appliances??={}
  j.q.appliances.present='yes'
  if(j.q.appliances.disconnected==null)j.q.appliances.disconnected='no'

  const disconnected=j.q.appliances.disconnected
  const reconnect=j.q.appliances.reconnect_requested
  if(['yes','no'].includes(disconnected)&&['yes','no'].includes(reconnect)){
    r.f.appliance_plumbing='known'
  }
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  recoverLiteralApplianceConnection(r.j,r,message)
  return r
}
