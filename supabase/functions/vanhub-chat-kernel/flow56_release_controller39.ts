// @ts-nocheck
import * as base from './flow56_release_controller38.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const esc=s=>String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
const UK_POSTCODE=/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i
const MONTH=/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i
const FLEX_WINDOW=/\b(?:any\s+day\s+)?next\s+week\b|\b(?:this|next)\s+weekend\b|\bweek\s+(?:commencing|beginning)\b/i

function compact(v){return String(v||'').toUpperCase().replace(/\s+/g,'')}
function routePostcodeEvidence(message,side,value){
  const v=clean(value);if(!v||!UK_POSTCODE.test(v))return false
  const s=String(message||''),e=esc(v).replace(/\s+/g,'\\s*')
  const literal=compact(s).includes(compact(v));if(!literal)return false
  if(side==='collection')return new RegExp(`\\bfrom\\s+(?:the\\s+)?${e}\\b`,'i').test(s)||new RegExp(`\\bcollect(?:ion|ing)?(?:\\s+[^,.;]{0,70})?\\s+(?:from\\s+)?${e}\\b`,'i').test(s)
  return new RegExp(`\\bto\\s+(?:the\\s+)?${e}\\b`,'i').test(s)||new RegExp(`\\bdeliver(?:y|ed|ing)?(?:\\s+[^,.;]{0,70})?\\s+(?:to\\s+)?${e}\\b`,'i').test(s)
}
function restoreExplicitRoutePostcodes(j,candidate,message){
  let changed=false
  for(const side of ['collection','delivery']){
    j[side]??={};if(clean(j[side].postcode))continue
    const fact=(candidate?.facts||[]).find(x=>x?.k===`${side}.postcode`&&['operational','correction'].includes(x?.kind)&&clean(x?.v))
    if(!fact||!routePostcodeEvidence(message,side,fact.v))continue
    j[side].postcode=clean(fact.v);changed=true
  }
  return changed
}
function addAccessNote(l,note){const cur=clean(l?.access_notes);if(!cur){l.access_notes=note;return true}if(canon(cur).includes(canon(note)))return false;l.access_notes=`${cur}; ${note}`;return true}
function restoreSymmetricAccess(j,message){
  const s=String(message||'');let changed=false
  const driveway=/\bdriveways?\s+(?:at\s+)?both\s+ends\b|\bboth\s+ends\b.{0,25}\bdriveways?\b/i.test(s)
  const loading=/\bloading\s+bays?\s+(?:at\s+)?both\s+ends\b|\bboth\s+ends\b.{0,25}\bloading\s+bays?\b/i.test(s)
  if(!driveway&&!loading)return false
  for(const side of ['collection','delivery']){
    j[side]??={}
    if(driveway&&!clean(j[side].parking)){j[side].parking='driveway';changed=true}
    if(loading){if(!clean(j[side].parking)){j[side].parking='loading bay';changed=true}changed=addAccessNote(j[side],'loading bay')||changed}
  }
  return changed
}
function londonParts(){const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),x=Object.fromEntries(p.map(v=>[v.type,v.value]));return{y:+x.year,m:+x.month,d:+x.day}}
function dim(y,m){return new Date(Date.UTC(y,m,0)).getUTCDate()}
function nextOrdinal(day){const t=londonParts();for(let add=0;add<14;add++){const z=t.m-1+add,y=t.y+Math.floor(z/12),m=(z%12)+1;if(day>dim(y,m))continue;if(add===0&&day<t.d)continue;return`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`}return null}
function explicitOrdinal(message){
  const s=String(message||'');if(MONTH.test(s)||/\b\d{1,2}[\/.]\d{1,2}(?:[\/.]\d{2,4})?\b/.test(s))return null
  const m=s.match(/\bon\s+(?:the\s+)?([1-9]|[12]\d|3[01])(st|nd|rd|th)\b/i);if(!m)return null
  const iso=nextOrdinal(+m[1]);return iso?{iso,text:m[0].replace(/^on\s+/i,'').trim()}:null
}
function restoreOrdinalDate(j,message){
  if(clean(j?.date?.iso_date))return false
  const x=explicitOrdinal(message);if(!x)return false
  j.date??={original_text:null,iso_date:null,alternative_iso_dates:[],flexibility:null,time_preference:null}
  j.date.iso_date=x.iso;j.date.original_text=x.text;j.q??={};j.q.controller_date_ack_iso=x.iso
  return true
}
function acceptBoundedFlexibleDate(j,r,message){
  if(clean(j?.date?.iso_date)||!clean(j?.date?.original_text))return false
  const txt=[j.date.original_text,j.date.flexibility,message].filter(Boolean).join(' ')
  if(!FLEX_WINDOW.test(txt)||!/\b(?:flexible|any\s+day|anytime|any\s+time)\b/i.test(txt))return false
  if(typeof r.ambiguity==='string'&&/\b(?:date|day|week|vague|approx)/i.test(r.ambiguity))r.ambiguity=null
  return true
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  let changed=false
  changed=restoreExplicitRoutePostcodes(j,candidate,message)||changed
  changed=restoreSymmetricAccess(j,message)||changed
  changed=restoreOrdinalDate(j,message)||changed
  const flexible=acceptBoundedFlexibleDate(j,r,message)
  if(changed||flexible)r.f=requirements(j,r.f)
  if(typeof r.ambiguity==='string'&&/postcodes?/i.test(r.ambiguity)&&((clean(j.collection?.postcode)||clean(j.collection?.town))&&(clean(j.delivery?.postcode)||clean(j.delivery?.town))))r.ambiguity=null
  return r
}
