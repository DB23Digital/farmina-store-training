const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function runtime(extra={}){
  const context=vm.createContext({window:{},...extra});
  for(const name of ['farmina-data','catalog-links','products','ingredients','matcher'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
  return context;
}
function run(context,code){return vm.runInContext(code,context);}

const profiles=context=>run(context,`[].concat(...Object.entries(MATCHER_STAGES).map(([pet,stages])=>
  stages.map(s=>({pet,stage:s.val,concerns:matcherConcernsFor(pet).map(c=>c.id)}))))`);
const outcome=(context,state)=>JSON.parse(run(context,`JSON.stringify((() => {
  const o=getMatcherOutcome(${JSON.stringify(state)});
  const row=r=>({id:r.product.id,pet:r.product.pet,stage:r.product.stage,claim:r.claim,evidence:r.evidence,
    composition:r.product.composition.toLowerCase(),highlights:r.product.highlights});
  return {exact:o.exact.map(row),other:o.other.map(row),fallback:o.fallback};
})())`));

test('every offered concern lists formulas for every profile, with other life stages labelled separately',()=>{
  const context=runtime();
  for(const {pet,stage,concerns} of profiles(context)) for(const concern of concerns){
    if(concern==='allergies') continue;
    const o=outcome(context,{petType:pet,stage,concern});
    assert.ok(o.exact.length || o.other.length,`${pet}/${stage}/${concern} is empty`);
    assert.equal(o.fallback,!o.exact.length,`${pet}/${stage}/${concern} fallback flag`);
    for(const r of o.exact) assert.deepEqual([r.pet,r.stage],[pet,stage]);
    for(const r of o.other){
      assert.equal(r.pet,pet);
      assert.notEqual(r.stage,stage);
      if(o.exact.length) assert.ok(r.claim,`${r.id} shown from another stage without a dedicated claim`);
    }
  }
});

test('listed evidence matches a reference reading of the declared composition and claims',()=>{
  const context=runtime();
  // Independent plain-substring reference for each rule.
  const reference={
    digestion:t=>['pumpkin','psyllium','beet pulp','inulin','fos','fructooligosaccharides','mos','oligosaccharides'].some(k=>t.includes(k)),
    skin:(t,h)=>h.includes('Skin & Coat') || ['fish oil','herring oil','salmon oil','linseed','flaxseed'].some(k=>t.includes(k)),
    joints:t=>t.includes('glucosamine') && t.includes('chondroitin'),
    immunity:t=>['inulin','fos','fructooligosaccharides','mos','oligosaccharides'].some(k=>t.includes(k)),
    urinary:(t,h)=>h.includes('Urinary Support')
  };
  const products=JSON.parse(run(context,`JSON.stringify(PRODUCTS.map(p=>({id:p.id,pet:p.pet,stage:p.stage,t:p.composition.toLowerCase(),h:p.highlights})))`));
  for(const {pet,stage,concerns} of profiles(context)) for(const concern of concerns){
    if(concern==='allergies') continue;
    const o=outcome(context,{petType:pet,stage,concern});
    const expected=products.filter(p=>p.pet===pet && p.stage===stage && reference[concern](p.t,p.h)).map(p=>p.id).sort();
    assert.deepEqual(o.exact.map(r=>r.id).sort(),expected,`${pet}/${stage}/${concern}`);
    for(const r of [...o.exact,...o.other]){
      if(r.claim) assert.ok(r.highlights.includes(r.claim));
      for(const label of r.evidence) assert.ok(label.length);
    }
  }
});

test('dedicated Quinoa formulas rank first and urinary is cat-only',()=>{
  const context=runtime();
  assert.deepEqual(outcome(context,{petType:'dog',stage:'adult',concern:'skin'}).exact.slice(0,2).map(r=>r.id),['dq1','dq2']);
  assert.deepEqual(outcome(context,{petType:'dog',stage:'puppy',concern:'skin'}).other.map(r=>r.id),['dq1','dq2']);
  assert.deepEqual(outcome(context,{petType:'cat',stage:'adult',concern:'urinary'}).exact.map(r=>r.id),['cq1']);
  const neutered=outcome(context,{petType:'cat',stage:'neutered',concern:'urinary'});
  assert.equal(neutered.fallback,true);
  assert.deepEqual(neutered.other.map(r=>r.id),['cq1']);
  assert.equal(run(context,"matcherConcernsFor('dog').some(c=>c.id==='urinary')"),false);
  assert.equal(outcome(context,{petType:'dog',stage:'adult',concern:'urinary'}).exact.length,0);
  // cp5 declares no glucosamine, so it cannot be listed for joints.
  assert.deepEqual(outcome(context,{petType:'cat',stage:'neutered',concern:'joints'}).exact.map(r=>r.id),['cp6']);
});

test('ingredient exclusions never list a formula whose composition names an excluded ingredient',()=>{
  const context=runtime();
  const exclusions=run(context,'MATCHER_EXCLUSIONS.map(x=>({id:x.id,source:x.re.source,animal:!!x.animal}))');
  const unnamed=new RegExp(run(context,'MATCHER_UNNAMED_ANIMAL.source'));
  for(const {pet,stage} of profiles(context)) for(let i=0;i<exclusions.length;i++) for(let j=i;j<exclusions.length;j++){
    const chosen=[exclusions[i],exclusions[j]];
    const o=outcome(context,{petType:pet,stage,concern:'allergies',exclusions:chosen.map(x=>x.id)});
    for(const r of [...o.exact,...o.other]){
      for(const x of chosen) assert.doesNotMatch(r.composition,new RegExp(x.source),`${r.id} lists ${x.id}`);
      if(chosen.some(x=>x.animal)) assert.doesNotMatch(r.composition,unnamed,`${r.id} has an unnamed animal source`);
    }
  }
  assert.equal(outcome(context,{petType:'dog',stage:'adult',concern:'allergies',exclusions:[]}).exact.length,0);
  // "Chicken fat" counts as chicken; hydrolysed animal protein fails any animal exclusion only.
  assert.ok(!outcome(context,{petType:'dog',stage:'adult',concern:'allergies',exclusions:['chicken']}).exact.some(r=>r.id==='dl2'));
  assert.ok(!outcome(context,{petType:'cat',stage:'adult',concern:'allergies',exclusions:['duck']}).exact.some(r=>r.id==='cp2'));
  assert.ok(outcome(context,{petType:'cat',stage:'adult',concern:'allergies',exclusions:['grains']}).exact.some(r=>r.id==='cp2'));
});

test('products with an unverified catalogue identity drop out of matcher results',()=>{
  const context=runtime();
  run(context,"PRODUCTS.find(p=>p.id==='dq1').catalog_error=true");
  const o=outcome(context,{petType:'dog',stage:'adult',concern:'skin'});
  assert.ok(![...o.exact,...o.other].some(r=>r.id==='dq1'));
  assert.ok(!run(context,"conditionPanelProducts('skin').some(p=>p.id==='dq1')"));
});

test('every Ingredients condition panel resolves to existing catalogue formulas',()=>{
  const context=runtime();
  const panels=run(context,`BODY_CONDITIONS.map(c=>({id:c.id,rule:CONDITION_MATCHER_RULES[c.id],
    ids:CONDITION_MATCHER_RULES[c.id]?conditionPanelProducts(CONDITION_MATCHER_RULES[c.id]).map(p=>p.id):[]}))`);
  const known=new Set(run(context,'PRODUCTS.map(p=>p.id)'));
  for(const panel of panels){
    assert.ok(run(context,`!!MATCHER_RULES['${panel.rule}']`),`${panel.id} has no rule`);
    assert.ok(panel.ids.length>0 && panel.ids.length<=6,`${panel.id} panel size`);
    for(const id of panel.ids) assert.ok(known.has(id),`${panel.id} -> ${id}`);
  }
});

test('the allergy flow renders cautions and keeps exclusion choices out of analytics',()=>{
  const hits=[];
  const container={innerHTML:''};
  const context=runtime({document:{getElementById:id=>id==='matcherContainer'?container:null},
    window:{TrainingAnalytics:{track:(name,params)=>hits.push([name,params])}}});
  run(context,"initMatcher(); selectMatcherPet('cat'); selectMatcherStage('adult'); selectMatcherConcern('allergies')");
  assert.match(container.innerHTML,/Which ingredients must be avoided/);
  assert.match(container.innerHTML,/disabled/);
  run(context,"toggleMatcherExclusion('chicken'); toggleMatcherExclusion('lamb'); toggleMatcherExclusion('lamb'); showMatcherExclusionResults()");
  assert.match(container.innerHTML,/does not list: chicken\./);
  assert.match(container.innerHTML,/not a diagnosis/);
  assert.doesNotMatch(container.innerHTML,/\bsafe\b|hypoallergenic/i);
  const complete=hits.filter(h=>h[0]==='matcher_complete');
  assert.equal(complete.length,1);
  assert.deepEqual(Object.keys(complete[0][1]).sort(),['concern','life_stage','pet_type','result_count']);
  assert.ok(!JSON.stringify(hits).includes('chicken'));
  run(context,"selectMatcherPet('cat'); selectMatcherStage('neutered'); selectMatcherConcern('urinary')");
  assert.match(container.innerHTML,/No neutered formula matches/);
  assert.match(container.innerHTML,/Check the pack’s life-stage guidance/);
});
