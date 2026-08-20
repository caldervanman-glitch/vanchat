// @ts-nocheck
import * as base from './flow56.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const prompt=base.prompt
export const faq=base.faq

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const safeCandidate=candidate&&typeof candidate==='object'?{...candidate,context_notes:[]}:candidate
  return base.reduce(j0,f0,message,obj,safeCandidate,direct,media)
}

export function review(j){
  const r=base.review(j)
  const risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  if(!j?.q?.assistance_detail&&j?.customer_assistance===false)risks.push('Lifting help: customer cannot help with lifting/loading')
  else if(!j?.q?.assistance_detail&&j?.customer_assistance===true)risks.push('Lifting help: customer states capable lifting help is available')
  if(j?.q?.completion&&!risks.some(x=>String(x).startsWith('Completion/key timing:')))risks.push(`Completion/key timing: ${j.q.completion}`)
  return {...r,quote_risks:risks}
}
