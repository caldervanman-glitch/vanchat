// @ts-nocheck
export * from './core_release_controller50.ts'
import * as base from './core_release_controller50.ts'

const HOUSE=new Set(['house_move','flat_move'])
const GOODS=new Set(['house_move','flat_move','single_item','furniture_move','business_delivery','courier','urgent_delivery','equipment_transport','event_transport','motorbike_transport','vehicle_transport','other_transport','waste_transport'])
const CONTAINER=/\b\d+\s*(?:boxes?|bags?|crates?|cartons?|containers?)\b/i
const NO_CONTAINER=/\b(?:no|zero|none)\s+(?:boxes?|bags?|crates?|cartons?|containers?)\b/i
const CONTAINER_ITEM=/\b(?:boxes?|bags?|crates?|cartons?|containers?)\b/i

function arr(v){return Array.isArray(v)?v:[]}
function majorItems(j){return arr(j?.inventory).filter(x=>!CONTAINER_ITEM.test(String(x))&&!base.vague(x))}
function containerKnown(j){
  const text=[...arr(j?.inventory),j?.q?.house_volume,j?.q?.packing,j?.additional_notes].filter(Boolean).join(' ')
  return CONTAINER.test(text)||NO_CONTAINER.test(text)||j?.q?.controller_no_containers===true
}
function bedroomCount(j){const n=Number(j?.q?.controller_bedrooms);return Number.isFinite(n)&&n>0?n:null}
function suspiciouslySmall(j){
  const b=bedroomCount(j),m=majorItems(j).length
  if(!b)return false
  if(b>=4)return m<6
  if(b===3)return m<5
  if(b===2)return m<3
  return false
}
export function houseLoadReady(j){
  if(!HOUSE.has(j?.category))return true
  if(j?.q?.controller_accuracy_gate!==true)return base.volumeKnown(j)
  if(j?.q?.controller_inventory_complete!==true)return false
  if(!containerKnown(j))return false
  if(majorItems(j).length<2)return false
  if(suspiciouslySmall(j)&&j?.q?.controller_underload_confirmed!==true)return false
  return true
}
function unusualGoodsTime(j){
  if(!GOODS.has(j?.category))return false
  const h=base.hour(j?.date?.time_preference)
  return h!=null&&(h>=21||h<6)
}

export function requirements(j0,prev={}){
  const f=base.requirements(j0,prev)
  if(HOUSE.has(j0?.category)&&j0?.q?.controller_accuracy_gate===true)f.volume=houseLoadReady(j0)?'known':'missing'
  if(unusualGoodsTime(j0))f.unusual_time=j0?.q?.unusual_time_confirmed===true?'known':'missing'
  return f
}

export function nextObjective(j,f){
  if(f?.unusual_time==='missing')return 'confirm_unusual_time'
  return base.nextObjective(j,f)
}
