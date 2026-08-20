// @ts-nocheck
import * as base from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/a4c70d98db13f4158770cf681741d7566fe7ce51/supabase/functions/vanhub-chat-kernel/flow56.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const prompt=base.prompt
export const faq=base.faq

// Bounded typo normalisation for known transport/removal vocabulary.
// Raw customer text remains the persisted audit record; only reducer evidence is normalised.
const INVENTORY_TERMS=['piano','sofa','wardrobe','mattress','armchair','fridge','freezer','dishwasher','cooker','table','chair','boxes','safe','motorbike','motorcycle','scooter']
const ACCESS_TERMS=['stairs','steps','parking','lift']
const APPLIANCE_TERMS=['washing','machine','dishwasher','disconnected','reconnect','reconnected']
const VEHICLE_TERMS=['motorbike','motorcycle','scooter','brakes','steer','steers','fuel','leak','rolls']
const DATE_TERMS=['tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday','morning','afternoon','evening']
const COMMON_COLLISIONS=new Set(['left','list','life','live','soft','sale','save','same','chain','cable','boxer','stars'])

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
function typoTerms(obj){
  let out=[]
  if(!obj||['clarify_load','clarify_inventory','ask_notable','ask_furniture','ask_piano','ask_volume'].includes(String(obj)))out.push(...INVENTORY_TERMS)
  if(['ask_collection_access','ask_delivery_access','ask_fit_access'].includes(String(obj)))out.push(...ACCESS_TERMS,...INVENTORY_TERMS)
  if(obj==='ask_appliance_plumbing')out.push(...APPLIANCE_TERMS)
  if(['ask_vehicle_identity','ask_vehicle_condition'].includes(String(obj)))out.push(...VEHICLE_TERMS)
  if(['ask_date','ask_time','confirm_unusual_time'].includes(String(obj)))out.push(...DATE_TERMS)
  return [...new Set(out)]
}
function normaliseTypos(message,obj){
  const terms=typoTerms(obj),corrections=[]
  if(!terms.length)return{message,corrections}
  const corrected=String(message||'').replace(/[A-Za-z]+/g,raw=>{
    const token=raw.toLowerCase()
    if(token.length<4||COMMON_COLLISIONS.has(token)||terms.includes(token))return raw
    const hits=terms.filter(t=>Math.abs(t.length-token.length)<=1&&oneEdit(token,t))
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
  const safeCandidate=groundedCandidate&&typeof groundedCandidate==='object'?{...groundedCandidate,context_notes:[]}:groundedCandidate
  const result=base.reduce(j0,f0,typo.message,obj,safeCandidate,direct,media)
  return addNotableFromCorrection(result,obj,typo.message,typo.corrections)
}

export function review(j){
  const r=base.review(j)
  const risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  if(!j?.q?.assistance_detail&&j?.customer_assistance===false)risks.push('Lifting help: customer cannot help with lifting/loading')
  else if(!j?.q?.assistance_detail&&j?.customer_assistance===true)risks.push('Lifting help: customer states capable lifting help is available')
  if(j?.q?.completion&&!risks.some(x=>String(x).startsWith('Completion/key timing:')))risks.push(`Completion/key timing: ${j.q.completion}`)
  return {...r,quote_risks:risks}
}
