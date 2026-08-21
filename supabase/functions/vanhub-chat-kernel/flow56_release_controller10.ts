// @ts-nocheck
import * as base from './flow56_release_controller9.ts'

export const groundedSafetyFlags=base.groundedSafetyFlags
export const hazard=base.hazard
export const contact=base.contact
export const missingContact=base.missingContact
export const review=base.review
export const faq=base.faq

function hintFrom(message,obj){
  const s=String(message||'').toLowerCase()
  if(/\bsome\s+sofas?\b/.test(s))return 'some_sofas'
  if(/\b(?:a few|some|few)\s+boxes?\b/.test(s))return 'vague_boxes'
  if(/\bmultiple\s+(?:pieces|items)\b/.test(s))return 'multiple_items'
  if(obj==='ask_furniture'&&/^\s*(?:red|blue|green|black|white|grey|gray|brown|cream|beige|navy)\s*$/i.test(s))return 'furniture_colour'
  return null
}

function replaceQuestion(p,re,text){return re.test(p)?p.replace(re,text):text}

export function prompt(o,j,amb=null){
  let p=base.prompt(o,j,amb)
  const h=j?.q?.controller_load_hint
  if(h==='some_sofas'&&o==='ask_furniture'){
    return replaceQuestion(p,/What type of sofa is it —[^?]+\?/i,'How many sofas are there, and what type/size is each one — for example 2-seater, 3-seater, corner sofa or sofa bed?')
  }
  if(h==='vague_boxes'&&o==='clarify_load'){
    return replaceQuestion(p,/What are you moving\?[^.]*\.?\s*(?:A rough list[^.]*\.)?/i,'Roughly how many boxes are there, and are they mostly small, medium or large? Please mention any unusually heavy boxes, such as books.')
  }
  if(h==='multiple_items'&&o==='clarify_load'){
    return replaceQuestion(p,/What are you moving\?[^.]*\.?\s*(?:A rough list[^.]*\.)?/i,'What are the pieces? Please list the main items and quantities so drivers can judge the load.')
  }
  if(h==='furniture_colour'&&o==='ask_furniture'){
    return 'The colour is not normally needed for the quote. What size/type is the sofa — 2-seater, 3-seater, corner sofa, sofa bed, or something else?'
  }
  return p
}

export function reduce(j0,f0,message,obj,candidate={},direct=null,media=[]){
  const r=base.reduce(j0,f0,message,obj,candidate,direct,media),j=r.j
  j.q??={}
  delete j.q.controller_load_hint
  const h=hintFrom(message,obj)
  if(h)j.q.controller_load_hint=h
  return r
}
