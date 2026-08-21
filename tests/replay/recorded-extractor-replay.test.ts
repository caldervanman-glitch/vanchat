// @ts-nocheck
import {EMPTY,shape,requirements,nextObjective,clean} from '../../supabase/functions/vanhub-chat-kernel/core_release_highvalue.ts'
import {reduce} from '../../supabase/functions/vanhub-chat-kernel/flow56_release_controller44.ts'

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
  const view={...r.j,field_status:r.f,next_objective:nextObjective(r.j,r.f)}
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
    const a=pathGet(view,k)
    if(!eq(a,v))throw new Error(`${c.id}: ${k} expected=${JSON.stringify(v)} actual=${JSON.stringify(a)}`)
  }
}

const text=await Deno.readTextFile(new URL('./recorded-extractor-v1.jsonl',import.meta.url))
const cases=text.split(/\r?\n/).filter(x=>x.trim()).map((line,i)=>{try{return JSON.parse(line)}catch(e){throw new Error(`fixture line ${i+1}: ${e}`)}})

for(const c of cases)Deno.test(`recorded extractor replay: ${c.id}`,()=>{
  const j0=shape(merge(structuredClone(EMPTY),c.initial||{}))
  const f0=requirements(j0,{})
  const r=reduce(j0,f0,c.message,c.objective_before,c.candidate,null,[])
  if(!r?.j||!r?.f)throw new Error(`${c.id}: reducer returned invalid result`)
  assertCase(c,r)
})

Deno.test('recorded extractor replay corpus is nontrivial and PII-safe',()=>{
  if(cases.length<6)throw new Error(`expected at least 6 recorded cases, got ${cases.length}`)
  const raw=JSON.stringify(cases)
  if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(raw))throw new Error('email-like PII found in replay corpus')
  if(/(?:\+44\s?\d|\b07\d{9}\b)/.test(raw))throw new Error('phone-like PII found in replay corpus')
  if(cases.some(c=>!Number.isInteger(c.source_turn_id)))throw new Error('every replay case needs source_turn_id provenance')
})
