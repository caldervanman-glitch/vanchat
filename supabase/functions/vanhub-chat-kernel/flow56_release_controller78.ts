// @ts-nocheck
import * as base from './flow56_release_controller77.ts'
import * as core from './core_release_controller52.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const review=base.review

const CATEGORIES=new Set(['house_move','flat_move','single_item','furniture_move','business_delivery','courier','urgent_delivery','equipment_transport','event_transport','motorbike_transport','vehicle_transport','other_transport','waste_transport','passenger_transport'])
const GOODS=new Set(['house_move','flat_move','single_item','furniture_move','business_delivery','courier','urgent_delivery','equipment_transport','event_transport','motorbike_transport','vehicle_transport','other_transport','waste_transport'])
const BIKE=new Set(['motorbike_transport','vehicle_transport'])
const FLEX_TIME=/\b(?:timing (?:is )?flexible|any\s*time|anytime|no (?:time )?preference|whenever|flexible(?: any time)?)\b/i
const APPLIANCE=/\b(?:washing machine|washer|dishwasher)\b/i
const PLUMBING=/\b(?:still connected|seller says|(?:driver|movers?|removal team)\s+(?:can|will|should|could|just|is expected to)\s+(?:disconnect|unplumb|reconnect|replumb|plumb)|disconnect it|reconnect it|unplumb|replumb|plumb it(?: back in)?|expect(?:ing)?\s+(?:the|your)?\s*(?:driver|movers?))\b/i
const RECONNECT=/\b(?:reconnect|replumb|plumb it(?: back in)?|plumb(?:ed)? back in)\b/i
const NOT_DISCONNECTED=/\b(?:still connected|driver (?:can|will|should|could|just|is expected to) (?:disconnect|unplumb)|disconnect it)\b/i
const BOTH_ENDS=/\b(?:both ends|at both ends|both properties|collection and delivery|pickup and delivery)\b/i
const ACCESS=/\b(?:stairs?|steps?|flights?|floor|lift|elevator|parking|park(?:ing)?|carry|roadworks?|loading bay|double yellow|single yellow|permit|doorway|entrance|property access|metres?|meters?|yards?|feet|ft)\b/i
const FURN_DETAIL=/\b(?:three|four|five|six|3|4|5|6)[ -]?doors?(?:\s+wide)?\b|\b\d+(?:\.\d+)?\s*(?:m|metres?|meters?|cm|centimetres?|centimeters?|ft|feet)\b/i
const WARDROBE=/\bwardrobe\b/i
const ACCESS_FIELDS=['floor','stairs','lift','parking','internal_stairs','external_steps','carry_distance','access_notes']

const arr=v=>Array.isArray(v)?v:[]
const clean=v=>core.clean(v)
const norm=v=>core.canon(v)
function quote(v){return String(v||'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,420)}
function pushNote(j,text){const t=clean(text);if(!t)return;j.q??={};j.q.driver_notes=arr(j.q.driver_notes);if(!j.q.driver_notes.some(x=>norm(x)===norm(t)))j.q.driver_notes.push(t)}
function phrasePresent(hay,needle){
  const h=norm(hay).split(/[^a-z0-9]+/).filter(Boolean),n=norm(needle).split(/[^a-z0-9]+/).filter(Boolean)
  if(!n.length||n.length>h.length)return false
  outer:for(let i=0;i<=h.length-n.length;i++){for(let k=0;k<n.length;k++)if(h[i+k]!==n[k])continue outer;return true}return false
}
function routeFromCurrent(message){
  const stop='(?:today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|next|this|any|on|at|around|with|there|for|and\\b|\\d{1,2}(?:st|nd|rd|th)?\\b)'
  const re=new RegExp(`\\bfrom\\s+([A-Za-z][A-Za-z' .-]{1,48}?)\\s+to\\s+([A-Za-z][A-Za-z' .-]{1,48}?)(?=\\s+${stop}|[,.!?;:]|$)`,'i')
  const m=String(message||'').match(re);if(!m)return null
  const a=quote(m[1]),b=quote(m[2]);if(!a||!b)return null
  return {collection:a,delivery:b}
}
function usefulBikeIdentity(v){
  const s=norm(v);if(!s)return false
  const compact=s.replace(/\s+/g,'')
  if(/^(?=.*[a-z])(?=.*\d)[a-z0-9-]{4,}$/i.test(compact)&&!/^\d+cc$/i.test(compact))return true
  const junk=new Set(['a','an','the','my','our','got','have','has','bike','motorbike','motorcycle','scooter','moped','vehicle','only','does','not','run','runs','rolls','steers','brakes','no','leaks','fuel','oil'])
  const tokens=s.split(/[^a-z0-9-]+/).filter(Boolean).filter(x=>!junk.has(x)&&!/^\d+cc$/.test(x)&&x!=='cc')
  return tokens.length>=2
}
function literalCandidateIdentity(candidate,message){
  for(const item of arr(candidate?.inventory_add)){
    const v=clean(typeof item==='string'?item:item?.value),e=clean(typeof item==='string'?item:item?.evidence)
    if(!v||!usefulBikeIdentity(v))continue
    if(phrasePresent(message,v)&&( !e || phrasePresent(message,e) || phrasePresent(e,v)))return v
  }
  return null
}
function hour(v){
  const s=norm(v);let m=s.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);if(m&&!/\b(?:am|pm)\b/.test(s))return +m[1]
  m=s.match(/\b(1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(am|pm)\b/);if(m){let h=+m[1]%12;if(m[2]==='pm')h+=12;return h}
  return null
}
function compactInventory(j){
  const xs=arr(j?.inventory).map(clean).filter(Boolean)
  return xs.filter((x,i)=>!xs.some((y,k)=>k!==i&&y.length<x.length&&norm(x).includes(norm(y)))).slice(0,10)
}
function furnitureContext(j,message){return WARDROBE.test(String(message||''))||WARDROBE.test(arr(j?.inventory).join(' '))}
function clearFurnitureAccessNoise(j,before,message){
  if(!furnitureContext(j,message)||!FURN_DETAIL.test(String(message||''))||ACCESS.test(String(message||'').replace(/\b\d+(?:\.\d+)?\s*(?:m|metres?|meters?|cm|centimetres?|centimeters?|ft|feet)\b/gi,'')))return
  for(const side of ['collection','delivery'])for(const k of ACCESS_FIELDS)j[side][k]=structuredClone(before?.[side]?.[k]??null)
  const prior=new Set(arr(before?.q?.driver_notes).map(norm))
  j.q.driver_notes=arr(j.q.driver_notes).filter(n=>prior.has(norm(n))||!/Customer access statement:/i.test(String(n)))
}
function bothEndsNote(j,message){
  if(!BOTH_ENDS.test(message)||!ACCESS.test(message))return
  j.q.driver_notes=arr(j.q.driver_notes).filter(n=>!/Customer access statement:/i.test(String(n))||!/did not explicitly identify which endpoint/i.test(String(n)))
  pushNote(j,`Customer access statement applying to both collection and delivery: "${quote(message)}".`)
}
function applianceReconcile(j,message){
  if(!APPLIANCE.test(message)||!PLUMBING.test(message))return false
  j.q.appliances??={present:null,disconnected:null,reconnect_requested:null}
  j.q.appliances.present='yes'
  if(NOT_DISCONNECTED.test(message))j.q.appliances.disconnected='no'
  if(RECONNECT.test(message))j.q.appliances.reconnect_requested='yes'
  j.q.controller_appliance_notice='Important: appliance plumbing is not assumed. Many drivers are not insured or willing to disconnect/reconnect washing machines or dishwashers, so this must be explicitly agreed with the driver.'
  pushNote(j,`Customer appliance statement: "${quote(message)}" — appliance disconnection/reconnection is not included by default. Many drivers are not insured or willing to do plumbing work; it must be explicitly agreed with the driver.`)
  return true
}
function normalizeCategory(j,candidate){
  const c=clean(candidate?.category)
  if(!clean(j?.category)&&CATEGORIES.has(c))j.category=c
  if(!clean(j?.category)&&CATEGORIES.has(clean(j?.job_type)))j.category=clean(j.job_type)
}
function unusual(j){const h=hour(j?.date?.time_preference);return GOODS.has(j?.category)&&h!=null&&(h>=21||h<6)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const before=structuredClone(j0)
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}

  normalizeCategory(j,candidate)

  const route=routeFromCurrent(message)
  if(route){j.collection.town=route.collection;j.delivery.town=route.delivery}

  if(BIKE.has(j?.category)||(/\b(?:motorbike|motorcycle|scooter|moped)\b/i.test(message)&&['house_move','flat_move'].includes(j?.category))){
    const id=literalCandidateIdentity(candidate,message)
    if(id&&!usefulBikeIdentity(j?.q?.vehicle?.identity))j.q.vehicle.identity=id
  }

  if(FLEX_TIME.test(message))j.date.time_preference='flexible'

  const furniture=furnitureContext(j,message)&&FURN_DETAIL.test(message)
  if(furniture){
    j.q.controller_furniture_detail=quote(message)
    pushNote(j,`Furniture size/detail supplied by customer: "${quote(message)}".`)
  }
  clearFurnitureAccessNoise(j,before,message)
  bothEndsNote(j,message)
  applianceReconcile(j,message)

  // Waste fields are model noise unless this is actually a waste job. Human
  // testing caught ordinary house-move black bags populating waste.volume.
  if(j.category!=='waste_transport'&&j.job_type!=='waste_transport')j.q.waste={type:null,volume:null,hazard:null}

  // Recompute after the opener-level corrections. Older layers sometimes
  // carry stale `na` values forward even though the current turn proved a fact.
  r.f=core.requirements(j,r.f)
  if(furniture)r.f.furniture='known'
  if(j.date.time_preference==='flexible')r.f.time='known'
  if(usefulBikeIdentity(j?.q?.vehicle?.identity)&&(BIKE.has(j?.category)||['house_move','flat_move'].includes(j?.category)))r.f['vehicle.identity']='known'
  if(unusual(j))r.f.unusual_time=j.q.unusual_time_confirmed===true?'known':'missing'
  return r
}

export function prompt(o,j,amb=null){
  if(o==='ask_volume'&&j?.q?.controller_underload_needed&&!amb){
    const scale=clean(j?.q?.controller_property_scale)||'the property size',items=compactInventory(j)
    let p=`Thanks — I have this as ${scale}${items.length?` with ${items.join(', ')}`:''}. That looks unusually small for the property size, so before drivers quote it I need to make sure the load is not being understated. Is the property mostly empty, and are there definitely no other beds or mattresses, drawers, TVs, desks, garden or garage items, furniture or appliances going? Photos are useful here, but not required.`
    if(j?.q?.controller_appliance_notice)p=`${j.q.controller_appliance_notice}\n\n${p}`
    return p
  }
  return base.prompt(o,j,amb)
}
