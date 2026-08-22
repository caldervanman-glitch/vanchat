// @ts-nocheck
// Security boundary for privileged vector audit operations. Supabase gateway JWT
// verification remains enabled; this adds application-level operator auth.
const OPERATOR_TOKEN_SHA256='1ecf156d45481856ad31ac34d0d19a36b3b43b9001f18142a8a8e60609fb14b3'
async function sha256(v){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(v||'')));return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,'0')).join('')}
function safeEq(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
async function operator(req){const t=req.headers.get('x-vanhub-operator-token')||'';return t.length>=32&&safeEq(await sha256(t),OPERATOR_TOKEN_SHA256)}
const nativeServe=Deno.serve.bind(Deno)
Deno.serve=(handler)=>nativeServe(async(req,info)=>{if(req.method==='OPTIONS')return handler(req,info);if(!await operator(req))return Response.json({error:'Forbidden'},{status:403});return handler(req,info)})
await import('./index.ts')
