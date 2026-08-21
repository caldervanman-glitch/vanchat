// @ts-nocheck
import {EMPTY,shape,requirements,nextObjective,relativeHouseholdValue} from '../../supabase/functions/vanhub-chat-kernel/core_release_controller49.ts'
import {deterministic} from '../../supabase/functions/vanhub-chat-kernel/parser_direct56.ts'
import {reduce,prompt} from '../../supabase/functions/vanhub-chat-kernel/flow56_release_controller51.ts'

function merge(a,b){
  if(Array.isArray(b))return structuredClone(b)
  if(!b||typeof b!=='object')return b===undefined?a:b
  const out={...(a&&typeof a==='object'?a:{})}
  for(const [k,v] of Object.entries(b))out[k]=merge(out[k],v)
  return out
}
function pathGet(o,p){return String(p).split('.').reduce((a,k)=>a==null?undefined:a[k],o)}
function norm(v){return String(v??'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function eq(a,b){return b===null?a==null:(typeof b==='boolean'||typeof b==='number')?a===b:norm(a)===norm(b)}
function assertCase(c,r){
  const next=nextObjective(r.j,r.f)
  const view={...r.j,ambiguity:r.ambiguity,field_status:r.f,next_objective:next}
  for(const [k,v] of Object.entries(c.expect||{})){
    if(k==='inventory_contains'){
      const joined=(r.j.inventory||[]).map(norm).join(' | ')
      if(!joined.includes(norm(v)))throw new Error(`${c.id}: inventory missing ${v}; actual=${joined}`)
      continue
    }
    if(k==='q.assistance_detail_contains'){
      if(!norm(r.j?.q?.assistance_detail).includes(norm(v)))throw new Error(`${c.id}: assistance detail missing ${v}; actual=${r.j?.q?.assistance_detail}`)
      continue
    }
    if(k==='q.vehicle.loading_contains'){
      if(!norm(r.j?.q?.vehicle?.loading).includes(norm(v)))throw new Error(`${c.id}: vehicle loading missing ${v}; actual=${r.j?.q?.vehicle?.loading}`)
      continue
    }
    if(k==='prompt_contains'){
      const actual=prompt(next,r.j,r.ambiguity)
      if(!norm(actual).includes(norm(v)))throw new Error(`${c.id}: prompt missing ${v}; actual=${actual}`)
      continue
    }
    const a=k.startsWith('field_status.')?r.f[k.slice('field_status.'.length)]:pathGet(view,k)
    if(!eq(a,v))throw new Error(`${c.id}: ${k} expected=${JSON.stringify(v)} actual=${JSON.stringify(a)}`)
  }
}

const fixtureFiles=['recorded-extractor-v1.jsonl','recorded-extractor-v2.jsonl','recorded-extractor-v3.jsonl']
const cases=[]
for(const file of fixtureFiles){
  const text=await Deno.readTextFile(new URL(`./${file}`,import.meta.url))
  for(const [i,line] of text.split(/\r?\n/).entries()){
    if(!line.trim())continue
    try{cases.push(JSON.parse(line))}catch(e){throw new Error(`${file} line ${i+1}: ${e}`)}
  }
}

for(const c of cases)Deno.test(`recorded extractor replay: ${c.id}`,()=>{
  const j0=shape(merge(structuredClone(EMPTY),c.initial||{}))
  const f0=requirements(j0,{})
  const direct=deterministic(c.message,c.objective_before,j0)
  const r=reduce(j0,f0,c.message,c.objective_before,c.candidate,direct,[])
  if(!r?.j||!r?.f)throw new Error(`${c.id}: reducer returned invalid result`)
  assertCase(c,r)
})

Deno.test('relative household pseudo-locations are rejected without substring false positives',()=>{
  for(const value of ["my nan's",'nans','gran','mums',"dad's house",'our parents','my mate','friends place','aunties']){
    if(!relativeHouseholdValue(value))throw new Error(`expected household reference to be rejected: ${value}`)
  }
  for(const value of ['Leeds','York','Bradford','Nantwich','Mumby','Grantham']){
    if(relativeHouseholdValue(value))throw new Error(`real place false-positive: ${value}`)
  }
})

Deno.test('recorded extractor replay corpus is nontrivial and PII-safe',()=>{
  if(cases.length<6)throw new Error(`expected at least 6 recorded cases, got ${cases.length}`)
  const raw=JSON.stringify(cases)
  if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(raw))throw new Error('email-like PII found in replay corpus')
  if(/(?:\+44\s?\d|\b07\d{9}\b)/.test(raw))throw new Error('phone-like PII found in replay corpus')
  if(cases.some(c=>!Number.isInteger(c.source_turn_id)))throw new Error('every replay case needs source_turn_id provenance')
})
