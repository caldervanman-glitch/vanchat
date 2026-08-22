// @ts-nocheck
import * as base from './flow56_release_controller26.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const NUM={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10}
const PURE=/^(?:\d+\s+)?(?:sofa beds?|corner sofas?|sofas?|settees?|armchairs?|chairs?|double beds?|single beds?|beds?|wardrobes?|dining tables?|coffee tables?|bedside tables?|tables?|desks?|chests? of drawers|drawers?|bookcases?|cabinets?|sideboards?|mattresses?|cots?|cribs?|dressers?|benches?|stools?)$/i
function protect(s){return String(s||'').replace(/\bchest of drawers\b/gi,'chest_of_drawers').replace(/\bsofa bed\b/gi,'sofa_bed').replace(/\bcorner sofa\b/gi,'corner_sofa').replace(/\bdining table\b/gi,'dining_table').replace(/\bcoffee table\b/gi,'coffee_table').replace(/\bbedside table\b/gi,'bedside_table').replace(/\bdouble bed\b/gi,'double_bed').replace(/\bsingle bed\b/gi,'single_bed')}
function parseFurniture(message){
  const s=protect(message),out=[]
  const re=/\b(?:(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?(chest_of_drawers|sofa_bed|corner_sofa|dining_table|coffee_table|bedside_table|double_bed|single_bed|sofas?|settees?|armchairs?|chairs?|beds?|wardrobes?|tables?|desks?|drawers?|bookcases?|cabinets?|sideboards?|mattresses?|cots?|cribs?|dressers?|benches?|stools?)\b/gi
  for(const m of s.matchAll(re)){const raw=(m[1]||'').toLowerCase(),n=raw?(Number(raw)||NUM[raw]||1):1,name=m[2].replace(/_/g,' ').toLowerCase();out.push({name,n,label:n>1?`${n} ${name}`:name})}
  return out
}
function dedupe(a){const m=new Map;for(const x of a||[])m.set(`${x.n}:${x.name}`,x);return [...m.values()]}
function total(a){return (a||[]).reduce((n,x)=>n+(Number(x.n)||1),0)}
function syncInventory(j,list){j.inventory=(j.inventory||[]).filter(x=>!PURE.test(String(x).trim()));for(const x of list)if(!j.inventory.some(v=>String(v).toLowerCase()===x.label.toLowerCase()))j.inventory.push(x.label)}
function sofaBedCorrection(message,list){
  if(!/\b(?:sofa\s+(?:and|plus)\s+(?:a\s+)?separate\s+bed|separate\s+sofa\s+(?:and|plus)\s+bed|sofa\s+(?:and|plus)\s+bed\s+are\s+separate)\b/i.test(String(message||'')))return list
  const rest=(list||[]).filter(x=>x.name!=='sofa bed');rest.push({name:'sofa',n:1,label:'sofa'},{name:'bed',n:1,label:'bed'});return dedupe(rest)
}
function expectedFrom(j0,j){const vals=[j?.q?.controller_furniture_count,j?.q?.controller_furniture_mismatch?.expected,j0?.q?.controller_furniture_count,j0?.q?.controller_furniture_mismatch?.expected];for(const v of vals){const n=Number(v);if(Number.isFinite(n)&&n>0)return n}return null}

export function prompt(o,j,amb=null){
  const m=j?.q?.controller_furniture_mismatch
  if(o==='ask_volume'&&m){
    const names=(m.items||[]).map(x=>x.label).join(', ')
    if(m.total===0)return `What are the ${m.expected} furniture items? Please list the main pieces — for example sofa, bed, wardrobe, table or chairs. I already have the box/bag quantity.`
    if(m.total<m.expected)return `You said ${m.expected} furniture items. I can identify ${m.total}: ${names}. What ${m.expected-m.total===1?'is the other item':'are the other items'}? If “sofa bed” means a sofa and a separate bed, say that.`
    return `You said ${m.expected} furniture items, but I can identify ${m.total}: ${names}. Which count/list should drivers use?`
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const prevList=Array.isArray(j0?.q?.controller_named_furniture)?structuredClone(j0.q.controller_named_furniture):[]
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={};const expected=expectedFrom(j0,j)
  if(['house_move','flat_move'].includes(j.category)&&expected){
    let list=prevList
    const parsed=parseFurniture(message);if(parsed.length)list=dedupe([...list,...parsed])
    list=sofaBedCorrection(message,list)
    j.q.controller_furniture_count=expected
    if(list.length){j.q.controller_named_furniture=list;syncInventory(j,list)}
    const n=total(list)
    if(n!==expected){j.q.controller_furniture_mismatch={expected,total:n,items:list};r.f.volume='missing'}
    else {delete j.q.controller_furniture_mismatch;delete j.q.controller_furniture_count;r.f.volume='known'}
  }
  return r
}
