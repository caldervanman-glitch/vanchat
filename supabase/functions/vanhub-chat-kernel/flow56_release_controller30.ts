// @ts-nocheck
import * as base from './flow56_release_controller29.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
const canon=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[-_]+/g,' ').replace(/^[\s.!?,;:]+|[\s.!?,;:]+$/g,'').replace(/\s+/g,' ').trim()
const ground=v=>canon(v)==='0'||/\bground\b/.test(canon(v))
function internalKnown(l){return !!(ground(l?.floor)||/\bbungalow\b/i.test(clean(l?.property_type)||'')||clean(l?.internal_stairs)||clean(l?.stairs)||clean(l?.lift)||/\b(no internal stairs|internal stairs|ground floor|stairs inside|lift)\b/i.test(clean(l?.access_notes)||''))}
function externalKnown(l){return !!(clean(l?.external_steps)||/\b(no (?:outside|external) steps?|outside steps?|external steps?|steps? to (?:the )?(?:door|property|entrance))\b/i.test(clean(l?.access_notes)||''))}
function carryKnown(l){return !!(clean(l?.carry_distance)||/\b(?:park(?:ing)? (?:at|outside|by|next to) (?:the )?(?:door|property|entrance)|driveway|loading bay|no long carry|long carry|carry (?:distance|of)|\d+\s*(?:m|metres?|meters?|yards?|ft|feet)\s*(?:carry|from|to))\b/i.test([clean(l?.parking),clean(l?.access_notes)].filter(Boolean).join(' ')))}
function accessKnown(l){return internalKnown(l)&&externalKnown(l)&&carryKnown(l)}
function sideLabel(side){return side==='collection'?'collection':'delivery'}
function pendingAccess(side,j){
  const l=j?.[side]||{},missing=[]
  if(!internalKnown(l))missing.push('internal')
  if(!externalKnown(l))missing.push('external')
  if(!carryKnown(l))missing.push('carry')
  return {l,missing}
}
function targetedAccess(side,j){
  const {l,missing}=pendingAccess(side,j),where=sideLabel(side)
  if(!missing.length)return null
  const bits=[]
  if(missing.includes('internal'))bits.push(`are there any internal stairs or a lift${clean(l.floor)?` beyond the ${l.floor} detail`:''}`)
  if(missing.includes('external'))bits.push('are there any outside steps to the entrance')
  if(missing.includes('carry')){
    const p=canon(l.parking)
    if(/\bparking outside\b/.test(p))bits.push('when you say parking outside, is the van right by the door/property or is there a carry')
    else bits.push('roughly how far is the carry between the property and where the van can park')
  }
  if(bits.length===1)return `At ${where}, ${bits[0]}?`
  if(bits.length===2)return `At ${where}, ${bits[0]}, and ${bits[1]}?`
  return `At ${where}, ${bits[0]}, ${bits[1]}, and ${bits[2]}?`
}
function accessWords(m){return /\b(?:ground floor|\d+(?:st|nd|rd|th) floor|first floor|second floor|third floor|stairs?|steps?|lift|parking|loading bay|driveway|carry)\b/i.test(String(m||''))}
function noHelpWords(m){return /\b(?:i|we)\s+(?:can't|cannot|won't|will not|am not able to|are not able to)\s+(?:help|lift|load|carry)\b|\bno(?:body| one|-one)?\s+(?:can|will|is able to)\s+(?:help|lift|load|carry)\b/i.test(String(m||''))}
function helpWords(m){return /\b(?:i|we|me and my \w+|my \w+ and (?:i|me)|two of us|three of us|\d+ people)\s+(?:can|will|are able to|am able to)\s+(?:both\s+)?(?:help\s+)?(?:lift|load|unload|carry)\b/i.test(String(m||''))}
function ackFor(message,obj,r){
  if(obj==='ask_notable'&&r.f?.notable!=='known'){
    if(accessWords(message))return 'I’ve noted those access/parking details.'
    if(noHelpWords(message))return 'I’ve noted that you cannot help with the lifting.'
    if(helpWords(message))return 'I’ve noted the lifting help you have available.'
  }
  if(['ask_collection_access','ask_delivery_access'].includes(obj)){
    const side=obj==='ask_collection_access'?'collection':'delivery'
    if(!accessKnown(r.j?.[side])){
      if(noHelpWords(message))return 'I’ve noted that you cannot help with the lifting.'
      if(helpWords(message))return 'I’ve noted the lifting help you have available.'
    }
  }
  return null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const input=structuredClone(j0||{})
  if(input.q){delete input.q.controller_progress_ack}
  const r=base.reduce(input,f0,message,obj,candidate,direct,media)
  r.j.q??={}
  const ack=ackFor(message,obj,r)
  if(ack)r.j.q.controller_progress_ack=ack
  return r
}

export function prompt(o,j,amb=null){
  if(amb)return base.prompt(o,j,amb)
  const ack=clean(j?.q?.controller_progress_ack)
  if(o==='ask_collection_access'||o==='ask_delivery_access'){
    const side=o==='ask_collection_access'?'collection':'delivery',q=targetedAccess(side,j)
    if(q)return ack?`${ack} ${q}`:q
  }
  if(o==='ask_notable'&&ack)return `${ack} I still need one point: are there any particularly large, heavy or awkward items?`
  return base.prompt(o,j,amb)
}
