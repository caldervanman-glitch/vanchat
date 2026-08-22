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

export function applianceDriverNote(j:any){
  const a=j?.q?.appliances||{}
  if(a?.present!=='yes')return null
  if(a?.disconnected==='no'||a?.reconnect_requested==='yes'){
    const bits=[]
    if(a.disconnected==='no')bits.push('appliance is not disconnected before collection')
    if(a.reconnect_requested==='yes')bits.push('customer is requesting reconnection')
    return `Appliance plumbing warning - ${bits.join('; ')}. Disconnecting/reconnecting is not assumed; many drivers are not insured or willing to do plumbing work and the driver must explicitly agree.`
  }
  return null
}

export function stateDriverNotes(j:any){return list(j?.q?.driver_notes)}

export function driverRiskNotes(j:any){
  return [multiStopNote(j),applianceDriverNote(j),...stateDriverNotes(j)].filter(Boolean)
}

export function mergeDriverNotes(...values:any[]){
  const seen=new Set<string>(),out:string[]=[]
  for(const v of values.flatMap(x=>Array.isArray(x)?x:[x])){
    const s=clean(v)
    if(!s)continue
    const k=s.toLowerCase().replace(/\s+/g,' ')
    if(seen.has(k))continue
    seen.add(k);out.push(s)
  }
  return out.length?out.join('. '):null
}
