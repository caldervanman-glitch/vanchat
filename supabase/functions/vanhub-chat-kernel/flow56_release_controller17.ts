// @ts-nocheck
import * as base from './flow56_release_controller16.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const prompt=base.prompt

function rideRequest(message){
  const s=String(message||'')
  return /\b(?:can|could|may|would|do|is it ok|is that ok|i would like|i'd like|we would like|we'd like)\b[^.!?]{0,80}\b(?:i|me|we|us|my daughter|my son|my child|my wife|my husband|my partner)\b[^.!?]{0,80}\b(?:go|travel|ride|come)\b[^.!?]{0,50}\b(?:with (?:the )?driver|in (?:the|his|her|their) van|as (?:a )?passenger)\b|\b(?:can|could|may)\s+i\s+(?:go|travel|ride|come)\s+(?:with (?:the )?driver|in (?:the|his|her|their) van)(?:\s+as\s+(?:a\s+)?passenger)?\b/i.test(s)
}
function countPeople(message){
  const s=String(message||'').toLowerCase()
  if(/\b(?:me|i)\s+and\s+my\s+(?:daughter|son|child|wife|husband|partner|mum|mom|dad|brother|sister)\b|\bmy\s+(?:daughter|son|child|wife|husband|partner|mum|mom|dad|brother|sister)\s+and\s+(?:me|i)\b/.test(s))return 2
  const n=s.match(/\b(\d+)\s+(?:of us|passengers?|people)\b/);return n?Number(n[1]):null
}
function childRelation(message){return /\b(?:daughter|son|child|kid)\b/i.test(String(message||''))}
function childDetails(message){
  const s=String(message||'')
  let age=null,height=null
  const a=s.match(/\b(?:age(?:d)?\s*)?(\d{1,2})\s*(?:years?|yrs?)(?:\s*old)?\b/i)||s.match(/\b(?:she|he|they|daughter|son|child)\s+(?:is|'s)\s+(\d{1,2})\b/i)
  if(a){const n=Number(a[1]);if(n>=0&&n<=17)age=n}
  const h=s.match(/\b(\d{2,3})\s*cm\b/i);if(h){const n=Number(h[1]);if(n>=50&&n<=220)height=n}
  return{age,height}
}
function answer(message){
  const child=childRelation(message)
  let t="It can be possible, but it is not automatically included. The driver must agree and the van must have a proper belted passenger seat for each person. The accepting driver should also confirm their insurance/terms allow them to carry you. I'll record the request so drivers can confirm whether they can take you."
  if(child)t+=' If your daughter/child is still subject to child-seat rules, tell me their age and approximate height; in a van the normal car rule applies until age 12 or 135 cm tall, whichever comes first.'
  else t+=' If any passenger is a child, tell me their age and approximate height because the normal child-seat rules for cars also apply in vans.'
  return t
}

export function faq(message){
  if(rideRequest(message))return answer(message)
  return base.faq(message)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const ride=rideRequest(message)
  const oldCat=j0?.category||null,oldPassenger=structuredClone(j0?.q?.passenger||{count:null,luggage:null,special:null,arrival_deadline:null})
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  const priorRide=!!j0?.q?.ride_request?.requested
  if(ride||priorRide){
    j.q.ride_request??=structuredClone(j0?.q?.ride_request||{})
    if(ride){
      j.q.ride_request.requested=true
      j.q.ride_request.count=countPeople(message)||j.q.ride_request.count||null
      j.q.ride_request.child_relation=childRelation(message)||j.q.ride_request.child_relation||false
      j.q.ride_request.raw=String(message||'').trim()
      j.q.ride_request.status='driver agreement required'
    }
    const cd=childDetails(message)
    if(cd.age!==null)j.q.ride_request.child_age=cd.age
    if(cd.height!==null)j.q.ride_request.child_height_cm=cd.height
  }
  if(!ride)return r
  // This is an ancillary request on the transport/removal job, not evidence that the job itself is passenger transport.
  if(oldCat!=='passenger_transport'&&j.category==='passenger_transport')j.category=oldCat
  if(oldCat!=='passenger_transport'){
    j.inventory=(j.inventory||[]).filter(x=>String(x).toLowerCase()!=='passengers')
    j.q.passenger=oldPassenger
  }
  // It is also not lifting assistance.
  j.customer_assistance=j0?.customer_assistance??j.customer_assistance
  if(candidate?.ambiguity&&/travel only|passenger|move themselves|service van/i.test(String(candidate.ambiguity)))r.ambiguity=null
  return r
}

export function review(j){
  const r=base.review(j),rr=j?.q?.ride_request
  if(!rr?.requested)return r
  const risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  let who=rr.count?`${rr.count} passenger${rr.count===1?'':'s'}`:'customer passenger request'
  if(rr.child_relation){
    const bits=[];if(Number.isFinite(rr.child_age))bits.push(`age ${rr.child_age}`);if(Number.isFinite(rr.child_height_cm))bits.push(`${rr.child_height_cm} cm`)
    who+=bits.length?` (child relation: ${bits.join(', ')})`:' (includes daughter/son/child relation; age/height not confirmed)'
  }
  risks.push(`Ride with driver requested: ${who}; not guaranteed or included unless the accepting driver confirms enough proper belted seats and that their insurance/terms permit it`)
  if(rr.child_relation&&(!Number.isFinite(rr.child_age)||!Number.isFinite(rr.child_height_cm)))risks.push('Passenger child-seat check: if the daughter/child is under the normal child-restraint threshold, confirm age/height and the correct restraint before carriage')
  return {...r,quote_risks:[...new Set(risks)]}
}
