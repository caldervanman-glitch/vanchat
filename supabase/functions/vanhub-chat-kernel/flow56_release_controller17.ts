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
function answer(){return 'Possibly — but travelling in the driver\'s van is not automatically included. The driver must agree, the van must have suitable legal passenger seating and seat belts, and the driver must be happy that their insurance/terms allow it. If your daughter or other passenger is a child, tell me their age/height because a suitable child restraint may also be required. I\'ll record the passenger request for the driver rather than assume it is included.'}

export function faq(message){
  if(rideRequest(message))return answer()
  return base.faq(message)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const ride=rideRequest(message)
  const oldCat=j0?.category||null,oldPassenger=structuredClone(j0?.q?.passenger||{count:null,luggage:null,special:null,arrival_deadline:null})
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!ride)return r
  j.q??={};j.q.ride_request??={}
  j.q.ride_request.requested=true
  j.q.ride_request.count=countPeople(message)||j.q.ride_request.count||null
  j.q.ride_request.child_relation=childRelation(message)||j.q.ride_request.child_relation||false
  j.q.ride_request.raw=String(message||'').trim()
  j.q.ride_request.status='driver agreement required'
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
  if(rr.child_relation)who+=' (includes daughter/son/child relation — confirm age/height if a child)'
  risks.push(`Ride with driver requested: ${who}; not guaranteed or included unless the accepting driver confirms suitable seating/seat belts and that their insurance/terms permit it`)
  return {...r,quote_risks:[...new Set(risks)]}
}
