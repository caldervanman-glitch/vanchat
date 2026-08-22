// @ts-nocheck
export * from './core_release_highvalue.ts'
import * as base from './core_release_highvalue.ts'

const BROAD_GEO=new Set([
  'uk','united kingdom','great britain','britain','england','scotland','wales','northern ireland',
  'london','greater london','yorkshire','west yorkshire','north yorkshire','south yorkshire','east yorkshire','east riding of yorkshire',
  'greater manchester','merseyside','west midlands','east midlands','midlands','north east','north west','south east','south west','east of england',
  'bedfordshire','berkshire','buckinghamshire','cambridgeshire','cheshire','cornwall','cumbria','derbyshire','devon','dorset','county durham',
  'east sussex','essex','gloucestershire','hampshire','herefordshire','hertfordshire','isle of wight','kent','lancashire','leicestershire','lincolnshire',
  'norfolk','northamptonshire','northumberland','nottinghamshire','oxfordshire','rutland','shropshire','somerset','staffordshire','suffolk','surrey',
  'warwickshire','west sussex','wiltshire','worcestershire'
])

const geo=v=>base.canon(v)
export function broadLocation(l){
  if(!l||base.clean(l?.postcode))return false
  return BROAD_GEO.has(geo(l?.town))||BROAD_GEO.has(geo(l?.address_text))
}

export function requirements(j0,prev={}){
  const f=base.requirements(j0,prev)
  // Quote-grade route specificity is an invariant, not a one-controller hint.
  // Later requirements recomputation must never turn a county/region/country
  // label back into a usable collection or delivery endpoint.
  if(broadLocation(j0?.collection))f['collection.location']='missing'
  if(broadLocation(j0?.delivery))f['delivery.location']='missing'
  return f
}

export function nextObjective(j,f){
  // A fresh house/flat opener such as "moving house soon" is more natural if
  // we establish the route first. The reducer sets this flag only for a fresh
  // opener without relative pseudo-locations such as "my house to my nan's".
  // Once the route is complete the flag is cleared and normal quote-grade load
  // ordering resumes.
  if(j?.q?.controller_route_first&&['house_move','flat_move'].includes(j?.category)&&base.known(f,'unusual_time')){
    const c=base.known(f,'collection.location'),d=base.known(f,'delivery.location')
    if(!c&&!d)return 'ask_route'
    if(!c)return 'ask_collection'
    if(!d)return 'ask_delivery'
  }
  return base.nextObjective(j,f)
}
