// @ts-nocheck
export * from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/94b0eb95b61e5fed2a0e1b17c9cfbcc711ca33eb/supabase/functions/vanhub-chat-kernel/core.ts'
import * as base from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/94b0eb95b61e5fed2a0e1b17c9cfbcc711ca33eb/supabase/functions/vanhub-chat-kernel/core.ts'

const HV_ITEM_RE=/\b(?:glass\s+(?:cabinet|display\s+cabinet|display\s+case|dresser|table)|display\s+cabinet|china\s+cabinet|curio\s+cabinet|antique\s+cabinet|large\s+mirror|glass\s+furniture)\b/i
const FLEX_WINDOW_RE=/\b(?:any\s+day\s+)?next\s+week\b|\b(?:this|next)\s+weekend\b|\bweek\s+commencing\b|\bweek\s+beginning\b/i
function highValue(j){return !!j?.q?.high_value||HV_ITEM_RE.test((j?.inventory||[]).join(' '))}
function boundedFlexibleDate(j){return !base.clean(j?.date?.iso_date)&&!!base.clean(j?.date?.original_text)&&FLEX_WINDOW_RE.test(String(j.date.original_text||''))&&/\b(?:flexible|any\s+day|anytime|any\s+time)\b/i.test([j.date.flexibility,j.date.original_text].filter(Boolean).join(' '))}

export function requirements(j0,prev={}){
  const f=base.requirements(j0,prev)
  if(boundedFlexibleDate(j0))f.date='known'
  return f
}

export function nextObjective(j,f){
  // If an unusual house/flat start has already been detected, confirm it before
  // asking for further load detail. Quote-grade inventory guards must not hide
  // an explicit 9pm/overnight timing anomaly.
  if(!base.known(f,'unusual_time'))return base.OBJ.unusual_time
  if(highValue(j)){
    if(!base.known(f,'inventory'))return base.OBJ.inventory
    if(base.known(f,'inventory')&&!base.known(f,'collection.location')&&!base.known(f,'delivery.location'))return 'ask_route'
    if(!base.known(f,'collection.location'))return base.OBJ['collection.location']
    if(!base.known(f,'delivery.location'))return base.OBJ['delivery.location']
    if(!base.known(f,'dimweight'))return base.OBJ.dimweight
  }
  return base.nextObjective(j,f)
}
