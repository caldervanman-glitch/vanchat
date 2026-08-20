// @ts-nocheck
import * as base from './flow56_release_dateguard.ts'
import {clean,canon,requirements} from './core.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact

const OUTWARD='[A-Z]{1,2}\\d[A-Z\\d]?'
const MATERIAL_RE=/\b(?:boards?|sheets?|panels?|plywood|ply|osb|mdf|plasterboard|timber|lumber|chipboard|hardboard|cement boards?|insulation boards?|sheet material|building materials?)\b/i
const MATERIAL_TYPE_RE=/\b(plywood|ply|osb|mdf|plasterboard|timber|lumber|wood|chipboard|hardboard|cement board|insulation board|metal|steel|composite)\b/i
const SITE_WORDS=['builders merchant','builder merchant','merchant','shop','store','warehouse','storage unit','storage depot','storage','yard','home','house','flat','apartment','building site','construction site','site','workshop','factory','office','depot']

function mat(j){j.q??={};j.q.materials??={};return j.q.materials}
function materialJob(j,message=''){return !!j?.q?.materials||MATERIAL_RE.test(String(message||''))||MATERIAL_RE.test((j?.inventory||[]).join(' '))}
function normOutward(v){return String(v||'').toUpperCase().replace(/\s+/g,'').trim()}
function simpleLocation(v){let s=String(v||'').trim();return s.length>=2&&s.length<=80&&/^[A-Za-z][A-Za-z .'-]*$/.test(s)&&!/^(yes|no|none|unknown|not sure)$/i.test(s)}
function stripRouteFromInventory(j,raw){if(!raw)return;j.inventory=(j.inventory||[]).map(x=>String(x).replace(new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),'').replace(/\s{2,}/g,' ').trim()).filter(Boolean)}

function applyRoute(j,message,obj){
  const s=String(message||'').trim()
  let pair=s.match(new RegExp(`\\b(${OUTWARD})\\s+(?:to|->|→)\\s+(${OUTWARD})\\b`,'i'))
  if(!pair&&obj==='ask_route')pair=s.match(new RegExp(`^\\s*(${OUTWARD})\\s+(${OUTWARD})\\s*$`,'i'))
  if(pair){j.collection.postcode=normOutward(pair[1]);j.delivery.postcode=normOutward(pair[2]);stripRouteFromInventory(j,pair[0])}
  const one=s.match(new RegExp(`^\\s*(${OUTWARD})\\s*$`,'i'))
  if(one&&obj==='ask_collection')j.collection.postcode=normOutward(one[1])
  if(one&&obj==='ask_delivery')j.delivery.postcode=normOutward(one[1])
  const both=s.match(/^\s*both\s+(.+?)\s*$/i)
  if(both&&simpleLocation(both[1])){j.collection.town=both[1].trim();j.delivery.town=both[1].trim()}
  if(obj==='ask_collection'&&!one&&!both&&simpleLocation(s))j.collection.town=s
  if(obj==='ask_delivery'&&!one&&!both&&simpleLocation(s))j.delivery.town=s
}

function unitName(v){let s=String(v||'').toLowerCase();if(/^(?:ft|foot|feet)$/.test(s))return'ft';if(/^(?:m|metre|metres|meter|meters)$/.test(s))return'm';if(/^(?:cm|centimetre|centimetres|centimeter|centimeters)$/.test(s))return'cm';if(/^(?:mm|millimetre|millimetres|millimeter|millimeters)$/.test(s))return'mm';if(/^(?:in|inch|inches)$/.test(s))return'in';return null}
function extractDimensions(text,m){
  const s=String(text||'')
  let x=s.match(/\b(\d+(?:\.\d+)?)\s*(ft|foot|feet|m|metres?|meters?|cm|centimetres?|centimeters?|mm|millimetres?|millimeters?|in|inch|inches)?\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)\s*(ft|foot|feet|m|metres?|meters?|cm|centimetres?|centimeters?|mm|millimetres?|millimeters?|in|inch|inches)?\b/i)
  if(x){m.dimensions_raw=`${x[1]} x ${x[3]}`;let u=unitName(x[2])||unitName(x[4]);if(u){m.dimension_unit=u;m.dimensions=`${x[1]} x ${x[3]} ${u}`}}
  let thick=s.match(/\b(?:thick(?:ness)?\s*)?(\d+(?:\.\d+)?)\s*(mm|cm|millimetres?|millimeters?|centimetres?|centimeters?)\s*(?:thick|thickness)?\b/i)
  if(thick&&(!x||!String(x[0]).includes(thick[0])))m.thickness=`${thick[1]} ${unitName(thick[2])||thick[2]}`
}
function extractMaterialType(text,m){let x=String(text||'').match(MATERIAL_TYPE_RE);if(x)m.material_type=x[1].toLowerCase()==='ply'?'plywood':x[1].toLowerCase()}
function extractQuantity(text,m){let x=String(text||'').match(/\b(\d+)\s+(?:boards?|sheets?|panels?)\b/i);if(x)m.quantity=x[1]}
function siteFrom(v){let s=canon(v);return SITE_WORDS.find(x=>s.includes(x))||null}
function extractSites(text,m){
  const s=String(text||'').trim(),c=canon(s)
  let both=c.match(/^both\s+(.+)$/);if(both){let z=siteFrom(both[1]);if(z){m.collection_site=z;m.delivery_site=z;return}}
  let pair=c.match(/^(?:from\s+)?(.+?)\s+(?:to|into)\s+(.+)$/);if(pair){let a=siteFrom(pair[1]),b=siteFrom(pair[2]);if(a)m.collection_site=a;if(b)m.delivery_site=b}
  let col=c.match(/collection(?: is| from| at)?\s+([^,;.]+)/);if(col){let z=siteFrom(col[1]);if(z)m.collection_site=z}
  let del=c.match(/delivery(?: is| to| at)?\s+([^,;.]+)/);if(del){let z=siteFrom(del[1]);if(z)m.delivery_site=z}
}
function extractHandling(text,m){
  const s=canon(text)
  if(/\bkerbside\s*(?:to|-|—|–)\s*kerbside\b/.test(s)||/\bkerbside at both ends\b/.test(s)){m.handling='kerbside-to-kerbside: driver only needs to load/unload at the vehicle; no carry between the van and the final resting place';return}
  const hasLoad=/\b(load|loading|loaded)\b/.test(s),hasUnload=/\b(unload|unloading|unloaded|offload|offloading)\b/.test(s)
  const bothEnds=/\b(both ends|collection and delivery|at collection.*delivery|collection.*and.*delivery)\b/.test(s)
  const noCarry=/\b(no carry|no carrying|kerbside|at the van|beside the van)\b/.test(s)
  const resting=/\b(resting place|inside|into the (?:house|flat|property|warehouse|storage|yard)|carry)\b/.test(s)
  if((hasLoad&&hasUnload)||(bothEnds&&(noCarry||resting)))m.handling=String(text).trim()
  else if(/\b(driver|customer|staff|merchant|seller|recipient|we|i|they)\b/.test(s)&&(hasLoad||hasUnload)&&/\bcollection|delivery\b/.test(s))m.handling=String(text).trim()
}
function materialComplete(m){return !!(clean(m.quantity)&&clean(m.material_type)&&clean(m.dimensions)&&clean(m.dimension_unit)&&clean(m.collection_site)&&clean(m.delivery_site)&&clean(m.handling))}
function materialSummary(m){return [`${m.quantity} ${m.material_type} board/sheet item(s)`,m.dimensions,m.thickness&&`thickness ${m.thickness}`,`collection site ${m.collection_site}`,`delivery site ${m.delivery_site}`,`handling ${m.handling}`].filter(Boolean).join('; ')}
function materialQuestion(j){
  const m=mat(j),raw=m.dimensions_raw||'the dimensions'
  if(!clean(m.quantity)||!clean(m.material_type)||!clean(m.dimensions)||!clean(m.dimension_unit)){
    if(clean(m.dimensions_raw)&&!clean(m.dimension_unit))return `You said ${raw}. What unit is that — feet, metres, centimetres, etc.? Also, what are the boards made of (for example plywood/OSB, MDF, plasterboard or timber)? If you know the thickness, include that too.`
    return 'For the boards/sheets, how many are there, what are they made of, and what are the dimensions including units (for example 8 x 4 ft)? If you know the thickness, include that too.'
  }
  if(!clean(m.collection_site)&&!clean(m.delivery_site))return 'What sort of place are they being collected from and delivered to — for example a builders merchant/shop, warehouse, storage unit, yard, house or building site?'
  if(!clean(m.collection_site))return 'What sort of place is the collection — for example a builders merchant/shop, warehouse, storage unit, yard, house or building site?'
  if(!clean(m.delivery_site))return 'What sort of place is the delivery — for example a warehouse, storage unit, yard, house or building site?'
  if(!clean(m.handling))return 'At collection and delivery, who moves the boards between their resting place and the van? If it is kerbside-to-kerbside, say that. Otherwise tell me who loads/unloads and whether the driver must carry them beyond the vehicle, including any carry distance, stairs or steps.'
  return base.prompt('ask_handling',j)
}

export function prompt(o,j,amb=null){if(o==='ask_handling'&&materialJob(j))return materialQuestion(j);return base.prompt(o,j,amb)}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  let r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  applyRoute(j,message,obj)
  if(materialJob(j,message)){
    j.category='other_transport';const m=mat(j)
    const allText=[String(message||''),(j.inventory||[]).join(' ')].join(' ')
    extractQuantity(allText,m);extractMaterialType(allText,m);extractDimensions(allText,m)
    if(obj==='ask_handling'||/\b(?:merchant|shop|warehouse|storage|yard|house|flat|building site|construction site|workshop|factory|office|depot)\b/i.test(String(message||'')))extractSites(message,m)
    if(obj==='ask_handling'||/\b(?:kerbside|load|unload|carry|resting place)\b/i.test(String(message||'')))extractHandling(message,m)
    // Route codes are transport data, never inventory.
    j.inventory=(j.inventory||[]).map(x=>String(x).replace(new RegExp(`\\b${OUTWARD}\\s+(?:to|->|→)\\s+${OUTWARD}\\b`,'ig'),'').replace(/\s{2,}/g,' ').trim()).filter(Boolean)
    j.q.specialist??={}
    j.q.specialist.quantity=m.quantity||j.q.specialist.quantity||null
    j.q.specialist.dimensions=m.dimensions||null
    j.q.specialist.site_access=(m.collection_site&&m.delivery_site)?`collection: ${m.collection_site}; delivery: ${m.delivery_site}`:null
    j.q.specialist.handling=materialComplete(m)?materialSummary(m):null
    r.f=requirements(j,r.f)
    if(!materialComplete(m))r.f.handling='missing'
    if(r.f['collection.location']==='known'&&r.f['delivery.location']==='known'&&r.ambiguity&&/location missing|postcode.*missing/i.test(r.ambiguity))r.ambiguity=null
  }else{
    r.f=requirements(j,r.f)
    if(r.f['collection.location']==='known'&&r.f['delivery.location']==='known'&&r.ambiguity&&/location missing|postcode.*missing/i.test(r.ambiguity))r.ambiguity=null
  }
  return r
}

export function review(j){
  const r=base.review(j)
  if(!materialJob(j))return r
  const m=mat(j),risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  if(m.collection_site)risks.push(`Collection site: ${m.collection_site}`)
  if(m.delivery_site)risks.push(`Delivery site: ${m.delivery_site}`)
  if(m.handling)risks.push(`Loading/unloading/carry: ${m.handling}`)
  const detail=[m.quantity&&`${m.quantity} item(s)`,m.material_type,m.dimensions,m.thickness&&`thickness ${m.thickness}`].filter(Boolean).join('; ')
  return {...r,load_detail:detail||r.load_detail,quote_risks:risks}
}

export function faq(message){
  if(/\b(postcode|post code|outward code|postcode prefix)\b/i.test(String(message||''))&&/\b(need|necessary|required|have to|why|prefix|outward)\b/i.test(String(message||'')))return 'For an ordinary quote request, a specific town/local area or an outward postcode such as HX1 can be enough to continue, although postcodes generally get better results because drivers can judge the route more accurately. Fixed-price jobs require both collection and delivery outward postcodes.'
  return base.faq(message)
}
