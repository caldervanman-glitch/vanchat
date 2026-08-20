// @ts-nocheck
import * as base from './flow56_release_controller8.ts'
import {canon,clean,requirements} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const MAKE='honda|yamaha|kawasaki|suzuki|bmw|ducati|triumph|ktm|harley(?: davidson)?|royal enfield|aprilia|vespa|piaggio|husqvarna|benelli|moto guzzi'
function identityFromText(message){
  const s=String(message||'')
  let m=s.match(new RegExp(`\\b(${MAKE})\\s+([a-z0-9][a-z0-9-]{1,24})\\b`,'i'))
  if(m&&!/^(?:bike|motorbike|motorcycle|scooter|car|vehicle|van)$/i.test(m[2]))return `${m[1]} ${m[2]}`
  m=s.match(new RegExp(`\\b(${MAKE})\\b`,'i'));if(m)return m[1]
  m=s.match(/\b([a-z]{1,6}\d{1,5}[a-z0-9-]*)\s+(?:bike|motorbike|motorcycle|scooter)\b/i);if(m)return m[1]
  return null
}
function primitiveConditionKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function needsLoadingPlan(v){return primitiveConditionKnown(v)&&['rolls','steers','brakes'].some(k=>v?.[k]==='no')&&!clean(v?.loading)}
function loadingText(message){
  const s=String(message||'').trim()
  if(/\b(winch|winched|wheel skates?|vehicle skates?|doll(?:y|ies)|forklift|fork lift|tail ?lift|crane|hoist|specialist loading|lift(?:ed|ing) on|needs? to be lifted|dragged on|loading equipment|recovery truck|breakdown truck)\b/i.test(s))return s
  return null
}

export function prompt(o,j,amb=null){
  const v=j?.q?.vehicle||{}
  if(o==='ask_vehicle_condition'&&needsLoadingPlan(v))return `Because it does not ${v.rolls==='no'?'roll':v.steers==='no'?'steer':'brake'} normally, how will it be loaded onto the transport vehicle — for example winch, wheel skates, forklift or other equipment?`
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={};j.q.vehicle??={}
  if(['motorbike_transport','vehicle_transport'].includes(j.category)&&!clean(j.q.vehicle.identity)){
    const id=identityFromText(message);if(id)j.q.vehicle.identity=id
  }
  if(obj==='ask_vehicle_condition'){
    const lt=loadingText(message);if(lt)j.q.vehicle.loading=lt
  }
  r.f=requirements(j,r.f)
  if(['motorbike_transport','vehicle_transport'].includes(j.category)){
    if(clean(j.q.vehicle.identity))r.f['vehicle.identity']='known'
    if(needsLoadingPlan(j.q.vehicle))r.f['vehicle.condition']='missing'
    else if(primitiveConditionKnown(j.q.vehicle))r.f['vehicle.condition']='known'
  }
  return r
}

export function review(j){
  const r=base.review(j),v=j?.q?.vehicle||{},risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  if(clean(v.identity)&&['motorbike_transport','vehicle_transport'].includes(j?.category))risks.push(`Vehicle identity: ${v.identity}`)
  if(clean(v.loading))risks.push(`Vehicle loading plan: ${v.loading}`)
  return {...r,quote_risks:[...new Set(risks)]}
}
