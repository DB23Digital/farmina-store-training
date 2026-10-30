// The guide in use for the selected formula and breed size, or null until one is determined.
function selectedGuideLink() {
  const productId = document.getElementById('cProductSelect')?.value;
  try { return selectGuideLink(productId, document.getElementById('cGuideBreed')?.value); } catch(_) { return null; }
}

function selectedGuide() {
  const link = selectedGuideLink();
  return link && FEEDING_GUIDES?.guides.find(guide=>guide.id === link.id) || null;
}

function fillSelect(select, values, placeholder, label) {
  const previous = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>` + values.map(v=>`<option value="${v}">${label(v)}</option>`).join('');
  select.value = values.some(v=>String(v) === previous) ? previous : '';
}

// Lists the weights printed in the guide (for kittens, in the chosen age band).
function populateGuideWeightOptions() {
  const guide = selectedGuide();
  const hint = document.getElementById('cGuideWeightHint');
  if(!guide || guide.kind === 'puppy') { hint.textContent = ''; return; }
  const band = document.getElementById('cAgeBand').value;
  if(guide.kind === 'kitten' && !band) { hint.textContent = 'Choose the kitten’s age first.'; return; }
  const rows = guide.kind === 'kitten' ? guide.rows.filter(row=>row.age_band === band) : guide.rows;
  const weights = rows.map(row=>row.weight_kg).sort((a,b)=>a-b);
  hint.textContent = `Printed weights: ${weights.join(', ')} kg. Between two printed weights, both printed rows are shown.`;
}

function populateGuideWeights() {
  const guide = selectedGuide();
  const age = Number(document.getElementById('cAgeMonths').value);
  const weights = (guide?.kind === 'puppy' ? guide.rows : []).filter(row=>row.age_months === age && !row.adult_food).map(row=>row.mature_weight_kg);
  fillSelect(document.getElementById('cMatureWeight'), weights, 'Choose weight', w=>`${w} kg`);
}

// Show the fields the selected guide needs and fill them from its listed values only.
function populateGuideFields() {
  const guide = selectedGuide();
  const puppy = guide?.kind === 'puppy';
  document.getElementById('cGuideAgeField').hidden = !puppy;
  document.getElementById('cGuideMatureField').hidden = !puppy;
  document.getElementById('cGuideWeightField').hidden = !guide || puppy;
  document.getElementById('cGuideBandField').hidden = guide?.kind !== 'kitten';
  const ages = puppy ? [...new Set(guide.rows.map(row=>row.age_months))].sort((a,b)=>a-b) : [];
  fillSelect(document.getElementById('cAgeMonths'), ages, 'Choose age', a=>`${a} months`);
  populateGuideWeights();
  const bands = guide?.kind === 'kitten' ? KITTEN_BANDS.filter(b=>guide.rows.some(row=>row.age_band === b.id)).map(b=>b.id) : [];
  fillSelect(document.getElementById('cAgeBand'), bands, 'Choose age', id=>KITTEN_BANDS.find(b=>b.id === id).label);
  populateGuideWeightOptions();
}

function updateFeedingMode(reset = false) {
  const select = document.getElementById('cFeedMethod');
  if(!select) return;
  const productId = document.getElementById('cProductSelect').value;
  const links = guidesForProduct(productId);
  document.getElementById('cGuideOption').disabled = !links.length || feedingGuideStatus !== 'ready';
  // A selected Farmina product only ever uses its printed guide.
  document.getElementById('cEstimateOption').disabled = !!productId;
  if(reset || productId) select.value = productId ? 'guide' : 'estimate';
  const guideMode = select.value === 'guide';
  document.getElementById('cGuideFields').hidden = !guideMode;
  document.getElementById('cGuideBreedField').hidden = !guideMode || !guideNeedsBreedSize(productId);
  if(reset) document.getElementById('cGuideBreed').value = '';
  document.getElementById('cWeight').disabled = guideMode;
  document.getElementById('cMEContainer').hidden = guideMode || document.getElementById('cPetType').value === 'cat';
  const note = document.getElementById('cGuideNote');
  if(links.length) {
    const status = feedingGuideStatus === 'ready'
      ? (guideNeedsBreedSize(productId) ? 'Choose the breed size, then the values listed in the guide. ' : '') +
        'Only values printed in the supplied guide can be chosen; nothing is interpolated.'
      : 'Supplied guide ' + feedingGuideStatus + '.';
    note.textContent = `Supplied guide${links.length > 1 ? 's' : ''}: ${links.map(l=>l.label).join('; ')}. ${status}`;
  } else if(productId) {
    note.textContent = 'Farmina’s feeding guide for this product has not been added yet. Use the feeding guide printed on the bag.';
  } else {
    note.textContent = 'No product selected: the formula estimate is a rough guide only. Choose a product to use Farmina’s printed feeding guide.';
  }
  populateGuideFields();
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
      breedSize:document.getElementById('cGuideBreed').value,
      guideWeightKg:Number(document.getElementById('cGuideWeight').value),
      ageBand:document.getElementById('cAgeBand').value});
    // Printed rows to show: adult, cat and kitten guides give one min–max row, or the
    // two printed rows either side of the weight; puppy guides and the estimate give one amount.
    const rows = feeding.rows || [{gramsMin:feeding.grams, gramsMax:feeding.grams}];
    const span = (a, b, fmt) => a === b ? fmt(a) : `${fmt(a)}–${fmt(b)}`;
    const figures = rows.map(row=>{
      const costLow = price / bagSizeG * row.gramsMin, costHigh = price / bagSizeG * row.gramsMax;
      if(!Number.isFinite(costLow) || costLow <= 0) throw Error('These inputs do not produce a valid daily cost.');
      return {weightKg:row.weightKg,
        portion:span(row.gramsMin, row.gramsMax, g=>g + 'g'),
        costDay:span(costLow, costHigh, c=>'R' + c.toFixed(2)),
        days:span(Math.floor(bagSizeG / row.gramsMax), Math.floor(bagSizeG / row.gramsMin), d=>d),
        month:span(Math.round(costLow * 30.4), Math.round(costHigh * 30.4), m=>'R' + m)};
    });
    for(const [id, key] of [['crPortion','portion'],['crCostDay','costDay'],['crDays','days'],['crMonth','month']]) {
      const tile = document.getElementById(id);
      if(figures.length === 1) tile.textContent = figures[0][key];
      else tile.innerHTML = `<div class="cr-rows">${figures.map(f=>`${f[key]}<span>at ${f.weightKg} kg</span>`).join('')}</div>`;
    }
    const guideLink = `<a href="${feeding.sourceFile}" target="_blank" rel="noopener" style="color:inherit">View supplied guide</a>`;
    const rowNote = rows.length === 2
      ? `${feeding.weightKg}kg is between the printed ${rows[0].weightKg}kg and ${rows[1].weightKg}kg rows; both are shown and nothing is calculated between them.`
      : `Printed min–max for ${feeding.weightKg}kg.`;
    const sourceNote = feeding.source !== 'guide'
      ? `Formula estimate for a ${weight}kg ${petType} on a custom bag. Confirm against the product’s feeding guide.`
      : feeding.kind === 'kitten'
        ? `Supplied guide: ${feeding.label}, ${feeding.ageBand}. ${rowNote} ${guideLink}.`
      : feeding.kind === 'adult'
        ? `Supplied guide: ${feeding.label}. ${rowNote} ${guideLink}.`
        : `Supplied guide: ${feeding.label}. Age ${feeding.ageMonths} months; expected adult weight ${feeding.matureWeightKg}kg. ${guideLink}.`;
    const formulaNote = feeding.source === 'estimate' && petType === 'dog'
      ? ` Existing calculation: 63.3 × ${weight}^0.75 kcal/day; ME ${meValue} kcal/kg.` : '';
    document.getElementById('crNote').innerHTML = sourceNote + formulaNote +
      `<br>${bagSizeG/1000}kg bag at R${price}. Prices: June 2026 RRP list; confirm the shelf price.`;
    document.getElementById('calcResult').style.display = 'block';
    window.TrainingAnalytics?.track('calculator_used', {pet_type:petType, product_id:productId || 'custom'});
  } catch(error) {
    const message = document.getElementById('calcError');
    message.textContent = error.message;
    message.hidden = false;
  }
}
