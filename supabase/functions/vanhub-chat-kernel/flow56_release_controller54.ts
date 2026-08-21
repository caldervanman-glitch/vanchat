// @ts-nocheck
import * as base from './flow56_release_controller53.ts'
import {quoteGradeLocation} from './core_release_controller49.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VEHICLE_CATS=new Set(['motorbike_transport','vehicle_transport'])
function norm(v){return String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function endpointValue(l){return String(l?.town||l?.postcode||l?.address_text||'').trim()}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!VEHICLE_CATS.has(j?.category))return r

  const msg=norm(message)
  for(const fact of candidate?.facts||[]){
    if(fact?.k!=='specialist.site_access'||fact?.kind!=='operational')continue
    const place=String(fact?.v||'').trim()
    if(!place||/\s+to\s+/i.test(place)||!quoteGradeLocation({town:place}))continue
    const evidence=String(fact?.evidence||'').trim()
    if(!msg.includes(norm(place)))continue
    if(evidence&&!msg.includes(norm(evidence)))continue
    const proof=norm(evidence||message)

    const delivery=endpointValue(j?.delivery)
    if(r.f?.['collection.location']!=='known'&&delivery&&quoteGradeLocation(j.delivery)){
      if(proof.includes(`${norm(place)} to ${norm(delivery)}`)||msg.includes(`${norm(place)} to ${norm(delivery)}`)){
        j.collection??={}
        if(!j.collection.postcode&&!j.collection.town&&!j.collection.address_text){
          j.collection.town=place
          r.f['collection.location']='known'
        }
      }
    }

    const collection=endpointValue(j?.collection)
    if(r.f?.['delivery.location']!=='known'&&collection&&quoteGradeLocation(j.collection)){
      if(proof.includes(`${norm(collection)} to ${norm(place)}`)||msg.includes(`${norm(collection)} to ${norm(place)}`)){
        j.delivery??={}
        if(!j.delivery.postcode&&!j.delivery.town&&!j.delivery.address_text){
          j.delivery.town=place
          r.f['delivery.location']='known'
        }
      }
    }
  }
  return r
}
