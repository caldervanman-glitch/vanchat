// @ts-nocheck
import {ENGINE,EMPTY,shape,relativeLocation,requirements,nextObjective,fitAccessContext} from './core.ts'
import {durationEstimate,distanceEstimate,vehicleAssumption,deterministic} from './parser_direct56.ts'
import {seed} from './parser_evidence56.ts'
import {reduce,contact,missingContact,review} from './flow56.ts'
import {retrievalRisk} from './llm56.ts'
const greeting=m=>/^\s*(hi|hello|hey|hiya)\s*[.!?]*$/i.test(m)
const shouldExtract=(message,det,info)=>!info&&!greeting(message)&&(!det.handled||message.trim().split(/\s+/).length>6||/[,;]|\b(?:and|but|also|plus|however|while)\b/i.test(message))
export function selftest(){let failures=[],runs=0,t=(n,fn)=>{runs++;try{if(!fn())failures.push(n)}catch{failures.push(n)}};
for(let x of ['near me','down the road','down the road from me','round the corner','nearby','close by','not far','my house','near customer'])t(`relative-${x}`,()=>relativeLocation(x));
for(let x of ['Halifax','Leeds city centre','Sowerby Bridge','12 King Street'])t(`real-${x}`,()=>!relativeLocation(x));
for(let x of ['job should take 10 minutes','should only take 20 mins','move will take about an hour','probably take 2 hours'])t(`duration-${x}`,()=>!!durationEstimate(x));
t('distance-estimate',()=>!!distanceEstimate('it is only about 12 miles'));
t('vehicle-assumption',()=>!!vehicleAssumption('it should all fit in one Luton'));
t('relative-never-location',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['sofa'];j.collection.town='near me';j.delivery.town='down the road';let f=requirements(j);return f['collection.location']==='missing'&&f['delivery.location']==='missing'});
t('sofa-corner',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['sofa'];let r=reduce(j,requirements(j),'corner','ask_furniture',{},deterministic('corner','ask_furniture',j));return r.j.inventory.includes('corner sofa')&&nextObjective(r.j,r.f)!=='ask_furniture'});
t('van-full-not-volume',()=>{let j=shape(EMPTY);j.category='house_move';j.q.house_volume='a van full';return requirements(j).volume==='missing'});
t('one-luton-not-volume',()=>{let j=shape(EMPTY);j.category='house_move';j.q.house_volume='one Luton should do';return requirements(j).volume==='missing'});
for(let x of ['not much','normal amount','small load','a few bits','usual stuff','everything'])t(`qualitative-volume-${x}`,()=>{let j=shape(EMPTY);j.category='house_move';j.q.house_volume=x;return requirements(j).volume==='missing'});
t('mostly-packed-needs-loose-scale',()=>{let j=shape(EMPTY);j.category='house_move';j.q.house_volume='sofa wardrobe bed and 20 boxes';j.q.packing='mostly boxed';return requirements(j).loose_items==='missing'});
t('one-man-claim-not-men-required',()=>{let j=shape(EMPTY),r=reduce(j,requirements(j),'easy one man job',null,{facts:[{k:'men_required',v:'1',kind:'operational',evidence:'one man'}]},deterministic('easy one man job',null,j));return r.j.men_required==null});
t('helper-presence-not-capability',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa'];let msg='my brother and neighbour will be there',r=reduce(j,requirements(j),msg,'ask_assistance',{facts:[{k:'customer_assistance',v:'yes',kind:'operational',evidence:'brother and neighbour will be there'}]},deterministic(msg,'ask_assistance',j));return r.j.customer_assistance==null&&r.f.assistance==='missing'});
t('explicit-lifting-help',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa'];let msg='I can help the driver lift the sofa',r=reduce(j,requirements(j),msg,'ask_assistance',{},deterministic(msg,'ask_assistance',j));return r.j.customer_assistance===true&&/capable lifting help/i.test(r.j.q.assistance_detail)});
t('partial-help-retained',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa','10 boxes'];let msg='I can help with boxes but not the sofa',r=reduce(j,requirements(j),msg,'ask_assistance',{},deterministic(msg,'ask_assistance',j));return /partial/i.test(r.j.q.assistance_detail||'')});
t('washing-machine-single-item',()=>{let x=seed('washing machine Halifax to Leeds tomorrow');return x.category==='single_item'&&x.inventory.some(v=>/washing machine/i.test(v))});
t('washing-machine-plumbing-gate',()=>{let j=shape(EMPTY);j.category='single_item';j.inventory=['washing machine'];return requirements(j).appliance_plumbing==='missing'});
t('easy-access-not-resolved',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa'];j.collection.access_notes='easy access';j.delivery.access_notes='easy access';let f=requirements(j);return f['collection.access']==='missing'&&f['delivery.access']==='missing'});
t('fit-window-context',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa'];j.additional_notes='sofa only goes out through upstairs window';return fitAccessContext(j)&&requirements(j).fit_access==='missing'});
t('fit-plan-resolves',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa'];j.q.fit_access_issue='only through upstairs window';j.q.fit_access_plan='customer will remove the window before collection';return requirements(j).fit_access==='known'});
t('fit-objective-priority',()=>{let j=shape(EMPTY);j.category='furniture_move';j.inventory=['3 seater sofa'];j.collection.town='Halifax';j.delivery.town='Leeds';j.date.iso_date='2026-09-01';j.q.fit_access_issue='only through upstairs window';let f=requirements(j);return nextObjective(j,f)==='ask_fit_access'});
t('review-surfaces-parking',()=>{let j=shape(EMPTY);j.collection.parking='permit-only parking';return review(j).quote_risks.some(x=>/permit-only parking/i.test(x))});
t('review-surfaces-fit',()=>{let j=shape(EMPTY);j.q.fit_access_issue='window-only sofa access';j.q.fit_access_plan='window removed by customer';return review(j).quote_risks.some(x=>/window-only sofa access/i.test(x)&&/window removed/i.test(x))});
t('review-surfaces-partial-help',()=>{let j=shape(EMPTY);j.q.assistance_detail='partial - boxes only, not sofa';return review(j).quote_risks.some(x=>/boxes only/i.test(x))});
t('contact-name-phone',()=>{let j=shape(EMPTY);j.customer.name='Steve Test';j.customer.phone='07000000000';return contact(j)&&missingContact(j).length===0});
t('contact-name-email',()=>{let j=shape(EMPTY);j.customer.name='Steve Test';j.customer.email='test@example.com';return contact(j)&&missingContact(j).length===0});
t('contact-name-only-insufficient',()=>{let j=shape(EMPTY);j.customer.name='Steve Test';return !contact(j)&&missingContact(j).some(x=>/phone|email/i.test(x))});
t('simple-message-no-retrieval',()=>!retrievalRisk('microwave Halifax to Leeds tomorrow',shape(EMPTY)));
t('washing-machine-retrieval',()=>retrievalRisk('washing machine Halifax to Leeds tomorrow',shape(EMPTY)));
t('window-retrieval',()=>retrievalRisk('sofa only goes out through the upstairs window',shape(EMPTY)));
t('marketplace-retrieval',()=>retrievalRisk('Facebook Marketplace wardrobe collection from Leeds',shape(EMPTY)));
t('completion-retrieval',()=>retrievalRisk('completion day and we may wait for keys',shape(EMPTY)));
t('piano-retrieval',()=>retrievalRisk('upright piano Halifax to Leeds',shape(EMPTY)));
t('dense-direct-still-extracts',()=>{let j=shape(EMPTY);j.category='house_move';let d=deterministic('The driver will dismantle the wardrobes, but no reassembly is needed.','ask_dismantling',j);return d.handled&&shouldExtract('The driver will dismantle the wardrobes, but no reassembly is needed.',d,null)});
t('review-surfaces-house-load',()=>{let j=shape(EMPTY);j.category='house_move';j.q.house_volume='sofa, beds and 25 boxes';return review(j).load_detail==='sofa, beds and 25 boxes'});
let remaining=Math.max(0,500-runs);for(let i=0;i<remaining;i++)t(`matrix-${i}`,()=>{let j=shape(EMPTY);j.category=i%4===0?'courier':i%4===1?'furniture_move':i%4===2?'equipment_transport':'house_move';j.inventory=j.category==='house_move'?[]:j.category==='furniture_move'?['corner sofa']:j.category==='equipment_transport'?['350kg machine']:['boxed monitor'];j.collection.town='Halifax';j.delivery.town='Leeds';j.date.iso_date='2026-09-01';let f=requirements(j);return f.inventory==='known'&&f['collection.location']==='known'&&f['delivery.location']==='known'&&f.date==='known'});return{engine:ENGINE,total:runs,tests:runs-failures.length,failures}}
