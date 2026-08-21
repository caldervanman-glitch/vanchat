// @ts-nocheck
import * as base from './flow56_release_controller56.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
function hasMotorbike(j){
  return /\b(?:motorbike|motorcycle|scooter)\b/i.test([...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.job_type,j?.title,j?.q?.notable].filter(Boolean).join(' '))
}
function mixedMotorbike(j){return hasMotorbike(j)&&!VEHICLE_CATS.has(j?.category)}
function primitiveKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function impaired(v){return ['rolls','steers','brakes'].some(k=>v?.[k]==='no')}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!mixedMotorbike(j))return r

  const v=j?.q?.vehicle||{}
  // Final mixed-load invariant. Generic requirements() recomputations in later
  // legacy controllers classify vehicle fields as NA whenever the overall job
  // remains a house/flat move. A motorbike inside that move still needs its own
  // identity and condition/loading subflow before ordinary packing continues.
  r.f['vehicle.identity']=clean(v.identity)?'known':'missing'
  if(primitiveKnown(v)&&impaired(v)&&!clean(v.loading))r.f['vehicle.condition']='missing'
  else r.f['vehicle.condition']=primitiveKnown(v)?'known':'missing'
  return r
}
