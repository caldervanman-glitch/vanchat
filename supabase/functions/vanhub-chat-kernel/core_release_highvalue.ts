// @ts-nocheck
export * from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/94b0eb95b61e5fed2a0e1b17c9cfbcc711ca33eb/supabase/functions/vanhub-chat-kernel/core.ts'
import * as base from 'https://raw.githubusercontent.com/caldervanman-glitch/vanchat/94b0eb95b61e5fed2a0e1b17c9cfbcc711ca33eb/supabase/functions/vanhub-chat-kernel/core.ts'

const HV_ITEM_RE=/\b(?:glass\s+(?:cabinet|display\s+cabinet|display\s+case|dresser|table)|display\s+cabinet|china\s+cabinet|curio\s+cabinet|antique\s+cabinet|large\s+mirror|glass\s+furniture)\b/i
function highValue(j){return !!j?.q?.high_value||HV_ITEM_RE.test((j?.inventory||[]).join(' '))}

export function nextObjective(j,f){
  if(highValue(j)){
    if(!base.known(f,'inventory'))return base.OBJ.inventory
    if(base.known(f,'inventory')&&!base.known(f,'collection.location')&&!base.known(f,'delivery.location'))return 'ask_route'
    if(!base.known(f,'collection.location'))return base.OBJ['collection.location']
    if(!base.known(f,'delivery.location'))return base.OBJ['delivery.location']
    if(!base.known(f,'dimweight'))return base.OBJ.dimweight
  }
  return base.nextObjective(j,f)
}
