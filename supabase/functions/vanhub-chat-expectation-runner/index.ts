// @ts-nocheck
import {createClient} from "npm:@supabase/supabase-js@2.95.0"

const TARGET="vanhub-chat-kernel"
const ORIGIN="https://www.vanhubuk.com"
const WAIT=725
const FIXTURE_REF="5a1e3063cd553375e28417488eb15c3129b2868d"
const REPO="caldervanman-glitch/vanchat"
const FILES=[
  "v47-regression.jsonl",
  "v48-date-assistance-canonicalization.jsonl",
  "v48-explicit-route-town-grounding.jsonl",
  "v48-final-polish.jsonl",
  "v48-inventory-retention.jsonl",
  "v48-mixed-specialists.jsonl",
  "v48-multistop-state.jsonl",
  "v48-partial-access-progression.jsonl",
  "v48-persistent-context.jsonl",
  "v48-progress-date-rendering.jsonl",
  "v48-quote-grade-state.jsonl",
  "v48-route-date-symmetric-retention.jsonl",
  "v48-safety-spam-ambiguity.jsonl",
  "v48-specialist-grounding.jsonl",
]

function admin(){
  const u=Deno.env.get("SUPABASE_URL")||""
  let k=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""
  if(!k)try{k=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||""}catch{}
  if(!u||!k)throw Error("ENV")
  return createClient(u,k,{auth:{persistSession:false}})
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const norm=v=>String(v??"").toLowerCase().replace(/[’']/g,"'").replace(/\s+/g," ").trim()
const arr=v=>Array.isArray(v)?v:[v]
const pathGet=(o,p)=>String(p).split(".").reduce((a,k)=>a==null?undefined:a[k],o)
const sigTokens=v=>norm(v).split(/[^a-z0-9]+/).filter(x=>x&&!["a","an","the","and","of","about","around","roughly"].includes(x))
const tokenContains=(hay,needle)=>{const h=new Set(sigTokens(hay));const n=sigTokens(needle);return n.length>0&&n.every(x=>h.has(x))}
const textContains=(hay,needle)=>norm(hay).includes(norm(needle))
const valueEq=(a,b)=>{
  if(b===null)return a==null
  if(typeof b==="boolean"||typeof b==="number")return a===b
  return norm(a)===norm(b)
}
const listContainsAll=(actual,expected)=>{
  if(!Array.isArray(actual))return false
  const joined=actual.map(norm).join(" | ")
  return arr(expected).every(e=>tokenContains(joined,e))
}
const exactListContainsAll=(actual,expected)=>Array.isArray(actual)&&arr(expected).every(e=>actual.some(a=>norm(a)===norm(e)))

async function loadFixture(file){
  if(!FILES.includes(file))throw Error(`UNKNOWN_FIXTURE:${file}`)
  const url=`https://raw.githubusercontent.com/${REPO}/${FIXTURE_REF}/tests/conversation/${file}`
  const r=await fetch(url,{headers:{"Accept":"text/plain"}})
  if(!r.ok)throw Error(`FIXTURE_HTTP_${r.status}:${file}`)
  const text=await r.text(),out=[]
  for(const [i,line] of text.split(/\r?\n/).entries()){
    if(!line.trim())continue
    try{out.push(JSON.parse(line))}catch(e){throw Error(`FIXTURE_JSON:${file}:${i+1}:${e}`)}
  }
  return out
}

async function callKernel(sessionId,turn,pageContext){
  const url=`${Deno.env.get("SUPABASE_URL")}/functions/v1/${TARGET}`
  const message=typeof turn==="string"?turn:String(turn?.message||"")
  const body={action:"message",sessionId:sessionId||undefined,message,pageContext}
  if(Array.isArray(turn?.attachments))body.attachments=turn.attachments
  let last=null
  for(let n=0;n<3;n++){
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Origin":ORIGIN},body:JSON.stringify(body)})
    let p={};try{p=await r.json()}catch{}
    last={status:r.status,p}
    if(![429,502,503,504].includes(r.status))return last
    if(typeof p?.sessionId==="string")sessionId=p.sessionId
    await sleep(WAIT+200*(n+1))
    body.sessionId=sessionId||undefined
  }
  return last
}
async function state(sb,id){
  if(!id)return null
  const r=await sb.from("job_drafts").select("job_data,field_status,last_objective,ready_for_review,state_revision,status,review_summary,job_id").eq("session_id",id).maybeSingle()
  if(r.error)throw r.error
  return r.data?{...r.data,ready_for_review:!!r.data.ready_for_review,state_revision:Number(r.data.state_revision||0)}:null
}

function pushFail(f,msg){f.push(msg)}
function checkReply(expect,reply,f){
  if(expect.reply_contains!==undefined)for(const x of arr(expect.reply_contains))if(!textContains(reply,x))pushFail(f,`REPLY_MISSING:${x}`)
  if(expect.reply_not_contains!==undefined)for(const x of arr(expect.reply_not_contains))if(textContains(reply,x))pushFail(f,`REPLY_FORBIDDEN:${x}`)
}
function checkEndpoint(name,expected,j,f){
  if(!expected||typeof expected!=="object"||Array.isArray(expected)){pushFail(f,`BAD_${name.toUpperCase()}_EXPECTATION`);return}
  for(const [k,v] of Object.entries(expected)){
    if(!["town","postcode","address_text","property_type","floor","stairs","lift","parking","internal_stairs","external_steps","carry_distance","access_notes"].includes(k)){pushFail(f,`UNSUPPORTED_${name.toUpperCase()}_KEY:${k}`);continue}
    if(!valueEq(j?.[name]?.[k],v))pushFail(f,`${name.toUpperCase()}_${k.toUpperCase()}:expected=${JSON.stringify(v)} actual=${JSON.stringify(j?.[name]?.[k])}`)
  }
}
function stateActual(key,st){
  const j=st?.job_data||{},q=j.q||{},fs=st?.field_status||{}
  if(key.includes("."))return {kind:"value",value:pathGet(j,key)}
  const map={
    category:()=>j.category,
    collection_town:()=>j.collection?.town,delivery_town:()=>j.delivery?.town,
    collection_postcode:()=>j.collection?.postcode,delivery_postcode:()=>j.delivery?.postcode,
    date_iso:()=>j.date?.iso_date,date_flexibility:()=>j.date?.flexibility,time:()=>j.date?.time_preference,
    customer_name:()=>j.customer?.name,customer_phone:()=>j.customer?.phone,customer_assistance:()=>j.customer_assistance,
    vehicle_identity:()=>q.vehicle?.identity,vehicle_runs:()=>q.vehicle?.runs,vehicle_rolls:()=>q.vehicle?.rolls,vehicle_steers:()=>q.vehicle?.steers,vehicle_brakes:()=>q.vehicle?.brakes,
    dismantling_mode:()=>q.dismantling_mode,reassembly_required:()=>j.reassembly_required,
    appliance_disconnected:()=>q.appliances?.disconnected,appliance_reconnect:()=>q.appliances?.reconnect_requested,
    loose_items:()=>q.loose_items,notable:()=>q.notable,house_volume:()=>q.house_volume,
    passenger_luggage:()=>q.passenger?.luggage,passenger_count:()=>q.passenger?.count,
    ride_request_count:()=>q.ride_request?.count,ride_child_age:()=>q.ride_request?.child_age,ride_child_height_cm:()=>q.ride_request?.child_height_cm,
  }
  if(map[key])return {kind:"value",value:map[key]()}
  const special={
    collection_parking_contains:()=>({kind:"contains",value:j.collection?.parking}),delivery_parking_contains:()=>({kind:"contains",value:j.delivery?.parking}),
    date_original_contains:()=>({kind:"contains",value:j.date?.original_text}),assistance_contains:()=>({kind:"contains",value:q.assistance_detail}),assistance_detail_contains:()=>({kind:"contains",value:q.assistance_detail}),
    vehicle_loading_contains:()=>({kind:"contains",value:q.vehicle?.loading}),additional_notes_contains:()=>({kind:"contains",value:j.additional_notes}),
    completion_contains:()=>({kind:"contains_all",value:q.completion}),inventory_contains:()=>({kind:"inventory",value:j.inventory||[]}),inventory_contains_all:()=>({kind:"inventory",value:j.inventory||[]}),
    inventory_status:()=>({kind:"value",value:fs.inventory}),volume_status:()=>({kind:"value",value:fs.volume}),
    notable_known:()=>({kind:"bool",value:fs.notable==="known"}),packing_known:()=>({kind:"bool",value:fs.packing==="known"}),
    assistance_not_known:()=>({kind:"bool",value:fs.assistance!=="known"}),vehicle_condition_known:()=>({kind:"bool",value:fs["vehicle.condition"]==="known"}),
    fit_issue_known:()=>({kind:"bool",value:!!q.fit_access_issue}),fit_plan_missing:()=>({kind:"bool",value:!q.fit_access_plan}),
    materials_absent:()=>({kind:"bool",value:q.materials==null}),media_count:()=>({kind:"value",value:Array.isArray(j.media)?j.media.length:0}),
    multi_stop_collections:()=>({kind:"exact_list",value:q.multi_stop?.collections||[]}),multi_stop_deliveries:()=>({kind:"exact_list",value:q.multi_stop?.deliveries||[]}),
    category_not:()=>({kind:"not_value",value:j.category}),
  }
  return special[key]?special[key]():null
}
function checkState(expected,st,f){
  if(!expected||typeof expected!=="object"||Array.isArray(expected)){pushFail(f,"BAD_STATE_EXPECTATION");return}
  for(const [k,v] of Object.entries(expected)){
    const a=stateActual(k,st)
    if(!a){pushFail(f,`UNSUPPORTED_STATE_KEY:${k}`);continue}
    if(a.kind==="value"&&!valueEq(a.value,v))pushFail(f,`STATE_${k}:expected=${JSON.stringify(v)} actual=${JSON.stringify(a.value)}`)
    else if(a.kind==="not_value"&&valueEq(a.value,v))pushFail(f,`STATE_${k}:forbidden=${JSON.stringify(v)}`)
    else if(a.kind==="contains"&&!textContains(a.value,v))pushFail(f,`STATE_${k}_MISSING:${v}`)
    else if(a.kind==="contains_all"&&arr(v).some(x=>!textContains(a.value,x)))pushFail(f,`STATE_${k}_MISSING:${JSON.stringify(v)}`)
    else if(a.kind==="inventory"&&!listContainsAll(a.value,v))pushFail(f,`STATE_${k}_MISSING:${JSON.stringify(v)} actual=${JSON.stringify(a.value)}`)
    else if(a.kind==="exact_list"&&!exactListContainsAll(a.value,v))pushFail(f,`STATE_${k}_MISSING:${JSON.stringify(v)} actual=${JSON.stringify(a.value)}`)
    else if(a.kind==="bool"&&a.value!==v)pushFail(f,`STATE_${k}:expected=${v} actual=${a.value}`)
  }
}
const TOP_KEYS=new Set(["objective","objective_not","not_objective","last_objective_not","reply_contains","reply_not_contains","category","category_not","state","collection","delivery"])
function checkExpect(expect,response,st){
  const f=[]
  if(!expect||typeof expect!=="object"||Array.isArray(expect))return f
  for(const k of Object.keys(expect))if(!TOP_KEYS.has(k))pushFail(f,`UNSUPPORTED_EXPECTATION_KEY:${k}`)
  const objective=response?.objective??st?.last_objective??null
  if(expect.objective!==undefined&&!valueEq(objective,expect.objective))pushFail(f,`OBJECTIVE:expected=${expect.objective} actual=${objective}`)
  const neg=expect.objective_not??expect.not_objective
  if(neg!==undefined&&valueEq(objective,neg))pushFail(f,`OBJECTIVE_FORBIDDEN:${neg}`)
  if(expect.last_objective_not!==undefined&&valueEq(st?.last_objective,expect.last_objective_not))pushFail(f,`LAST_OBJECTIVE_FORBIDDEN:${expect.last_objective_not}`)
  checkReply(expect,response?.reply||"",f)
  const cat=st?.job_data?.category
  if(expect.category!==undefined&&!valueEq(cat,expect.category))pushFail(f,`CATEGORY:expected=${expect.category} actual=${cat}`)
  if(expect.category_not!==undefined&&valueEq(cat,expect.category_not))pushFail(f,`CATEGORY_FORBIDDEN:${expect.category_not}`)
  if(expect.collection!==undefined)checkEndpoint("collection",expect.collection,st?.job_data||{},f)
  if(expect.delivery!==undefined)checkEndpoint("delivery",expect.delivery,st?.job_data||{},f)
  if(expect.state!==undefined)checkState(expect.state,st,f)
  return f
}

function normalizeTurns(s){
  if(!Array.isArray(s?.turns))return []
  return s.turns.map(x=>typeof x==="string"?{message:x}:x).filter(x=>typeof x?.message==="string"&&x.message.trim())
}
async function runScenario(sb,runId,file,s){
  if(s?.type==="concurrency")return {skipped:true,failed:false,error:null}
  const turns=normalizeTurns(s),transcript=[],allFailures=[]
  let sessionId=null,lastState=null,error=null
  const sid=String(s?.id||s?.name||"unnamed")
  const pc={title:"vanhub-chat-kernel expectation",url:`internal://qa/${TARGET}/expectation/${file}/${sid}`,isDriverProfile:false}
  try{
    for(let i=0;i<turns.length;i++){
      if(i)await sleep(WAIT)
      const turn=turns[i],r=await callKernel(sessionId,turn,pc),p=r?.p||{}
      if(!sessionId&&typeof p.sessionId==="string")sessionId=p.sessionId
      if(typeof p.sessionId==="string")sessionId=p.sessionId
      if(sessionId)lastState=await state(sb,sessionId)
      const failures=r?.status===200?checkExpect(turn.expect,p,lastState):[`HTTP_${r?.status}:${p?.error||"unknown"}`]
      allFailures.push(...failures.map(x=>`turn_${i+1}:${x}`))
      transcript.push({turn:i+1,user:turn.message,reply:p.reply||null,objective:p.objective||null,stage:p.stage||null,progress:p.progress??null,ready_for_review:!!p.readyForReview,http_status:r?.status??null,expect:turn.expect||null,expectation_failures:failures})
      if(r?.status!==200){error=`HTTP_${r?.status}:${p?.error||"unknown"}`;break}
    }
    if(!error&&s?.expect){const p=transcript.at(-1)||{};allFailures.push(...checkExpect(s.expect,p,lastState).map(x=>`final:${x}`))}
  }catch(e){error=e instanceof Error?e.message:String(e);allFailures.push(`RUNNER:${error}`)}
  const flags=[...new Set(allFailures)]
  if(lastState?.job_id)flags.push("UNEXPECTED_JOB_CREATED")
  const ins=await sb.from("qa_chatbot_acceptance_results").insert({run_id:runId,scenario_id:`${file}:${sid}`,scenario_name:sid,scenario_group:file,input_turns:turns,transcript,final_state:lastState,auto_flags:flags,error})
  if(ins.error)throw ins.error
  return {skipped:false,failed:!!error||flags.length>0,error,flags}
}

Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("ok")
  if(req.method!=="POST")return Response.json({error:"Method not allowed"},{status:405})
  let b={};try{b=await req.json()}catch{return Response.json({error:"Invalid JSON"},{status:400})}
  const file=String(b.file||"")
  if(!FILES.includes(file))return Response.json({error:"file must be a known conversation fixture",files:FILES},{status:400})
  const offset=Math.max(0,Number(b.offset||0)),limit=b.limit==null?null:Math.max(1,Math.min(50,Number(b.limit)))
  const sb=admin();let list
  try{list=(await loadFixture(file)).slice(offset,limit==null?undefined:offset+limit)}catch(e){return Response.json({error:String(e)},{status:500})}
  const fileIndex=FILES.indexOf(file)
  const rr=await sb.from("qa_chatbot_acceptance_runs").insert({batch:100+fileIndex,status:"running",started_at:new Date().toISOString(),summary:{target:TARGET,source:"github-expectation",fixture_ref:FIXTURE_REF,file,offset,limit,scenarios:list.length}}).select("id").single()
  if(rr.error)return Response.json({error:rr.error.message},{status:500})
  const runId=rr.data.id
  try{
    let passed=0,failed=0,skipped=0,infra_errors=0
    for(const s of list){
      const r=await runScenario(sb,runId,file,s)
      if(r.skipped){skipped++;continue}
      if(r.failed)failed++;else passed++
      if(r.error)infra_errors++
    }
    const summary={target:TARGET,source:"github-expectation",fixture_ref:FIXTURE_REF,file,offset,limit,scenarios:list.length,evaluated:passed+failed,passed,failed,skipped_concurrency:skipped,infra_errors}
    await sb.from("qa_chatbot_acceptance_runs").update({status:"completed",finished_at:new Date().toISOString(),summary,error:null}).eq("id",runId)
    return Response.json({run_id:runId,...summary})
  }catch(e){
    const msg=e instanceof Error?e.message:String(e)
    await sb.from("qa_chatbot_acceptance_runs").update({status:"failed",finished_at:new Date().toISOString(),error:msg}).eq("id",runId)
    return Response.json({run_id:runId,error:msg},{status:500})
  }
})
