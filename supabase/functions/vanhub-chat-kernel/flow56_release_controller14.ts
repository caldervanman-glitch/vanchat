// @ts-nocheck
import * as base from './flow56_release_controller13.ts'
import {requirements,clean} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function applyApplianceWords(j,message,obj){
  const s=String(message||'')
  j.q??={};j.q.appliances??={present:null,disconnected:null,reconnect_requested:null}
  const relevant=obj==='ask_appliance_plumbing'||/\b(?:washing machine|dishwasher)\b/i.test(s)
  if(!relevant)return
  if(/\b(?:washing machine|dishwasher)\b/i.test(s))j.q.appliances.present='yes'

  if(/\b(?:will be|is|already|both are|they are)\s+disconnected\b|\bdisconnect(?:ed)?\s+before\s+collection\b/i.test(s))j.q.appliances.disconnected='yes'
  if(/\b(?:not|won't|will not|isn't|is not)\s+(?:be\s+)?disconnected\b|\b(?:need|want|expect)\s+(?:the\s+)?driver\s+to\s+disconnect\b/i.test(s))j.q.appliances.disconnected='no'

  if(/\b(?:no|don't|dont|do not|won't|will not)\s+(?:need\s+)?(?:a\s+)?reconnect(?:ion|ing)?\b|\bno\s+reconnect(?:ion)?\s+needed\b|\b(?:we|i)\s+(?:will|'ll|can)\s+reconnect\s+(?:it|them|ourselves|myself)\b/i.test(s))j.q.appliances.reconnect_requested='no'
  else if(/\b(?:need|want|require|expect)\s+(?:the\s+)?driver\s+to\s+reconnect\b|\b(?:need|want|require)\s+(?:it|them)?\s*reconnect(?:ed|ion)?\b|\bdriver\s+(?:to|must|needs? to|will)\s+reconnect\b/i.test(s))j.q.appliances.reconnect_requested='yes'
}

function contactParts(message){
  const raw=String(message||'').trim()
  const email=(raw.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)||[])[0]||null
  const phoneMatch=raw.match(/(?:\+44\s?\(?0?\)?|0)(?:[\s().-]*\d){9,11}/)
  const phone=phoneMatch?phoneMatch[0].replace(/[^+\d]/g,''):null
  let rest=raw
  if(email)rest=rest.replace(email,' ')
  if(phoneMatch)rest=rest.replace(phoneMatch[0],' ')
  rest=rest.replace(/\b(?:my\s+name\s+is|name\s+is|i\s+am|i'm|im|phone|mobile|number|email|email\s+is|contact)\b[:\s-]*/gi,' ').replace(/[,:;|]+/g,' ').replace(/\s+/g,' ').trim()
  const bad=/^(?:yes|no|none|thanks|thank you|please|call me|text me|whatsapp)$/i
  const name=!bad.test(rest)&&/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,60}$/.test(rest)&&rest.split(/\s+/).length<=5?rest:null
  return{name,email,phone}
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  applyApplianceWords(j,message,obj)
  if(obj==='ask_contact'){
    const p=contactParts(message)
    if(p.name&&!clean(j.customer?.name))j.customer.name=p.name
    if(p.email&&!clean(j.customer?.email))j.customer.email=p.email.toLowerCase()
    if(p.phone&&!clean(j.customer?.phone))j.customer.phone=p.phone
  }
  r.f=requirements(j,r.f)
  return r
}
