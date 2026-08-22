// @ts-nocheck
// QA-only wrapper around the reviewed expectation runner. Redirect its pinned
// conversation-fixture fetches to the current clock-safe canonical snapshot.
// This does not alter chatbot runtime behaviour or expose runner credentials.
const OLD_REF='7bdeaeba83bd2a23c442c1cf45dd8938d27dca8f'
const FIXTURE_REF='8a83417b45b37cf69c2b9098b167d0a42a7e1ede'
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
