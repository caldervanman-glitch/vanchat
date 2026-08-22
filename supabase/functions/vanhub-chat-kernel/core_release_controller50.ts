// @ts-nocheck
export * from './core_release_controller49.ts'
import * as base from './core_release_controller49.ts'

export function nextObjective(j,f){
  // A routed house/flat opener with no item list should use the canonical
  // house/flat load question (`ask_volume`) rather than the generic
  // `clarify_load` label. This is objective ordering only: inventory remains
  // missing until quote-grade item evidence exists.
  //
  // Keep the rule narrow to genuinely empty inventory. Vague supplied load
  // descriptions such as "full house" or "van full" retain the existing
  // clarification path and are still not treated as volume evidence.
  if(['house_move','flat_move'].includes(j?.category)
    && !base.known(f,'inventory')
    && Array.isArray(j?.inventory)
    && j.inventory.length===0
    && base.known(f,'collection.location')
    && base.known(f,'delivery.location')){
    const withoutGenericInventory={...f,inventory:'known'}
    return base.nextObjective(j,withoutGenericInventory)
  }
  return base.nextObjective(j,f)
}
