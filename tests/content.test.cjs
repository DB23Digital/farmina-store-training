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

test('Quinoa Skin & Coat cards are listed for adult dogs, matching the approved list',()=>{
  const context=runtime();
  for(const id of ['dq1','dq2']){
    const p=JSON.parse(vm.runInContext(`JSON.stringify(PRODUCTS.find(p=>p.id==='${id}'))`,context));
    assert.equal(p.stage,'adult');
    assert.match(p.suitable,/^Adult dogs/);
  }
});
