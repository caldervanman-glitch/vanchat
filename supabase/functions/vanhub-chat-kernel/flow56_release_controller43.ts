// @ts-nocheck
import * as base from './flow56_release_controller42.ts'
import {clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function literalDismantlingDecision(message){
  const s=String(message||'')
  if(/\b(?:already\s+)?dismantled\b|\b(?:is|it's|its|they(?:'re| are))\s+already\s+(?:apart|in\s+(?:pieces|sections|panels))\b/i.test(s))return true
  if(/\b(?:i|we)\s*(?:'ll|will|can|am going to|are going to)\s+(?:dismantle|take\s+(?:it|them|the\s+\w+)\s+apart|break\s+(?:it|them)\s+down)\b/i.test(s))return true
  if(/\b(?:customer|seller|shop)\s+(?:will|can|is going to)\s+(?:dismantle|take\s+(?:it|them)\s+apart|break\s+(?:it|them)\s+down)\b/i.test(s))return true
  if(/\b(?:driver|mover|crew|you)\s+(?:will|must|needs? to|has to|should|can)\s+(?:dismantle|take\s+(?:it|them)\s+apart|break\s+(?:it|them)\s+down)\b/i.test(s))return true
  if(/\b(?:need|want|require)\s+(?:the\s+)?(?:driver|mover|crew|you)\s+to\s+(?:dismantle|take\s+(?:it|them)\s+apart|break\s+(?:it|them)\s+down)\b/i.test(s))return true
  if(/\b(?:does(?:n't| not)|won't|will not|no need to)\s+(?:need\s+to\s+)?(?:be\s+)?dismantl/i.test(s))return true
  return false
}

function proposedDismantling(candidate){
  return (candidate?.facts||[]).find(x=>x?.k==='dismantling_mode'&&['operational','correction','approximate'].includes(String(x?.kind||'')))||null
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const before=clean(j0?.q?.dismantling_mode)
  const proposed=proposedDismantling(candidate)
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  const after=clean(r?.j?.q?.dismantling_mode)

  // A statement such as "it comes apart into 3 sections" proves separability,
  // not who will dismantle it. Responsibility/status stays unknown unless the
  // latest customer message explicitly supplies that decision.
  if(!before&&after&&proposed&&!literalDismantlingDecision(message)){
    r.j.q.dismantling_mode=null
    r.j.dismantling_required=null
    r.f=requirements(r.j,r.f)
  }
  return r
}
