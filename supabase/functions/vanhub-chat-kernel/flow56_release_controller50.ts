// @ts-nocheck
import * as base from './flow56_release_controller49.ts'
import {canon,clean} from './core_release_controller49.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

const CONFIRM='__CONTROLLER_DATE_CONFIRM__:'
const validIso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))
const yes=v=>/^(?:yes|yeah|yep|correct|right|yes please|that's right|thats right)$/i.test(canon(v))
const no=v=>/^(?:no|nope|wrong|that's wrong|thats wrong)$/i.test(canon(v))

function dateLabel(iso){try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${iso}T12:00:00Z`))}catch{return iso}}
function literalDateText(candidate,message){
  const m=canon(message)
  const f=(candidate?.facts||[]).find(x=>x?.k==='date.original_text'&&clean(x?.v)&&clean(x?.evidence)&&m.includes(canon(x.evidence)))
  return clean(f?.v)
}

export function prompt(o,j,amb=null){
  const ack=clean(j?.q?.controller_date_ack_iso)
  if(validIso(ack)&&o!=='ask_date'){
    const x=structuredClone(j)
    if(x.q)delete x.q.controller_date_ack_iso
    return `Got it — ${dateLabel(ack)}. ${base.prompt(o,x,amb)}`
  }
  return base.prompt(o,j,amb)
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const pendingBefore=clean(j0?.q?.pending_date_iso)
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={};j.date??={original_text:null,iso_date:null,alternative_iso_dates:[],flexibility:null,time_preference:null}

  // A pending complex-relative date is deliberately unconfirmed. Generic
  // weekday normalisation later in the legacy chain must not turn the word
  // "Friday" into the next ordinary Friday and silently make the date known.
  const pendingNow=clean(j.q.pending_date_iso)
  if(validIso(pendingNow)&&!(obj==='ask_date'&&pendingBefore===pendingNow&&yes(message))){
    j.date.iso_date=null
    const human=literalDateText(candidate,message)
    if(human)j.date.original_text=human
    r.f.date='missing'
    delete j.q.controller_date_ack_iso
    // Keep the deterministic confirmation marker if a later controller has
    // replaced/cleared it while the confirmation is still outstanding.
    if(!String(r.ambiguity||'').startsWith(CONFIRM))r.ambiguity=CONFIRM+pendingNow
  }

  // Confirmation is a deterministic state transition. Do not depend on the
  // extractor manufacturing a fresh ISO fact from the word "yes".
  if(obj==='ask_date'&&validIso(pendingBefore)&&yes(message)){
    j.date.iso_date=pendingBefore
    j.date.original_text=clean(j0?.date?.original_text)||clean(j.date.original_text)||null
    delete j.q.pending_date_iso
    delete j.q.pending_date_text
    j.q.controller_date_ack_iso=pendingBefore
    r.f.date='known'
    r.ambiguity=null
  }else if(obj==='ask_date'&&validIso(pendingBefore)&&no(message)){
    j.date.iso_date=null
    delete j.q.pending_date_iso
    delete j.q.pending_date_text
    delete j.q.controller_date_ack_iso
    r.f.date='missing'
    r.ambiguity=null
  }
  return r
}
