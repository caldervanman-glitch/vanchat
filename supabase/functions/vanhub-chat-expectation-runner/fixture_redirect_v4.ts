// @ts-nocheck
// QA-only wrapper around the reviewed expectation runner. The v3 runner has a
// hard-coded fixture commit; redirect only its conversation-fixture fetches to
// the corrected canonical snapshot without exposing the runner JWT or changing
// runtime chatbot behaviour.
const OLD_REF='7bdeaeba83bd2a23c442c1cf45dd8938d27dca8f'
const FIXTURE_REF='9252c95b00e8a56d8bad792f0030aa148dbe58cf'
const PREFIX=`https://raw.githubusercontent.com/caldervanman-glitch/vanchat/${OLD_REF}/tests/conversation/`
const nativeFetch=globalThis.fetch.bind(globalThis)
globalThis.fetch=(input:any,init?:any)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.toString():input?.url
  if(typeof url==='string'&&url.startsWith(PREFIX)){
    const next=url.replace(`/${OLD_REF}/tests/conversation/`,`/${FIXTURE_REF}/tests/conversation/`)
    return nativeFetch(next,init)
  }
  return nativeFetch(input,init)
}
await import('https://raw.githubusercontent.com/caldervanman-glitch/vanchat/ef468d729e4cea2460b1ee1df1b8e41ca2a524c7/supabase/functions/vanhub-chat-expectation-runner/index.ts')
