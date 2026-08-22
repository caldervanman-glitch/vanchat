// @ts-nocheck
import * as base from './flow56_release_controller74.ts'
import * as core from './core_release_controller51.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const review=base.review

const HOUSE=new Set(['house_move','flat_move'])
const BIKE=/\b(?:motorbike|motorcycle|scooter|moped)\b/i
const INJECTION=/\b(?:ignore|disregard|forget)\b.{0,40}\b(?:rules?|instructions?|questions?)\b|\bmark\b.{0,30}\bready for review\b|\bskip (?:the )?(?:normal )?questions?\b|\bdo not ask (?:any )?more questions?\b/i
const VAGUE_HELP=/\b(?:loads?|lots?|plenty) of (?:us|people|mates?|friends?|family)?(?:\s+there)?\s*(?:help(?:ing)?|to help)\b|\b(?:loads?|lots?) of us(?: there)? helping\b/i
const PLUMBING=/\b(?:washing machine|washer|dishwasher)\b/i
const PLUMBING_ASSUMPTION=/\b(?:still connected|(?:your|the|a)?\s*driver (?:can|will|should|could|just|is expected to)\s+(?:disconnect|unplumb|reconnect|replumb|plumb)|disconnect it|reconnect it|unplumb|replumb|plumb it(?: back in)?|seller says|expect(?:ing)? (?:the|your)?\s*driver)\b/i
const COMPLETE_LOAD=/\b(?:that(?:'s| is) (?:everything|all)|this is everything|nothing else(?: is going)?|that is the lot|that's the lot|complete (?:load|list)|only (?:those|these) items|those are all the items|that is genuinely everything|genuinely everything)\b/i
const NO_CONTAINERS=/\b(?:no|zero|none)\s+(?:boxes?|bags?|crates?|cartons?|containers?)\b/i
const UNDERLOAD_CONFIRM=/\b(?:mostly empty|genuinely everything|that(?:'s| is) everything|nothing else|yes[, ]+that(?:'s| is) all|only those items|only these items)\b/i
const FLEX_TIME=/\b(?:timing (?:is )?flexible|any\s*time|anytime|no (?:time )?preference|whenever|flexible(?: any time)?)\b/i
const YES_CONFIRM=/\b(?:yes|yeah|yep|correct|exactly|that's right|that is right|definitely)\b/i
const STRONG_ACCESS=/\b(?:stairs?|steps?|floor|lift|elevator|parking|park(?:ing)?|carry|roadworks?|loading bay|double yellow|single yellow|permit|doorway|entrance|property access|long carry)\b/i
const FURN_DIM=/\b(?:wardrobe|cabinet|dresser|table|bed|sofa)\b.{0,60}\b(?:\d+(?:\.\d+)?\s*(?:m|metres?|meters?|cm|centimetres?|centimeters?|ft|feet)|(?:three|four|five|six|3|4|5|6)[ -]?doors?)\b|\b(?:three|four|five|six|3|4|5|6)[ -]?doors?\b.{0,40}\b(?:wardrobe|cabinet)\b/i
const PLAUSIBLE_DISMANTLE=/\b(?:wardrobes?|bed frames?|beds?|bunk beds?|cots?|cribs?|dining tables?|large tables?|desks?|bookcases?|shelving units?|corner sofas?|sectional sofas?)\b/i
const SOFA_BED=/\bsofa beds?\b/i
const ACCESS_FIELDS=['floor','stairs','lift','parking','internal_stairs','external_steps','carry_distance','access_notes']
const NUMBER_WORD='(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten)'
const ITEM_PATTERNS=[
  new RegExp(`\\b${NUMBER_WORD}\\s+(?:sofa beds?|corner sofas?|sofas?)\\b`,'gi'),
  /\b(?:a|an|one)\s+(?:sofa bed|corner sofa|sofa)\b/gi,
  new RegExp(`\\b${NUMBER_WORD}\\s+wardrobes?\\b`,'gi'),
  /\b(?:a|an|one)\s+wardrobe\b/gi,
  new RegExp(`\\b${NUMBER_WORD}\\s+beds?\\b(?!\\s+(?:house|flat|home|property))`,'gi'),
  /\b(?:a|an|one)\s+bed\b(?!\s+(?:house|flat|home|property))/gi,
  new RegExp(`\\b${NUMBER_WORD}\\s+mattresses?\\b`,'gi'),
  /\b(?:dining table|dining tables|table|tables)\b/gi,
  /\b(?:washing machine|washing machines|washer|dishwasher|dishwashers)\b/gi,
  /\b(?:fridge freezer|fridge freezers|american fridge freezer|fridge|freezer)\b/gi,
  /\b(?:upright piano|baby grand piano|grand piano|digital piano|piano)\b/gi,
  /\b(?:chest of drawers|chests of drawers|drawers|dresser|dressers|sideboard|sideboards|bookcase|bookcases|desk|desks|armchair|armchairs|tv|television|televisions)\b/gi,
  new RegExp(`\\b(?:(?:about|around|roughly|approx(?:imately)?)\\s+)?${NUMBER_WORD}\\s+(?:loose\\s+)?(?:boxes?|bags?|crates?|cartons?)\\b`,'gi'),
]

const clean=v=>core.clean(v)
const norm=v=>core.canon(v)
function arr(v){return Array.isArray(v)?v:[]}
function quote(v){return String(v||'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,320)}
function ded(a){return core.ded(a)}
function pushDriverNote(j,text){
  const t=clean(text);if(!t)return
  j.q??={};j.q.driver_notes=arr(j.q.driver_notes)
  if(!j.q.driver_notes.some(x=>norm(x)===norm(t)))j.q.driver_notes.push(t)
}
function phrasePresent(hay,needle){
  const h=norm(hay).split(/[^a-z0-9]+/).filter(Boolean),n=norm(needle).split(/[^a-z0-9]+/).filter(Boolean)
  if(!n.length||n.length>h.length)return false
  outer:for(let i=0;i<=h.length-n.length;i++){for(let k=0;k<n.length;k++)if(h[i+k]!==n[k])continue outer;return true}
  return false
}
function usefulBikeIdentity(v){
  const s=norm(v);if(!s)return false
  const compact=s.replace(/\s+/g,'')
  if(/^(?=.*[a-z])(?=.*\d)[a-z0-9-]{4,}$/i.test(compact)&&!/^\d+cc$/i.test(compact))return true
  const junk=new Set(['a','an','the','my','our','got','have','has','bike','motorbike','motorcycle','scooter','moped','vehicle','make','model','it','does','not','run','runs','rolls','steers','brakes','no','leaks','fuel','oil'])
  const tokens=s.split(/[^a-z0-9-]+/).filter(Boolean).filter(x=>!junk.has(x)&&!/^\d+cc$/.test(x)&&x!=='cc')
  return tokens.length>=2
}
function bikePresent(j,message){return BIKE.test(String(message||''))||BIKE.test([...arr(j?.inventory),...arr(j?.heavy_or_awkward_items),j?.q?.notable].filter(Boolean).join(' '))}
function bikeConditionKnown(j){const v=j?.q?.vehicle||{};return ['runs','rolls','steers','brakes','fuel_leak'].every(k=>['yes','no'].includes(v[k]))}
function propertyScale(message){
  const m=String(message||'').match(/\b(\d+|one|two|three|four|five|six)\s*(?:bed|bedroom)s?\s+(?:house|flat|home|property)\b/i)
  if(!m)return null
  const words={one:1,two:2,three:3,four:4,five:5,six:6}
  return {text:quote(m[0]),count:Number(m[1])||words[String(m[1]).toLowerCase()]||null}
}
function fallbackInventory(message){
  const out=[]
  for(const re of ITEM_PATTERNS){re.lastIndex=0;for(const m of String(message||'').matchAll(re)){const v=quote(m[0]);if(v)out.push(v)}}
  return ded(out)
}
function mainItems(j){return arr(j?.inventory).filter(x=>!/\b(?:boxes?|bags?|crates?|cartons?|containers?)\b/i.test(String(x))&&!core.vague(x))}
function knownInventorySummary(j){return arr(j?.inventory).filter(x=>!core.vague(x)).slice(0,9).join(', ')}
function extractRoute(message){
  const m=String(message||'').match(/\bfrom\s+([A-Za-z][A-Za-z' .-]{1,40}?)\s+to\s+([A-Za-z][A-Za-z' .-]{1,40}?)(?=\s+(?:today|tomorrow|tonight|next|this|any|on|at|around|with|there|for|and\b)|[,.!?;]|$)/i)
  if(!m)return null
  const collection=quote(m[1]),delivery=quote(m[2])
  if(!core.quoteGradeLocation?.({town:collection})||!core.quoteGradeLocation?.({town:delivery}))return null
  return {collection,delivery}
}
function explicitAssembly(message,j){
  const s=String(message||'')
  const driver=/(?:driver|movers?|removal team).{0,45}(?:dismantl|disassembl|take(?:n)? apart)|(?:dismantl|disassembl|take(?:n)? apart).{0,45}(?:by|for|allow for) (?:the )?(?:driver|movers?|removal team)|(?:need|needs|require|required).{0,35}(?:dismantl|disassembl).{0,35}(?:driver|movers?)/i.test(s)||/\bdriver should allow for dismantling\b/i.test(s)
  const customer=/(?:i|we|customer|seller).{0,35}(?:will|can|shall|going to).{0,20}(?:dismantl|disassembl|take apart)/i.test(s)
  const already=/\b(?:already (?:apart|dismantled|disassembled)|beds? are already apart|already taken apart)\b/i.test(s)
  if(driver){j.q.dismantling_mode='driver';j.dismantling_required=true}
  else if(customer){j.q.dismantling_mode='customer';j.dismantling_required=false}
  else if(already&&!clean(j.q.dismantling_mode)){j.q.dismantling_mode='already_dismantled';j.dismantling_required=false}
  const reassemblyYes=/(?:reassembl|put (?:it|them) back together).{0,35}(?:driver|movers?|removal team)|(?:driver|movers?|removal team).{0,35}(?:reassembl|put (?:it|them) back together)|\b(?:dismantl\w*\s+and\s+reassembl\w*).{0,35}(?:by|for) (?:the )?(?:driver|movers?)/i.test(s)
  const reassemblyNo=/\b(?:no reassembly|do not need (?:it|them) reassembled|won't need (?:it|them) reassembled|will not need (?:it|them) reassembled)\b/i.test(s)
  if(reassemblyYes)j.reassembly_required=true
  else if(reassemblyNo)j.reassembly_required=false
  if(driver||customer||already||reassemblyYes||reassemblyNo)pushDriverNote(j,`Customer dismantling/reassembly statement: "${quote(message)}".`)
}
function plausibleDismantle(j){return arr(j?.inventory).some(x=>{const s=String(x||'');if(SOFA_BED.test(s))return false;return PLAUSIBLE_DISMANTLE.test(s)})}
function furnitureDetail(message){
  const s=String(message||'')
  const door=s.match(/\b(?:three|four|five|six|3|4|5|6)[ -]?door(?:s)?(?:\s+wide)?\b/i)
  const dims=[...s.matchAll(/\b\d+(?:\.\d+)?\s*(?:m|metres?|meters?|cm|centimetres?|centimeters?|ft|feet)\b/gi)].map(x=>x[0])
  if(!door&&!dims.length)return null
  return quote([door?.[0],...dims].filter(Boolean).join(', '))
}
function clearFalseFurnitureAccess(j,j0,message,obj){
  if(obj!=='ask_furniture'||!FURN_DIM.test(String(message||''))||STRONG_ACCESS.test(String(message||'')))return
  for(const side of ['collection','delivery'])for(const k of ACCESS_FIELDS)j[side][k]=structuredClone(j0?.[side]?.[k]??null)
  const prior=new Set(arr(j0?.q?.driver_notes).map(norm))
  j.q.driver_notes=arr(j.q.driver_notes).filter(n=>prior.has(norm(n))||!/Customer access statement:/i.test(String(n)))
}
function stopSegments(message,stops){
  const segs=String(message||'').split(/[.;]+/).map(x=>x.trim()).filter(Boolean),out={}
  for(const stop of stops){const hit=segs.filter(s=>phrasePresent(s,stop)&&STRONG_ACCESS.test(s));if(hit.length)out[stop]=quote(hit.join('; '))}
  return out
}
function syncMultiStopAccess(j,j0,message){
  const ms=j?.q?.multi_stop||{},stops=ded([...arr(ms.collections),...arr(ms.deliveries)])
  if(stops.length<3)return
  const notes=stopSegments(message,stops)
  if(!Object.keys(notes).length)return
  j.q.multi_stop_access={...(j0?.q?.multi_stop_access||{}),...(j.q.multi_stop_access||{}),...notes}
  for(const [stop,note] of Object.entries(notes))pushDriverNote(j,`Stop-specific access — ${stop}: "${note}".`)
  const primary=[clean(j?.collection?.town),clean(j?.delivery?.town)].filter(Boolean)
  const intermediate=stops.filter(s=>!primary.some(p=>norm(p)===norm(s)))
  const fieldTerms={stairs:/\bstairs?\b/i,internal_stairs:/\bstairs?\b/i,lift:/\blift\b/i,floor:/\bfloor\b/i,parking:/\bpark(?:ing)?\b/i,carry_distance:/\bcarry|\b\d+\s*(?:m|metres?|meters?|yards?|ft|feet)\b/i,external_steps:/\bsteps?\b/i}
  for(const side of ['collection','delivery']){
    const p=clean(j?.[side]?.town);if(!p)continue
    const pnote=notes[p]||''
    for(const [field,re] of Object.entries(fieldTerms)){
      const intermediateHas=intermediate.some(s=>re.test(notes[s]||''))
      const primaryHas=re.test(pnote)
      if(intermediateHas&&!primaryHas)j[side][field]=structuredClone(j0?.[side]?.[field]??null)
    }
  }
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  if(j0?.q?.controller_customer_ack)delete j.q.controller_customer_ack

  const fallback=fallbackInventory(message)
  if(fallback.length)j.inventory=ded([...arr(j.inventory),...fallback])

  const route=extractRoute(message)
  if(route){j.collection.town=route.collection;j.delivery.town=route.delivery;r.f['collection.location']='known';r.f['delivery.location']='known'}

  if(j.category==='single_item'&&mainItems(j).length>=2)j.category='furniture_move'

  const help=String(message||'').match(VAGUE_HELP)?.[0]
  if(help){
    pushDriverNote(j,`Customer said: "${quote(help)}" — lifting help is not treated as confirmed capability. This needs direct qualification with the customer; the driver is the final decision-maker on whether to rely on that help.`)
    j.customer_assistance=null;j.q.assistance_detail=null
    if(r.f.assistance!=='na')r.f.assistance='missing'
  }

  const plumbingParts=String(message||'').split(/[.!?;]+/).map(x=>x.trim()).filter(Boolean)
  const plumbing=plumbingParts.find(x=>PLUMBING.test(x)&&PLUMBING_ASSUMPTION.test(x))
  if(plumbing){
    pushDriverNote(j,`Customer appliance statement: "${quote(plumbing)}" — appliance disconnection/reconnection is not included by default. Many drivers are not insured or willing to do plumbing work; it must be explicitly agreed with the driver.`)
    j.q.controller_appliance_notice='Important: appliance plumbing is not assumed. Many drivers are not insured or willing to disconnect/reconnect washing machines or dishwashers, so this must be explicitly agreed with the driver.'
  }

  explicitAssembly(message,j)

  const fd=furnitureDetail(message)
  if(obj==='ask_furniture'&&fd){j.q.controller_furniture_detail=fd;r.f.furniture='known';pushDriverNote(j,`Furniture size/detail supplied by customer: "${quote(message)}".`)}
  clearFalseFurnitureAccess(j,j0,message,obj)

  if(obj==='ask_time'&&FLEX_TIME.test(message)){j.date.time_preference='flexible';r.f.time='known'}
  if(obj==='confirm_unusual_time'&&YES_CONFIRM.test(message)){j.q.unusual_time_confirmed=true;r.f.unusual_time='known'}

  if(INJECTION.test(message))j.q.controller_customer_ack='Thanks for the information. I still need a few job details so drivers can quote it accurately.'

  if(HOUSE.has(j?.category)&&bikePresent(j,message)){
    r.f['vehicle.identity']=usefulBikeIdentity(j?.q?.vehicle?.identity)?'known':'missing'
    r.f['vehicle.condition']=bikeConditionKnown(j)?'known':'missing'
  }

  if(!plausibleDismantle(j)&&!clean(j?.q?.dismantling_mode)){
    if(!HOUSE.has(j?.category)||j.q?.controller_inventory_complete===true){r.f.dismantling='na';r.f.reassembly='na'}
  }
  if(clean(j?.q?.dismantling_mode))r.f.dismantling='known'
  if(typeof j?.reassembly_required==='boolean')r.f.reassembly='known'

  syncMultiStopAccess(j,j0,message)

  if(HOUSE.has(j?.category)){
    j.q.controller_accuracy_gate=true
    const scale=propertyScale(message)
    if(scale){j.q.controller_property_scale=scale.text;j.q.controller_bedrooms=scale.count}
    if(COMPLETE_LOAD.test(message))j.q.controller_inventory_complete=true
    if(NO_CONTAINERS.test(message))j.q.controller_no_containers=true
    if(j0?.q?.controller_underload_needed&&UNDERLOAD_CONFIRM.test(message))j.q.controller_underload_confirmed=true
    const b=Number(j.q.controller_bedrooms)||0,m=mainItems(j).length
    const suspicious=(b>=4&&m<6)||(b===3&&m<5)||(b===2&&m<3)
    j.q.controller_underload_needed=!!(j.q.controller_inventory_complete&&suspicious&&!j.q.controller_underload_confirmed)
    r.f.volume=core.houseLoadReady(j)?'known':'missing'
  }

  const overrides={...r.f}
  r.f=core.requirements(j,r.f)
  for(const k of ['vehicle.identity','vehicle.condition','dismantling','reassembly','furniture','time','unusual_time','volume'])if(overrides[k]!==undefined)r.f[k]=overrides[k]
  return r
}

function houseVolumePrompt(j){
  const scale=clean(j?.q?.controller_property_scale),items=knownInventorySummary(j)
  if(j?.q?.controller_underload_needed){
    return `Thanks — I have ${scale?`this as ${scale}`:'the property size'} and the items you've listed${items?`: ${items}`:''}. That looks unusually small for the property size, so before drivers quote it I need to check the load is not being understated. Is the property mostly empty, and are there definitely no other beds/mattresses, drawers, TVs, desks, garden/garage items, furniture or appliances going? Photos are useful here, but not required.`
  }
  if(j?.q?.controller_inventory_complete===true&&!core.houseLoadReady(j)){
    return `Thanks — I have the main items you've listed${items?`: ${items}`:''}. About how many boxes, bags or crates will also be going (or say none)? Drivers need this to size the van and labour properly. Photos of the rooms/items are useful too, but not required.`
  }
  if(scale||items){
    const known=[scale?`the property as ${scale}`:null,items?`these items: ${items}`:null].filter(Boolean).join(' and ')
    return `Thanks — I've already noted ${known}. To size a house move properly I need the complete load, not just a rough estimate or "van full" description. Please add the remaining main furniture/appliances and approximate numbers of boxes/bags. If that is genuinely everything, say so. Photos of the rooms/items are useful too, but not required.`
  }
  return `To size a house move properly, please list the main furniture and appliances going plus approximate numbers of boxes/bags. I need enough detail for drivers to judge van size and labour rather than relying on a rough "van full" estimate. When the list is complete, say that is everything. Photos of the rooms/items are useful too, but not required.`
}

export function prompt(o,j,amb=null){
  let actual=o==='ask_volume'&&HOUSE.has(j?.category)&&!amb?houseVolumePrompt(j):base.prompt(o,j,amb)
  if(o==='ask_furniture'&&/\bwardrobe\b/i.test(arr(j?.inventory).join(' '))&&!amb)actual='What size is the wardrobe? Door count or dimensions are both fine — for example four-door, or roughly width × height. A photo is useful too, but not required.'
  if(j?.q?.controller_customer_ack&&!norm(actual).startsWith(norm(j.q.controller_customer_ack)))actual=`${j.q.controller_customer_ack}\n\n${actual}`
  return actual
}
