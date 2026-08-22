// @ts-nocheck
const clean=v=>typeof v==='string'&&v.trim()?v.trim():null
const list=v=>Array.isArray(v)?v.map(clean).filter(Boolean):[]

export function multiStopNote(j:any){
  const ms=j?.q?.multi_stop||{}
  const collections=list(ms.collections),deliveries=list(ms.deliveries)
  if(collections.length+deliveries.length<3)return null
  const parts=[]
  if(collections.length)parts.push(`collections: ${collections.join(' -> ')}`)
  if(deliveries.length)parts.push(`deliveries: ${deliveries.join(' -> ')}`)
  return `Multi-stop route - ${parts.join('; ')}`
}

export function mergeDriverNotes(...values:any[]){
  const seen=new Set<string>(),out:string[]=[]
  for(const v of values){
    const s=clean(v)
    if(!s)continue
    const k=s.toLowerCase().replace(/\s+/g,' ')
    if(seen.has(k))continue
    seen.add(k);out.push(s)
  }
  return out.length?out.join('. '):null
}
