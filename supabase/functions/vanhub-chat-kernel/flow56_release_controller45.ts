// @ts-nocheck
import * as base from './flow56_release_controller44.ts'
import {canon} from './core_release_highvalue.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq
export const prompt=base.prompt

const VAGUE_VOLUME=/^(?:full\s+house|whole\s+house|house\s+contents?|general\s+belongings?|all\s+(?:my|our)\s+stuff|everything|not\s+much|a\s+few\s+(?:bits|things)|bits\s+and\s+pieces|multiple\s+(?:items|pieces)(?:\s+of\s+furniture)?|some\s+(?:furniture|items|things|stuff|sofas?|boxes|bags)|a\s+few\s+(?:boxes|bags)|boxes|bags|furniture|items|things|stuff|(?:a\s+)?van\s*load|(?:a\s+)?van\s+full(?:\s+of\s+(?:stuff|things|items|belongings))?|one\s+van\s+load)$/i
const PROPERTY_SIZE_ONLY=/^(?:\d+|one|two|three|four|five|six|seven|eight|nine)\s*(?:bed|beds|bedroom|bedrooms)\s*(?:house|flat|home)?$/i
function weakVolume(v){const x=canon(v);return !!x&&(VAGUE_VOLUME.test(x)||PROPERTY_SIZE_ONLY.test(x))}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media)
  // Bedroom/property-size labels and vague load claims are useful conversation
  // context, but they are not a canonical volume measurement. Recorded model
  // outputs have occasionally mapped "3 bedroom house" into house_volume.
  // Clear that semantic overclaim even when later readiness logic already kept
  // the field status missing.
  if(['house_move','flat_move'].includes(r?.j?.category)&&weakVolume(r?.j?.q?.house_volume)){
    r.j.q.house_volume=null
  }
  return r
}
