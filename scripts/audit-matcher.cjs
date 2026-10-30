// Prints every Matcher pet × life stage × concern combination with the evidence
// behind each listed formula, plus the Ingredients screen condition panels.
// Usage: node scripts/audit-matcher.cjs
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

const context=vm.createContext({window:{}});
for(const name of ['farmina-data','catalog-links','products','ingredients','matcher'])
  vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
const report=vm.runInContext(`(() => {
  const rows=[];
  const describe=r=>r.product.id+'('+r.product.stage+')'+(r.claim?' ['+r.claim+']':'')+(r.evidence.length?' '+r.evidence.join('+'):'');
  for(const pet of ['dog','cat']) for(const s of MATCHER_STAGES[pet]) for(const c of matcherConcernsFor(pet)){
    const sets=c.id==='allergies' ? MATCHER_EXCLUSIONS.map(x=>[x.id]) : [[]];
    for(const exclusions of sets){
      const o=getMatcherOutcome({petType:pet,stage:s.val,concern:c.id,exclusions});
      rows.push({pet,stage:s.val,concern:c.id+(exclusions.length?':-'+exclusions[0]:''),
        exact:o.exact.map(describe).join(', ')||'-',
        other:o.other.map(describe).join(', ')||'-',
        status:o.exact.length?'ok':o.fallback?'FALLBACK':'EMPTY'});
    }
  }
  const panels=Object.entries(CONDITION_MATCHER_RULES).map(([cond,rule])=>({cond,rule,
    products:conditionPanelProducts(rule).map(p=>p.id).join(',')||'-'}));
  const errors=PRODUCTS.filter(p=>p.catalog_error).map(p=>p.id);
  return {rows,panels,errors};
})()`,context);

for(const r of report.rows) console.log(`${r.status.padEnd(8)} ${r.pet}/${r.stage}/${r.concern}\n  exact: ${r.exact}\n  other: ${r.other}`);
console.log('\nIngredients condition panels');
for(const p of report.panels) console.log(`  ${p.cond} -> ${p.rule}: ${p.products}`);
const counts=report.rows.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
console.log(`\nCombinations: ${report.rows.length}; ${JSON.stringify(counts)}; catalogue errors: ${report.errors.join(',')||'none'}`);
