// @ts-nocheck
// General conversation-control hardening layered on the exact production v46 flow.
// Purpose: ordinary conversation must progress naturally; trade-risk gates remain underneath.
import * as base from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/flow56_release_highvalue.ts'
import {canon,clean,requirements} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const BROAD_GEO=new Set([
  'uk','united kingdom','great britain','britain','england','scotland','wales','northern ireland',
  'london','greater london','yorkshire','west yorkshire','north yorkshire','south yorkshire','east yorkshire','east riding of yorkshire',
  'greater manchester','merseyside','west midlands','east midlands','midlands','north east','north west','south east','south west','east of england',
  'bedfordshire','berkshire','buckinghamshire','cambridgeshire','cheshire','cornwall','cumbria','derbyshire','devon','dorset','county durham',
  'east sussex','essex','gloucestershire','hampshire','herefordshire','hertfordshire','isle of wight','kent','lancashire','leicestershire','lincolnshire',
  'norfolk','northamptonshire','northumberland','nottinghamshire','oxfordshire','rutland','shropshire','somerset','staffordshire','suffolk','surrey',
  'warwickshire','west sussex','wiltshire','worcestershire'
])
const geo=v=>canon(v)
const broad=l=>!clean(l?.postcode)&&BROAD_GEO.has(geo(l?.town||l?.address_text))
const locLabel=l=>clean(l?.town)||clean(l?.address_text)||'that area'

function dateLabel(iso){
  try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${iso}T12:00:00Z`))}catch{return iso}
}

function missingOnlyAmbiguity(v){
  const s=canon(v)
  if(!s)return false
  if(/\b(ambiguous|unclear|conflict|contradict|did you mean|could mean|invalid|does not look|doesn't look|too broad|which one|which date|which location)\b/.test(s))return false
  return /\b(missing|not provided|not supplied|not given|not specified|still need|need(?:s)? (?:a |the )?(?:date|location|route)|no specific addresses?|no property types?)\b/.test(s)
}

// Long intent words get a tightly bounded two-edit rescue. Geography is never fuzzy-corrected.
const INTENT_TERMS=['removal','removals','delivery','transport','recovery','furniture','motorbike','motorcycle']
function distance(a,b){
  a=String(a||'').toLowerCase();b=String(b||'').toLowerCase();
  const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[a.length][b.length]
}
function normaliseIntent(message){
  return String(message||'').replace(/[A-Za-z]+/g,raw=>{
    const t=raw.toLowerCase();if(t.length<7||INTENT_TERMS.includes(t))return raw
    const hits=INTENT_TERMS.filter(x=>x.length>=7&&Math.abs(x.length-t.length)<=2&&distance(t,x)<=2)
    return hits.length===1?hits[0]:raw
  })
}

function plausibleVehicleIdentity(message){
  let s=String(message||'').trim().replace(/^[.!?,;:\s]+|[.!?,;:\s]+$/g,'')
  let c=canon(s)
  if(!s||s.length>80)return null
  if(/^(?:yes|no|yeah|yep|nope|none|unknown|don't know|dont know|do not know|not sure|unsure|no idea)$/i.test(c))return null
  if(/^(?:a |an )?(?:bike|motorbike|motorcycle|scooter|car|vehicle|van)$/i.test(c))return null
  s=s.replace(/^(?:it(?:'s| is)|its)\s+(?:a\s+|an\s+)?/i,'').trim()
  if(!/[a-z0-9]/i.test(s))return null
  // Model-only answers such as CBR345/R1 are useful customer evidence and must not be rejected.
  if(/[a-z].*\d|\d.*[a-z]/i.test(s))return s
  const MAKES=/^(?:honda|yamaha|kawasaki|suzuki|bmw|ducati|triumph|ktm|harley(?: davidson)?|royal enfield|aprilia|vespa|piaggio|husqvarna|benelli|moto guzzi)$/i
  if(MAKES.test(s))return s
  if(s.split(/\s+/).length>=2)return s
  // A single non-generic model name can still be all letters (e.g. Fireblade).
  if(/^[A-Za-z][A-Za-z-]{3,24}$/.test(s)&&!/^(?:red|blue|black|white|green|silver|large|small|old|new|broken)$/i.test(s))return s
  return null
}

function routePrompt(o,j){
  const cb=broad(j?.collection),db=broad(j?.delivery)
  if(o==='ask_route'){
    if(cb&&db)return `${locLabel(j.collection)} to ${locLabel(j.delivery)} is too broad for a useful quote. What specific town/area or postcode is it at each end? Postcodes usually get better results.`
    if(cb)return `${locLabel(j.collection)} is too broad for collection. What specific town/area or postcode is it? Postcodes usually get better results.`
    if(db)return `${locLabel(j.delivery)} is too broad for delivery. What specific town/area or postcode is it? Postcodes usually get better results.`
    if(['house_move','flat_move'].includes(j?.category))return 'Where are you moving from and to? Town/area or postcode is fine.'
    if(j?.category==='motorbike_transport')return 'Where does the bike need collecting from and taking to? Town/area or postcode is fine.'
    return 'Where is it being collected from and delivered to? Town/area or postcode is fine.'
  }
  if(o==='ask_collection')return cb?`${locLabel(j.collection)} is too broad for collection. What specific town/area or postcode is it? Postcodes usually get better results.`:'What town/area or postcode is the collection?'
  if(o==='ask_delivery')return db?`${locLabel(j.delivery)} is too broad for delivery. What specific town/area or postcode is it? Postcodes usually get better results.`:'What town/area or postcode is the delivery?'
  return null
}

export function prompt(o,j,amb=null){
  if(amb&&!missingOnlyAmbiguity(amb))return base.prompt(o,j,amb)
  let p=routePrompt(o,j)
  if(!p){
    if(o==='clarify_load')p='What are you moving? A rough list of the main items and boxes/bags is fine.'
    else if(o==='ask_vehicle_identity')p=j?.category==='motorbike_transport'?'What bike is it — make and/or model if you know it?':'What vehicle is it — make and/or model if you know it?'
    else p=base.prompt(o,j,null)
  }
  const ack=clean(j?.q?.controller_date_ack_iso)
  if(ack&&o!=='ask_date')p=`Got it — ${dateLabel(ack)}. ${p}`
  return p
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const corrected=normaliseIntent(message)
  let r=base.reduce(j0,f0,corrected,obj,candidate,direct,media),j=r.j
  j.q??={}
  // Date acknowledgement is one-turn only: clear an old marker, set a new one only when this turn resolves a date.
  if(clean(j0?.q?.controller_date_ack_iso))delete j.q.controller_date_ack_iso
  const oldIso=clean(j0?.date?.iso_date),newIso=clean(j?.date?.iso_date)
  if(newIso&&newIso!==oldIso&&!clean(j?.q?.pending_date_iso))j.q.controller_date_ack_iso=newIso

  // Model ambiguity must not replace a normal objective with a robotic summary of missing fields.
  if(missingOnlyAmbiguity(r.ambiguity))r.ambiguity=null

  // Deterministic answer contract for vehicle identity. Partial/model-only identity is valid evidence.
  if(obj==='ask_vehicle_identity'&&!clean(j?.q?.vehicle?.identity)){
    const id=plausibleVehicleIdentity(message)
    if(id){j.q.vehicle.identity=id;r.f=requirements(j,r.f);if(r.ambiguity&&/\b(make|model|identity|vehicle|bike)\b/i.test(r.ambiguity))r.ambiguity=null}
  }
  return r
}
