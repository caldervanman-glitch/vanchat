// @ts-nocheck
import * as base from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/a4c70d98db13f4158770cf681741d7566fe7ce51/supabase/functions/vanhub-chat-kernel/flow56.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq

// Bounded typo normalisation for known transport/removal vocabulary.
// Raw customer text remains the persisted audit record; only reducer evidence is normalised.
// Locations/postcodes are deliberately excluded: the engine must not guess geography.
const INVENTORY_TERMS=['piano','sofa','wardrobe','mattress','armchair','fridge','freezer','dishwasher','cooker','table','chair','boxes','safe','motorbike','motorcycle','scooter']
const ACCESS_TERMS=['stairs','steps','parking','lift']
const APPLIANCE_TERMS=['washing','machine','dishwasher','disconnected','reconnect','reconnected']
const VEHICLE_TERMS=['motorbike','motorcycle','scooter','brakes','steer','steers','fuel','leak','rolls']
const DATE_TERMS=['tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday','morning','afternoon','evening']
const ALL_TERMS=[...new Set([...INVENTORY_TERMS,...ACCESS_TERMS,...APPLIANCE_TERMS,...VEHICLE_TERMS,...DATE_TERMS])]
const COMMON_COLLISIONS=new Set(['left','list','life','live','gift','loft','lint','soft','soda','soya','sale','save','same','sane','cafe','chain','choir','cable','able','stable','tablet','boxer','stars','stems','stops','wishing','steel','feel','full','lead','leaf','lean'])

// These labels are useful for browsing a directory, but too broad for a driver to price a route.
// A postcode always makes the endpoint quote-grade; otherwise a specific town/local area is required.
const BROAD_GEO=new Set([
  'uk','united kingdom','great britain','britain','england','scotland','wales','northern ireland',
  'london','greater london','yorkshire','west yorkshire','north yorkshire','south yorkshire','east yorkshire','east riding of yorkshire',
  'greater manchester','merseyside','west midlands','east midlands','midlands','north east','north west','south east','south west','east of england',
  'bedfordshire','berkshire','buckinghamshire','cambridgeshire','cheshire','cornwall','cumbria','derbyshire','devon','dorset','county durham',
  'east sussex','essex','gloucestershire','hampshire','herefordshire','hertfordshire','isle of wight','kent','lancashire','leicestershire','lincolnshire',
  'norfolk','northamptonshire','northumberland','nottinghamshire','oxfordshire','rutland','shropshire','somerset','staffordshire','suffolk','surrey',
  'warwickshire','west sussex','wiltshire','worcestershire'
])
const geoText=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[-_]+/g,' ').replace(/^[\s.!?,;:]+|[\s.!?,;:]+$/g,'').replace(/\s+/g,' ').trim()
function broadLocation(l){
  if(!l||String(l.postcode||'').trim())return false
  const town=geoText(l.town),address=geoText(l.address_text)
  return BROAD_GEO.has(town)||BROAD_GEO.has(address)
}
function endpointLabel(l){return String(l?.town||l?.address_text||'that area').trim()}
function routeSpecificity(result){
  const j=result?.j,f=result?.f
  if(!j||!f)return result
  if(broadLocation(j.collection))f['collection.location']='missing'
  if(broadLocation(j.delivery))f['delivery.location']='missing'
  return result
}
function postcodeAdvice(side,label){
  const cap=side==='collection'?'collection':'delivery'
  return `${label} is too broad for drivers to quote the ${cap} accurately. Please give the ${cap} postcode if you can — postcodes generally get better results because drivers can judge the route much more accurately. If you do not have it, give a specific town or local area.`
}
export function prompt(o,j,amb=null){
  if(amb)return base.prompt(o,j,amb)
  const cb=broadLocation(j?.collection),db=broadLocation(j?.delivery)
  if(o==='ask_route'&&(cb||db)){
    if(cb&&db)return `${endpointLabel(j.collection)} to ${endpointLabel(j.delivery)} is too broad for drivers to quote accurately. Please give the collection and delivery postcodes if you can — postcodes generally get better results because drivers can judge the route much more accurately. If you do not have them, give a specific town or local area at each end.`
    if(cb)return postcodeAdvice('collection',endpointLabel(j.collection))
    return postcodeAdvice('delivery',endpointLabel(j.delivery))
  }
  if(o==='ask_collection'&&cb)return postcodeAdvice('collection',endpointLabel(j.collection))
  if(o==='ask_delivery'&&db)return postcodeAdvice('delivery',endpointLabel(j.delivery))
  if(o==='ask_route')return `What town/area or postcode is it being collected from, and what town/area or postcode is it going to? Please use postcodes if you have them — postcodes generally get better results because drivers can judge the route more accurately.`
  if(o==='ask_collection')return `What is the collection postcode? Postcodes generally get better results because drivers can judge the route more accurately. If you do not have it, give a specific town or local area.`
  if(o==='ask_delivery')return `What is the delivery postcode? Postcodes generally get better results because drivers can judge the route more accurately. If you do not have it, give a specific town or local area.`
  return base.prompt(o,j,amb)
}

function oneEdit(a,b){
  a=String(a||'').toLowerCase();b=String(b||'').toLowerCase()
  if(!a||!b||a===b||Math.abs(a.length-b.length)>1)return false
  if(a.length===b.length){
    let d=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])d.push(i)
    if(d.length===1)return true
    return d.length===2&&d[1]===d[0]+1&&a[d[0]]===b[d[1]]&&a[d[1]]===b[d[0]]
  }
  let s=a.length<b.length?a:b,l=a.length<b.length?b:a,i=0,j=0,skips=0
  while(i<s.length&&j<l.length){if(s[i]===l[j]){i++;j++}else{skips++;j++;if(skips>1)return false}}
  return true
}
function shortAllowed(term,obj){
  if(term==='sofa'||term==='safe')return !obj||['clarify_load','clarify_inventory','ask_notable','ask_furniture','ask_volume'].includes(String(obj))
  if(term==='lift')return ['ask_collection_access','ask_delivery_access','ask_fit_access'].includes(String(obj))
  if(term==='fuel'||term==='leak')return obj==='ask_vehicle_condition'
  return false
}
function normaliseTypos(message,obj){
  const corrections=[]
  const corrected=String(message||'').replace(/[A-Za-z]+/g,raw=>{
    const token=raw.toLowerCase()
    if(token.length<3||COMMON_COLLISIONS.has(token)||ALL_TERMS.includes(token))return raw
    const hits=ALL_TERMS.filter(t=>Math.abs(t.length-token.length)<=1&&(t.length>4||shortAllowed(t,obj))&&oneEdit(token,t))
    if(hits.length!==1)return raw
    corrections.push({from:raw,to:hits[0]})
    return hits[0]
  })
  return{message:corrected,corrections}
}
function normaliseCandidateEvidence(value,obj){
  if(Array.isArray(value))return value.map(v=>normaliseCandidateEvidence(v,obj))
  if(!value||typeof value!=='object')return value
  const out={}
  for(const [k,v] of Object.entries(value))out[k]=k==='evidence'&&typeof v==='string'?normaliseTypos(v,obj).message:normaliseCandidateEvidence(v,obj)
  return out
}
function suppressResolvedTypoAmbiguity(candidate,corrections){
  if(!candidate||typeof candidate!=='object'||!corrections.length||typeof candidate.ambiguity!=='string')return candidate
  const out={...candidate},a=geoText(out.ambiguity)
  const typoLike=/\b(typo|spelling|misspell|misspelling|did you mean|appears to be)\b/.test(a)
  const mentions=corrections.some(x=>a.includes(geoText(x.from))||a.includes(geoText(x.to)))
  if(typoLike&&mentions)out.ambiguity=null
  return out
}
function addNotableFromCorrection(result,obj,corrected,corrections){
  if(obj!=='ask_notable'||!corrections.length)return result
  const known=['piano','safe','wardrobe','mattress','sofa','armchair','fridge','freezer','dishwasher','cooker','table']
  const found=known.filter(x=>new RegExp(`\\b${x}\\b`,'i').test(corrected))
  if(!found.length)return result
  result.j.heavy_or_awkward_items=[...new Set([...(result.j.heavy_or_awkward_items||[]),...found])]
  result.j.q??={};result.j.q.notable=found.join(', ')
  return result
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const typo=normaliseTypos(message,obj)
  const groundedCandidate=normaliseCandidateEvidence(candidate,obj)
  const ambiguitySafeCandidate=suppressResolvedTypoAmbiguity(groundedCandidate,typo.corrections)
  const safeCandidate=ambiguitySafeCandidate&&typeof ambiguitySafeCandidate==='object'?{...ambiguitySafeCandidate,context_notes:[]}:ambiguitySafeCandidate
  let result=base.reduce(j0,f0,typo.message,obj,safeCandidate,direct,media)
  result=addNotableFromCorrection(result,obj,typo.message,typo.corrections)
  return routeSpecificity(result)
}

export function review(j){
  const r=base.review(j)
  const risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  if(!j?.q?.assistance_detail&&j?.customer_assistance===false)risks.push('Lifting help: customer cannot help with lifting/loading')
  else if(!j?.q?.assistance_detail&&j?.customer_assistance===true)risks.push('Lifting help: customer states capable lifting help is available')
  if(j?.q?.completion&&!risks.some(x=>String(x).startsWith('Completion/key timing:')))risks.push(`Completion/key timing: ${j.q.completion}`)
  return {...r,quote_risks:risks}
}
