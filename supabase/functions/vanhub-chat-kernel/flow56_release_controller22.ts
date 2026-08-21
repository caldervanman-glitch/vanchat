// @ts-nocheck
import * as base from './flow56_release_controller21.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
const UNKNOWN=/^(?:i\s+)?(?:don't know|dont know|do not know|not sure|unsure|no idea|unknown|haven't a clue|havent a clue)$/i

function motorbikeText(j){return [...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.job_type,j?.title].filter(Boolean).join(' ')}
function hasMotorbike(j){return /\b(?:motorbike|motorcycle|scooter)\b/i.test(motorbikeText(j))}
function mixedMotorbike(j){return hasMotorbike(j)&&!VEHICLE_CATS.has(j?.category)}
function known(v){return typeof v==='string'&&v.trim().length>0}

function conditionWords(j,message){
  if(!hasMotorbike(j))return
  const s=String(message||'').toLowerCase().replace(/[’']/g,"'")
  j.q??={};j.q.vehicle??={};const v=j.q.vehicle
  const neg='(?:does\\s*not|doesn\\x27t|doesnt|will\\s*not|won\\x27t|wont|can\\s*not|cannot|can\\x27t|cant|not)'
  const negOne=(word)=>new RegExp(`\\b${neg}\\s+${word}\\b|\\b${word}\\s+(?:does\\s*not|doesn\\x27t|doesnt|won\\x27t|wont)\\b`,'i')
  const pair=(a,b)=>new RegExp(`\\b${neg}\\s+${a}\\s+(?:or|and|/)\\s+${b}\\b`,'i')
  if(pair('run','roll').test(s)){v.runs='no';v.rolls='no'}
  if(pair('roll','steer').test(s)){v.rolls='no';v.steers='no'}
  if(pair('steer','brake').test(s)){v.steers='no';v.brakes='no'}
  for(const [k,w] of [['runs','run'],['rolls','roll'],['steers','steer'],['brakes','brake']])if(negOne(w).test(s))v[k]='no'
  if(/\b(?:runs?|running)\b/i.test(s)&&!negOne('run').test(s)&&!pair('run','roll').test(s))v.runs='yes'
  if(/\b(?:rolls?|rolling)\b/i.test(s)&&!negOne('roll').test(s)&&!pair('run','roll').test(s)&&!pair('roll','steer').test(s))v.rolls='yes'
  if(/\bsteers?\b/i.test(s)&&!negOne('steer').test(s)&&!pair('roll','steer').test(s)&&!pair('steer','brake').test(s))v.steers='yes'
  if(/\bbrakes?\b/i.test(s)&&!negOne('brake').test(s)&&!pair('steer','brake').test(s))v.brakes='yes'
  if(/\b(?:no|without)\s+(?:fuel\s+or\s+oil\s+)?leaks?\b|\bno\s+leaks?\b/i.test(s)){v.fuel_leak='no';v.oil_leak='no'}
  if(/\b(?:fuel|petrol|diesel)\s+(?:is\s+)?leak(?:ing)?\b|\bleaking\s+(?:fuel|petrol|diesel)\b/i.test(s))v.fuel_leak='yes'
  if(/\boil\s+(?:is\s+)?leak(?:ing)?\b|\bleaking\s+oil\b/i.test(s))v.oil_leak='yes'
  if(/\b(?:keys?|key)\s+(?:are\s+)?(?:available|present|here|with me)\b|\bi have (?:the )?keys?\b/i.test(s))v.keys='yes'
  if(/\b(?:no|without)\s+keys?\b|\bkeys?\s+(?:missing|lost|unavailable)\b/i.test(s))v.keys='no'
  const lm=s.match(/\b(?:load(?:ed|ing)?|get(?:ting)? it (?:on|onto)|onto the van)\b.{0,35}\b(winch|wheel skates?|forklift|ramp|tail lift|crane)\b|\b(winch|wheel skates?|forklift|ramp|tail lift|crane)\b.{0,35}\b(?:load|loading|onto)\b/i)
  if(lm)v.loading=(lm[1]||lm[2]||'').trim()
}
function primitiveKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function needsLoading(v){return primitiveKnown(v)&&['rolls','steers','brakes'].some(k=>v?.[k]==='no')&&!known(v?.loading)}

function identityFromDense(message,j){
  if(!hasMotorbike(j)||known(j?.q?.vehicle?.identity))return
  const raw=String(message||'')
  j.q??={};j.q.vehicle??={}
  let m=raw.match(/\b(?:a|an|the)?\s*([A-Za-z0-9][A-Za-z0-9-]{1,20}(?:\s+[A-Za-z0-9][A-Za-z0-9-]{1,20})?)\s+(?:motorbike|motorcycle|scooter)\b/i)
  if(m){
    let x=m[1].trim()
    if(!/^(?:a|an|the|one|my|our|this|that|a honda|an honda)$/i.test(x)&&!/^(?:moving|house|including|include|with|and)$/i.test(x))j.q.vehicle.identity=x
  }
}
function identityFromAnswer(message,obj,j){
  if(obj!=='ask_vehicle_identity'||!hasMotorbike(j)||known(j?.q?.vehicle?.identity))return
  const raw=String(message||'').trim();j.q??={};j.q.vehicle??={}
  if(UNKNOWN.test(raw)){j.q.vehicle.identity='unknown - customer does not know make/model';return}
  let x=raw.replace(/^\s*(?:it(?:'s| is)|the bike is|bike is|motorbike is|motorcycle is)\s+/i,'').trim()
  if(x.length>=2&&x.length<=60&&x.split(/\s+/).length<=6&&!/\b(?:from|to|tomorrow|today|friday|monday|tuesday|wednesday|thursday|saturday|sunday|collect|deliver|move)\b/i.test(x))j.q.vehicle.identity=x
}
function markMixedBikeNotable(j,r){
  if(!mixedMotorbike(j))return
  j.q??={}
  if(['house_move','flat_move'].includes(j.category)){
    j.q.notable='motorbike included'
    r.f.notable='known'
  }
  if(!Array.isArray(j.heavy_or_awkward_items))j.heavy_or_awkward_items=[]
  if(!j.heavy_or_awkward_items.some(x=>/\b(?:motorbike|motorcycle|scooter)\b/i.test(String(x))))j.heavy_or_awkward_items.push('motorbike')
}

function clearPassengerContamination(j){
  j.q??={};j.q.passenger??={count:null,luggage:null,special:null,arrival_deadline:null}
  const p=j.q.passenger,actualRide=j.category==='passenger_transport'||Number(p.count)>0
  if(!actualRide){p.luggage=null;p.special=null;p.arrival_deadline=null}
}

export function prompt(o,j,amb=null){
  if(mixedMotorbike(j)){
    if(o==='ask_vehicle_identity')return 'What bike is it — make/model or model code if you know it? If you do not know, just say so.'
    if(o==='ask_vehicle_condition'){
      const v=j?.q?.vehicle||{}
      if(needsLoading(v))return 'Because the motorbike does not roll/steer/brake normally, how will it be loaded with the rest of the move — for example winch, wheel skates, ramp, tail lift or other equipment?'
      return 'For the motorbike, does it run, roll, steer and brake normally, and are there any fuel or oil leaks?'
    }
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  clearPassengerContamination(j)
  if(hasMotorbike(j)){
    identityFromDense(message,j)
    identityFromAnswer(message,obj,j)
    conditionWords(j,message)
  }
  if(mixedMotorbike(j)){
    markMixedBikeNotable(j,r)
    const v=j.q?.vehicle||{}
    r.f['vehicle.identity']=known(v.identity)?'known':'missing'
    r.f['vehicle.condition']=needsLoading(v)?'missing':primitiveKnown(v)?'known':'missing'
  }
  return r
}

export function review(j){
  const s=base.review(j)
  if(mixedMotorbike(j)){
    const v=j?.q?.vehicle||{},bits=[]
    if(known(v.identity))bits.push(`identity ${v.identity}`)
    for(const [k,label] of [['runs','runs'],['rolls','rolls'],['steers','steers'],['brakes','brakes']])if(['yes','no'].includes(v[k]))bits.push(`${label}: ${v[k]}`)
    if(['yes','no'].includes(v.fuel_leak))bits.push(`fuel leak: ${v.fuel_leak}`)
    if(known(v.loading))bits.push(`loading: ${v.loading}`)
    if(bits.length){s.quote_risks=Array.isArray(s.quote_risks)?s.quote_risks:[];s.quote_risks.push(`Motorbike included in mixed load — ${bits.join(', ')}`)}
  }
  return s
}
