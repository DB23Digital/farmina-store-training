function selectedGuide() {
  const id = document.getElementById('cProductSelect')?.value;
  return FEEDING_GUIDES?.guides.find(guide=>guide.product_id === id) || null;
}

function populateGuideWeights() {
  const guide = selectedGuide();
  const age = Number(document.getElementById('cAgeMonths').value);
  const select = document.getElementById('cMatureWeight');
  const previous = select.value;
  const weights = (guide?.rows || []).filter(row=>row.age_months === age && !row.adult_food).map(row=>row.mature_weight_kg);
  select.innerHTML = '<option value="">Choose weight</option>' + weights.map(weight=>`<option value="${weight}">${weight} kg</option>`).join('');
  select.value = weights.includes(Number(previous)) ? previous : '';
}

function updateFeedingMode(reset = false) {
  const select = document.getElementById('cFeedMethod');
  if(!select) return;
  const productId = document.getElementById('cProductSelect').value;
  const link = GUIDE_LINKS[productId];
  document.getElementById('cGuideOption').disabled = !link || feedingGuideStatus !== 'ready';
  if(reset) select.value = link ? 'guide' : 'estimate';
  const guideMode = select.value === 'guide';
  document.getElementById('cGuideFields').hidden = !guideMode;
  document.getElementById('cGuideBreedField').hidden = !guideMode || productId !== 'P0020';
  if(reset) document.getElementById('cGuideBreed').value = '';
  document.getElementById('cWeight').disabled = guideMode;
  document.getElementById('cMEContainer').hidden = guideMode || document.getElementById('cPetType').value === 'cat';
  document.getElementById('cGuideNote').textContent = link
    ? `${link.label}. ${feedingGuideStatus === 'ready' ? 'Choose an exact table age and expected adult weight. Adult-food cells and unlisted combinations have no puppy dosage.' : 'Supplied guide ' + feedingGuideStatus + '.'}`
    : 'No supplied table is linked to this formula. Adult estimates use the existing calculation; use the product’s own instructions for puppies and kittens.';
  if(reset || !document.getElementById('cAgeMonths').options?.length || document.getElementById('cAgeMonths').options.length === 1) {
    const guide = selectedGuide();
    const ageSelect = document.getElementById('cAgeMonths');
    const previous = reset ? '' : ageSelect.value;
    const ages = [...new Set((guide?.rows || []).map(row=>row.age_months))].sort((a,b)=>a-b);
    ageSelect.innerHTML = '<option value="">Choose age</option>' + ages.map(age=>`<option value="${age}">${age} months</option>`).join('');
    ageSelect.value = ages.includes(Number(previous)) ? previous : '';
    populateGuideWeights();
  }
}

function updateProductList() {
  const sel = document.getElementById('cProductSelect');
  const petTypeSelect = document.getElementById('cPetType');
  if (!sel || !petTypeSelect) return;

  const selectedPet = petTypeSelect.value; // 'dog' or 'cat'

  sel.innerHTML = '<option value="">Custom price or choose a product</option>';

  if (typeof FARMINA_SCRAPED_PRODUCTS === 'undefined') return;

  // Filter products by selected pet type
  FARMINA_SCRAPED_PRODUCTS.filter(p => p.species === selectedPet && validatedSourceIds.has(p.product_id)).forEach(p => {
    const opt = document.createElement('option');
    const petIcon = p.species === 'cat' ? '🐱' : '🐶';
    opt.value = p.product_id;
    opt.textContent = `${p.line} · ${p.product_name} ${petIcon}`;
    sel.appendChild(opt);
  });
}

let calculatorInitialised = false;
function initCalculator() {
  if(calculatorInitialised) return;
  calculatorInitialised = true;
  updateProductList();
  setGenericBagOptions();
  updateFeedingMode(true);
}

function onCalcPetChange() {
  updateProductList();
  onCalcProductChange();
}

function getCalcProduct() {
  const productId = document.getElementById('cProductSelect')?.value;
  if (!productId || typeof FARMINA_SCRAPED_PRODUCTS === 'undefined') return null;
  return FARMINA_SCRAPED_PRODUCTS.find(p => p.product_id === productId && validatedSourceIds.has(p.product_id)) || null;
}

function renderCalcSkuButtons(product) {
  const container = document.getElementById('cProductSkuButtons');
  if (!container) return;
  container.innerHTML = '';
  if (!product || !Array.isArray(product.skus) || !product.skus.length) return;
  product.skus.forEach(sku => {
    const button = document.createElement('button');
    const sizeLabel = sku.pack_size_unit === 'g'
      ? `${parseInt(sku.pack_size_grams)} g`
      : `${sku.pack_size_value}${sku.pack_size_unit}`;
    button.type = 'button';
    button.textContent = `${sizeLabel} · R${sku.price_current}`;
    button.style.cssText = 'padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;background:var(--surf);font-size:12px;font-weight:600;cursor:pointer;color:var(--gd);box-shadow:var(--sh)';
    button.addEventListener('click', () => {
      const bagSelect = document.getElementById('cBagSize');
      if (!bagSelect) return;
      const opt = Array.from(bagSelect.options).find(o => o.value === String(sku.pack_size_grams));
      if (opt) {
        bagSelect.value = opt.value;
        document.getElementById('cPrice').value = sku.price_current;
        calcUpdate();
      }
    });
    container.appendChild(button);
  });
}

function onCalcProductChange() {
  const product = getCalcProduct();
  const bagSelect = document.getElementById('cBagSize');
  const priceInput = document.getElementById('cPrice');
  const petTypeSelect = document.getElementById('cPetType');
  if (!bagSelect || !priceInput) return;
  if (!product) {
    setGenericBagOptions();
    renderCalcSkuButtons(null);
    priceInput.value = '';
    updateFeedingMode(true);
    calcUpdate();
    return;
  }

  if (petTypeSelect && product.species) {
    petTypeSelect.value = product.species;
  }

  bagSelect.innerHTML = '';
  product.skus.forEach(sku => {
    const opt = document.createElement('option');
    opt.value = String(sku.pack_size_grams || sku.pack_size_value || '');
    opt.dataset.price = sku.price_current || '';
    const sizeLabel = sku.pack_size_unit === 'g'
      ? `${parseInt(sku.pack_size_grams)} g`
      : `${sku.pack_size_value}${sku.pack_size_unit}`;
    opt.textContent = `${sizeLabel}${sku.price_current ? ` · R${sku.price_current}` : ''}`;
    bagSelect.appendChild(opt);
  });

  if (bagSelect.options.length) {
    bagSelect.selectedIndex = 0;
    const selected = bagSelect.selectedOptions[0];
    if (selected && selected.dataset.price) {
      priceInput.value = selected.dataset.price;
    }
  }

  renderCalcSkuButtons(product);
  updateFeedingMode(true);
  calcUpdate();
}

function onCalcBagSizeChange() {
  const bagSelect = document.getElementById('cBagSize');
  const priceInput = document.getElementById('cPrice');
  if (!bagSelect || !priceInput) return;
  const selected = bagSelect.selectedOptions[0];
  if (selected && selected.dataset.price) {
    priceInput.value = selected.dataset.price;
  }
  calcUpdate();
}

function setGenericBagOptions() {
  const bagSelect = document.getElementById('cBagSize');
  if (!bagSelect) return;
  bagSelect.innerHTML =
    '<optgroup label="Dog">' +
    '<option value="2500">2.5 kg</option>' +
    '<option value="7000" selected>7 kg</option>' +
    '<option value="10000">10 kg</option>' +
    '<option value="12000">12 kg</option>' +
    '</optgroup>' +
    '<optgroup label="Cat">' +
    '<option value="300">300 g</option>' +
    '<option value="1500">1.5 kg</option>' +
    '<option value="5000">5 kg</option>' +
    '</optgroup>';
}

window.addEventListener('load', initCalculator);

function calcBagPrice() {
  calcUpdate();
}

function calcUpdate() {
  const error = document.getElementById('calcError');
  if(error) error.hidden = true;
  const result = document.getElementById('calcResult');
  if (result) {
    result.classList.remove('show');
    result.style.display = 'none';
  }
}

function runCalc() {
  calcUpdate();
  try {
    const petType = document.getElementById('cPetType').value;
    const weight = Number(document.getElementById('cWeight').value);
    const bagSizeG = Number(document.getElementById('cBagSize').value);
    const price = Number(document.getElementById('cPrice').value);
    const meValue = Number(document.getElementById('cME').value);
    if(!Number.isFinite(price) || price <= 0 || !Number.isFinite(bagSizeG) || bagSizeG <= 0) throw Error('Enter a positive bag size and bag price.');
    const productId = document.getElementById('cProductSelect').value;
    const mode = document.getElementById('cFeedMethod').value || 'estimate';
    const feeding = getFeedingResult({mode,petType,weightKg:weight,meValue,productId,
      ageMonths:Number(document.getElementById('cAgeMonths').value),
      matureWeightKg:Number(document.getElementById('cMatureWeight').value),
      breedSize:document.getElementById('cGuideBreed').value});
    const portion = feeding.grams;
    const costPerDay = price / bagSizeG * portion;
    if(!Number.isFinite(costPerDay) || costPerDay <= 0) throw Error('These inputs do not produce a valid daily cost.');
    document.getElementById('crPortion').textContent = portion + 'g';
    document.getElementById('crCostDay').textContent = 'R' + costPerDay.toFixed(2);
    document.getElementById('crDays').textContent = Math.floor(bagSizeG / portion);
    document.getElementById('crMonth').textContent = 'R' + Math.round(costPerDay * 30.4);
    const sourceNote = feeding.source === 'guide'
      ? `Supplied guide: ${feeding.label}. Age ${feeding.ageMonths} months; expected adult weight ${feeding.matureWeightKg}kg. <a href="${feeding.pdf}" target="_blank" rel="noopener" style="color:inherit">View source PDF</a>.`
      : `Adult formula estimate for a ${weight}kg ${petType}. Confirm against the selected product’s feeding instructions.`;
    const formulaNote = feeding.source === 'estimate' && petType === 'dog'
      ? ` Existing calculation: 63.3 × ${weight}^0.75 kcal/day; ME ${meValue} kcal/kg.` : '';
    document.getElementById('crNote').innerHTML = sourceNote + formulaNote +
      `<br>${bagSizeG/1000}kg bag at R${price} = R${costPerDay.toFixed(2)}/day.<br>Prices: June 2026 snapshot; confirm current RRP.`;
    document.getElementById('calcResult').style.display = 'block';
    window.TrainingAnalytics?.track('calculator_used', {pet_type:petType, product_id:productId || 'custom'});
  } catch(error) {
    const message = document.getElementById('calcError');
    message.textContent = error.message;
    message.hidden = false;
  }
}
