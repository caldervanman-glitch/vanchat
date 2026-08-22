// @ts-nocheck
import * as base from './flow56_release_controller30.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
const canon=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[-_]+/g,' ').replace(/^[\s.!?,;:]+|[\s.!?,;:]+$/g,'').replace(/\s+/g,' ').trim()
const tokens=v=>canon(v).split(/[^a-z0-9]+/).filter(x=>x.length>1)
function evidencePresent(ev,message){const e=canon(ev),m=canon(message);return !!e&&!!m&&m.includes(e)}
function groundedItem(x,message){
  if(typeof x==='string'){
    const v=clean(x);return v&&canon(message).includes(canon(v))?v:null
  }
  if(!x||!['operational','approximate','correction'].includes(x.kind)||!evidencePresent(x.evidence,message))return null
  const v=clean(x.value),ev=clean(x.evidence);if(!v||!ev)return null
  const et=new Set(tokens(ev)),vt=tokens(v);if(vt.length&&!vt.every(t=>et.has(t)))return null
  return v
}
function mergeGroundedInventory(j,candidate,message){
  const adds=(candidate?.inventory_add||[]).map(x=>groundedItem(x,message)).filter(Boolean)
  if(!adds.length)return
  j.inventory=Array.isArray(j.inventory)?j.inventory:[]
  for(const value of adds){
    const cv=canon(value);if(!cv)continue
    const exact=j.inventory.findIndex(x=>canon(x)===cv);if(exact>=0)continue
    const shorter=j.inventory.findIndex(x=>{const c=canon(x);return c&&cv.includes(c)&&cv.length>c.length})
    if(shorter>=0){j.inventory[shorter]=value;continue}
    const longer=j.inventory.some(x=>{const c=canon(x);return c&&c.includes(cv)&&c.length>cv.length})
    if(!longer)j.inventory.push(value)
  }
  const seen=new Set
  j.inventory=j.inventory.filter(x=>{const c=canon(x);if(!c||seen.has(c))return false;seen.add(c);return true})
}
function noHelpWords(m){return /\b(?:i|we)\s+(?:can't|cannot|won't|will not|am not able to|are not able to)\s+(?:help|lift|load|carry)\b|\bno(?:body| one|-one)?\s+(?:can|will|is able to)\s+(?:help|lift|load|carry)\b/i.test(String(m||''))}
function helpWords(m){return /\b(?:i|we|me and my \w+|my \w+ and (?:i|me)|two of us|three of us|\d+ people)\s+(?:can|will|are able to|am able to)\s+(?:both\s+)?(?:help\s+)?(?:lift|load|unload|carry)\b/i.test(String(m||''))}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  mergeGroundedInventory(r.j,candidate,message)
  if(obj==='ask_notable'&&r.f?.notable!=='known'){
    r.j.q??={}
    if(noHelpWords(message))r.j.q.controller_progress_ack='I’ve noted that you cannot help with the lifting.'
    else if(helpWords(message))r.j.q.controller_progress_ack='I’ve noted the lifting help you have available.'
  }
  return r
}
