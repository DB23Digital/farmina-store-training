const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname,'..');
const guides = JSON.parse(fs.readFileSync(path.join(root,'assets/feeding-guides/feeding-guides.json'),'utf8'));
function runtime() {
  const ctx = vm.createContext({window:{},fetch:async()=>({ok:false})});
  for(const name of ['farmina-data','catalog-links','products','matcher','feeding']) vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx);
  ctx.guideFixture = guides;
  return ctx;
}
function run(ctx,code) { return vm.runInContext(code,ctx); }

test('all 22 cards resolve explicitly to the 31 source records and retain prices',()=>{
  const c = runtime();
  assert.equal(run(c,'catalogIssues.length'),0);
  assert.equal(run(c,'validatedSourceIds.size'),31);
  assert.equal(run(c,'PRODUCTS.length'),22);
  assert.equal(run(c,"PRODUCTS.find(p=>p.id==='cp1').scraped_skus.some(s=>s.pack_size_grams===5000)"),false);
  assert.equal(run(c,"PRODUCTS.find(p=>p.id==='dp2').scraped_skus.find(s=>s.pack_size_grams===12000).price_current"),1999);
});

test('every listed pack has a local Farmina product shot with recorded source and checksum',()=>{
  const c=runtime();
  const shots=vm.runInNewContext(fs.readFileSync(path.join(root,'js/product-images.js'),'utf8')+'\nPRODUCT_SHOTS',{});
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/products/sources.json'),'utf8'));
  assert.equal(Object.keys(shots).length,31);
  assert.equal(manifest.files.length,36);
  const byName=new Map(manifest.files.map(file=>[file.name,file]));
  for(const product of run(c,'PRODUCTS')) for(const sku of product.scraped_skus){
    const shot=shots[sku.product_id];
    assert.ok(shot,`${product.id}: ${sku.product_id}`);
    const expected=shot.large && sku.pack_size_grams>=12000 ? shot.large : shot.standard;
    const file=byName.get(path.basename(expected));
    assert.ok(file && file.source_page.startsWith('https://www.farmina.com/za/eshop/'),expected);
    const bytes=fs.readFileSync(path.join(root,expected));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
});
test('changed source identity fails closed and cannot retain old prices',()=>{
  const c = runtime();
  run(c,"FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id==='P0002').product_name='Different formula'; applyScrapedProductData();");
  assert.equal(run(c,"PRODUCTS.find(p=>p.id==='cp1').catalog_error"),true);
  assert.equal(run(c,"PRODUCTS.find(p=>p.id==='cp1').scraped_skus"),undefined);
  assert.equal(run(c,"validatedSourceIds.has('P0002')"),false);
});
test('duplicate source identities, invalid prices and contradictory same-size prices are rejected',()=>{
  for(const mutation of [
    "FARMINA_SCRAPED_PRODUCTS.push(FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id==='P0019'))",
    "FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id==='P0019').skus[0].price_current=NaN",
    "Object.assign(FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id==='P0020').skus[0],{pack_size_grams:800,pack_size_value:'800',pack_size_unit:'g'})"
  ]) {
    const c=runtime();run(c,mutation+'; applyScrapedProductData();');
    assert.equal(run(c,"PRODUCTS.find(p=>p.id==='dp1').catalog_error"),true,mutation);
  }
});
test('all offered matcher combinations respect species and exact displayed life stage',()=>{
  const c=runtime();
  const failures=run(c,`(() => {
    const errors=[];
    for(const pet of ['dog','cat']) for(const stage of MATCHER_STAGES[pet]) for(const concern of MATCHER_CONCERNS){
      matcherState={petType:pet,stage:stage.val,concern:concern.id};
      for(const id of getMatcherResults()) {const p=PRODUCTS.find(p=>p.id===id); if(p.pet!==pet || p.stage!==stage.val) errors.push(id);}
    }
    return errors.length;
  })()`);
  assert.equal(failures,0);
  assert.equal(run(c,"matcherState={petType:'dog',stage:'adult',concern:'allergies'};getMatcherResults().length"),0);
});
test('each generated table is a complete grid with a matching source hash',()=>{
  const c=runtime();run(c,'validateFeedingGuides(guideFixture)');
  for(const guide of guides.guides){
    if(guide.kind==='puppy'){
      const ages=new Set(guide.rows.map(r=>r.age_months)),weights=new Set(guide.rows.map(r=>r.mature_weight_kg));
      assert.equal(guide.rows.length,ages.size*weights.size,guide.id);
    }
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,guide.source_file))).digest('hex'),guide.source_sha256);
  }
});
test('guide lookup distinguishes current weight, projected adult weight and age',()=>{
  const c=runtime();
  const result=run(c,"getFeedingResult({mode:'guide',petType:'dog',weightKg:5,productId:'P0010',ageMonths:4,matureWeightKg:40},guideFixture)");
  assert.equal(result.grams,355);
  assert.equal(result.kind,'puppy');
  assert.equal(result.sourceFile,'assets/feeding-guides/nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf');
  assert.equal(run(c,"getFeedingResult({mode:'guide',petType:'dog',productId:'P0020',breedSize:'maxi',ageMonths:4,matureWeightKg:50},guideFixture).grams"),540);
});
test('missing cells, Adult transitions, unavailable guides and the wrong product never fall back',()=>{
  const c=runtime();
  for(const input of [
    "{mode:'guide',petType:'dog',productId:'P0010',ageMonths:5,matureWeightKg:40}",
    "{mode:'guide',petType:'dog',productId:'P0010',ageMonths:16,matureWeightKg:10}",
    "{mode:'guide',petType:'dog',productId:'P0009',ageMonths:4,matureWeightKg:40}",
    "{mode:'guide',petType:'dog',productId:'P0020',breedSize:'medium',ageMonths:4,matureWeightKg:40}",
    "{mode:'guide',petType:'dog',productId:'P0020',ageMonths:4,matureWeightKg:40}",
    "{mode:'guide',petType:'cat',productId:'P0010',ageMonths:4,matureWeightKg:40}"
  ]) assert.throws(()=>run(c,`getFeedingResult(${input},guideFixture)`));
  assert.throws(()=>run(c,"getFeedingResult({mode:'guide',petType:'dog',productId:'P0010',ageMonths:4,matureWeightKg:40},null)"));
});
test('there is no formula estimate: every result needs a product and its printed guide',()=>{
  const c=runtime();
  assert.equal(run(c,"typeof calcPortion"),'undefined');
  for(const input of [
    "{petType:'dog',guideWeightKg:10}",
    "{petType:'dog',productId:'',guideWeightKg:10}",
    "{petType:'dog',productId:'P0013',guideWeightKg:10}"
  ]) assert.throws(()=>run(c,`getFeedingResult(${input},guideFixture)`),/Choose a product|printed on the bag/);
});
