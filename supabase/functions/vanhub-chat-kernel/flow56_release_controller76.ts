// @ts-nocheck
import * as base from './flow56_release_controller75.ts'
import * as core from './core_release_controller52.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const review=base.review
export const prompt=base.prompt

const HOUSE=new Set(['house_move','flat_move'])
const ACCESS_FIELDS=['floor','stairs','lift','parking','internal_stairs','external_steps','carry_distance','access_notes']
const STRONG_ACCESS=/\b(?:stairs?|steps?|floor|lift|elevator|parking|park(?:ing)?|carry|roadworks?|loading bay|double yellow|single yellow|permit|doorway|entrance|property access|long carry)\b/i
const FURN_DETAIL=/\b(?:three|four|five|six|3|4|5|6)[ -]?doors?(?:\s+wide)?\b|\b\d+(?:\.\d+)?\s*(?:m|metres?|meters?|cm|centimetres?|centimeters?|ft|feet)\b/i
const CONTAINER=/\b(?:about|around|roughly|approx(?:imately)?)?\s*\d+\s+(?:(?:loose|black|bin|carrier|packed|sealed|tied)\s+){0,3}(?:boxes?|bags?|crates?|cartons?)\b/ig

const norm=v=>core.canon(v)
const clean=v=>core.clean(v)
function arr(v){return Array.isArray(v)?v:[]}
function ded(v){return core.ded(v)}
function phrasePresent(hay,needle){
  const h=norm(hay).split(/[^a-z0-9]+/).filter(Boolean),n=norm(needle).split(/[^a-z0-9]+/).filter(Boolean)
  if(!n.length||n.length>h.length)return false
  outer:for(let i=0;i<=h.length-n.length;i++){for(let k=0;k<n.length;k++)if(h[i+k]!==n[k])continue outer;return true}return false
}
function preserveContainers(j,message){
  const xs=[];CONTAINER.lastIndex=0
  for(const m of String(message||'').matchAll(CONTAINER))xs.push(m[0].trim())
  if(xs.length)j.inventory=ded([...arr(j.inventory),...xs])
}
function removeFalseFurnitureAccess(j,before,message,obj){
  if(obj!=='ask_furniture'||!FURN_DETAIL.test(String(message||''))||STRONG_ACCESS.test(String(message||'')))return
  const wardrobeContext=/\bwardrobe\b/i.test([...arr(before?.inventory),...arr(j?.inventory)].join(' '))
  if(!wardrobeContext)return
  for(const side of ['collection','delivery'])for(const k of ACCESS_FIELDS)j[side][k]=structuredClone(before?.[side]?.[k]??null)
  const prior=new Set(arr(before?.q?.driver_notes).map(norm))
  j.q.driver_notes=arr(j.q.driver_notes).filter(n=>prior.has(norm(n))||!/Customer access statement:/i.test(String(n)))
}
function stopNotes(message,stops){
  const segs=String(message||'').split(/[.;]+/).map(x=>x.trim()).filter(Boolean),out={}
  for(const stop of stops){const hits=segs.filter(s=>phrasePresent(s,stop)&&STRONG_ACCESS.test(s));if(hits.length)out[stop]=hits.join('; ')}
  return out
}
function cleanMultiStopLeak(j,before,message){
  const prior=before?.q?.multi_stop||{},current=j?.q?.multi_stop||{}
  const collections=ded([...arr(prior.collections),...arr(current.collections)])
  const deliveries=ded([...arr(prior.deliveries),...arr(current.deliveries)])
  const stops=ded([...collections,...deliveries])
  if(stops.length<3)return
  j.q.multi_stop={collections,deliveries}
  const notes=stopNotes(message,stops);if(!Object.keys(notes).length)return
  j.q.multi_stop_access={...(before?.q?.multi_stop_access||{}),...(j.q.multi_stop_access||{}),...notes}
  const primaries=[clean(j?.collection?.town),clean(j?.delivery?.town)].filter(Boolean)
  const intermediates=stops.filter(s=>!primaries.some(p=>norm(p)===norm(s)))
  const terms={stairs:/\bstairs?\b/i,internal_stairs:/\bstairs?\b/i,lift:/\blift\b/i,floor:/\bfloor\b/i,parking:/\bpark(?:ing)?\b/i,carry_distance:/\bcarry|\b\d+\s*(?:m|metres?|meters?|yards?|ft|feet)\b/i,external_steps:/\bsteps?\b/i}
  for(const side of ['collection','delivery']){
    const p=clean(j?.[side]?.town);if(!p)continue
    const ptext=notes[p]||''
    for(const [field,re] of Object.entries(terms)){
      const intermediateHas=intermediates.some(s=>re.test(notes[s]||''))
      const primaryHas=re.test(ptext)
      if(intermediateHas&&!primaryHas)j[side][field]=structuredClone(before?.[side]?.[field]??null)
    }
  }
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const before=structuredClone(j0)
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  preserveContainers(j,message)
  removeFalseFurnitureAccess(j,before,message,obj)
  cleanMultiStopLeak(j,before,message)
  if(HOUSE.has(j?.category)&&j?.q?.controller_accuracy_gate===true)r.f.volume=core.houseLoadReady(j)?'known':'missing'
  return r
}
