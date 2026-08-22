// @ts-nocheck
export * from './core_release_controller51.ts'
import * as base from './core_release_controller51.ts'

const HOUSE=new Set(['house_move','flat_move'])
const CONTAINER_ITEM=/\b(?:boxes?|bags?|crates?|cartons?|containers?)\b/i
const CONTAINER=/\b(?:about|around|roughly|approx(?:imately)?)?\s*\d+\s+(?:(?:loose|black|bin|carrier|packed|sealed|tied)\s+){0,3}(?:boxes?|bags?|crates?|cartons?|containers?)\b/i
const NO_CONTAINER=/\b(?:no|zero|none)\s+(?:boxes?|bags?|crates?|cartons?|containers?)\b/i
function arr(v){return Array.isArray(v)?v:[]}
function majorItems(j){return arr(j?.inventory).filter(x=>!CONTAINER_ITEM.test(String(x))&&!base.vague(x))}
function containerKnown(j){
  const text=[...arr(j?.inventory),j?.q?.house_volume,j?.q?.packing,j?.additional_notes].filter(Boolean).join(' ')
  return CONTAINER.test(text)||NO_CONTAINER.test(text)||j?.q?.controller_no_containers===true
}
function suspiciouslySmall(j){
  const b=Number(j?.q?.controller_bedrooms)||0,m=majorItems(j).length
  return (b>=4&&m<6)||(b===3&&m<5)||(b===2&&m<3)
}
export function houseLoadReady(j){
  if(!HOUSE.has(j?.category)||j?.q?.controller_accuracy_gate!==true)return base.houseLoadReady(j)
  if(j?.q?.controller_inventory_complete!==true)return false
  if(!containerKnown(j))return false
  if(majorItems(j).length<2)return false
  if(suspiciouslySmall(j)&&j?.q?.controller_underload_confirmed!==true)return false
  return true
}
export function requirements(j0,prev={}){
  const f=base.requirements(j0,prev)
  if(HOUSE.has(j0?.category)&&j0?.q?.controller_accuracy_gate===true)f.volume=houseLoadReady(j0)?'known':'missing'
  return f
}
