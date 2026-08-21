// @ts-nocheck
import * as base from './flow56_release_controller50.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
function known(v){return typeof v==='string'&&v.trim().length>0}
function hasMotorbike(j){
  if(j?.category==='motorbike_transport')return true
  return /\b(?:motorbike|motorcycle|scooter)\b/i.test([...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.job_type,j?.title].filter(Boolean).join(' '))
}
function primitiveKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function impaired(v){return ['rolls','steers','brakes'].some(k=>v?.[k]==='no')}
function vehicleConditionRelevant(j){return VEHICLE_CATS.has(j?.category)||hasMotorbike(j)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  const v=j?.q?.vehicle||{}

  // Final release invariant: later generic requirements() recomputations must
  // not erase the specialist loading gate established earlier in the chain.
  // A vehicle/bike that cannot roll, steer or brake normally is not quote-
  // ready until the customer gives a viable loading plan.
  if(vehicleConditionRelevant(j)){
    if(primitiveKnown(v)&&impaired(v)&&!known(v.loading))r.f['vehicle.condition']='missing'
    else if(primitiveKnown(v))r.f['vehicle.condition']='known'
  }
  return r
}
