import { createClient } from "npm:@supabase/supabase-js@2.95.0"
import { mergeDriverNotes, multiStopNote } from "../vanhub-chat-confirm/driver_notes_v6.ts"

const ORIGINS=new Set(["https://vanhubuk.com","https://www.vanhubuk.com"])
function allowed(o:string|null){return !o||ORIGINS.has(o)||/^https:\/\/(?:[a-z0-9-]+\.)?framer\.com$/i.test(o)||/^https:\/\/[a-z0-9-]+\.(framer\.app|framer\.website)$/i.test(o)||/^https:\/\/[a-z0-9.-]+\.(framerusercontent|framercanvas)\.com$/i.test(o)||/^http:\/\/localhost(?::\d+)?$/i.test(o)}
function cors(o:string|null){return {"Access-Control-Allow-Origin":o&&allowed(o)?o:"https://www.vanhubuk.com","Access-Control-Allow-Headers":"content-type, apikey, authorization, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(o:string|null,s:number,b:unknown){return new Response(JSON.stringify(b),{status:s,headers:{...cors(o),"Content-Type":"application/json","Cache-Control":"no-store"}})}
function uuid(v:unknown):v is string{return typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)}
function admin(){const url=Deno.env.get("SUPABASE_URL")||"",key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";if(!url||!key)throw new Error("env");return createClient(url,key,{auth:{persistSession:false}})}
function errorShape(e:unknown){if(e instanceof Error)return{name:e.name||"Error",message:e.message||String(e),stack:e.stack||null,cause:e.cause==null?null:String(e.cause)};if(e&&typeof e==="object"){const x=e as Record<string,unknown>;return{name:String(x.name||"Error"),message:String(x.message||x.details||x.hint||"Unknown error"),stack:null,cause:null,code:x.code==null?null:String(x.code)}}return{name:typeof e,message:String(e),stack:null,cause:null}}
function logError(event:string,e:unknown,ctx:Record<string,unknown>={}){console.error(JSON.stringify({event,...ctx,error:errorShape(e)}))}
async function sha256(v:string){const b=new TextEncoder().encode(v.trim().toLowerCase()),d=await crypto.subtle.digest("SHA-256",b);return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join("")}
async function geo(pc:string){pc=pc.trim();if(!pc)return null;const r=await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);if(!r.ok)return null;const p=await r.json();return p?.status===200&&p?.result?{postcode:p.result.postcode,outcode:p.result.outcode,latitude:p.result.latitude,longitude:p.result.longitude}:null}
function join(a:string[]){const c=a.map(x=>x.trim()).filter(Boolean);return c.length<2?(c[0]||""):`${c.slice(0,-1).join(", ")} and ${c[c.length-1]}`}
function load(j:any){const p:string[]=[];if(Array.isArray(j.inventory)&&j.inventory.length)p.push(join(j.inventory));if(Array.isArray(j.heavy_or_awkward_items)&&j.heavy_or_awkward_items.length)p.push(`Includes awkward/heavy items: ${join(j.heavy_or_awkward_items)}`);if(j.dismantling_required)p.push("dismantling required");if(j.reassembly_required)p.push("reassembly required");return p.join(". ")||String(j.job_type||"Transport job as described by the customer.")}
function access(j:any){const f=(l:any,n:string)=>{if(!l)return null;const b=[];if(l.property_type)b.push(l.property_type);if(l.floor)b.push(`${l.floor} floor`);if(l.internal_stairs)b.push(`internal stairs: ${l.internal_stairs}`);else if(l.stairs)b.push(l.stairs);if(l.external_steps)b.push(`outside steps: ${l.external_steps}`);if(l.lift)b.push(`lift: ${l.lift}`);if(l.parking)b.push(`parking: ${l.parking}`);if(l.carry_distance)b.push(`carry: ${l.carry_distance}`);if(l.access_notes)b.push(l.access_notes);return b.length?`${n}: ${b.join(", ")}`:null};return [f(j.collection,"Collection"),f(j.delivery,"Delivery")].filter(Boolean).join(". ")||null}
function hasDateFlex(j:any){return typeof j?.date?.flexibility==="string"&&j.date.flexibility.trim().length>0}
function statusMessage(status:any,live:boolean,magicLinkSent:boolean|null){if(live)return"Your job is now live on the VanHub job board.";if(status==="pending_verification"){if(magicLinkSent===false)return"Your job details are confirmed, but the verification email could not be sent. Please try again shortly.";return"Your job details are confirmed. Check your email to verify the request before it goes live on the VanHub job board."}if(status==="awaiting_review")return"Your job details are confirmed and the job is awaiting review.";return"Your job details have been confirmed."}

Deno.serve(async req=>{
  const o=req.headers.get("Origin")
  if(!allowed(o))return json(o,403,{error:"Origin not allowed"})
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(o)})
  if(req.method!=="POST")return json(o,405,{error:"Method not allowed"})
  let sessionId:string|null=null
  try{
    const b=await req.json();sessionId=uuid(b.sessionId)?b.sessionId:null
    if(!sessionId)return json(o,400,{error:"Invalid sessionId"})
    const sb=admin()
    const s=await sb.from("intake_sessions").select("id,status").eq("id",sessionId).maybeSingle()
    if(s.error)throw s.error
    if(!s.data)return json(o,404,{error:"Session not found"})
    const d=await sb.from("job_drafts").select("id,status,ready_for_review,job_data,job_id").eq("session_id",sessionId).maybeSingle()
    if(d.error)throw d.error
    if(!d.data)return json(o,404,{error:"Job draft not found"})
    if(!d.data.ready_for_review)return json(o,409,{error:"Job is not ready for confirmation"})
    if(d.data.status==="confirmed"&&d.data.job_id){
      const jr=await sb.from("jobs").select("public_reference,status").eq("id",d.data.job_id).maybeSingle()
      const live=jr.data?.status==="open"
      return json(o,200,{status:"confirmed",sessionId:s.data.id,draftId:d.data.id,jobId:d.data.job_id,publicReference:jr.data?.public_reference||null,boardStatus:jr.data?.status||null,live,message:statusMessage(jr.data?.status,live,null)})
    }
    const j=d.data.job_data,cp=String(j?.collection?.postcode||"").trim(),dp=String(j?.delivery?.postcode||"").trim(),[cg,dg]=await Promise.all([cp?geo(cp):null,dp?geo(dp):null]),email=j?.customer?.email?String(j.customer.email).trim().toLowerCase():null
    const payload={email,email_hash:email?await sha256(email):null,poster_name:j?.customer?.name||null,poster_phone:j?.customer?.phone||null,title:j?.title||null,category:j?.category||"other_transport",collection_postcode:cg?.postcode||cp,collection_outward_postcode:cg?.outcode||cp,collection_town:j?.collection?.town||null,collection_latitude:cg?.latitude??null,collection_longitude:cg?.longitude??null,delivery_postcode:dg?.postcode||dp||null,delivery_outward_postcode:dg?.outcode||dp||null,delivery_town:j?.delivery?.town||null,delivery_latitude:dg?.latitude??null,delivery_longitude:dg?.longitude??null,job_date:j?.date?.iso_date||null,time_window:j?.date?.time_preference||"Flexible",date_flexible:hasDateFlex(j),load_summary_public:load(j),vehicle_type:j?.vehicle_type||"not_sure",people_needed:j?.men_required??null,access_notes_public:mergeDriverNotes(access(j),multiStopNote(j)),private_notes:j?.additional_notes||null,idempotency_key:d.data.id}
    const cr=await sb.rpc("create_chatbot_job_internal",{p_payload:payload,p_draft_id:d.data.id})
    if(cr.error){logError("confirm_create_job_rpc_failed",cr.error,{sessionId:s.data.id,draftId:d.data.id});return json(o,400,{error:"We couldn't confirm that job - please check the details and try again."})}
    if(!cr.data?.accepted){logError("confirm_create_job_not_accepted",new Error("create_chatbot_job_internal returned accepted=false"),{sessionId:s.data.id,draftId:d.data.id});return json(o,400,{error:"That job could not be posted right now. Please try again shortly."})}
    await sb.from("intake_sessions").update({status:"confirmed",last_error:null}).eq("id",s.data.id)
    await sb.from("job_drafts").update({status:"confirmed"}).eq("id",d.data.id)
    let magicLinkSent=false
    if(email&&!cr.data.duplicate){
      const url=Deno.env.get("SUPABASE_URL")||"",anon=Deno.env.get("SUPABASE_ANON_KEY")||""
      if(url&&anon){const auth=createClient(url,anon,{auth:{persistSession:false}}),redirectTo=Deno.env.get("VANHUB_AUTH_REDIRECT_URL")||"https://www.vanhubuk.com/my-jobs";const a=await auth.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});magicLinkSent=!a.error;if(a.error)logError("confirm_magic_link_failed",a.error,{sessionId:s.data.id,draftId:d.data.id,jobId:cr.data.job_id})}
    }
    const live=cr.data?.status==="open"||cr.data?.auto_published===true
    return json(o,200,{status:"confirmed",sessionId:s.data.id,draftId:d.data.id,jobId:cr.data.job_id,publicReference:cr.data.public_reference,boardStatus:cr.data.status||null,live,magicLinkSent,emailVerificationRequired:Boolean(cr.data?.requires_email_verification),phoneOnly:Boolean(cr.data?.phone_only),message:statusMessage(cr.data?.status,live,magicLinkSent)})
  }catch(e){logError("confirm_unhandled",e,{sessionId,method:req.method});return json(o,500,{error:"The request could not be processed"})}
})
