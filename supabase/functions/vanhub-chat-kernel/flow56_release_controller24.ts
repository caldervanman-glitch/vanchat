// @ts-nocheck
import * as base from './flow56_release_controller23.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const prompt=base.prompt

function canon(v){return String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[-_]+/g,' ').replace(/^[\s.!?,;:]+|[\s.!?,;:]+$/g,'').replace(/\s+/g,' ').trim()}
function hasMotorbike(j){return /\b(?:motorbike|motorcycle|scooter)\b/i.test([...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.job_type].filter(Boolean).join(' '))}

function scrubLoadingFromInventory(j){
  if(!hasMotorbike(j))return
  const load=canon(j?.q?.vehicle?.loading);if(!load)return
  j.inventory=(j.inventory||[]).filter(x=>canon(x)!==load)
  j.heavy_or_awkward_items=(j.heavy_or_awkward_items||[]).filter(x=>canon(x)!==load)
}
function scrubAbsentAppliances(j){
  if(j?.q?.appliances?.present!=='no')return
  const absent=/^(?:a |an |one |1 )?(?:washing machine|dishwasher)$/i
  j.inventory=(j.inventory||[]).filter(x=>!absent.test(String(x).trim()))
  j.heavy_or_awkward_items=(j.heavy_or_awkward_items||[]).filter(x=>!absent.test(String(x).trim()))
}
function packedMeansNoLoose(j,r,message){
  const s=String(message||'')
  const ready=/\b(?:all|everything|all the loose (?:items|belongings))\s+(?:is |are |will be )?(?:boxed|bagged|packed)(?:\s+and\s+(?:boxed|bagged|packed))?\b|\bfully\s+(?:boxed|bagged|packed)\b/i.test(s)
  const contrary=/\b(?:unboxed|loose items?|loose bits?|not boxed|not packed|nothing boxed|nothing packed|some loose|partly boxed|partially packed)\b/i.test(s)
  if(ready&&!contrary){j.q??={};j.q.loose_items='none';r.f.loose_items='known'}
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  packedMeansNoLoose(j,r,message)
  scrubAbsentAppliances(j)
  scrubLoadingFromInventory(j)
  return r
}

export function review(j){
  const s=base.review(j)
  if(hasMotorbike(j)&&j?.q?.vehicle?.loading&&Array.isArray(s.quote_risks)){
    // Mixed-motorbike summary already contains the loading plan with the bike condition.
    s.quote_risks=s.quote_risks.filter(x=>!/^Vehicle loading plan:/i.test(String(x)))
  }
  return s
}
