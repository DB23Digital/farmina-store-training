// ═══════════════════════════════════════
// ALLERGY/SENSITIVITY MATCHER
// Product comparison aid. Does not diagnose allergies or establish suitability.
// Results come from the composition text and claims declared on each catalogue
// card in products.js; every result shows the evidence that put it on the list.
// ═══════════════════════════════════════

let matcherState = {
  step: 1,        // 1=pet type, 2=life stage, 3=concern, 'exclude'=ingredient exclusions, 4=results
  petType: null,  // 'dog' | 'cat'
  stage: null,    // 'puppy','adult','kitten','neutered','light'
  concern: null,  // MATCHER_CONCERNS id
  exclusions: [], // MATCHER_EXCLUSIONS ids, allergies only
  showAll: false
};

// Declared ingredients used as evidence. Patterns run on lower-cased composition text.
const MATCHER_MARKERS = {
  pumpkin:{label:'dried pumpkin',re:/\bpumpkin\b/},
  psyllium:{label:'psyllium',re:/\bpsyllium\b/},
  beet:{label:'beet pulp',re:/\bbeet pulp\b/},
  inulin:{label:'inulin',re:/\binulin\b/},
  fos:{label:'FOS',re:/\b(fos|fructo-?oligosaccharides?)\b/},
  mos:{label:'MOS',re:/\b(mos|mann(?:an|o)-?oligosaccharides?)\b/},
  glucosamine:{label:'glucosamine',re:/\bglucosamine\b/},
  chondroitin:{label:'chondroitin',re:/\bchondroitin\b/},
  cartilage:{label:'cartilage',re:/\bcartilages?\b/},
  fishoil:{label:'fish oil',re:/\b(fish|herring|salmon) oil\b/},
  linseed:{label:'linseed',re:/\b(linseed|flaxseed)\b/},
  lutein:{label:'lutein (marigold)',re:/\b(lutein|marigold)\b/}
};

// claims: card highlights that name the need (a dedicated formula, ranked first).
// markers: declared ingredients counted as evidence; requireAll must all be present.
const MATCHER_RULES = {
  digestion:{markers:['pumpkin','psyllium','beet','inulin','fos','mos']},
  skin:{claims:['Skin & Coat'],markers:['fishoil','linseed']},
  joints:{markers:['glucosamine','chondroitin','cartilage'],requireAll:['glucosamine','chondroitin']},
  immunity:{markers:['inulin','fos','mos']},
  urinary:{claims:['Urinary Support'],markers:[]},
  // Used by the Ingredients screen condition panels.
  omega3:{claims:['High Omega-3','Omega Rich'],markers:['fishoil','linseed']},
  eye:{markers:['lutein']},
  novel:{claims:['Novel Protein'],markers:[]}
};

// Concern definitions
const MATCHER_CONCERNS = [
  {id:'allergies',icon:'🐾',label:'Food Allergies/Sensitivities',desc:'Leave out ingredients the pet must avoid'},
  {id:'digestion',icon:'🫁',label:'Digestive Issues',desc:'Loose stools, constipation, gas'},
  {id:'skin',icon:'✨',label:'Skin & Coat Issues',desc:'Dull coat, itching, dry skin'},
  {id:'joints',icon:'🦴',label:'Joint/Mobility Support',desc:'Age-related stiffness, arthritis'},
  {id:'immunity',icon:'🛡️',label:'Immune Support',desc:'General wellness, seasonal issues'},
  {id:'urinary',icon:'💧',label:'Urinary Support',desc:'Lower urinary tract concerns',pets:['cat']}
];

const MATCHER_CONCERN_TEXT = {
  allergies:'the ingredients you left out', digestion:'digestive support ingredients',
  skin:'skin & coat ingredients', joints:'joint support ingredients',
  immunity:'prebiotic ingredients', urinary:'urinary support'
};

// Exclusions match the full composition text, so "chicken fat" counts as chicken.
const MATCHER_EXCLUSIONS = [
  {id:'chicken',label:'Chicken',re:/\bchicken\b/,animal:true},
  {id:'egg',label:'Egg',re:/\beggs?\b/,animal:true},
  {id:'fish',label:'Fish (incl. fish oil)',re:/\b(fish|herrings?|cod|salmon|anchov(?:y|ies)|tuna|shrimps?)\b/,animal:true},
  {id:'lamb',label:'Lamb',re:/\blamb\b/,animal:true},
  {id:'duck',label:'Duck',re:/\bduck\b/,animal:true},
  {id:'boar',label:'Wild boar',re:/\bboar\b/,animal:true},
  {id:'quail',label:'Quail',re:/\bquail\b/,animal:true},
  {id:'legumes',label:'Peas & legumes',re:/\b(peas?|chickpeas?|lentils?|beans?)\b/},
  {id:'potato',label:'Potato & sweet potato',re:/\bpotato(?:es)?\b/},
  {id:'grains',label:'Grains (spelt, oats, wheat, rice, corn)',re:/\b(spelt|oats?|wheat|rice|corn|barley)\b/}
];
// An unnamed animal source could be any species, so it fails every animal exclusion.
const MATCHER_UNNAMED_ANIMAL = /\bhydroly[sz]ed animal proteins?\b|\banimal (fat|derivatives?|by-?products?)\b/;

// Life stage options per pet type
const MATCHER_STAGES = {
  dog: [{val:'puppy',label:'Puppy'},{val:'adult',label:'Adult'},{val:'light',label:'Light (Weight Management)'}],
  cat: [{val:'kitten',label:'Kitten'},{val:'adult',label:'Adult'},{val:'neutered',label:'Neutered/Spayed'}]
};
const MATCHER_STAGE_LABELS = {puppy:'Puppy',adult:'Adult',light:'Light',kitten:'Kitten',neutered:'Neutered'};

// ── Matching ──

function matcherConcernsFor(pet){
  return MATCHER_CONCERNS.filter(c=>!c.pets || c.pets.includes(pet));
}

function matcherEvaluate(product, ruleId){
  const rule = MATCHER_RULES[ruleId];
  if(!rule) return null;
  const text = product.composition.toLowerCase();
  const found = rule.markers.filter(key=>MATCHER_MARKERS[key].re.test(text));
  const claim = (rule.claims || []).find(c=>product.highlights.includes(c)) || null;
  const meetsMarkers = rule.requireAll
    ? rule.requireAll.every(key=>found.includes(key))
    : found.length > 0;
  if(!claim && !meetsMarkers) return null;
  return {product, claim, evidence:found.map(key=>MATCHER_MARKERS[key].label),
    score:(claim?100:0) + found.length};
}

function matcherExcludedBy(product, exclusionIds){
  const text = product.composition.toLowerCase();
  const chosen = MATCHER_EXCLUSIONS.filter(x=>exclusionIds.includes(x.id));
  const hits = chosen.filter(x=>x.re.test(text)).map(x=>x.label);
  if(chosen.some(x=>x.animal) && MATCHER_UNNAMED_ANIMAL.test(text)) hits.push('unnamed animal protein');
  return hits;
}

// The kibble sizes of a recipe would otherwise fill the shortlist with near-duplicates.
function matcherOnePerRecipe(results){
  const byRecipe = new Map();
  results.forEach(result=>{
    const first = byRecipe.get(result.product.family);
    if(first) first.alsoKibble = result.product.kibble;
    else byRecipe.set(result.product.family,{...result});
  });
  return [...byRecipe.values()];
}

function matcherCandidates(pet){
  return PRODUCTS.filter(p=>!p.catalog_error && p.pet===pet);
}

// Ranked matches for one pet: exact life stage first, then other stages.
// Other-stage formulas are offered when the exact stage has none, and dedicated
// formulas (claim on the card) are always offered from other stages, labelled.
function getMatcherOutcome(state){
  const empty = {exact:[],other:[],fallback:false};
  if(!state.petType || !state.stage || !state.concern) return empty;
  const pool = matcherCandidates(state.petType);
  let ranked;
  if(state.concern === 'allergies'){
    if(!state.exclusions?.length) return empty;
    ranked = pool.filter(p=>!matcherExcludedBy(p,state.exclusions).length)
      .map(p=>({product:p,claim:null,evidence:[],score:0}));
  } else {
    if(!matcherConcernsFor(state.petType).some(c=>c.id===state.concern)) return empty;
    ranked = pool.map(p=>matcherEvaluate(p,state.concern)).filter(Boolean)
      .sort((a,b)=>b.score-a.score || PRODUCTS.indexOf(a.product)-PRODUCTS.indexOf(b.product));
  }
  ranked = matcherOnePerRecipe(ranked);
  const exact = ranked.filter(r=>r.product.stage===state.stage);
  const elsewhere = ranked.filter(r=>r.product.stage!==state.stage);
  const other = exact.length ? elsewhere.filter(r=>r.claim) : elsewhere;
  return {exact, other, fallback:!exact.length && other.length>0};
}

function getMatcherResults(){
  return getMatcherOutcome(matcherState).exact.map(r=>r.product.id);
}

// Top formulas across both pets for an Ingredients screen condition panel.
function conditionPanelProducts(ruleId, limit=6){
  return matcherOnePerRecipe(PRODUCTS.filter(p=>!p.catalog_error)
    .map(p=>matcherEvaluate(p,ruleId)).filter(Boolean)
    .sort((a,b)=>b.score-a.score || PRODUCTS.indexOf(a.product)-PRODUCTS.indexOf(b.product)))
    .slice(0,limit).map(r=>r.product);
}

function matcherEscape(value){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);
}

function matcherReason(result){
  if(matcherState.concern === 'allergies'){
    const labels = MATCHER_EXCLUSIONS.filter(x=>matcherState.exclusions.includes(x.id)).map(x=>x.label.toLowerCase());
    return `Composition text does not list: ${labels.join(', ')}.`;
  }
  const parts = [];
  if(result.claim) parts.push(`Dedicated ${result.claim} formula`);
  if(result.evidence.length) parts.push(`declares ${result.evidence.join(', ')}`);
  const text = parts.join(' · ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

// ── Matcher UI Functions ──

function initMatcher(){
  matcherState = {step:1,petType:null,stage:null,concern:null,exclusions:[],showAll:false};
  window.TrainingAnalytics?.track('matcher_start');
  renderMatcherStep();
}

function matcherResultCard(result, otherStage){
  const p = result.product;
  return `
    <div class="match-result-card" style="background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;cursor:pointer" role="button" tabindex="0" onclick="jumpToProduct('${p.id}')">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div style="font-size:24px">${p.icon}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;color:var(--text)">${matcherEscape(p.name)}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${matcherEscape(p.variant)}${result.alsoKibble?` · also ${matcherEscape(result.alsoKibble)}`:''}</div>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            <span class="badge badge-line" style="font-size:11px;padding:3px 8px">${matcherEscape(p.lineName)}</span>
            <span class="badge" style="font-size:11px;padding:3px 8px;background:var(--gd);color:#fff">${p.pet==='cat'?'🐱 Cat':'🐶 Dog'}</span>
            ${otherStage?`<span class="badge" style="font-size:11px;padding:3px 8px;background:var(--gold);color:#fff">${MATCHER_STAGE_LABELS[p.stage]} formula</span>`:''}
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:8px;line-height:1.4"><strong>Why listed:</strong> ${matcherEscape(matcherReason(result))}</div>
          ${otherStage?`<div style="font-size:11px;color:var(--text);margin-top:6px;line-height:1.4">Listed for ${MATCHER_STAGE_LABELS[p.stage].toLowerCase()} pets, not ${MATCHER_STAGE_LABELS[matcherState.stage].toLowerCase()}. Check the pack’s life-stage guidance before recommending.</div>`:''}
        </div>
      </div>
    </div>`;
}

function renderMatcherStep(){
  const container = document.getElementById('matcherContainer');
  if(!container) return;

  // Step 1: Pet Type
  if(matcherState.step === 1){
    container.innerHTML = `
<div class="match-step">
  <div class="match-progress"><div class="match-prog-bar" style="width:25%"></div></div>
  <h3>What pet do you have?</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px">Let's find the best Farmina for them</p>
  <div style="display:flex;gap:12px;margin-top:16px">
    <button type="button" class="match-btn" onclick="selectMatcherPet('dog')" style="flex:1;padding:18px;background:var(--cream);border:2px solid var(--gm);border-radius:12px;font-size:16px;font-weight:600;color:var(--text);cursor:pointer">🐶 Dog</button>
    <button type="button" class="match-btn" onclick="selectMatcherPet('cat')" style="flex:1;padding:18px;background:var(--cream);border:2px solid var(--gm);border-radius:12px;font-size:16px;font-weight:600;color:var(--text);cursor:pointer">🐱 Cat</button>
  </div>
</div>`;
  }
  // Step 2: Life Stage
  else if(matcherState.step === 2){
    const stages = MATCHER_STAGES[matcherState.petType] || [];
    container.innerHTML = `
<div class="match-step">
  <div class="match-progress"><div class="match-prog-bar" style="width:50%"></div></div>
  <button type="button" onclick="selectMatcherStage(null)" style="float:right;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;text-decoration:underline">← Back</button>
  <h3>What is their life stage?</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px;clear:both">This helps us recommend the right formula</p>
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">
    ${stages.map(s=>`
    <button type="button" class="match-btn" onclick="selectMatcherStage('${s.val}')" style="padding:14px;background:var(--cream);border:2px solid var(--border);border-radius:10px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;text-align:left">
      ${s.label}
    </button>`).join('')}
  </div>
</div>`;
  }
  // Step 3: Concern
  else if(matcherState.step === 3){
    container.innerHTML = `
<div class="match-step">
  <div class="match-progress"><div class="match-prog-bar" style="width:75%"></div></div>
  <button type="button" onclick="selectMatcherConcern(null)" style="float:right;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;text-decoration:underline">← Back</button>
  <h3>What's the main concern?</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px;clear:both">Select their biggest nutritional need</p>
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">
    ${matcherConcernsFor(matcherState.petType).map(c=>`
    <button type="button" class="match-btn" onclick="selectMatcherConcern('${c.id}')" style="padding:12px;background:var(--cream);border:2px solid var(--border);border-radius:10px;text-align:left;cursor:pointer">
      <div style="font-size:16px;margin-bottom:4px">${c.icon}</div>
      <div style="font-weight:600;font-size:13px;color:var(--text)">${c.label}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px">${c.desc}</div>
    </button>`).join('')}
  </div>
</div>`;
  }
  // Allergies: choose ingredients to leave out
  else if(matcherState.step === 'exclude'){
    container.innerHTML = `
<div class="match-step">
  <div class="match-progress"><div class="match-prog-bar" style="width:88%"></div></div>
  <button type="button" onclick="matcherBackToConcern()" style="float:right;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;text-decoration:underline">← Back</button>
  <h3>Which ingredients must be avoided?</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px;clear:both">Use only what the owner or vet has confirmed. Tick everything that applies.</p>
  <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
    ${MATCHER_EXCLUSIONS.map(x=>`
    <label style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--cream);border:2px solid var(--border);border-radius:10px;font-size:14px;color:var(--text);cursor:pointer">
      <input type="checkbox" ${matcherState.exclusions.includes(x.id)?'checked':''} onchange="toggleMatcherExclusion('${x.id}')" style="width:18px;height:18px">
      ${x.label}
    </label>`).join('')}
  </div>
  <button type="button" onclick="showMatcherExclusionResults()" ${matcherState.exclusions.length?'':'disabled'} style="width:100%;padding:12px;background:var(--gm);color:#fff;border:none;border-radius:10px;font-weight:600;margin-top:14px;cursor:pointer;opacity:${matcherState.exclusions.length?1:.5}">Show formulas →</button>
</div>`;
  }
  // Step 4: Results
  else if(matcherState.step === 4){
    const outcome = getMatcherOutcome(matcherState);
    const limit = 3;
    const shown = matcherState.showAll ? outcome.exact : outcome.exact.slice(0,limit);
    const hidden = outcome.exact.length - shown.length;
    const stageLabel = MATCHER_STAGE_LABELS[matcherState.stage].toLowerCase();
    const otherHeading = outcome.fallback
      ? `No ${stageLabel} formula matches. Closest options for other life stages:`
      : 'Dedicated formulas listed for other life stages:';
    container.innerHTML = `
<div class="match-step">
  <div class="match-progress"><div class="match-prog-bar" style="width:100%"></div></div>
  <button type="button" onclick="matcherBackFromResults()" style="float:right;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;text-decoration:underline">← Back</button>
  <h3>Products to compare</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px;clear:both">${MATCHER_STAGE_LABELS[matcherState.stage]} ${matcherState.petType} formulas listed by ${MATCHER_CONCERN_TEXT[matcherState.concern]}</p>
  <div style="margin-top:16px">
    ${shown.map(r=>matcherResultCard(r,false)).join('')}
    ${hidden>0?`<button type="button" onclick="matcherShowAll()" style="width:100%;padding:10px;background:none;border:1.5px solid var(--border);border-radius:10px;color:var(--text);font-weight:600;margin-bottom:12px;cursor:pointer">Show all ${outcome.exact.length}</button>`:''}
    ${outcome.other.length?`<p style="font-size:12px;font-weight:600;color:var(--text);margin:6px 0 10px">${otherHeading}</p>${outcome.other.map(r=>matcherResultCard(r,true)).join('')}`:''}
    ${!outcome.exact.length && !outcome.other.length?`<p style="color:var(--muted);text-align:center;padding:20px">No catalogue formula for this pet ${matcherState.concern==='allergies'?'leaves out every ingredient you selected':'declares these ingredients'}. Browse the catalogue to compare full compositions.</p>`:''}
  </div>
  <p style="font-size:11px;color:var(--muted);line-height:1.5;margin-top:4px">Listed from the composition and claims shown in this app, not from the pack itself. Confirm the full ingredient list on the pack label. This is not a diagnosis; for allergies or ongoing health concerns, follow veterinary advice.</p>
  <button type="button" onclick="initMatcher()" style="width:100%;padding:12px;background:var(--gm);color:#fff;border:none;border-radius:10px;font-weight:600;margin-top:12px;cursor:pointer">Start Over</button>
</div>`;
  }
}

function selectMatcherPet(pet){
  matcherState.petType = pet;
  matcherState.step = 2;
  renderMatcherStep();
}

function selectMatcherStage(stage){
  if(stage === null){
    matcherState.step = 1;
  } else {
    matcherState.stage = stage;
    matcherState.step = 3;
  }
  renderMatcherStep();
}

function selectMatcherConcern(concern){
  if(concern === null){
    matcherState.step = 2;
  } else if(concern === 'allergies'){
    matcherState.concern = concern;
    matcherState.exclusions = [];
    matcherState.step = 'exclude';
  } else {
    matcherState.concern = concern;
    matcherState.showAll = false;
    matcherState.step = 4;
    matcherTrackComplete();
  }
  renderMatcherStep();
}

function toggleMatcherExclusion(id){
  if(!MATCHER_EXCLUSIONS.some(x=>x.id===id)) return;
  const set = new Set(matcherState.exclusions);
  set.has(id) ? set.delete(id) : set.add(id);
  matcherState.exclusions = MATCHER_EXCLUSIONS.map(x=>x.id).filter(x=>set.has(x));
  renderMatcherStep();
}

function showMatcherExclusionResults(){
  if(!matcherState.exclusions.length) return;
  matcherState.showAll = false;
  matcherState.step = 4;
  matcherTrackComplete();
  renderMatcherStep();
}

// Exclusion choices are customer details, so only the count of results is sent.
function matcherTrackComplete(){
  window.TrainingAnalytics?.track('matcher_complete', {pet_type:matcherState.petType, life_stage:matcherState.stage,
    concern:matcherState.concern, result_count:getMatcherResults().length});
}

function matcherShowAll(){
  matcherState.showAll = true;
  renderMatcherStep();
}

function matcherBackToConcern(){
  matcherState.step = 3;
  renderMatcherStep();
}

function matcherBackFromResults(){
  matcherState.step = matcherState.concern === 'allergies' ? 'exclude' : 3;
  renderMatcherStep();
}
