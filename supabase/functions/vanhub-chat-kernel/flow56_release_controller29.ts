// @ts-nocheck
import * as base from './flow56_release_controller28.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const NUM={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12}
const BROAD=new Set(['uk','united kingdom','great britain','britain','england','scotland','wales','london','greater london','yorkshire','west yorkshire','north yorkshire','south yorkshire','east yorkshire','greater manchester','midlands','north east','north west','south east','south west'])
const canon=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[-_]+/g,' ').replace(/^[\s.!?,;:]+|[\s.!?,;:]+$/g,'').replace(/\s+/g,' ').trim()
const animal=j=>/\b(cat|kitten|dog|puppy|rabbit|guinea pig|bird|parrot|chickens?|animal|pet)\b/i.test([...(j?.inventory||[]),j?.job_type,j?.title].filter(Boolean).join(' '))
const evidencePresent=(ev,m)=>{const e=canon(ev),x=canon(m);return !!e&&x.includes(e)}
const validPlace=v=>{const x=canon(v);return !!x&&!BROAD.has(x)&&!/^(?:near|nearby|local|here|home|my house|my home|my place|from me|to me|down the road|round the corner)$/.test(x)}

function passengerCount(j,r,message){
  if(j?.category!=='passenger_transport')return
  const m=String(message||'').match(/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:people|passengers?|persons?)\b/i)
  if(!m)return
  const raw=m[1].toLowerCase(),n=Number(raw)||NUM[raw]||0
  if(n<1||n>20)return
  j.q??={};j.q.passenger??={count:null,luggage:null,special:null,arrival_deadline:null}
  j.q.passenger.count=n
  r.f['passenger.count']='known'
}

function groundedAnimalRoute(j,r,message,candidate){
  if(!animal(j)||j.category==='passenger_transport')return
  for(const fact of candidate?.facts||[]){
    const k=fact?.k,v=fact?.v,ev=fact?.evidence
    if(!['collection.town','collection.address_text','delivery.town','delivery.address_text','collection.postcode','delivery.postcode'].includes(k))continue
    if(typeof v!=='string'||typeof ev!=='string'||!evidencePresent(ev,message))continue
    if(k.endsWith('.postcode')){
      const code=String(v).trim()
      if(!/^(?:GIR ?0AA|[A-Z]{1,2}\d[A-Z\d]?(?: ?\d[A-Z]{2})?)$/i.test(code)||!canon(message).includes(canon(code)))continue
    }else if(!validPlace(v)||!canon(message).includes(canon(v)))continue
    const [side,key]=k.split('.')
    j[side]??={}
    if(!j[side][key])j[side][key]=v
  }
  if(j.collection?.postcode||validPlace(j.collection?.town)||validPlace(j.collection?.address_text))r.f['collection.location']='known'
  if(j.delivery?.postcode||validPlace(j.delivery?.town)||validPlace(j.delivery?.address_text))r.f['delivery.location']='known'
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  passengerCount(j,r,message)
  groundedAnimalRoute(j,r,message,candidate)
  return r
}
