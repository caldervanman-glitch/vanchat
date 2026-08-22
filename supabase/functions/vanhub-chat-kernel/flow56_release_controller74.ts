// @ts-nocheck
import * as base from './flow56_release_controller73.ts'
import * as core from './core_release_controller50.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq

const HOUSE=new Set(['house_move','flat_move'])
const BIKE=/\b(?:motorbike|motorcycle|scooter|moped)\b/i
const ACCESS_RISK=/\b(?:stairs?|steps?|floor|lift|elevator|parking|park(?:ing)?|carry|metres?|meters?|yards?|feet|ft|roadworks?|loading bay|double yellow|single yellow|permit|narrow|doorway|long carry)\b/i
const APPLIANCE=/\b(?:washing machine|washer|dishwasher)\b/i
const PLUMBING_ASSUMPTION=/\b(?:still connected|driver (?:can|will|should|could|just) (?:disconnect|unplumb|reconnect|plumb)|disconnect it|reconnect it|unplumb|replumb|plumb it|seller says|expect(?:ing)? (?:the )?driver)\b/i
const VAGUE_HELP=/\b(?:loads?|lots?|plenty) of (?:us|people|mates?|friends?|family)?\s*(?:help(?:ing)?|to help)\b|\b(?:loads?|lots?) of us helping\b/i

const clean=v=>core.clean(v)
const norm=v=>core.canon(v)
function arr(v){return Array.isArray(v)?v:[]}
function quote(v){return String(v||'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,280)}
function pushDriverNote(j,text){
  const t=clean(text);if(!t)return
  j.q??={};j.q.driver_notes=arr(j.q.driver_notes)
  if(!j.q.driver_notes.some(x=>norm(x)===norm(t)))j.q.driver_notes.push(t)
}
function matchedPhrase(message,re){const m=String(message||'').match(re);return m?.[0]?quote(m[0]):null}
function riskyClause(message){
  const parts=String(message||'').split(/[.!?;]+/).map(x=>x.trim()).filter(Boolean)
  const hit=parts.filter(x=>ACCESS_RISK.test(x)).slice(0,2).join('; ')
  return hit?quote(hit):null
}
function applianceClause(message){
  const parts=String(message||'').split(/[.!?;]+/).map(x=>x.trim()).filter(Boolean)
  const hit=parts.find(x=>APPLIANCE.test(x)&&PLUMBING_ASSUMPTION.test(x))
  return hit?quote(hit):null
}
function bikePresent(j,message){return BIKE.test(String(message||''))||BIKE.test([...(j?.inventory||[]),...(j?.heavy_or_awkward_items||[]),j?.q?.notable].filter(Boolean).join(' '))}
function usefulBikeIdentity(v){
  const s=norm(v);if(!s)return false
  const tokens=s.split(/[^a-z0-9]+/).filter(Boolean).filter(x=>!['a','an','the','my','our','got','have','has','bike','motorbike','motorcycle','scooter','moped','vehicle'].includes(x)&&!/^\d+cc$/.test(x)&&x!=='cc')
  // Require make + model (or equivalent two-part identity). Capacity alone,
  // pronouns and phrases such as "got my" must never close this gate.
  return tokens.length>=2
}
function explicitAccessSide(message){
  return /\b(?:collection|collect(?:ion)?|pickup|pick[- ]?up|delivery|deliver(?:y)?|drop[- ]?off|at collection|at delivery)\b/i.test(String(message||''))
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j

  // One-turn customer warning: clear the previous warning before considering
  // whether this new message creates another one.
  if(j0?.q?.controller_appliance_notice)delete j.q.controller_appliance_notice

  const help=matchedPhrase(message,VAGUE_HELP)
  if(help){
    pushDriverNote(j,`Customer said: "${help}" — lifting help is not treated as confirmed capability. This needs direct qualification with the customer; the driver is the final decision-maker on whether to rely on that help.`)
    // Do not allow vague head-count/help language to satisfy the lifting gate.
    j.customer_assistance=null
    j.q.assistance_detail=null
    if(r.f?.assistance!=='na')r.f.assistance='missing'
  }

  const ap=applianceClause(message)
  if(ap){
    pushDriverNote(j,`Customer appliance statement: "${ap}" — appliance disconnection/reconnection is not included by default. Many drivers are not insured or willing to do plumbing work; it must be explicitly agreed with the driver.`)
    j.q.controller_appliance_notice='Important: appliance plumbing is not assumed. Many drivers are not insured or willing to disconnect/reconnect washing machines or dishwashers, so this must be explicitly agreed with the driver.'
  }

  const access=riskyClause(message)
  if(access){
    const suffix=explicitAccessSide(message)?'':' The customer did not explicitly identify which endpoint this applies to, so the endpoint must be confirmed.'
    pushDriverNote(j,`Customer access statement: "${access}".${suffix}`)
  }

  // Mixed house/flat moves must ask make/model before vehicle condition. Human
  // QA caught the parser storing "got my" as a motorbike identity from
  // "got my motorbike ... 125cc". Reject that sort of pseudo-identity.
  if(HOUSE.has(j?.category)&&bikePresent(j,message)&&!usefulBikeIdentity(j?.q?.vehicle?.identity)){
    if(j?.q?.vehicle)j.q.vehicle.identity=null
    if(r.f)r.f['vehicle.identity']='missing'
  }

  return r
}

export function prompt(o,j,amb=null){
  let actual=base.prompt(o,j,amb)
  if(j?.q?.controller_appliance_notice)actual=`${j.q.controller_appliance_notice}\n\n${actual}`
  if((o==='ask_dismantling'||o==='ask_reassembly')&&/\b(?:wardrobe|bed|table|desk|bookcase|shelving|sofa)\b/i.test((j?.inventory||[]).join(' '))){
    actual+=`\n\nIf dismantling or reassembly is involved, you can upload a photo if it would help the driver judge the job. A photo is useful but not required.`
  }
  return actual
}

export function review(j){
  const s=base.review(j),notes=arr(j?.q?.driver_notes).map(clean).filter(Boolean)
  if(notes.length)s.quote_risks=[...(s.quote_risks||[]),...notes]
  return s
}
