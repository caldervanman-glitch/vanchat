// @ts-nocheck
import * as base from './flow56_release_controller46.ts'
import {broadLocation,clean} from './core_release_controller47.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function hasEndpoint(l){return !!(clean(l?.postcode)||clean(l?.town)||clean(l?.address_text))}
function freshIntake(j0){
  return !j0?.category&&!(Array.isArray(j0?.inventory)&&j0.inventory.length)&&!hasEndpoint(j0?.collection)&&!hasEndpoint(j0?.delivery)
}
function relativeHouseholdRoute(message){
  const s=String(message||'')
  return /\b(?:my|our)\s+(?:house|home|place)\b|\b(?:my|our)\s+(?:nan'?s?|gran'?s?|grandma'?s?|grandad'?s?|mum'?s?|mom'?s?|dad'?s?|parents?'?|friend'?s?|mate'?s?)\b|\b(?:near me|nearby|down the road|up the road|round the corner|around the corner|close by|not far)\b/i.test(s)
}
function routeComplete(f){return f?.['collection.location']==='known'&&f?.['delivery.location']==='known'}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}

  // Conversation ordering only: never manufacture route/load evidence. A fresh
  // house/flat opener with no relative pseudo-location should establish the
  // route before asking for the inventory. Relative household wording remains
  // on the normal load-first path because it supplied no quote-grade endpoint.
  if(freshIntake(j0)&&['house_move','flat_move'].includes(j?.category)&&!relativeHouseholdRoute(message)){
    j.q.controller_route_first=true
  }

  // Do not recompute the whole requirements map here. Earlier controllers hold
  // quote-grade guards (for example "full house" / "van full" remains missing)
  // that a generic recomputation would erase. Only reassert the final route
  // specificity invariant that later controllers are capable of overwriting.
  if(broadLocation(j.collection))r.f['collection.location']='missing'
  if(broadLocation(j.delivery))r.f['delivery.location']='missing'

  if(j.q.controller_route_first&&routeComplete(r.f))delete j.q.controller_route_first
  return r
}
