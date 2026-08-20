// @ts-nocheck
import * as base from './flow56_release_controller4.ts'
import {canon,clean,nextObjective} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const PAST='__CONTROLLER_PAST_DATE__'
const OBJ_FIELD={
  clarify_load:'inventory',ask_collection:'collection.location',ask_delivery:'delivery.location',ask_date:'date',ask_vehicle_identity:'vehicle.identity',ask_vehicle_condition:'vehicle.condition',ask_furniture:'furniture',ask_piano:'piano',ask_volume:'volume',ask_notable:'notable',ask_packing:'packing',ask_loose_items:'loose_items',ask_completion:'completion',ask_safe:'safe',ask_dismantling:'dismantling',ask_reassembly:'reassembly',ask_fit_access:'fit_access',ask_collection_access:'collection.access',ask_delivery_access:'delivery.access',ask_appliance_plumbing:'appliance_plumbing',ask_assistance:'assistance',ask_time:'time',ask_quantity:'quantity',ask_dimweight:'dimweight',ask_loading:'loading',ask_packaging:'packaging',ask_site:'site',ask_deadline:'deadline',ask_ready:'ready',ask_return:'return_leg',ask_handling:'handling',ask_passenger_count:'passenger.count',ask_passenger_details:'passenger.details',ask_passenger_deadline:'passenger.deadline',ask_waste_details:'waste.details',ask_waste_hazard:'waste.hazard'
}
function retryText(o,j){
  const P={
    clarify_load:"I still need the actual load rather than a general word like 'stuff'. List the main items and roughly how many boxes/bags.",
    ask_volume:'I still need a useful idea of the load size. Give the number of rooms plus the main furniture and roughly how many boxes/bags — a van-size estimate on its own is not enough.',
    ask_vehicle_identity:j?.category==='motorbike_transport'?"I didn't get a bike make/model from that. Give whatever you know — make, model, or model code (for example CBR600/R1). If you don't know, just say so.":"I didn't get a vehicle make/model from that. Give whatever you know, or say you don't know.",
    ask_vehicle_condition:'I still need the transport condition: does it run, roll, steer and brake, and are there any fuel/oil leaks? If one of those is unknown, say which one.',
    ask_date:'I still need a future collection/move date. Give it in your own words — for example tomorrow, Friday, or 28 August.',
    ask_collection:'I still need the actual collection town/area or postcode.',
    ask_delivery:'I still need the actual delivery town/area or postcode.',
    ask_collection_access:'I still need the collection access: internal stairs/lift, outside steps, and the carry from the item/property to where the van can park.',
    ask_delivery_access:'I still need the delivery access: internal stairs/lift, outside steps, and the carry from the van to the final resting place.',
    ask_assistance:'I still need to know who can genuinely help lift/load the larger items, if anyone. Someone simply being present is not lifting help.',
    ask_dismantling:'I still need to know whether anything needs dismantling and, if so, whether you or the driver will do it.',
    ask_appliance_plumbing:'I still need to know whether any washing machine/dishwasher is going, whether it will be disconnected before collection, and whether reconnection is expected.'
  }
  return P[o]||`I couldn't use that as the ${String(o||'detail').replace(/^ask_/,'').replace(/_/g,' ')} detail I need. ${base.prompt(o,j,null)}`
}

export function prompt(o,j,amb=null){
  if(amb===PAST)return 'That sounds like a date in the past. What future date do you need the move?'
  if(j?.q?.controller_retry_objective===o)return retryText(o,j)
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  // A phrase involving yesterday cannot become a future move date, including when supplied in the opening message.
  if(/\byesterday\b/i.test(String(message||''))&&!clean(j?.date?.iso_date)){
    r.ambiguity=PAST
  }
  const next=nextObjective(j,r.f),field=OBJ_FIELD[obj]
  const trivial=/^(?:yes|no|ok|okay|thanks|thank you)$/i.test(canon(message))
  if(obj&&next===obj&&field&&r.f[field]==='missing'&&!trivial&&!r.ambiguity)j.q.controller_retry_objective=obj
  return r
}
