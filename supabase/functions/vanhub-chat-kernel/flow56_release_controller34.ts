// @ts-nocheck
import * as base from './flow56_release_controller33.ts'
import {canon,clean,requirements} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const faq=base.faq
export const prompt=base.prompt

function town(v){return String(v||'').trim().replace(/\s+(?:on\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|next\s+\w+).*$/i,'').trim()}
function note(j,text){if(!text)return;j.additional_notes=[clean(j.additional_notes),text].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).join('; ')}
function boxOnly(j){const a=(j?.inventory||[]).map(canon).filter(Boolean);return a.length>0&&a.every(x=>/\b(?:boxes?|bags?)\b/.test(x)&&!/\b(?:sofa|wardrobe|bed|table|chair|fridge|machine|piano|safe|furniture)\b/.test(x))}
function inferContainerCategory(j){if(!j.category&&boxOnly(j)&&(clean(j.collection?.town)||clean(j.collection?.postcode))&&(clean(j.delivery?.town)||clean(j.delivery?.postcode)))j.category='courier'}
function multiCollections(j,message){
  const s=String(message||'')
  const m=s.match(/\b(?:a\s+)?(?:sofa|bed|wardrobe|table|chair|item|piece)[^,;]{0,35}?\s+from\s+([A-Za-z][A-Za-z .'-]{1,35}?)\s+and\s+(?:a\s+)?(?:sofa|bed|wardrobe|table|chair|item|piece)[^,;]{0,35}?\s+from\s+([A-Za-z][A-Za-z .'-]{1,35}?)\s+both\s+delivered\s+to\s+([A-Za-z][A-Za-z .'-]{1,35}?)(?=\s+(?:on|tomorrow|today|at)\b|[,.]|$)/i)
  if(!m)return false
  const a=town(m[1]),b=town(m[2]),d=town(m[3]);if(!a||!b||!d)return false
  j.collection.town=a;j.delivery.town=d;j.q??={};j.q.multi_stop={collections:[a,b],deliveries:[d]}
  note(j,`Multi-stop route: collect in ${a} and ${b}; deliver to ${d}.`);return true
}
function splitDeliveries(j,message){
  const s=String(message||'')
  const m=s.match(/\bcollect\s+(\d+)\s+boxes?\s+in\s+([A-Za-z][A-Za-z .'-]{1,35}?),?\s+(\d+)\s+go\s+to\s+([A-Za-z][A-Za-z .'-]{1,35}?)\s+and\s+(\d+)\s+(?:go\s+)?to\s+([A-Za-z][A-Za-z .'-]{1,35}?)(?=\s+(?:on|tomorrow|today|at)\b|[,.]|$)/i)
  if(!m)return false
  const c=town(m[2]),d1=town(m[4]),d2=town(m[6]);if(!c||!d1||!d2)return false
  j.collection.town=c;j.delivery.town=d1;j.category=j.category||'courier';j.q??={};j.q.multi_stop={collections:[c],deliveries:[d1,d2],split:[`${m[3]} boxes to ${d1}`,`${m[5]} boxes to ${d2}`]}
  note(j,`Multi-stop delivery: ${m[3]} boxes to ${d1}; ${m[5]} boxes to ${d2}.`);return true
}
function explicitDeliverTown(j,message){
  if(clean(j.delivery?.town))return false
  const m=String(message||'').match(/\bdeliver(?:ed)?\s+(?:to\s+)?([A-Za-z][A-Za-z .'-]{1,35}?)(?=\s+(?:on\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|at)\b|[,.]|$)/i)
  const d=town(m?.[1]);if(!d)return false;j.delivery.town=d;return true
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  multiCollections(j,message)||splitDeliveries(j,message)||explicitDeliverTown(j,message)
  inferContainerCategory(j)
  r.f=requirements(j,r.f)
  // Preserve quote-grade guards established by controller33 after requirements recomputation.
  if((j.inventory||[]).every(x=>/^(?:multiple\s+(?:items|pieces)(?:\s+of\s+furniture)?|some\s+furniture|some\s+sofas?|a\s+few\s+boxes|some\s+boxes|boxes|bags|furniture|items|things|stuff|bits\s+and\s+pieces|(?:a\s+)?van\s*load)$/i.test(canon(x))))r.f.inventory='missing'
  return r
}

export function review(j){
  const r=base.review(j),m=j?.q?.multi_stop;if(!m)return r
  const risks=Array.isArray(r.quote_risks)?[...r.quote_risks]:[]
  const c=(m.collections||[]).join(' → '),d=(m.deliveries||[]).join(' → ')
  risks.push(`Multi-stop route: collections ${c||'not specified'}; deliveries ${d||'not specified'}`)
  if(Array.isArray(m.split)&&m.split.length)risks.push(`Delivery split: ${m.split.join('; ')}`)
  return {...r,quote_risks:[...new Set(risks)]}
}
