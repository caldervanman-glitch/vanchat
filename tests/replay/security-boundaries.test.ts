// @ts-nocheck
const guarded=[
  'supabase/functions/vanhub-vector-audit/secure_entrypoint.ts',
  'supabase/functions/vanhub-vector-distill/secure_entrypoint.ts',
  'supabase/functions/vanhub-refinery-adjudicate/secure_entrypoint.ts',
  'supabase/functions/vanhub-chat-expectation-runner/secure_fixture_redirect_v6.ts',
  'supabase/functions/vanhub-vector-audit-fallback/index.ts',
]

for(const path of guarded)Deno.test(`security boundary present: ${path}`,async()=>{
  const text=await Deno.readTextFile(path)
  if(!text.includes('x-vanhub-operator-token'))throw new Error(`${path}: missing operator header check`)
  if(!text.includes('OPERATOR_TOKEN_SHA256'))throw new Error(`${path}: missing hashed operator verifier`)
  if(/\bconst\s+TOKEN\s*=/.test(text))throw new Error(`${path}: raw hard-coded token declaration found`)
  if(text.includes('x-qa-token'))throw new Error(`${path}: legacy QA-token bypass found`)
})

Deno.test('security migrations use Vault operator token and no raw token literal',async()=>{
  const paths=[
    'supabase/migrations/20260822102655_security_operator_auth_helpers.sql',
    'supabase/migrations/20260822103027_security_operator_auth_bearer_headers.sql',
  ]
  for(const path of paths){
    const text=await Deno.readTextFile(path)
    if(!text.includes("name='vanhub_operator_token'"))throw new Error(`${path}: operator token not loaded from Vault`)
    if(!text.includes('x-vanhub-operator-token'))throw new Error(`${path}: operator header not propagated`)
    if(text.includes('x-qa-token'))throw new Error(`${path}: legacy QA token header remains`)
  }
})

Deno.test('operator-token injecting SECURITY DEFINER helpers are service-role only',async()=>{
  const path='supabase/migrations/20260822113000_lock_operator_auth_helpers.sql'
  const text=await Deno.readTextFile(path)
  const helpers=[
    'private.qa_expectation_invoke(text, integer, integer)',
    'public.qa_refinery_distill_invoke(text, integer)',
    'public.qa_refinery_adjudicate_invoke(text)',
    'public.qa_refinery_adjudicate_sync(text)',
    'public.qa_vector_fallback_invoke(text, integer, integer)',
    'public.qa_vector_fallback_invoke_name(text, integer, integer)',
  ]
  for(const fn of helpers){
    if(!text.includes(`revoke all on function ${fn} from public, anon, authenticated`))throw new Error(`${fn}: missing public/anon/authenticated revoke`)
    if(!text.includes(`grant execute on function ${fn} to service_role`))throw new Error(`${fn}: missing service_role grant`)
  }
})

Deno.test('security scan runbook preserves targeted revalidation boundary',async()=>{
  const text=await Deno.readTextFile('security/FINAL_CHATBOT_DELTA_SCAN.md')
  for(const required of ['1c7778f8ed443553f4eed684ddb6dbc7d6fc6b27','Finding 1','Finding 5','$security-diff-scan','<FINAL_FROZEN_HEAD>']){
    if(!text.includes(required))throw new Error(`final scan runbook missing ${required}`)
  }
})
