// ═══════════════════════════════════════
// APP — Navigation, Products UI, Ingredients UI, Init
// Depends on: products.js, ingredients.js, quiz.js, tips.js, calculator.js
// ═══════════════════════════════════════

// ── Shared filter state ──
let filters = {pet:'all',stage:'all',line:'all',kibble:'all'};
let ingFilter = 'all';
let ingMode = 'type';   // 'type' | 'condition'
let condFilter = 'all';
let selectedSkuByProduct = {};

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function showScreen(name, btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+name).classList.add('active');
  if(btn) btn.classList.add('active');
  window.scrollTo?.(0,0);
  window.TrainingAnalytics?.screen(name);
  
  // Initialize screen-specific logic
  if(name === 'matcher') initMatcher();
  if(name === 'calc') initCalculator();
  if(name === 'search'){
    const input = document.getElementById('screenSearchInput');
    if(input) input.focus();
  }
}

// ═══════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════
function setF(type,val,el){
  filters[type]=val;
  el.closest('.cr').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  syncFilterChips();
  renderProducts();
}

// Pet narrows Life Stage, and Pet plus Life Stage narrow Line, using the catalogue
// itself, so every chip on show leads to at least one product.
function syncFilterChips(){
  const inPet=PRODUCTS.filter(p=>filters.pet==='all'||p.pet===filters.pet);
  syncChipRow('fstage','stage',inPet.map(p=>p.stage));
  const inStage=inPet.filter(p=>filters.stage==='all'||p.stage===filters.stage);
  syncChipRow('fline','line',inStage.map(p=>p.line));
  syncChipRow('fkibble','kibble',inPet.map(kibbleKey));
}

function kibbleKey(product){
  return product.kibble==='Mini'?'mini':product.kibble?'mm':null;
}

// Hides unavailable chips. A selection that just became unavailable falls back to "All".
function syncChipRow(group,type,available){
  const chips=document.querySelectorAll(`#${group} .chip`);
  chips.forEach(chip=>{chip.hidden=chip.dataset.value!=='all'&&!available.includes(chip.dataset.value);});
  if(filters[type]!=='all'&&!available.includes(filters[type])){
    filters[type]='all';
    chips.forEach(chip=>chip.classList.toggle('active',chip.dataset.value==='all'));
  }
}

// Clears every product filter and the search box. The pet row has no "All" chip,
// so no pet chip stays active; the other rows return to their "All" chip.
function resetFilters(){
  filters={pet:'all',stage:'all',line:'all',kibble:'all'};
  document.getElementById('psearch').value='';
  for(const group of ['fpet','fstage','fline','fkibble']){
    const chips=document.querySelectorAll(`#${group} .chip`);
    chips.forEach(chip=>chip.classList.remove('active'));
    if(group!=='fpet') chips[0]?.classList.add('active');
  }
  syncFilterChips();
  renderProducts();
}

function renderProducts(){
  const q = document.getElementById('psearch').value.toLowerCase();
  const grid = document.getElementById('pgrid');
  let list = PRODUCTS.filter(p=>{
    // Strict pet filter
    if(filters.pet!=='all' && p.pet!==filters.pet) return false;
    // Strict stage filter
    if(filters.stage!=='all' && p.stage!==filters.stage) return false;
    // Strict line filter (no fuzzy matches)
    if(filters.line!=='all' && p.line!==filters.line) return false;
    if(filters.kibble!=='all' && kibbleKey(p)!==filters.kibble) return false;
    // Search only in name, variant, protein, composition
    if(q && !p.name.toLowerCase().includes(q) && !p.variant.toLowerCase().includes(q) &&
       !p.protein.toLowerCase().includes(q) && !p.composition.toLowerCase().includes(q)) return false;
    return true;
  });

  if(!list.length){
    grid.innerHTML='<div class="es"><div>🔍</div><p>No products match your filters</p></div>';
    return;
  }

  // Group by line for banners
  const linesSeen = new Set();
  let html = '';
  list.forEach(p=>{
    if(!linesSeen.has(p.line)){
      linesSeen.add(p.line);
      const lc = p.line==='quinoa'?'quinoa':p.line==='pumpkin'?'pumpkin':p.line==='ocean'?'ocean':p.line==='prime'?'prime':'lag';
      const lsub = p.line==='quinoa'?'Grain-Free · High Fresh Meat · No Legumes':
                   p.line==='pumpkin'?'Grain-Free · With Pumpkin · Wild Proteins':
                   p.line==='ocean'?'Grain-Free · Wild Caught Fish · High Omega-3':
                   p.line==='prime'?'Grain-Free · High Animal Protein · No Legumes':
                   'Organic Spelt & Oats · Premium Ancient Grains';
      const licon = p.line==='quinoa'?'🌿':p.line==='pumpkin'?'🎃':p.line==='ocean'?'🌊':p.line==='prime'?'⭐':'🌾';
      html += `<div class="line-banner lb-${lc}"><div class="lb-icon">${licon}</div><div class="lb-text"><h3>${p.lineName}</h3><p>${lsub}</p></div></div>`;
    }
    const lb = p.line==='quinoa'?'bq':p.line==='pumpkin'?'bp':p.line==='ocean'?'bo':p.line==='prime'?'bpr':'bl';
    const lbn = p.line==='quinoa'?'N&D Quinoa':p.line==='pumpkin'?'N&D Pumpkin':p.line==='ocean'?'N&D Ocean':p.line==='prime'?'N&D Prime':'Low Grain';
    const pet = p.pet==='dog'?'🐶 Dog':'🐱 Cat';
    const stageLabel = p.stage.charAt(0).toUpperCase()+p.stage.slice(1);
    const sizesHtml = p.sizes.map(s=>`<span class="st">${s}</span>`).join('');
    const hlHtml = p.highlights.map(h=>`<span class="ht">${h}</span>`).join('');
    const skuOptionsHtml = renderSkuOptions(p);
    const selectedSku = getSelectedSku(p);
    const shot = getProductShot(p, selectedSku);
    const selectedPriceLabel = selectedSku ? `R${selectedSku.price_current.toFixed(0)}` : (p.scraped_price_label || '');
    const selectedSizeLabel = selectedSku ? (selectedSku.pack_size_unit==='g' ? `${parseInt(selectedSku.pack_size_grams)} g` : `${selectedSku.pack_size_value}${selectedSku.pack_size_unit}`) : '';
    const priceHtml = selectedSku ?
      `<div class="price-summary" id="price-${p.id}">${selectedPriceLabel}</div>` +
      `<div class="price-summary-size" id="size-${p.id}">${selectedSizeLabel}</div>${skuOptionsHtml}` :
      (p.catalog_error ? '<div class="price-summary">Pricing unavailable — catalogue needs review</div>' :
        (p.scraped_price_label ? `<div class="price-summary">${p.scraped_price_label}</div>` : ''));
    html += `
<div class="pc" id="pc-${p.id}">
  <div class="ch" role="button" tabindex="0" onclick="toggleCard('${p.id}')">
    ${shot ? `<img class="product-shot" id="shot-${p.id}" src="${shot.src}" alt="${shot.alt}" width="52" height="78" loading="lazy" decoding="async">` : `<div class="ci">${p.icon}</div>`}
    <div class="cm">
      <div class="cb">
        <span class="badge ${lb}">${lbn}</span>
        <span class="badge ${p.pet==='dog'?'bdog':'bcat'}">${pet}</span>
        <span class="badge bstage">${stageLabel}</span>
        ${p.kibble?`<span class="badge bstage">${p.kibble}</span>`:''}
      </div>
      <div class="cn">${p.name}</div>
      <div class="cs">${p.variant} · ${p.protein}</div>
      ${priceHtml}
    </div>
    <svg class="cchev" id="chev-${p.id}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="18" height="18"><path d="M6 9l6 6 6-6"/></svg>
  </div>
  <div class="spr">
    <div class="sp"><div class="val">${p.macros.meat}</div><div class="lbl">Meat & Fats</div></div>
    <div class="sp"><div class="val">${p.macros.grains}</div><div class="lbl">Grains</div></div>
    <div class="sp"><div class="val">${p.nutrition.fat}%</div><div class="lbl">Crude Fat</div></div>
    <div class="sp"><div class="val">${p.nutrition.fibre}%</div><div class="lbl">Crude Fibre</div></div>
  </div>
  <div class="pinfo">
    <div class="pinfo-row">
      <span class="pi-label">Crude Protein</span>
      <div class="pi-track"><div class="pi-fill-p" style="width:${Math.min(p.nutrition.protein/50*100,100)}%"></div></div>
      <span class="pi-val">${p.nutrition.protein}${p.nutrition.estimated?'*':''}%</span>
    </div>
    <div class="pinfo-row">
      <span class="pi-label">From Animal</span>
      <div class="pi-track"><div class="pi-fill-a" style="width:${p.nutrition.proteinAnimal}%"></div></div>
      <span class="pi-val">${p.nutrition.proteinAnimal}${p.nutrition.estimated?'*':''}%</span>
    </div>
    <div class="pinfo-note">${p.nutrition.proteinAnimal}% of the protein is from animal sources${p.nutrition.estimated?' · * estimated — confirm from packaging':''}</div>
  </div>
  <div class="cd" id="cd-${p.id}">
    <div class="ds"><h4>🏷️ Key Selling Point</h4><p>${p.sell}</p></div>
    <div class="ds"><h4>✅ Product Claims</h4><div class="hl">${hlHtml}</div></div>
    <div class="ds"><h4>📦 Available Sizes</h4><div class="sl">${sizesHtml}</div></div>
    <div class="ds"><h4>🐾 Suitable For</h4><p>${p.suitable}</p></div>
    <div class="ds"><h4>📋 Full Composition</h4><p style="font-size:12px;color:var(--muted)">${p.composition}</p></div>
    <div class="ds"><h4>🔬 Analytical Constituents</h4><p style="font-size:12px;color:var(--muted)">${p.analysis}</p></div>
    <div class="ds"><h4>⚡ Energy & Registration</h4><p style="font-size:12px;color:var(--muted)">${p.energy} kcal/kg · ${p.registration}</p></div>
  </div>
</div>`;
  });
  grid.innerHTML = html;
}

function toggleCard(id){
  const cd = document.getElementById('cd-'+id);
  const chev = document.getElementById('chev-'+id);
  const open = cd.classList.toggle('open');
  chev.classList.toggle('open',open);
  if(open){
    const product = PRODUCTS.find(p=>p.id===id);
    if(product) window.TrainingAnalytics?.track('product_view', {product_id:id, product_line:product.line, pet_type:product.pet});
  }
}

function getSelectedSku(product){
  if(!product.scraped_skus || !product.scraped_skus.length) return null;
  const selectedIndex = Number.isFinite(selectedSkuByProduct[product.id]) ? selectedSkuByProduct[product.id] : 0;
  return product.scraped_skus[selectedIndex] || product.scraped_skus[0];
}

function getProductShot(product, sku){
  const image = sku && PRODUCT_SHOTS[sku.product_id];
  if(!image) return null;
  return {
    src: image.large && sku.pack_size_grams >= 12000 ? image.large : image.standard,
    alt: `${product.lineName} ${product.name} ${product.variant} product pack`
  };
}

function renderSkuOptions(product){
  if(!product.scraped_skus || !product.scraped_skus.length) return '';
  const selectedIndex = Number.isFinite(selectedSkuByProduct[product.id]) ? selectedSkuByProduct[product.id] : 0;
  const buttons = product.scraped_skus.map((sku, index)=>{
    const label = sku.pack_size_unit==='g' ? `${parseInt(sku.pack_size_grams)} g` : `${sku.pack_size_value}${sku.pack_size_unit}`;
    const priceLabel = sku.price_current ? `R${sku.price_current.toFixed(0)}` : 'N/A';
    return `<button type="button" class="sku-chip${index===selectedIndex?' active':''}" onclick="event.stopPropagation();setProductSku('${product.id}', ${index})" data-product="${product.id}" data-index="${index}">${label} · ${priceLabel}</button>`;
  }).join('');
  return `<div class="sku-options" style="display:flex;flex-wrap:wrap;align-items:flex-start;margin-top:8px">${buttons}</div>`;
}

function setProductSku(productId, selectedIndex){
  selectedSkuByProduct[productId] = selectedIndex;
  const buttons = document.querySelectorAll(`button.sku-chip[data-product="${productId}"]`);
  buttons.forEach(btn => {
    const idx = Number(btn.dataset.index);
    const active = idx === selectedIndex;
    btn.classList.toggle('active', active);
    btn.style.background = active ? 'var(--gd)' : 'var(--surf)';
    btn.style.color = active ? '#fff' : 'var(--text)';
  });
  const product = PRODUCTS.find(p=>p.id===productId);
  if(!product) return;
  const sku = product.scraped_skus?.[selectedIndex];
  const priceText = document.getElementById(`price-${productId}`);
  const sizeText = document.getElementById(`size-${productId}`);
  const shot = document.getElementById(`shot-${productId}`);
  if(shot){
    const nextShot = getProductShot(product, sku);
    if(nextShot){ shot.src = nextShot.src; shot.alt = nextShot.alt; }
  }
  if(priceText){
    priceText.textContent = sku ? `R${sku.price_current.toFixed(0)}` : '';
  }
  if(sizeText){
    sizeText.textContent = sku ? (sku.pack_size_unit==='g' ? `${parseInt(sku.pack_size_grams)} g` : `${sku.pack_size_value}${sku.pack_size_unit}`) : '';
  }
}

// ═══════════════════════════════════════
// INGREDIENTS
// ═══════════════════════════════════════
function setIF(val,el){
  ingFilter=val;
  document.getElementById('ifilter').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  renderIngredients();
}

function setIngMode(mode){
  ingMode=mode;
  document.getElementById('imodetoggle').querySelectorAll('button').forEach((b,i)=>{
    b.classList.toggle('active',(i===0&&mode==='type')||(i===1&&mode==='condition'));
  });
  const tf=document.getElementById('ifilter');
  const cf=document.getElementById('icondfilter');
  tf.style.display=mode==='type'?'':'none';
  cf.classList.toggle('active',mode==='condition');
  condFilter='all';
  cf.querySelectorAll('.condchip').forEach(c=>c.classList.remove('active'));
  document.getElementById('condpanel').className='';
  renderIngredients();
}

function setIC(val,el){
  condFilter=val;
  document.getElementById('icondfilter').querySelectorAll('.condchip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  renderIngredients();
}

function renderIngredients(){
  const q=document.getElementById('isearch').value.toLowerCase();
  const grid=document.getElementById('igrid');
  let list=INGREDIENTS.filter(i=>{
    if(ingMode==='type'){
      if(ingFilter!=='all'&&i.cat!==ingFilter) return false;
    } else {
      if(condFilter!=='all'&&!(i.conditions||[]).includes(condFilter)) return false;
    }
    if(q&&!i.name.toLowerCase().includes(q)&&!i.catLabel.toLowerCase().includes(q)) return false;
    return true;
  });
  if(!list.length){
    grid.innerHTML='<div class="es" style="grid-column:1/-1"><div>🔍</div><p>No ingredients found</p></div>';
    renderConditionPanel();
    return;
  }
  grid.innerHTML=list.map(i=>`
<div class="ingcard" role="button" tabindex="0" onclick="openIng('${i.id}')">
  <div class="ii">${i.icon}</div>
  <div class="in">${i.name}</div>
  <div class="ic">${i.catLabel}</div>
</div>`).join('');
  renderConditionPanel();
}

function renderConditionPanel(){
  const panel=document.getElementById('condpanel');
  if(ingMode!=='condition'||condFilter==='all'){panel.className='';panel.innerHTML='';return;}
  const cond=BODY_CONDITIONS.find(c=>c.id===condFilter);
  if(!cond){panel.className='';panel.innerHTML='';return;}
  const rule=CONDITION_MATCHER_RULES[condFilter];
  const prods=rule?conditionPanelProducts(rule):[];
  const pillsHtml=prods.map(p=>{
    const badge=p.line==='quinoa'?'bq':p.line==='pumpkin'?'bp':p.line==='ocean'?'bo':p.line==='prime'?'bpr':'bl';
    const lname=p.line==='quinoa'?'Quinoa':p.line==='pumpkin'?'Pumpkin':p.line==='ocean'?'Ocean':p.line==='prime'?'Prime':'Low Grain';
    const pet=p.pet==='dog'?'🐶':'🐱';
    return `<button class="cpill" onclick="jumpToProduct('${p.id}')">\
<span class="cpill-badge ${badge}">${lname}</span>${pet} ${p.name}</button>`;
  }).join('');
  panel.innerHTML=`
<div class="cpanel-hdr"><h4>${cond.icon} ${cond.label}</h4><p>${cond.blurb}</p></div>
<div class="cpanel-body">
  <div class="cpanel-label">Formulas that declare these ingredients · tap to view. Use Matcher for a pet-specific list.</div>
  <div class="cpanel-pills">${pillsHtml||'<span style="font-size:12px;color:var(--muted)">No catalogue formula declares these ingredients.</span>'}</div>
</div>`;
  panel.className='active';
}

function jumpToProduct(id){
  const btn=document.querySelector('nav button');
  showScreen('catalog',btn);
  // An active filter may be hiding the card this jump is looking for.
  if(!document.getElementById('pc-'+id)) resetFilters();
  setTimeout(()=>{
    const el=document.getElementById('pc-'+id);
    if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}
  },120);
}

function openIng(id){
  const i = INGREDIENTS.find(x=>x.id===id);
  if(!i) return;
  window.TrainingAnalytics?.track('ingredient_view', {ingredient_id:id});
  document.getElementById('mcontent').innerHTML = `
<div class="micon">${i.icon}</div>
<h3>${i.name}</h3>
<div class="mcat">${i.catLabel}</div>
${i.nutritional_role ? `<div class="msec"><h4>🧪 Nutritional Role</h4><p>${i.nutritional_role}</p></div>` : ''}
<div class="msec"><h4>📖 What it is</h4><p>${i.what}</p></div>
<div class="msec"><h4>🧬 Why it matters</h4><p>${i.why}</p></div>
${i.benefit_statement ? `<div class="msec"><h4>✨ Benefits</h4><p>${i.benefit_statement}</p></div>` : ''}
${i.scraped_conditions?.length ? `<div class="msec"><h4>🩺 Appears in conditions</h4><p>${i.scraped_conditions.join(', ')}</p></div>` : ''}
${i.scraped_lines?.length ? `<div class="msec"><h4>🧭 Appears in lines</h4><p>${i.scraped_lines.join(', ')}</p></div>` : ''}
${i.notes ? `<div class="msec"><h4>📝 Notes</h4><p>${i.notes}</p></div>` : ''}
<div class="msec"><h4>💬 How to sell it</h4><p>${i.sell}</p></div>
<button class="mclose" onclick="document.getElementById('overlay').classList.remove('open')">Close</button>`;
  document.getElementById('overlay').classList.add('open');
}

function closeModal(e){
  if(e.target===document.getElementById('overlay')) document.getElementById('overlay').classList.remove('open');
}

// ═══════════════════════════════════════
// KEYBOARD (tablet keyboards and desktop)
// ═══════════════════════════════════════
document.addEventListener?.('keydown',e=>{
  if(e.key==='Escape'){
    document.getElementById('overlay').classList.remove('open');
    closeSearchModal();
  } else if((e.key==='Enter'||e.key===' ')&&e.target.getAttribute?.('role')==='button'){
    e.preventDefault();
    e.target.click();
  }
});

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
if(typeof applyScrapedProductData === 'function') applyScrapedProductData();
renderProducts();
renderIngredients();
renderQuizLines();
renderTips();
buildSearchIndex();
