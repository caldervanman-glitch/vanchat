// @ts-nocheck
// QA-only fallback reader. Requires BOTH Supabase gateway JWT verification and
// the separate VanHub operator token. No raw operator credential is committed.
const OPERATOR_TOKEN_SHA256='1ecf156d45481856ad31ac34d0d19a36b3b43b9001f18142a8a8e60609fb14b3'
const VS=Deno.env.get('VANHUB_VECTOR_STORE_ID')||'vs_6a84539e4a348191956211ede0cf1a26'
const API='https://api.openai.com/v1'
async function sha256(v){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(v||'')));return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,'0')).join('')}
function safeEq(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
async function operator(req){const t=req.headers.get('x-vanhub-operator-token')||'';return t.length>=32&&safeEq(await sha256(t),OPERATOR_TOKEN_SHA256)}
function key(){const k=Deno.env.get('OPENAI_API_KEY')||'';if(!k)throw Error('NO_OPENAI_API_KEY');return k}
async function parsed(fileId){const r=await fetch(`${API}/vector_stores/${VS}/files/${encodeURIComponent(fileId)}/content`,{headers:{Authorization:`Bearer ${key()}`,'Content-Type':'application/json','OpenAI-Beta':'assistants=v2'}});let p={};try{p=await r.json()}catch{};if(!r.ok)throw Error(`OPENAI_${r.status}:${p?.error?.message||JSON.stringify(p)}`);return p}
function blocksOf(p){if(Array.isArray(p?.content))return p.content;if(Array.isArray(p?.data))return p.data;if(Array.isArray(p))return p;return []}
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok');if(!await operator(req))return Response.json({error:'Forbidden'},{status:403});if(req.method!=='POST')return new Response('method',{status:405});let b={};try{b=await req.json()}catch{return Response.json({error:'json'},{status:400})};const fileId=String(b.file_id||'');if(!fileId)return Response.json({error:'file_id'},{status:400});const start=Math.max(0,Number(b.start)||0),limit=Math.max(1,Math.min(20000,Number(b.limit)||18000));try{const p=await parsed(fileId),text=blocksOf(p).map(x=>String(x?.text||x?.content||'')).join('\n\n');return Response.json({file_id:fileId,total_chars:text.length,start,end:Math.min(text.length,start+limit),has_more:start+limit<text.length,text:text.slice(start,start+limit)})}catch(e){return Response.json({error:e instanceof Error?e.message:String(e)},{status:500})}})
