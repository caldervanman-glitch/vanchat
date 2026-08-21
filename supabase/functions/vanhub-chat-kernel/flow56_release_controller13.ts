// @ts-nocheck
import * as base from './flow56_release_controller12.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

function vagueHelp(s){return /\b(?:loads?|lots?|plenty|enough)\s+of\s+(?:us|people|help)\b|\bthere (?:will|will be|are)\s+(?:loads?|lots?|plenty|people|helpers?)\b/i.test(s)}
function noHelp(s){return /\b(?:i|we)\s+(?:can't|cannot|won't|will not|am not able to|are not able to)\s+(?:help|lift|load|carry)\b|\bno(?:body| one|-one)?\s+(?:can|will|is able to)\s+(?:help|lift|load|carry)\b|\bdriver\s+(?:will\s+)?need(?:s)?\s+to\s+do\s+all\s+(?:the\s+)?(?:lifting|loading|carrying)\b/i.test(s)}
function capableHelp(s){
  if(vagueHelp(s))return false
  return /\b(?:i|we|me\s+and\s+my\s+\w+|my\s+\w+\s+and\s+i|my\s+\w+\s+and\s+me|two\s+of\s+us|three\s+of\s+us|\d+\s+of\s+us|\d+\s+people|customer\s+and\s+(?:friend|brother|sister|partner))\s+(?:can|will|are able to|am able to)\s+(?:both\s+)?(?:help\s+)?(?:lift|load|unload|carry)\b/i.test(s)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j,s=String(message||'')
  if(noHelp(s)){
    j.customer_assistance=false;j.q??={};j.q.assistance_detail=s.trim();r.f.assistance='known'
  }else if(capableHelp(s)){
    j.customer_assistance=true;j.q??={};j.q.assistance_detail=s.trim();r.f.assistance='known'
  }
  return r
}
