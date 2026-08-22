// @ts-nocheck
import * as base from './flow56_release_controller24.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const NUM={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12}
function motorbike(j){return /\b(?:motorbike|motorcycle|scooter)\b/i.test([...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.job_type].filter(Boolean).join(' '))}
function primitiveKnown(v){return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v?.[k]))}
function impaired(v){return ['rolls','steers','brakes'].some(k=>v?.[k]==='no')}
function toolPlan(message){
  const s=String(message||'')
  const tools=[...s.matchAll(/\b(winch|wheel skates?|forklift|ramp|tail lift|crane)\b/ig)].map(m=>m[1].toLowerCase())
  return tools.length?[...new Set(tools)].join(' and '):null
}
function furnitureCount(text){
  const s=String(text||'').toLowerCase()
  const m=s.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:items?|pieces?)\s+of\s+furniture\b|\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+furniture\s+items?\b/i)
  if(!m)return null;const x=(m[1]||m[2]).toLowerCase();return Number(x)||NUM[x]||null
}
const FURN='sofas?|settees?|armchairs?|chairs?|beds?|wardrobes?|tables?|desks?|drawers?|chests? of drawers|bookcases?|shelving|cabinets?|sideboards?|mattresses?|cots?|cribs?|dressers?|benches?|stools?'
function namedFurnitureCount(j){
  const s=(j?.inventory||[]).join(' ').toLowerCase();let total=0
  const re=new RegExp(`(?:\\b(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s+)?\\b(${FURN})\\b`,'gi')
  for(const m of s.matchAll(re)){const x=(m[1]||'').toLowerCase();total+=x?(Number(x)||NUM[x]||1):1}
  return total
}
function volumeText(j){return [j?.q?.house_volume,...(j?.inventory||[])].filter(Boolean).join(' ')}

export function prompt(o,j,amb=null){
  if(o==='ask_volume'&&j?.q?.controller_furniture_count){
    const n=j.q.controller_furniture_count
    return `What are the ${n} furniture items? Please list the main pieces — for example sofa, bed, wardrobe, table or chairs. I already have the box/bag quantity.`
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={};j.q.vehicle??={}
  if(motorbike(j)&&primitiveKnown(j.q.vehicle)&&impaired(j.q.vehicle)&&!String(j.q.vehicle.loading||'').trim()){
    const p=toolPlan(message)
    if(p){j.q.vehicle.loading=p;r.f['vehicle.condition']='known'}
  }
  if(['house_move','flat_move'].includes(j.category)){
    const n=furnitureCount(volumeText(j))
    if(n&&namedFurnitureCount(j)<n){j.q.controller_furniture_count=n;r.f.volume='missing'}
    else delete j.q.controller_furniture_count
  }
  return r
}
