const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function runtime(){
  const context=vm.createContext({window:{}});
  for(const name of ['farmina-data','catalog-links','products','product-images','buddy'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
  return context;
}
function run(context,code){return vm.runInContext(code,context);}

test('every offered profile returns only linked products for the selected pet and life stage',()=>{
  const context=runtime();
  const outcomes=run(context,`(() => {
    const rows=[];
    for(const [pet,profiles] of Object.entries(BUDDY_PROFILES)) for(const profile of profiles){
      const state={pet,stage:profile.id,size:pet==='dog'?'mini':null,preference:'any'};
      rows.push({pet,stage:profile.id,results:buddyResults(state).map(({product,source,exact})=>({
        id:product.id,pet:product.pet,stage:product.stage,sourceId:source?.product_id||null,exact
      }))});
    }
    return rows;
  })()`);
  assert.equal(outcomes.length,6);
  for(const row of outcomes){
    assert.ok(row.results.length>=1 && row.results.length<=2,`${row.pet}:${row.stage}`);
    for(const result of row.results){
      assert.equal(result.pet,row.pet);
      assert.equal(result.stage,row.stage);
      assert.equal(run(context,`CATALOG_LINKS['${result.id}'].ids.includes('${result.sourceId}')`),true);
    }
  }
  assert.equal(run(context,"buddyResults({pet:'cat',stage:'kitten',size:null,preference:'any'}).length"),1);
});

test('recipe preferences and explicit breed-size source records select the correct pack family',()=>{
  const context=runtime();
  assert.equal(run(context,"buddyResults({pet:'dog',stage:'puppy',size:'mini',preference:'fish'})[0].source.product_id"),'P0017');
  assert.equal(run(context,"buddyResults({pet:'dog',stage:'puppy',size:'medium_maxi',preference:'fish'})[0].source.product_id"),'P0018');
  assert.equal(run(context,"buddyResults({pet:'dog',stage:'adult',size:'medium_maxi',preference:'ancestral'})[0].source.product_id"),'P0012');
  assert.equal(run(context,"buddyResults({pet:'cat',stage:'adult',size:null,preference:'fish'})[0].product.id"),'co1');
  assert.equal(run(context,"buddyPreferenceOptions({pet:'cat',stage:'adult'}).some(p=>p.id==='ancestral')"),false);
});

test('shared-source dog recipes and unknown breed size do not claim a verified pack variant',()=>{
  const context=runtime();
  const generic=run(context,"buddyResults({pet:'dog',stage:'puppy',size:'medium_maxi',preference:'lamb'})[0]");
  assert.equal(generic.product.id,'dp3');
  assert.equal(generic.exact,false);
  const card=run(context,"buddyState={pet:'dog',stage:'puppy',size:'medium_maxi',preference:'lamb'};buddyResultCard(buddyResults(buddyState)[0])");
  assert.match(card,/Confirm the exact breed-size pack/);
  assert.match(card,/openBuddyProduct\('dp3',''\)/);
  assert.equal(run(context,"buddyResults({pet:'dog',stage:'puppy',size:'unknown',preference:'fish'})[0].exact"),false);
});

test('changed source identities disappear from guided results and specialised ranges stay outside them',()=>{
  const context=runtime();
  run(context,"FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id==='P0017').product_name='Different item';applyScrapedProductData()");
  assert.equal(run(context,"buddyResults({pet:'dog',stage:'puppy',size:'mini',preference:'fish'}).length"),0);
  assert.equal(run(context,"Object.values(BUDDY_PRIORITY).flat().some(id=>['dq1','dq2','cq1'].includes(id))"),false);
});
