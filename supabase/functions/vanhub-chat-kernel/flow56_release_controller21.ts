// @ts-nocheck
import * as base from './flow56_release_controller20.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
function conditionWords(j,message){
  if(!VEHICLE_CATS.has(j?.category))return
  const s=String(message||'').toLowerCase().replace(/[’']/g,"'")
  j.q??={};j.q.vehicle??={};const v=j.q.vehicle
  const neg='(?:does\\s*not|doesn\\x27t|doesnt|will\\s*not|won\\x27t|wont|can\\s*not|cannot|can\\x27t|cant|not)'
  const pos=(word)=>new RegExp(`\\b(?:${word}s?|can\\s+${word}|does\\s+${word})\\b`,'i')
  const negOne=(word)=>new RegExp(`\\b${neg}\\s+${word}\\b|\\b${word}\\s+(?:does\\s*not|doesn\\x27t|doesnt|won\\x27t|wont)\\b`,'i')
  const pair=(a,b)=>new RegExp(`\\b${neg}\\s+${a}\\s+(?:or|and|/)\\s+${b}\\b`,'i')
  if(pair('run','roll').test(s)){v.runs='no';v.rolls='no'}
  if(pair('roll','steer').test(s)){v.rolls='no';v.steers='no'}
  if(pair('steer','brake').test(s)){v.steers='no';v.brakes='no'}
  for(const [k,w] of [['runs','run'],['rolls','roll'],['steers','steer'],['brakes','brake']]){
    if(negOne(w).test(s))v[k]='no'
  }
  if(/\b(?:runs?|running)\b/i.test(s)&&!negOne('run').test(s)&&!pair('run','roll').test(s))v.runs='yes'
  if(/\b(?:rolls?|rolling)\b/i.test(s)&&!negOne('roll').test(s)&&!pair('run','roll').test(s)&&!pair('roll','steer').test(s))v.rolls='yes'
  if(/\bsteers?\b/i.test(s)&&!negOne('steer').test(s)&&!pair('roll','steer').test(s)&&!pair('steer','brake').test(s))v.steers='yes'
  if(/\bbrakes?\b/i.test(s)&&!negOne('brake').test(s)&&!pair('steer','brake').test(s))v.brakes='yes'
  if(/\b(?:no|without)\s+(?:fuel\s+or\s+oil\s+)?leaks?\b|\bno\s+leaks?\b/i.test(s)){v.fuel_leak='no';v.oil_leak='no'}
  if(/\b(?:fuel|petrol|diesel)\s+(?:is\s+)?leak(?:ing)?\b|\bleaking\s+(?:fuel|petrol|diesel)\b/i.test(s))v.fuel_leak='yes'
  if(/\boil\s+(?:is\s+)?leak(?:ing)?\b|\bleaking\s+oil\b/i.test(s))v.oil_leak='yes'
}
function primitiveKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function needsLoading(v){return primitiveKnown(v)&&['rolls','steers','brakes'].some(k=>v?.[k]==='no')&&!String(v?.loading||'').trim()}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  conditionWords(j,message)
  if(VEHICLE_CATS.has(j?.category)){
    const v=j.q?.vehicle||{}
    if(needsLoading(v))r.f['vehicle.condition']='missing'
    else if(primitiveKnown(v))r.f['vehicle.condition']='known'
  }
  return r
}
