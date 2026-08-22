// @ts-nocheck
import * as base from './flow56_release_controller76.ts'
import * as core from './core_release_controller52.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const review=base.review
export const prompt=base.prompt

const ACCESS_FIELDS=['floor','stairs','lift','parking','internal_stairs','external_steps','carry_distance','access_notes']
const FIELD_TERMS={
  stairs:/\bstairs?\b/i,
  internal_stairs:/\bstairs?\b/i,
  lift:/\blift\b/i,
  floor:/\bfloor\b/i,
  parking:/\bpark(?:ing)?\b/i,
  carry_distance:/\bcarry|\b\d+\s*(?:m|metres?|meters?|yards?|ft|feet)\b/i,
  external_steps:/\b(?:outside|external) steps?\b/i,
}
const norm=v=>core.canon(v)
const clean=v=>core.clean(v)
const arr=v=>Array.isArray(v)?v:[]
const ded=v=>core.ded(v)
function phrasePresent(hay,needle){
  const h=norm(hay).split(/[^a-z0-9]+/).filter(Boolean),n=norm(needle).split(/[^a-z0-9]+/).filter(Boolean)
  if(!n.length||n.length>h.length)return false
  outer:for(let i=0;i<=h.length-n.length;i++){for(let k=0;k<n.length;k++)if(h[i+k]!==n[k])continue outer;return true}return false
}
function clauses(message){return String(message||'').split(/[.;]+/).map(x=>x.trim()).filter(Boolean)}
function clausesFor(message,stop){return clauses(message).filter(s=>phrasePresent(s,stop))}
function hasField(message,stop,re){return clausesFor(message,stop).some(s=>re.test(s))}
function multiStopSet(before,j){
  const a=before?.q?.multi_stop||{},b=j?.q?.multi_stop||{}
  return {
    collections:ded([...arr(a.collections),...arr(b.collections)]),
    deliveries:ded([...arr(a.deliveries),...arr(b.deliveries)]),
  }
}
function enforceNamedStopAccess(j,before,message){
  const ms=multiStopSet(before,j),stops=ded([...ms.collections,...ms.deliveries])
  if(stops.length<3)return
  j.q.multi_stop=ms

  // Primary A/B endpoints were already established before this access-detail
  // turn. An intermediate-stop sentence must never rewrite those route towns.
  if(clean(before?.collection?.town))j.collection.town=before.collection.town
  if(clean(before?.delivery?.town))j.delivery.town=before.delivery.town

  const primaryCollection=clean(before?.collection?.town)||clean(j?.collection?.town)
  const primaryDelivery=clean(before?.delivery?.town)||clean(j?.delivery?.town)
  const primaries=[primaryCollection,primaryDelivery].filter(Boolean)
  const intermediates=stops.filter(s=>!primaries.some(p=>norm(p)===norm(s)))

  j.q.multi_stop_access={...(before?.q?.multi_stop_access||{}),...(j.q.multi_stop_access||{})}
  for(const stop of stops){
    const text=clausesFor(message,stop).join('; ')
    if(text)j.q.multi_stop_access[stop]=text
  }

  for(const [side,primary] of [['collection',primaryCollection],['delivery',primaryDelivery]]){
    if(!primary)continue
    for(const field of ACCESS_FIELDS){
      const re=FIELD_TERMS[field]
      if(!re)continue
      const primaryMentions=hasField(message,primary,re)
      const intermediateMentions=intermediates.some(s=>hasField(message,s,re))
      if(intermediateMentions&&!primaryMentions)j[side][field]=structuredClone(before?.[side]?.[field]??null)
    }
  }
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const before=structuredClone(j0)
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  enforceNamedStopAccess(r.j,before,message)
  return r
}
