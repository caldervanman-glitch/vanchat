// @ts-nocheck
export * from './core_release_controller49.ts'
import * as base from './core_release_controller49.ts'

export function nextObjective(j,f){
  // House/flat moves use one canonical load-qualification objective. The
  // inventory status must remain missing until quote-grade item evidence exists,
  // but once both route endpoints are known we should not surface the generic
  // `clarify_load` label before the house/flat `ask_volume` gate.
  //
  // For objective selection only, skip the generic inventory gate and let the
  // normal ordered requirements decide what comes next. This preserves date,
  // completion, unusual-time and other higher-priority gates. It does not mark
  // inventory known and does not change canonical state.
  if(['house_move','flat_move'].includes(j?.category)
    && !base.known(f,'inventory')
    && base.known(f,'collection.location')
    && base.known(f,'delivery.location')){
    const withoutGenericInventory={...f,inventory:'known'}
    return base.nextObjective(j,withoutGenericInventory)
  }
  return base.nextObjective(j,f)
}
