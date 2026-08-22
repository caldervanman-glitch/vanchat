// @ts-nocheck
import * as base from './flow56_release_controller25.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const NUM={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12}
const PURE=/^(?:\d+\s+)?(?:sofa beds?|corner sofas?|sofas?|settees?|armchairs?|chairs?|double beds?|single beds?|beds?|wardrobes?|dining tables?|coffee tables?|bedside tables?|tables?|desks?|chests? of drawers|drawers?|bookcases?|cabinets?|sideboards?|mattresses?|cots?|cribs?|dressers?|benches?|stools?)$/i
function countExpected(j){const n=Number(j?.q?.controller_furniture_count);return Number.isFinite(n)&&n>0?n:null}
function protect(s){return String(s||'').replace(/\bchest of drawers\b/gi,'chest_of_drawers').replace(/\bsofa bed\b/gi,'sofa_bed').replace(/\bcorner sofa\b/gi,'corner_sofa').replace(/\bdining table\b/gi,'dining_table').replace(/\bcoffee table\b/gi,'coffee_table').replace(/\bbedside table\b/gi,'bedside_table').replace(/\bdouble bed\b/gi,'double_bed').replace(/\bsingle bed\b/gi,'single_bed')}
function parseFurniture(message){
  const s=protect(message),out=[]
  const re=/\b(?:(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?(chest_of_drawers|sofa_bed|corner_sofa|dining_table|coffee_table|bedside_table|double_bed|single_bed|sofas?|settees?|armchairs?|chairs?|beds?|wardrobes?|tables?|desks?|drawers?|bookcases?|cabinets?|sideboards?|mattresses?|cots?|cribs?|dressers?|benches?|stools?)\b/gi
  for(const m of s.matchAll(re)){
    const raw=(m[1]||'').toLowerCase(),n=raw?(Number(raw)||NUM[raw]||1):1
    const name=m[2].replace(/_/g,' ').toLowerCase()
    out.push({name,n,label:n>1?`${n} ${name}`:name})
  }
  return out
}
function total(a){return (a||[]).reduce((n,x)=>n+(Number(x.n)||1),0)}
function dedupe(a){const m=new Map;for(const x of a||[])m.set(`${x.n}:${x.name}`,x);return [...m.values()]}
function syncInventory(j,list){
  j.inventory=(j.inventory||[]).filter(x=>!PURE.test(String(x).trim()))
  for(const x of list){if(!j.inventory.some(v=>String(v).toLowerCase()===x.label.toLowerCase()))j.inventory.push(x.label)}
}
function separateSofaBedCorrection(message,list){
  if(!/\b(?:separate|different)\s+(?:sofa\s+(?:and|plus)\s+bed|bed\s+(?:and|plus)\s+sofa)\b|\bsofa\s+(?:and|plus)\s+(?:a\s+)?separate\s+bed\b/i.test(String(message||'')))return list
  const rest=(list||[]).filter(x=>x.name!=='sofa bed')
  rest.push({name:'sofa',n:1,label:'sofa'},{name:'bed',n:1,label:'bed'})
  return dedupe(rest)
}

export function prompt(o,j,amb=null){
  const m=j?.q?.controller_furniture_mismatch
  if(o==='ask_volume'&&m){
    const names=(m.items||[]).map(x=>x.label).join(', ')
    if(m.total<m.expected)return `You said ${m.expected} furniture items. I can identify ${m.total}${names?`: ${names}`:''}. What ${m.expected-m.total===1?'is the other item':'are the other items'}? If “sofa bed” means a sofa and a separate bed, say that.`
    return `You said ${m.expected} furniture items, but the list appears to contain ${m.total}${names?`: ${names}`:''}. Which count/list should drivers use?`
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  const expected=countExpected(j)
  if(['house_move','flat_move'].includes(j.category)&&expected){
    let current=Array.isArray(j.q.controller_named_furniture)?j.q.controller_named_furniture:[]
    const parsed=parseFurniture(message)
    if(parsed.length)current=dedupe([...current,...parsed])
    current=separateSofaBedCorrection(message,current)
    if(current.length){j.q.controller_named_furniture=current;syncInventory(j,current)}
    const n=total(current)
    if(n!==expected){j.q.controller_furniture_mismatch={expected,total:n,items:current};r.f.volume='missing'}
    else {delete j.q.controller_furniture_mismatch;delete j.q.controller_furniture_count;r.f.volume='known'}
  }
  return r
}
