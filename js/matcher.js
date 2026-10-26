// ═══════════════════════════════════════
// ALLERGY/SENSITIVITY MATCHER
// Product comparison aid. Does not diagnose allergies or establish suitability.
// ═══════════════════════════════════════

let matcherState = {
  step: 1,        // 1=pet type, 2=life stage, 3=concern, 4=results
  petType: null,  // 'dog' | 'cat'
  stage: null,    // 'puppy','adult','kitten','neutered','light'
  concern: null   // 'allergies','digestion','skin','joints','immunity'
};

// Concern definitions
const MATCHER_CONCERNS = [
  {id:'allergies',icon:'🐾',label:'Food Allergies/Sensitivities',desc:'How to review full ingredient lists'},
  {id:'digestion',icon:'🫁',label:'Digestive Issues',desc:'Loose stools, constipation, gas'},
  {id:'skin',icon:'✨',label:'Skin & Coat Issues',desc:'Dull coat, itching, dry skin'},
  {id:'joints',icon:'🦴',label:'Joint/Mobility Support',desc:'Age-related stiffness, arthritis'},
  {id:'immunity',icon:'🛡️',label:'Immune Support',desc:'General wellness, seasonal issues'}
];

// Life stage options per pet type
const MATCHER_STAGES = {
  dog: [{val:'puppy',label:'Puppy'},{val:'adult',label:'Adult'},{val:'light',label:'Light (Weight Management)'}],
  cat: [{val:'kitten',label:'Kitten'},{val:'adult',label:'Adult'},{val:'neutered',label:'Neutered/Spayed'}]
};

// Matcher logic: concern + pet type + stage → product IDs
const MATCHER_LOGIC = {
  allergies: {}, // An exposure history and confirmed excluded ingredients are required.
  digestion: {
    dog: {puppy:['dp3','dp4'],adult:['dp5','dp6','dp7']},  // Pumpkin puppies & adult
    cat: {neutered:['cp5']}  // Keep the explicitly neutered formula within its displayed stage.
  },
  skin: {
    dog: {adult:['dq1','dq2','do2']},
    cat: {adult:['co1']}  // Ocean (wild-caught fish)
  },
  joints: {
    dog: {adult:['dp2','do2','dl2']},  // Prime adult, Ocean adult, LAG adult
    cat: {adult:['cp2','cp3','cp4']}  // Prime adult varieties + Lamb
  },
  immunity: {
    dog: {puppy:['dp1'],adult:['dp2','do2','dl2']},
    cat: {adult:['cp2','cp3','cp4']}  // Prime formulas
  }
};

// ── Matcher UI Functions ──

function initMatcher(){
  matcherState = {step:1,petType:null,stage:null,concern:null};
  window.TrainingAnalytics?.track('matcher_start');
  renderMatcherStep();
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
    ${MATCHER_CONCERNS.map(c=>`
    <button type="button" class="match-btn" onclick="selectMatcherConcern('${c.id}')" style="padding:12px;background:var(--cream);border:2px solid var(--border);border-radius:10px;text-align:left;cursor:pointer">
      <div style="font-size:16px;margin-bottom:4px">${c.icon}</div>
      <div style="font-weight:600;font-size:13px;color:var(--text)">${c.label}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px">${c.desc}</div>
    </button>`).join('')}
  </div>
</div>`;
  }
  // Step 4: Results
  else if(matcherState.step === 4){
    const results = getMatcherResults();
    const resultProducts = results.map(id => PRODUCTS.find(p=>p.id===id)).filter(Boolean);
    container.innerHTML = `
<div class="match-step">
  <div class="match-progress"><div class="match-prog-bar" style="width:100%"></div></div>
  <button type="button" onclick="initMatcher()" style="float:right;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;text-decoration:underline">Reset</button>
  <h3>Products to compare</h3>
  <p style="color:var(--muted);font-size:13px;margin-top:6px;clear:both">Based on ${matcherState.concern === 'allergies' ? 'food allergies' : matcherState.concern === 'digestion' ? 'digestive needs' : matcherState.concern === 'skin' ? 'skin & coat health' : matcherState.concern === 'joints' ? 'joint support' : 'immune support'}</p>
  <div style="margin-top:16px">
    ${resultProducts.length ? resultProducts.map(p=>`
    <div class="match-result-card" style="background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;cursor:pointer" onclick="jumpToProduct('${p.id}')">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div style="font-size:24px">${p.icon}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;color:var(--text)">${p.name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${p.variant}</div>
          <div style="display:flex;gap:6px;margin-top:6px">
            <span class="badge badge-line" style="font-size:11px;padding:3px 8px">${p.lineName}</span>
            <span class="badge" style="font-size:11px;padding:3px 8px;background:var(--gd);color:#fff">${p.pet==='cat'?'🐱 Cat':'🐶 Dog'}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:8px;line-height:1.4"><strong>Why this match:</strong> ${getMatchReason(p.id)}</div>
        </div>
      </div>
    </div>`).join('') : `<p style="color:var(--muted);text-align:center;padding:20px">${matcherState.concern === 'allergies' ? 'A headline protein cannot establish allergy suitability. Review the complete ingredient list with the pet’s known exclusions and veterinary advice. Browse the catalogue to compare ingredients.' : 'No verified matches for this pet and life stage. Browse all products to compare.'}</p>`}
  </div>
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
  } else {
    matcherState.concern = concern;
    matcherState.step = 4;
    window.TrainingAnalytics?.track('matcher_complete', {pet_type:matcherState.petType, life_stage:matcherState.stage, concern, result_count:getMatcherResults().length});
  }
  renderMatcherStep();
}

function getMatcherResults(){
  const logic = MATCHER_LOGIC[matcherState.concern];
  if(!logic) return [];
  const byPet = logic[matcherState.petType];
  if(!byPet) return [];
  const byStage = byPet[matcherState.stage];
  return (byStage || []).filter(id=>{
    const product = PRODUCTS.find(p=>p.id===id);
    return product && !product.catalog_error && product.pet === matcherState.petType && product.stage === matcherState.stage;
  });
}

function getMatchReason(productId){
  const p = PRODUCTS.find(pr => pr.id === productId);
  if(!p) return '';
  
  const concerns = {
    allergies: 'Review the complete ingredient list against known exclusions.',
    digestion: 'Compare the declared fibre sources and full ingredient list.',
    skin: 'Compare the declared oils and fatty-acid information.',
    joints: 'Check the full ingredient list for declared glucosamine and chondroitin.',
    immunity: 'Compare the declared prebiotic ingredients and product information.'
  };
  
  return concerns[matcherState.concern] || `Perfect match for ${matcherState.concern}`;
}
