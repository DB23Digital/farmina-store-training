// Shop-floor conversation guide. Only catalogue facts and explicit source links
// are used here; this is not an allergy or medical suitability tool.
const BUDDY_PRIORITY = {
  'dog:puppy': ['dl1','dp1','do1','dp3','dp4'],
  'dog:adult': ['dl2','dp2','do2','dp5','dp6','dp7'],
  'dog:light': ['dl3'],
  'cat:kitten': ['cp1'],
  'cat:adult': ['cp2','co1','cp3','cp4'],
  'cat:neutered': ['cp6','cp5']
};
const BUDDY_PROFILES = {
  dog: [{id:'puppy',label:'Puppy'},{id:'adult',label:'Adult'},{id:'light',label:'Adult · light formula'}],
  cat: [{id:'kitten',label:'Kitten'},{id:'adult',label:'Adult'},{id:'neutered',label:'Neutered adult'}]
};
const BUDDY_PREFERENCES = [
  {id:'any',label:'Show starting points'},
  {id:'grain_free',label:'Grain-free range'},
  {id:'ancestral',label:'With ancestral grains'},
  {id:'chicken',label:'Chicken recipe'},
  {id:'fish',label:'Fish recipe'},
  {id:'lamb',label:'Lamb recipe'},
  {id:'boar',label:'Boar recipe'}
];
let buddyState = {step:'pet',pet:null,stage:null,size:null,preference:'any'};

function buddyCandidates(state){
  return (BUDDY_PRIORITY[`${state.pet}:${state.stage}`] || [])
    .map(id=>PRODUCTS.find(product=>product.id===id))
    .filter(product=>product && !product.catalog_error && product.scraped_skus?.length &&
      CATALOG_LINKS[product.id]?.ids.every(id=>validatedSourceIds.has(id)) &&
      product.pet===state.pet && product.stage===state.stage);
}

function buddyMatchesPreference(product, preference){
  if(preference==='any') return true;
  if(preference==='grain_free') return product.line!=='lag';
  if(preference==='ancestral') return product.line==='lag';
  if(preference==='fish') return ['Cod','Herring'].includes(product.protein);
  return product.protein.toLowerCase()===preference;
}

function buddyPreferenceOptions(state){
  const candidates=buddyCandidates(state);
  if(candidates.length<=1) return [BUDDY_PREFERENCES[0]];
  return BUDDY_PREFERENCES.filter(option=>option.id==='any' ||
    candidates.some(product=>buddyMatchesPreference(product,option.id)) &&
    (option.id!=='grain_free' && option.id!=='ancestral' ||
      candidates.some(product=>product.line==='lag') && candidates.some(product=>product.line!=='lag')));
}

function buddySource(product, size){
  const sources=CATALOG_LINKS[product.id].ids
    .map(id=>FARMINA_SCRAPED_PRODUCTS.find(source=>source.product_id===id))
    .filter(Boolean);
  if(product.pet==='cat') return {source:sources[0],exact:true};
  if(size==='mini'){
    const source=sources.find(item=>/\bMINI\b/i.test(item.product_name));
    if(source) return {source,exact:true};
  }
  if(size==='medium_maxi'){
    const source=sources.find(item=>/\bMEDIUM\s*&\s*MAXI\b/i.test(item.product_name));
    if(source) return {source,exact:true};
  }
  // One source can contain both Mini and Medium/Maxi packs. Do not infer
  // which pack applies from its weight or photograph.
  return {source:sources.length===1?sources[0]:null,exact:false};
}

function buddyResults(state){
  return buddyCandidates(state)
    .filter(product=>buddyMatchesPreference(product,state.preference))
    .slice(0,2)
    .map(product=>({product,...buddySource(product,state.size)}));
}

function buddyEscape(value){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);
}

function buddyProfileLabel(state){
  return BUDDY_PROFILES[state.pet]?.find(profile=>profile.id===state.stage)?.label || '';
}

function buddySizeLabel(grams){
  return grams>=1000 ? `${grams/1000} kg` : `${grams} g`;
}

function buddyResultCard(result){
  const {product,source,exact}=result;
  const shot=source && PRODUCT_SHOTS[source.product_id];
  const image=shot && (product.pet==='dog' && buddyState.size==='medium_maxi' && shot.large ? shot.large : shot.standard);
  const sizeText=exact && source
    ? `Listed packs: ${source.skus.map(sku=>buddySizeLabel(sku.pack_size_grams)).join(', ')}`
    : 'Confirm the exact breed-size pack on the shelf before recommending it.';
  const grainText=product.line==='lag' ? 'Ancestral Grain range' : 'Grain-free range';
  return `<article class="buddy-result">
    ${image?`<img src="${buddyEscape(image)}" alt="${buddyEscape(product.name)} pack photo" width="84" height="126">`:''}
    <div class="buddy-result-copy">
      <h3>${buddyEscape(product.name)}</h3>
      <p class="buddy-result-variant">${buddyEscape(product.lineName)} · ${buddyEscape(product.variant)}</p>
      <p><strong>Why compare it:</strong> ${buddyEscape(buddyProfileLabel(buddyState))} formula with ${buddyEscape(product.protein)} in the ${buddyEscape(grainText)}.</p>
      <p class="buddy-result-sizes">${buddyEscape(sizeText)}</p>
      <button type="button" onclick="openBuddyProduct('${product.id}','${exact?source?.product_id||'':''}')">Find in catalogue</button>
    </div>
  </article>`;
}

function startBuddy(){
  buddyState={step:'pet',pet:null,stage:null,size:null,preference:'any'};
  showScreen('buddy',null);
  window.TrainingAnalytics?.track('buddy_start');
  renderBuddy();
}

function buddyExit(){showScreen('catalog',document.querySelector('nav button'));}

function buddySelectPet(pet){
  if(!Object.hasOwn(BUDDY_PROFILES,pet)) return;
  buddyState={step:'profile',pet,stage:null,size:null,preference:'any'};
  renderBuddy();
}

function buddySelectStage(stage){
  if(!BUDDY_PROFILES[buddyState.pet]?.some(profile=>profile.id===stage)) return;
  buddyState.stage=stage;
  buddyState.step=buddyState.pet==='dog'?'size':buddyPreferenceOptions(buddyState).length>1?'preference':'results';
  if(buddyState.step==='results') buddyTrackComplete();
  renderBuddy();
}

function buddySelectSize(size){
  if(!['mini','medium_maxi','unknown'].includes(size)) return;
  buddyState.size=size;
  buddyState.step=buddyPreferenceOptions(buddyState).length>1?'preference':'results';
  if(buddyState.step==='results') buddyTrackComplete();
  renderBuddy();
}

function buddySelectPreference(preference){
  if(!buddyPreferenceOptions(buddyState).some(option=>option.id===preference)) return;
  buddyState.preference=preference;
  buddyState.step='results';
  buddyTrackComplete();
  renderBuddy();
}

function buddyTrackComplete(){
  window.TrainingAnalytics?.track('buddy_complete',{result_count:buddyResults(buddyState).length});
}

function buddyBack(){
  if(buddyState.step==='results') buddyState.step=buddyPreferenceOptions(buddyState).length>1?'preference':buddyState.pet==='dog'?'size':'profile';
  else if(buddyState.step==='preference') buddyState.step=buddyState.pet==='dog'?'size':'profile';
  else if(buddyState.step==='size') buddyState.step='profile';
  else if(buddyState.step==='profile') buddyState.step='pet';
  else return buddyExit();
  renderBuddy();
}

function renderBuddy(){
  const container=document.getElementById('buddyContainer');
  if(!container) return;
  const step=buddyState.step;
  let heading='';
  let body='';
  if(step==='pet'){
    heading='Who is the food for?';
    body=`<div class="buddy-choices">
      <button type="button" onclick="buddySelectPet('dog')">🐶 Dog</button>
      <button type="button" onclick="buddySelectPet('cat')">🐱 Cat</button>
    </div>`;
  } else if(step==='profile'){
    heading='Which pet profile fits?';
    body=`<div class="buddy-choices">${BUDDY_PROFILES[buddyState.pet].map(profile=>
      `<button type="button" onclick="buddySelectStage('${profile.id}')">${buddyEscape(profile.label)}</button>`).join('')}</div>`;
  } else if(step==='size'){
    heading='What is the dog’s breed size?';
    body=`<div class="buddy-choices">
      <button type="button" onclick="buddySelectSize('mini')">Mini</button>
      <button type="button" onclick="buddySelectSize('medium_maxi')">Medium or Maxi</button>
      <button type="button" onclick="buddySelectSize('unknown')">Not sure yet</button>
    </div>`;
  } else if(step==='preference'){
    heading='What would the customer like to compare?';
    body=`<div class="buddy-choices">${buddyPreferenceOptions(buddyState).map(option=>
      `<button type="button" onclick="buddySelectPreference('${option.id}')">${buddyEscape(option.label)}</button>`).join('')}</div>`;
  } else {
    heading='Product starting points';
    const results=buddyResults(buddyState);
    body=`<p class="buddy-intro">${buddyEscape(buddyProfileLabel(buddyState))}${buddyState.pet==='dog'?' dog':' · Cat'}${buddyState.size==='mini'?' · Mini':buddyState.size==='medium_maxi'?' · Medium/Maxi':''}</p>
      ${results.length?results.map(buddyResultCard).join(''):'<p class="buddy-empty">No catalogue product matches these choices. Browse the full catalogue instead.</p>'}
      <p class="buddy-caution">These are products to compare, based on pet profile and recipe preference. Check the exact pack label, full ingredients and current shelf price. For allergies or ongoing health concerns, follow veterinary advice.</p>
      <button type="button" class="buddy-secondary" onclick="buddyExit()">Browse all products</button>`;
  }
  const hasPreference=buddyState.stage && buddyPreferenceOptions(buddyState).length>1;
  const progress={pet:1,profile:2,size:3,preference:buddyState.pet==='dog'?4:3,
    results:buddyState.pet==='dog'?(hasPreference?5:4):(hasPreference?4:3)};
  const total=buddyState.pet==='dog'?(hasPreference?5:4):(hasPreference?4:3);
  const progressLabel=step==='pet'?'Start':step==='profile'?'Step 2':`Step ${progress[step]} of ${total}`;
  container.innerHTML=`<div class="buddy-topline"><button type="button" class="buddy-back" onclick="buddyBack()">← ${step==='pet'?'Products':'Back'}</button><span>${progressLabel}</span></div>
    <h2 id="buddyHeading" tabindex="-1">${heading}</h2>${body}
    ${step!=='results'?'<p class="buddy-caution">This guide uses product and life-stage information. It does not assess allergies or medical conditions.</p>':''}`;
  document.getElementById('buddyHeading').focus({preventScroll:true});
  document.getElementById('s-buddy').scrollTo(0,0);
}

function openBuddyProduct(productId,sourceId){
  const product=PRODUCTS.find(item=>item.id===productId);
  if(!product || product.catalog_error) return;
  if(sourceId){
    const index=product.scraped_skus.findIndex(sku=>sku.product_id===sourceId);
    if(index>=0) selectedSkuByProduct[productId]=index;
  }
  resetFilters();
  jumpToProduct(productId);
}
