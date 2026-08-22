// @ts-nocheck
import * as base from './flow56_release_controller27.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function dedupe(a){const m=new Map;for(const x of a||[])m.set(`${x.n}:${x.name}`,x);return [...m.values()]}
function total(a){return (a||[]).reduce((n,x)=>n+(Number(x.n)||1),0)}
const PURE=/^(?:\d+\s+)?(?:sofa beds?|corner sofas?|sofas?|settees?|armchairs?|chairs?|double beds?|single beds?|beds?|wardrobes?|dining tables?|coffee tables?|bedside tables?|tables?|desks?|chests? of drawers|drawers?|bookcases?|cabinets?|sideboards?|mattresses?|cots?|cribs?|dressers?|benches?|stools?)$/i
function syncInventory(j,list){j.inventory=(j.inventory||[]).filter(x=>!PURE.test(String(x).trim()));for(const x of list)if(!j.inventory.some(v=>String(v).toLowerCase()===x.label.toLowerCase()))j.inventory.push(x.label)}
function separateSofaBed(message){return /\b(?:i\s+meant\s+)?(?:a\s+)?sofa\s+(?:and|plus)\s+(?:a\s+)?separate\s+bed\b|\bsofa\s+(?:and|plus)\s+bed\s+are\s+separate\b/i.test(String(message||''))}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const prevList=Array.isArray(j0?.q?.controller_named_furniture)?structuredClone(j0.q.controller_named_furniture):[]
  const expected=Number(j0?.q?.controller_furniture_count||j0?.q?.controller_furniture_mismatch?.expected||0)||null
  const oldCat=j0?.category,oldType=j0?.job_type
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(['house_move','flat_move'].includes(oldCat)&&j.job_type===oldType&&j.category!==oldCat){
    j.category=oldCat
    for(const k of ['volume','notable','packing','loose_items'])if(f0?.[k]!==undefined)r.f[k]=f0[k]
    r.f.furniture='na'
  }
  if(['house_move','flat_move'].includes(j.category)&&expected&&separateSofaBed(message)){
    let list=prevList.filter(x=>x.name!=='sofa bed')
    list=dedupe([...list,{name:'sofa',n:1,label:'sofa'},{name:'bed',n:1,label:'bed'}])
    j.q??={};j.q.controller_named_furniture=list;syncInventory(j,list)
    const n=total(list)
    if(n===expected){delete j.q.controller_furniture_mismatch;delete j.q.controller_furniture_count;r.f.volume='known'}
    else {j.q.controller_furniture_count=expected;j.q.controller_furniture_mismatch={expected,total:n,items:list};r.f.volume='missing'}
  }
  return r
}
