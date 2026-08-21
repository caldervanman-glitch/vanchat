// @ts-nocheck
export * from './core_release_controller47.ts'
import * as base from './core_release_controller47.ts'

const HOUSEHOLD_REFERENCE_RE=/^(?:nan|nans|gran|grans|grandma|grandmas|grandad|grandads|granddad|granddads|mum|mums|mom|moms|mam|mams|dad|dads|parent|parents|friend|friends|mate|mates|sister|sisters|brother|brothers|aunt|aunts|auntie|aunties|uncle|uncles|cousin|cousins|daughter|daughters|son|sons)(?:\s+(?:house|home|place))?$/

export function relativeHouseholdValue(v){
  const raw=base.canon(v)
  if(!raw)return false
  if(base.relativeLocation(raw))return true
  const s=raw
    .replace(/^(?:from|to|at)\s+/,'')
    .replace(/^(?:my|our|the)\s+/,'')
    .replace(/'s(?=\s|$)/g,'')
  return HOUSEHOLD_REFERENCE_RE.test(s)
}

export function relativeHouseholdLocation(l){
  return relativeHouseholdValue(l?.town)||relativeHouseholdValue(l?.address_text)
}

export function quoteGradeLocation(l){
  if(base.clean(l?.postcode))return true
  const town=base.clean(l?.town),address=base.clean(l?.address_text)
  if(town&&base.usableLoc(town)&&!base.broadLocation({town})&&!relativeHouseholdValue(town))return true
  if(address&&base.usableLoc(address)&&!base.broadLocation({address_text:address})&&!relativeHouseholdValue(address))return true
  return false
}

export function requirements(j0,prev={}){
  const f=base.requirements(j0,prev)
  // Family/household references describe a relationship to a place, not the
  // quote-grade place itself. A model may reduce "my nan's" to a bare value
  // such as "nans"; that must never satisfy a route endpoint.
  if(relativeHouseholdLocation(j0?.collection)&&!base.clean(j0?.collection?.postcode))f['collection.location']='missing'
  if(relativeHouseholdLocation(j0?.delivery)&&!base.clean(j0?.delivery?.postcode))f['delivery.location']='missing'
  return f
}
