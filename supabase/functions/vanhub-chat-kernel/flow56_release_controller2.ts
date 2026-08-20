// @ts-nocheck
import * as base from './flow56_release_controller.ts'
import {canon,clean} from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/fdacff5e91c4615d98feb13e9d72e60acf533b0f/supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const BROAD_GEO=new Set([
  'uk','united kingdom','great britain','britain','england','scotland','wales','northern ireland',
  'london','greater london','yorkshire','west yorkshire','north yorkshire','south yorkshire','east yorkshire','east riding of yorkshire',
  'greater manchester','merseyside','west midlands','east midlands','midlands','north east','north west','south east','south west','east of england',
  'bedfordshire','berkshire','buckinghamshire','cambridgeshire','cheshire','cornwall','cumbria','derbyshire','devon','dorset','county durham',
  'east sussex','essex','gloucestershire','hampshire','herefordshire','hertfordshire','isle of wight','kent','lancashire','leicestershire','lincolnshire',
  'norfolk','northamptonshire','northumberland','nottinghamshire','oxfordshire','rutland','shropshire','somerset','staffordshire','suffolk','surrey',
  'warwickshire','west sussex','wiltshire','worcestershire'
])
const broad=l=>!clean(l?.postcode)&&BROAD_GEO.has(canon(l?.town||l?.address_text))

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  if(broad(r.j?.collection))r.f['collection.location']='missing'
  if(broad(r.j?.delivery))r.f['delivery.location']='missing'
  return r
}
