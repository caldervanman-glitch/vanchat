// @ts-nocheck
import * as base from './flow56_release_materials4.ts'
import {clean,canon,requirements,access} from './core.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq

const ITEM_RE=/\b(?:glass\s+(?:cabinet|display\s+cabinet|display\s+case|dresser|table)|display\s+cabinet|china\s+cabinet|curio\s+cabinet|antique\s+cabinet|large\s+mirror|glass\s+furniture)\b/i
const VALUE_RE=/\b(?:very\s+expensive|expensive|high[- ]value|valuable|replacement\s+value|insured\s+for|worth)\b|£\s*\d/i
const CREW_RE=/\b(?:need|needs|will\s+need|requires?|require)\s+(?:two|2)\s+(?:(?:strong|experienced)\s+){0,2}(?:men|movers|people)|\b(?:two|2)[- ]man\s+lift\b|\b(?:very|extremely)\s+heavy\b/i

function hv(j){j.q??={};j.q.high_value??={};return j.q.high_value}
function relevant(j,message=''){const inv=(j?.inventory||[]).join(' ');return !!j?.q?.high_value||ITEM_RE.test(inv)||ITEM_RE.test(String(message||''))||(VALUE_RE.test(String(message||''))&&!!clean(inv))}
function money(text){
  const s=String(text||'')
  let m=s.match(/£\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*([kK])?\b/)
  if(m)return m[2]?`£${m[1]}k`:`£${m[1]}`
  m=s.match(/\b(\d+(?:\.\d+)?)\s*(k|grand)\b/i)
  if(m&&/\b(?:worth|value|cost|expensive|insured|replacement)\b/i.test(s))return `£${m[1]}k`
  m=s.match(/\b(?:worth|value|replacement\s+value|insured\s+for)\s+(?:about|around|roughly|approx(?:imately)?)?\s*(\d{3,6})\s*(?:pounds?|gbp)?\b/i)
  return m?`£${m[1]}`:null
}
function dimensions(text){
  const s=String(text||'')
  let m=s.match(/\b\d+(?:\.\d+)?\s*(?:mm|cm|m|ft|feet|foot|in|inch|inches)?\s*(?:x|×|by)\s*\d+(?:\.\d+)?\s*(?:mm|cm|m|ft|feet|foot|in|inch|inches)?(?:\s*(?:x|×|by)\s*\d+(?:\.\d+)?\s*(?:mm|cm|m|ft|feet|foot|in|inch|inches)?)?\b/i)
  if(m&&/(?:mm|cm|\bm\b|ft|feet|foot|inch|inches|\bin\b)/i.test(m[0]))return m[0]
  const vals=s.match(/\b\d+(?:\.\d+)?\s*(?:mm|cm|m|ft|feet|foot|in|inch|inches)\b/ig)||[]
  if(vals.length>=2&&/\b(?:high|height|wide|width|deep|depth|long|length)\b/i.test(s))return s.trim()
  return null
}
function weight(text){let m=String(text||'').match(/\b(?:about|around|roughly|approx(?:imately)?\s*)?(\d+(?:\.\d+)?)\s*(kg|kilograms?|kilos?|lb|lbs|pounds?|stone)\b/i);return m?`${m[1]} ${m[2]}`:null}
function fragility(text){const s=String(text||'');if(/\b(?:glass\s+(?:doors?|shelves?|panels?)|fixed\s+glass|removable\s+(?:glass\s+)?(?:shelves?|panels?|doors?)|glass\s+all\s+round|toughened\s+glass|tempered\s+glass|laminated\s+glass|mirrored|existing\s+(?:chip|crack)|chipped|cracked)\b/i.test(s))return s.trim();return null}
function explicitUnknown(text,what){const s=canon(text);return new RegExp(`(?:don't know|do not know|no idea|not sure|unsure).{0,25}${what}|${what}.{0,25}(?:don't know|do not know|no idea|not sure|unsure)`).test(s)}
function assist(text,h){const s=canon(text);if(/^(?:no help|none|nobody helping|no one helping)$/.test(s)||/\b(?:driver|drivers|movers)\s+(?:do|doing|will do)\s+(?:all|all the)\s+(?:lifting|handling|carrying)\b/.test(s)){h.assistance='no customer lifting help';return}if(/\b(?:i|we|seller|customer|staff|someone|people)\s+(?:can|will|are able to|is able to)\s+help\b/.test(s)){h.assistance=String(text).trim()}}
function complete(h){return !!(clean(h.declared_value)&&clean(h.dimensions)&&clean(h.weight)&&clean(h.fragility_details))}
function question(j){const h=hv(j),miss=[];if(!clean(h.declared_value))miss.push('approximate replacement value');if(!clean(h.dimensions))miss.push('dimensions including units');if(!clean(h.weight))miss.push('approximate weight');if(!clean(h.fragility_details))miss.push('whether the glass/shelves/panels are fixed or removable');const lead=h.crew_signal?`You mentioned ${h.crew_signal}. I won't assume a crew size from that alone — the driver needs the actual handling facts.`:'Because this is a valuable/fragile item, drivers need a little more detail before pricing it.';return `${lead} Please give ${miss.join(', ')}. If you genuinely don't know the weight or exact value, say so.`}

export function prompt(o,j,amb=null){
  if(relevant(j)){
    if(o==='ask_dimweight')return question(j)
    if(o==='ask_collection_access')return 'Because this is a valuable/fragile item, at collection are there internal stairs or a lift, any outside steps, roughly how far is the carry from its resting place to the van, and any tight/narrow doors or turns?'
    if(o==='ask_delivery_access')return 'At delivery, are there internal stairs or a lift, any outside steps, roughly how far is the carry from the van to its final resting place, and any tight/narrow doors or turns?'
    if(o==='ask_assistance'){const h=hv(j);return h.crew_signal?`You said ${h.crew_signal}. Is anyone at collection or delivery actually able to help with the lift, or should drivers quote for full handling by their own crew? The final crew requirement will be judged from the item, access and handling details.`:'Will anyone at collection or delivery actually be able to help lift/carry it, or should drivers quote for full handling by their own crew?'}
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  if(!relevant(j,message))return r
  const h=hv(j),s=String(message||'')
  const vs=s.match(/\b(?:very\s+expensive|expensive|high[- ]value|valuable)\b/i);if(vs&&!h.value_signal)h.value_signal=vs[0]
  const cs=s.match(CREW_RE);if(cs&&!h.crew_signal)h.crew_signal=cs[0]
  const val=money(s);if(val)h.declared_value=val;else if(obj==='ask_dimweight'&&explicitUnknown(s,'(?:value|worth|price)'))h.declared_value='unknown - customer described item as valuable/high-value'
  const d=dimensions(s);if(d)h.dimensions=d
  const w=weight(s);if(w)h.weight=w;else if(obj==='ask_dimweight'&&explicitUnknown(s,'weight'))h.weight='unknown'
  const fr=fragility(s);if(fr)h.fragility_details=fr;else if(obj==='ask_dimweight'&&/(?:don't know|do not know|no idea|not sure|unsure)/i.test(s)&&/\b(?:glass|shelves?|panels?|doors?)\b/i.test(s))h.fragility_details='customer unsure which glass parts are fixed/removable'
  if(obj==='ask_assistance')assist(s,h)
  j.q.specialist??={};j.q.specialist.dimensions=h.dimensions||j.q.specialist.dimensions||null;j.q.specialist.weight=h.weight||j.q.specialist.weight||null
  r.f=requirements(j,r.f)
  r.f.dimweight=complete(h)?'known':'missing'
  r.f['collection.access']=access(j.collection)?'known':'missing'
  r.f['delivery.access']=access(j.delivery)?'known':'missing'
  const assistanceKnown=!!clean(j.q.assistance_detail)||typeof j.customer_assistance==='boolean'||!!clean(h.assistance)
  r.f.assistance=assistanceKnown?'known':'missing'
  return r
}

export function review(j){const r=base.review(j);if(!relevant(j))return r;const h=hv(j),risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[];if(h.declared_value)risks.push(`Declared/replacement value: ${h.declared_value}`);if(h.dimensions)risks.push(`Approx dimensions: ${h.dimensions}`);if(h.weight)risks.push(`Approx weight: ${h.weight}`);if(h.fragility_details)risks.push(`Glass/fragility details: ${h.fragility_details}`);if(h.crew_signal)risks.push(`Customer handling signal: ${h.crew_signal} — crew requirement is not assumed; driver should judge from weight, access and handling`);if(h.assistance)risks.push(`Customer lifting assistance: ${h.assistance}`);risks.push('High-value/fragile item: accepting driver should confirm their goods-in-transit cover/terms and handling suitability for the declared value before accepting');return {...r,quote_risks:[...new Set(risks)]}}
