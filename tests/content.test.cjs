const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function runtime(){
  const context=vm.createContext({window:{}});
  for(const name of ['farmina-data','catalog-links','products','ingredients','quiz','tips'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
  return context;
}

// Products and formats outside the approved June 2026 RRP list must never be named.
const OUTSIDE_RANGE=[
  /quinoa puppy|puppy quinoa/i, /quinoa (neutered|boar|lamb|chicken)/i, /neutered cat formula/i,
  /pumpkin cod/i, /\bwet food\b|\bwet \+ dry\b/i,
  /\bindoor (cat|dog)\b|\bsenior (cat|dog) (formula|food)\b|'senior'/i, /\b(salmon|tuna|trout|venison)\b/i, /\bM&M\b/, /probiotics and fresh meat/i
];

test('quiz, tips, ingredient and card copy names only products in the approved range',()=>{
  const context=runtime();
  const text=vm.runInContext('JSON.stringify({QUIZZES,TIPS,INGREDIENTS,PRODUCTS})',context);
  for(const pattern of OUTSIDE_RANGE) assert.doesNotMatch(text,pattern);
});

test('every quiz question has one valid answer among its options',()=>{
  const context=runtime();
  const quizzes=JSON.parse(vm.runInContext('JSON.stringify(QUIZZES)',context));
  for(const [line,quiz] of Object.entries(quizzes)){
    assert.equal(quiz.questions.length,5,line);
    for(const q of quiz.questions){
      assert.ok(Number.isInteger(q.ans) && q.ans>=0 && q.ans<q.opts.length,q.q);
      assert.equal(new Set(q.opts).size,q.opts.length,q.q);
    }
  }
});

test('Reset clears pet, life stage, line and search; Find in catalogue starts from a clean filter',()=>{
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id)) elements.set(id,{id,value:'',style:{},dataset:{},innerHTML:'',textContent:'',classList:classes(),
      scrollIntoView(){},focus(){},scrollTo(){},closest(){return null}});
    return elements.get(id);
  };
  function classes(initial=[]){const set=new Set(initial);return {add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c),
    toggle(c,f){const on=f===undefined?!set.has(c):f;on?set.add(c):set.delete(c);return on}};}
  // Chips in printed order, as in index.html.
  const chips={fpet:['dog','cat','reset'],fstage:['all','puppy','kitten','adult','light','neutered'],fline:['all','quinoa','pumpkin','ocean','prime','lag'],fkibble:['all','mini','mm']};
  const chipEls=Object.fromEntries(Object.entries(chips).map(([g,list])=>[g,list.map((v,i)=>({value:v,dataset:{value:v},hidden:false,classList:classes(i===0&&g!=='fpet'?['active']:[])}))]));
  const document={getElementById:element,querySelector:()=>element('nav-first'),
    querySelectorAll:sel=>{const m=sel.match(/^#(\w+) \.chip$/);return m?chipEls[m[1]]:[];}};
  const context=vm.createContext({document,window:{addEventListener(){}},fetch:()=>new Promise(()=>{}),setTimeout:fn=>fn(),clearTimeout(){}});
  for(const name of ['farmina-data','catalog-links','products','product-images','ingredients','quiz','tips','feeding','calculator','matcher','search','app','buddy'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
  const active=g=>chipEls[g].filter(c=>c.classList.contains('active')).map(c=>c.value);
  // Simulate choices: Dog, Adult, Pumpkin, and a search term.
  vm.runInContext("filters={pet:'dog',stage:'adult',line:'pumpkin',kibble:'all'}",context);
  for(const [g,v] of [['fpet','dog'],['fstage','adult'],['fline','pumpkin']]){chipEls[g].forEach(c=>c.classList.remove('active'));chipEls[g].find(c=>c.value===v).classList.add('active');}
  element('psearch').value='chicken';
  vm.runInContext('resetFilters()',context);
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(filters)',context)),{pet:'all',stage:'all',line:'all',kibble:'all'});
  assert.equal(element('psearch').value,'');
  assert.deepEqual([active('fpet'),active('fstage'),active('fline')],[[],['all'],['all']]);
  assert.match(element('pgrid').innerHTML,/pc-cq1/);  // the cat Urinary card is visible again
  // Find in catalogue from Help a customer must not leave Dog selected.
  chipEls.fpet[1].classList.add('active');
  vm.runInContext("filters.pet='cat';openBuddyProduct('dp5-mini','')",context);
  assert.deepEqual(active('fpet'),[]);
  assert.equal(vm.runInContext('filters.pet',context),'all');
  // Pet decides the life stages and lines on offer; a stale selection falls back to All.
  const shown=g=>chipEls[g].filter(c=>!c.hidden).map(c=>c.value);
  const pick=(type,value)=>vm.runInContext(`filters.${type}='${value}';syncFilterChips()`,context);
  const pickActive=(g,value)=>{chipEls[g].forEach(c=>c.classList.remove('active'));chipEls[g].find(c=>c.value===value).classList.add('active');};
  pick('pet','dog');
  assert.deepEqual(shown('fstage'),['all','puppy','adult','light']);
  assert.deepEqual(shown('fline'),['all','quinoa','pumpkin','ocean','prime','lag']);
  pick('line','lag');pickActive('fline','lag');
  pick('pet','cat');
  assert.deepEqual(shown('fstage'),['all','kitten','adult','neutered']);
  assert.deepEqual(shown('fline'),['all','quinoa','pumpkin','ocean','prime']);
  assert.deepEqual(shown('fkibble'),['all']);
  assert.equal(vm.runInContext('filters.line',context),'all');
  assert.deepEqual(active('fline'),['all']);
  pick('stage','kitten');pickActive('fstage','kitten');
  assert.deepEqual(shown('fline'),['all','prime']);
  pick('pet','dog');
  assert.equal(vm.runInContext('filters.stage',context),'all');
  assert.deepEqual(active('fstage'),['all']);
  pick('stage','light');
  assert.deepEqual(shown('fline'),['all','lag']);
  vm.runInContext('resetFilters()',context);
  assert.deepEqual(shown('fstage'),chips.fstage);
  assert.deepEqual(shown('fline'),chips.fline);
});

test('the six card figures match the approved June 2026 list',()=>{
  const context=runtime();
  const expected={dp3:[96,'75%'],dp4:[96,'75%'],dq1:[92,'51%'],dq2:[92,'51%'],cp3:[98,'86%'],cq1:[94,'70%']};
  for(const [family,[animal,meat]] of Object.entries(expected)){
    const cards=JSON.parse(vm.runInContext(`JSON.stringify(PRODUCTS.filter(p=>p.family==='${family}'))`,context));
    assert.ok(cards.length>=1,family);
    for(const p of cards){
      assert.equal(p.nutrition.proteinAnimal,animal,p.id);
      assert.equal(p.macros.meat,meat,p.id);
    }
  }
});

test('protein figures match the Farmina ZA product pages read on 03/11/2026',()=>{
  const context=runtime();
  const crude={dp1:32,dp2:34,do1:30,do2:30,dp3:30,dp4:30,dp5:30,dp6:28,dp7:30,dl1:30,dl2:30,dl3:34,dq1:23,dq2:23,cp1:44,cp2:44,cp3:42,cp4:44,cp6:46,co1:44,cp5:46,cq1:33};
  const animal={dp1:98,dp2:98,do1:98,do2:98,dp3:96,dp4:96,dp5:96,dp6:96,dp7:96,dl1:90,dl2:90,dl3:90,cp1:98,cp2:98,cp3:98,cp4:98,cp6:98,co1:98,cp5:96};
  const products=JSON.parse(vm.runInContext('JSON.stringify(PRODUCTS)',context));
  assert.equal(products.length,36);
  for(const p of products){
    assert.equal(p.nutrition.protein,crude[p.family],p.id);
    if(animal[p.family]!==undefined) assert.equal(p.nutrition.proteinAnimal,animal[p.family],p.id);
  }
});

test('all 36 products are listed, with each dog recipe in both kibble sizes',()=>{
  const context=runtime();
  const products=JSON.parse(vm.runInContext('JSON.stringify(PRODUCTS)',context));
  assert.equal(products.length,36);
  assert.equal(new Set(products.map(p=>p.id)).size,36);
  assert.equal(products.filter(p=>p.pet==='cat').length,8);
  const dogs=products.filter(p=>p.pet==='dog');
  assert.equal(dogs.length,28);
  for(const family of new Set(dogs.map(p=>p.family))){
    assert.deepEqual(dogs.filter(p=>p.family===family).map(p=>p.kibble),['Mini','Medium & Maxi'],family);
  }
  for(const p of products){
    assert.equal(p.catalog_error,false,p.id);
    for(const field of ['composition','analysis','registration']) assert.ok(p[field],`${p.id} ${field}`);
    assert.ok(p.energy>0,p.id);
    assert.deepEqual(Object.keys(p.macros).sort(),['grains','meat'],`${p.id} quotes an unsourced macro`);
    const label=g=>g>=1000?`${g/1000}kg`:`${g}g`;
    assert.deepEqual(p.scraped_skus.map(s=>label(s.pack_size_grams)),p.sizes,`${p.id} packs`);
  }
  const packs=id=>products.find(p=>p.id===id).sizes;
  assert.deepEqual(packs('dp5-mini'),['800g','2.5kg','7kg']);
  assert.deepEqual(packs('dp5-mm'),['12kg']);
  assert.deepEqual(packs('dl3-mini'),['2.5kg']);
  assert.deepEqual(packs('dq1-mm'),['7kg']);
});

test('copy quotes no ingredient percentage without an approved source',()=>{
  const context=runtime();
  const text=vm.runInContext('JSON.stringify({TIPS,INGREDIENTS,QUIZZES,PRODUCTS})',context);
  assert.doesNotMatch(text,/48-51%|50%\+ of the recipe|70% water|63%\+|50% fresh|Fruits & Veg/);
});

test('Tips no longer carry the two unsourced claims',()=>{
  const text=vm.runInContext('JSON.stringify(TIPS)',runtime());
  assert.doesNotMatch(text,/AAFCO|boutique brands|15-20%|Most competitors/);
});

test('the value panel names its source and drops the unsupported meat comparison',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/Source: Andrew Fourie, Chief Technical Officer, Apex Pet Group/);
  assert.doesNotMatch(html,/60.65% more meat/);
});

test('every product line has a quiz',()=>{
  const context=runtime();
  const lines=JSON.parse(vm.runInContext('JSON.stringify([...new Set(PRODUCTS.map(p=>p.line))])',context));
  const quizzes=JSON.parse(vm.runInContext('JSON.stringify(Object.keys(QUIZZES))',context));
  for(const line of lines) assert.ok(quizzes.includes(line),line);
});

test('quiz progress is restored from the device and bad values are ignored',()=>{
  const source=fs.readFileSync(path.join(root,'js/quiz.js'),'utf8');
  const stored={'apex-training-quiz-progress-v1':JSON.stringify({prime:4,ocean:99,lag:'5',unknown:3})};
  const localStorage={getItem:k=>stored[k]??null,setItem:(k,v)=>{stored[k]=v;}};
  const context=vm.createContext({localStorage,window:{},document:{}});
  vm.runInContext(source,context);
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(quizDone)',context)),{prime:4});
  vm.runInContext("quizDone.ocean=5;saveQuizProgress()",context);
  assert.deepEqual(JSON.parse(stored['apex-training-quiz-progress-v1']),{prime:4,ocean:5});
  const blocked=vm.createContext({get localStorage(){throw new Error('blocked');},window:{},document:{}});
  assert.doesNotThrow(()=>vm.runInContext(source+"\nsaveQuizProgress();",blocked));
});

test('Quinoa Skin & Coat cards are listed for adult dogs, matching the approved list',()=>{
  const context=runtime();
  for(const id of ['dq1-mini','dq1-mm','dq2-mini','dq2-mm']){
    const p=JSON.parse(vm.runInContext(`JSON.stringify(PRODUCTS.find(p=>p.id==='${id}'))`,context));
    assert.equal(p.stage,'adult');
    assert.match(p.suitable,/^Adult dogs/);
  }
});

test('responsive layout: tablets can rotate and taps do only what they say',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.equal(manifest.orientation,'any');
  const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
  assert.match(app,/class="sku-chip[^`]*onclick="event\.stopPropagation\(\);setProductSku/,'choosing a pack size must not toggle the card');
  const search=fs.readFileSync(path.join(root,'js/search.js'),'utf8');
  assert.match(search,/onclick="jumpToProduct\('\$\{r\.id\}'\); closeSearchModal\(\)"/,'a product result must close the search overlay');
  const css=fs.readFileSync(path.join(root,'css/styles.css'),'utf8');
  assert.match(css,/@media\(min-width:900px\) and \(min-height:561px\)/,'side rail needs width and height, so landscape phones keep the bottom bar');
});
