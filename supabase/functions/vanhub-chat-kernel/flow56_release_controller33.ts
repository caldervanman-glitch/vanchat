// @ts-nocheck
import * as base from './flow56_release_controller32.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_ITEM=/^(?:multiple\s+(?:items|pieces)(?:\s+of\s+furniture)?|some\s+furniture|some\s+sofas?|a\s+few\s+boxes|some\s+boxes|boxes|bags|furniture|items|things|stuff|bits\s+and\s+pieces|(?:a\s+)?van\s*load)$/i
const SPECIFIC_ITEM=/\b(?:sofas?|armchairs?|wardrobes?|beds?|mattresses?|tables?|chairs?|drawers?|dressers?|bookcases?|desks?|fridges?|freezers?|washing machines?|dishwashers?|pianos?|safes?|tvs?|televisions?|cabinets?|sideboards?)\b/i
const CONTAINER_COUNT=/\b\d+(?:\s*(?:-|to)\s*\d+)?\s*(?:boxes?|bags?|crates?)\b/i
const FURNITURE_NOUN=/\b(?:wardrobe|bed|table|sofa|cabinet|bookcase|desk|fridge|freezer|dresser|drawers|sideboard)\b/i
const DISASSEMBLED=/\b(?:already\s+)?(?:dismantled|disassembled|taken\s+apart)\b/i
const PARTS=/\b(?:panels?|sections?|pieces?)\b/i

function literalInMessage(v,message){const a=canon(v),b=canon(message);return !!a&&!!b&&b.includes(a)}
function esc(v){return String(v||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function literalContainerCount(message,num,noun){
  const n=canon(noun).replace(/s$/,'')
  const nounRe=n==='box'?'box(?:es)?':n==='bag'?'bag(?:s)?':n==='crate'?'crate(?:s)?':null
  if(!nounRe)return false
  const numRe=esc(canon(num)).replace(/\s+/g,'\\s*')
  return new RegExp(`(?:^|\\b)${numRe}\\s*${nounRe}\\b`,'i').test(canon(message))
}
function mergeInventory(j,candidate,message,j0,obj){
  j.inventory=Array.isArray(j.inventory)?j.inventory:[]
  const prior=Array.isArray(j0?.inventory)?j0.inventory:[]
  const priorGeneric=prior.length===1&&/^(?:boxes?|bags?)$/i.test(String(prior[0]||'').trim())?canon(prior[0]):null
  for(const x of candidate?.inventory_add||[]){
    if(!x||!['operational','approximate','correction'].includes(x.kind))continue
    const value=clean(x.value),ev=clean(x.evidence);if(!value||!ev)continue
    let grounded=literalInMessage(value,message)
    if(!grounded&&obj==='clarify_load'&&priorGeneric&&x.kind==='approximate'){
      const noun=(canon(value).match(/\b(box(?:es)?|bag(?:s)?|crate(?:s)?)\b/)||[])[1]
      const num=(canon(value).match(/\b\d+(?:\s*(?:-|to)\s*\d+)?\b/)||[])[0]
      grounded=!!noun&&!!num&&canon(noun).startsWith(priorGeneric.replace(/s$/,''))&&literalContainerCount(message,num,noun)
    }
    if(!grounded)continue
    const cv=canon(value);let idx=j.inventory.findIndex(z=>canon(z)===cv);if(idx>=0)continue
    idx=j.inventory.findIndex(z=>{const c=canon(z);return c&&cv.includes(c)&&cv.length>c.length})
    if(idx>=0)j.inventory[idx]=value;else j.inventory.push(value)
  }
  const seen=new Set();j.inventory=j.inventory.filter(x=>{const c=canon(x);if(!c||seen.has(c))return false;seen.add(c);return true})
}
function vagueOnlyInventory(j){const a=Array.isArray(j?.inventory)?j.inventory.filter(clean):[];return !a.length||a.every(x=>VAGUE_ITEM.test(canon(x)))}
function quoteGradeHouseLoad(j){
  const inv=(j?.inventory||[]).map(x=>String(x||'').trim()).filter(x=>x&&!VAGUE_ITEM.test(canon(x)))
  const named=inv.filter(x=>SPECIFIC_ITEM.test(x)).length
  const containers=inv.some(x=>CONTAINER_COUNT.test(x))
  return named>=2||(named>=1&&containers)
}
function candidateHasLoad(candidate){return (candidate?.inventory_add||[]).length>0||(candidate?.facts||[]).some(x=>x?.k==='house_volume')}
function protectHouseVolume(j,j0,message,obj,candidate){
  if(!['house_move','flat_move'].includes(j?.category))return
  if(obj==='ask_volume'&&!candidateHasLoad(candidate)){
    const baseChanged=clean(j?.q?.house_volume)!==clean(j0?.q?.house_volume)
    if(baseChanged)j.q.house_volume=j0?.q?.house_volume??null
  }
}
function decontaminateFurniturePanels(j,j0,message,candidate){
  const context=[message,...(j0?.inventory||[]),...(j?.inventory||[])].join(' ')
  if(candidate?.category!=='furniture_move'||!FURNITURE_NOUN.test(context)||!DISASSEMBLED.test(message)||!PARTS.test(message))return
  if(j.q?.materials)delete j.q.materials
  j.category='furniture_move'
  j.q??={}
  j.q.dismantling_mode='already_dismantled'
  j.dismantling_required=false
  const note=`Already dismantled furniture: ${String(message||'').trim()}`
  if(!String(j.additional_notes||'').includes(note))j.additional_notes=[clean(j.additional_notes),note].filter(Boolean).join('; ')
}
function applyQuoteGradeStatuses(j,r){
  r.f=requirements(j,r.f)
  if(vagueOnlyInventory(j)){
    r.f.inventory='missing'
    if(j.category==='furniture_move')r.f.furniture='missing'
  }
  if(['house_move','flat_move'].includes(j.category))r.f.volume=quoteGradeHouseLoad(j)?'known':'missing'
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  mergeInventory(j,candidate,message,j0,obj)
  protectHouseVolume(j,j0,message,obj,candidate)
  decontaminateFurniturePanels(j,j0,message,candidate)
  applyQuoteGradeStatuses(j,r)
  return r
}
