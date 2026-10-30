const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const guides=JSON.parse(fs.readFileSync(path.join(root,'assets/feeding-guides/feeding-guides.json'),'utf8'));
const transcriptions=JSON.parse(fs.readFileSync(path.join(root,'scripts/feeding-guide-transcriptions.json'),'utf8'));

function runtime(extra={}){
  // The guide file is injected below, so the app's own fetch never settles.
  const context=vm.createContext({window:{addEventListener(){}},fetch:()=>new Promise(()=>{}),...extra});
  for(const name of ['farmina-data','catalog-links','products','feeding','calculator'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
  context.guideFixture=guides;
  run(context,'FEEDING_GUIDES=validateFeedingGuides(guideFixture);feedingGuideStatus="ready"');
  return context;
}
function run(context,code){return vm.runInContext(code,context);}
const result=(context,input)=>JSON.parse(run(context,`JSON.stringify(getFeedingResult(${JSON.stringify(input)}))`));

test('the app guide list, generated data and source files agree exactly',()=>{
  const context=runtime();
  const links=JSON.parse(run(context,'JSON.stringify(GUIDE_LINKS)'));
  assert.deepEqual(links.map(l=>l.id).sort(),guides.guides.map(g=>g.id).sort());
  for(const link of links) assert.ok(fs.existsSync(path.join(root,link.source)),link.source);
  for(const item of transcriptions.guides){
    const merged=guides.guides.find(g=>g.id===item.id);
    assert.deepEqual(merged.rows,item.rows,item.id);
    assert.equal(merged.source_sha256,item.source_sha256);
  }
});

test('only the two guides Farmina has not supplied are uncovered',()=>{
  const context=runtime();
  const uncovered=JSON.parse(run(context,`JSON.stringify(FARMINA_SCRAPED_PRODUCTS.map(p=>p.product_id).filter(id=>!guidesForProduct(id).length))`));
  assert.deepEqual(uncovered,['P0013','P0024']);
});

test('the kitten guide returns printed ranges by age band and never fills "—" cells',()=>{
  const context=runtime();
  const r=result(context,{mode:'guide',petType:'cat',productId:'P0002',ageBand:'7-12',guideWeightKg:4});
  assert.deepEqual([r.gramsMin,r.gramsMax,r.kind,r.ageBand],[63,68,'kitten','7–12 months']);
  assert.equal(result(context,{mode:'guide',petType:'cat',productId:'P0002',ageBand:'weaning',guideWeightKg:0.5}).gramsMax,40);
  for(const input of [
    {ageBand:'weaning',guideWeightKg:1.5},  // printed "—"
    {ageBand:'7-12',guideWeightKg:0.5},     // printed "—"
    {ageBand:'1-3',guideWeightKg:1.2},      // between printed weights
    {ageBand:'8-10',guideWeightKg:2}        // not a printed band
  ]) assert.throws(()=>run(context,`getFeedingResult(${JSON.stringify({mode:'guide',petType:'cat',productId:'P0002',...input})})`),/listed in the supplied guide/);
});

test('Farmina products never use the formula estimate; a custom bag still can',()=>{
  const context=runtime();
  assert.throws(()=>run(context,`getFeedingResult({mode:'estimate',petType:'dog',weightKg:20,meValue:3997,productId:'P0012'})`),/custom bag/);
  assert.throws(()=>run(context,`getFeedingResult({mode:'estimate',petType:'dog',weightKg:20,meValue:3997,productId:'P0013'})`),/printed on the bag/);
  assert.equal(result(context,{mode:'estimate',petType:'dog',weightKg:10,meValue:3997,productId:''}).source,'estimate');
});

test('adult and cat guides return the printed min-max for listed weights only',()=>{
  const context=runtime();
  const r=result(context,{mode:'guide',petType:'dog',productId:'P0027',breedSize:'mini',guideWeightKg:1});
  assert.deepEqual([r.gramsMin,r.gramsMax,r.kind],[16,30,'adult']);
  assert.deepEqual([result(context,{mode:'guide',petType:'cat',productId:'P0008',guideWeightKg:6.5}).gramsMin,
    result(context,{mode:'guide',petType:'cat',productId:'P0008',guideWeightKg:6.5}).gramsMax],[50,80]);
  assert.equal(result(context,{mode:'guide',petType:'dog',productId:'P0023',guideWeightKg:70}).gramsMax,750);
  for(const input of [
    {mode:'guide',petType:'dog',productId:'P0027',breedSize:'mini',guideWeightKg:1.5},
    {mode:'guide',petType:'cat',productId:'P0008',guideWeightKg:7},
    {mode:'guide',petType:'dog',productId:'P0023',guideWeightKg:0}
  ]) assert.throws(()=>run(context,`getFeedingResult(${JSON.stringify(input)})`),/listed in the supplied guide/);
});

test('breed size selects the matching guide and is required only when the record spans sizes',()=>{
  const context=runtime();
  assert.throws(()=>run(context,`getFeedingResult({mode:'guide',petType:'dog',productId:'P0027',guideWeightKg:10})`),/breed size/);
  assert.equal(result(context,{mode:'guide',petType:'dog',productId:'P0027',breedSize:'medium',guideWeightKg:10}).gramsMin,90);
  assert.equal(result(context,{mode:'guide',petType:'dog',productId:'P0028',breedSize:'maxi',ageMonths:6,matureWeightKg:65}).grams,605);
  assert.equal(result(context,{mode:'guide',petType:'dog',productId:'P0028',breedSize:'mini',ageMonths:2,matureWeightKg:1.5}).grams,25);
  assert.throws(()=>run(context,`getFeedingResult({mode:'guide',petType:'dog',productId:'P0028',breedSize:'maxi',ageMonths:12,matureWeightKg:25})`),/adult food/);
  assert.throws(()=>run(context,`getFeedingResult({mode:'guide',petType:'dog',productId:'P0020',breedSize:'medium',ageMonths:4,matureWeightKg:40})`),/No supplied guide covers/);
  for(const id of ['P0010','P0011','P0017','P0018','P0023','P0001','P0008']) assert.equal(run(context,`guideNeedsBreedSize('${id}')`),false,id);
  for(const id of ['P0020','P0027','P0028','P0029','P0030','P0031']) assert.equal(run(context,`guideNeedsBreedSize('${id}')`),true,id);
});

test('products without a supplied guide never get a guide result',()=>{
  const context=runtime();
  for(const id of ['P0013','P0024'])
    assert.throws(()=>run(context,`getFeedingResult({mode:'guide',petType:'dog',productId:'${id}',guideWeightKg:5})`),/printed on the bag/);
});

test('the validator rejects a kitten cell with an unprinted age band',()=>{
  const context=runtime();
  run(context,`const bad=JSON.parse(JSON.stringify(guideFixture));bad.guides.find(g=>g.id==='prime-kitten').rows[0].age_band='13-24';globalThis.bad=bad`);
  assert.throws(()=>run(context,'validateFeedingGuides(bad)'),/Invalid or duplicate guide cell/);
});

function calculatorDom(){
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id)) elements.set(id,{value:'',hidden:false,disabled:false,innerHTML:'',textContent:'',style:{},dataset:{},
      options:[],selectedOptions:[],appendChild(){},addEventListener(){},classList:{add(){},remove(){},toggle(){}}});
    return elements.get(id);
  };
  const context=runtime({document:{getElementById:element,createElement:()=>({dataset:{},style:{},addEventListener(){}})}});
  return {context,element};
}

test('the calculator walks a kitten through age band, then only that band’s printed weights',()=>{
  const {context,element}=calculatorDom();
  Object.assign(element('cPetType'),{value:'cat'});
  Object.assign(element('cProductSelect'),{value:'P0002'});
  run(context,'updateFeedingMode(true)');
  assert.equal(element('cFeedMethod').value,'guide');
  assert.equal(element('cEstimateOption').disabled,true);
  assert.equal(element('cGuideBandField').hidden,false);
  assert.equal(element('cGuideBreedField').hidden,true);
  element('cAgeBand').value='weaning';
  run(context,'populateGuideWeightOptions()');
  assert.match(element('cGuideWeight').innerHTML,/value="1">1 kg/);
  assert.doesNotMatch(element('cGuideWeight').innerHTML,/value="1.5"/);
  Object.assign(element('cGuideWeight'),{value:'1'});
  Object.assign(element('cBagSize'),{value:'300'});
  Object.assign(element('cPrice'),{value:'169'});
  run(context,'runCalc()');
  assert.equal(element('calcError').hidden,true,element('calcError').textContent);
  assert.equal(element('crPortion').textContent,'18g–40g');
  assert.match(element('crNote').innerHTML,/Weaning, 1kg/);
});

test('the calculator shows the guide range and its cost range for an adult guide',()=>{
  const {context,element}=calculatorDom();
  Object.assign(element('cPetType'),{value:'dog'});
  Object.assign(element('cProductSelect'),{value:'P0027'});
  run(context,'updateFeedingMode(true)');
  assert.equal(element('cFeedMethod').value,'guide');
  assert.equal(element('cGuideBreedField').hidden,false);
  assert.equal(element('cGuideWeightField').hidden,true);
  element('cGuideBreed').value='mini';
  run(context,'populateGuideFields()');
  assert.equal(element('cGuideWeightField').hidden,false);
  assert.equal(element('cGuideAgeField').hidden,true);
  assert.match(element('cGuideWeight').innerHTML,/value="1">1 kg/);
  Object.assign(element('cGuideWeight'),{value:'1'});
  Object.assign(element('cBagSize'),{value:'800'});
  Object.assign(element('cPrice'),{value:'279'});
  run(context,'runCalc()');
  assert.equal(element('calcError').hidden,true,element('calcError').textContent);
  assert.equal(element('crPortion').textContent,'16g–30g');
  assert.equal(element('crCostDay').textContent,'R5.58–R10.46');
  assert.equal(element('crDays').textContent,'26–50');
  assert.match(element('crNote').innerHTML,/Pumpkin Chicken & Pomegranate Adult — Mini.*1kg/);
});
