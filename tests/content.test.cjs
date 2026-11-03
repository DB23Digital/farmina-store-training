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
  const chips={fpet:['dog','cat','reset'],fstage:['all','puppy','kitten','adult','light','neutered'],fline:['all','quinoa','pumpkin','ocean','prime','lag']};
  const chipEls=Object.fromEntries(Object.entries(chips).map(([g,list])=>[g,list.map((v,i)=>({value:v,dataset:{value:v},hidden:false,classList:classes(i===0&&g!=='fpet'?['active']:[])}))]));
  const document={getElementById:element,querySelector:()=>element('nav-first'),
    querySelectorAll:sel=>{const m=sel.match(/^#(\w+) \.chip$/);return m?chipEls[m[1]]:[];}};
  const context=vm.createContext({document,window:{addEventListener(){}},fetch:()=>new Promise(()=>{}),setTimeout:fn=>fn(),clearTimeout(){}});
  for(const name of ['farmina-data','catalog-links','products','product-images','ingredients','quiz','tips','feeding','calculator','matcher','search','app','buddy'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
  const active=g=>chipEls[g].filter(c=>c.classList.contains('active')).map(c=>c.value);
  // Simulate choices: Dog, Adult, Pumpkin, and a search term.
  vm.runInContext("filters={pet:'dog',stage:'adult',line:'pumpkin'}",context);
  for(const [g,v] of [['fpet','dog'],['fstage','adult'],['fline','pumpkin']]){chipEls[g].forEach(c=>c.classList.remove('active'));chipEls[g].find(c=>c.value===v).classList.add('active');}
  element('psearch').value='chicken';
  vm.runInContext('resetFilters()',context);
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(filters)',context)),{pet:'all',stage:'all',line:'all'});
  assert.equal(element('psearch').value,'');
  assert.deepEqual([active('fpet'),active('fstage'),active('fline')],[[],['all'],['all']]);
  assert.match(element('pgrid').innerHTML,/pc-cq1/);  // the cat Urinary card is visible again
  // Find in catalogue from Help a customer must not leave Dog selected.
  chipEls.fpet[1].classList.add('active');
  vm.runInContext("filters.pet='cat';openBuddyProduct('dp5','')",context);
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

test('Quinoa Skin & Coat cards are listed for adult dogs, matching the approved list',()=>{
  const context=runtime();
  for(const id of ['dq1','dq2']){
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
