// @ts-nocheck
import * as base from './flow56_release_controller2.ts'
import {canon,clean,nextObjective} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

function relativeText(v){
  const s=canon(v);if(!s)return false
  return /^(?:my|our|the)\s+(?:nan|nans|nan's|nanna|nanna's|grandma|grandma's|grandad|grandad's|mum|mum's|mom|mom's|dad|dad's|parents?|parents'|friend|friend's|mate|mate's|brother|brother's|sister|sister's|son|son's|daughter|daughter's|aunt|aunt's|uncle|uncle's|customer|customer's|seller|seller's|buyer|buyer's|work|workplace|office|house|home|place)$/i.test(s)
}
function relativeEndpoint(l){return !clean(l?.postcode)&&(relativeText(l?.town)||relativeText(l?.address_text))}
function relLabel(l){return clean(l?.town)||clean(l?.address_text)||'that address'}

const OBJ_FIELD={
  clarify_load:'inventory',ask_collection:'collection.location',ask_delivery:'delivery.location',ask_date:'date',ask_vehicle_identity:'vehicle.identity',ask_vehicle_condition:'vehicle.condition',ask_furniture:'furniture',ask_piano:'piano',ask_volume:'volume',ask_notable:'notable',ask_packing:'packing',ask_loose_items:'loose_items',ask_completion:'completion',ask_safe:'safe',ask_dimweight:'dimweight',ask_collection_access:'collection.access',ask_delivery_access:'delivery.access',ask_appliance_plumbing:'appliance_plumbing',ask_assistance:'assistance',ask_time:'time'
}
function usefulRetry(o,j){
  if(o==='clarify_load')return "I still need the actual load rather than a general word like 'stuff'. List the main items and roughly how many boxes/bags."
  if(o==='ask_vehicle_identity')return j?.category==='motorbike_transport'?"I didn't get a bike make/model from that. Give whatever you know — make, model, or model code (for example CBR600/R1). If you don't know, just say so.":"I didn't get a vehicle make/model from that. Give whatever you know, or say you don't know."
  if(o==='ask_date')return 'I still need a future collection/move date. Give the date in your own words — for example tomorrow, Friday, or 28 August.'
  if(o==='ask_collection')return 'I still need the actual collection town/area or postcode.'
  if(o==='ask_delivery')return 'I still need the actual delivery town/area or postcode.'
  return null
}

export function prompt(o,j,amb=null){
  const cr=relativeEndpoint(j?.collection),dr=relativeEndpoint(j?.delivery)
  if(o==='ask_route'&&(cr||dr)){
    if(cr&&dr)return 'What town/area or postcode is each address in?'
    if(cr)return `What town/area or postcode is the collection address?`
    return `What town/area or postcode is ${relLabel(j.delivery)}?`
  }
  if(o==='ask_collection'&&cr)return 'What town/area or postcode is the collection address?'
  if(o==='ask_delivery'&&dr)return `What town/area or postcode is ${relLabel(j.delivery)}?`
  const retry=j?.q?.controller_retry_objective===o?usefulRetry(o,j):null
  if(retry)return retry
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  if(relativeEndpoint(j.collection))r.f['collection.location']='missing'
  if(relativeEndpoint(j.delivery))r.f['delivery.location']='missing'

  // One-turn loop marker. Never auto-advance on bad evidence; rephrase instead of repeating verbatim.
  delete j.q.controller_retry_objective
  const next=nextObjective(j,r.f)
  const mapped=OBJ_FIELD[obj]
  const trivial=/^(?:yes|no|ok|okay|thanks|thank you)$/i.test(canon(message))
  if(obj&&next===obj&&mapped&&r.f[mapped]==='missing'&&!trivial&&!r.ambiguity)j.q.controller_retry_objective=obj
  return r
}
