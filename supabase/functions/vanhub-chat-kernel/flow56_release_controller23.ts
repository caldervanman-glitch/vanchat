// @ts-nocheck
import * as base from './flow56_release_controller22.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function explicitNoPlumbedAppliances(message,obj){
  const s=String(message||'').trim()
  if(obj==='ask_appliance_plumbing'&&/^(?:no|none|neither|nope)$/i.test(s))return true
  return /\bno\s+washing machines?\s+(?:or|and)\s+dishwashers?\b|\bno\s+dishwashers?\s+(?:or|and)\s+washing machines?\b|\b(?:no|without)\s+(?:plumbed\s+)?appliances?\b|\bneither\s+(?:a\s+)?washing machine\s+nor\s+(?:a\s+)?dishwasher\b/i.test(s)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(explicitNoPlumbedAppliances(message,obj)){
    j.q??={};j.q.appliances??={present:null,disconnected:null,reconnect_requested:null}
    j.q.appliances.present='no'
    j.q.appliances.disconnected=null
    j.q.appliances.reconnect_requested=null
    r.f.appliance_plumbing='known'
    r.ambiguity=null
    if(j.q.controller_retry_objective==='ask_appliance_plumbing')delete j.q.controller_retry_objective
  }
  return r
}
