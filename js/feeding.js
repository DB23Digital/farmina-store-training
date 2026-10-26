// Existing formula constants are retained. Supplied-table results have a separate,
// exact lookup contract and never fall back to a formula on a missing table cell.
const GUIDE_LINKS = {
  P0020: {id:'prime-puppy-maxi',label:'Prime Chicken & Pomegranate — Maxi puppy',pdf:'assets/feeding-guides/nd-grain-free-canine-2-chicken-puppy-maxi.pdf'},
  P0010: {id:'ancestral-puppy-medium-maxi',label:'Ancestral Chicken & Pomegranate — Medium/Maxi puppy',pdf:'assets/feeding-guides/nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf'}
};
let FEEDING_GUIDES = null;
let feedingGuideStatus = 'loading';

function validateFeedingGuides(data) {
  if (data?.version !== 1 || !Array.isArray(data.guides) || data.guides.length !== 2) throw Error('Invalid guide dataset');
  const seen = new Set();
  data.guides.forEach(guide=>{
    const link = GUIDE_LINKS[guide.product_id];
    if (!link || seen.has(guide.product_id) || guide.id !== link.id || guide.source_pdf !== link.pdf || guide.label !== link.label || !guide.rows?.length) throw Error('Guide identity mismatch');
    seen.add(guide.product_id);
    const cells = new Set();
    guide.rows.forEach(row=>{
      const key = row.age_months + ':' + row.mature_weight_kg;
      if (cells.has(key) || !Number.isFinite(row.age_months) || row.age_months <= 0 ||
          !Number.isFinite(row.mature_weight_kg) || row.mature_weight_kg <= 0 ||
          (row.adult_food ? row.grams_per_day !== null : !Number.isFinite(row.grams_per_day) || row.grams_per_day <= 0)) throw Error('Invalid or duplicate guide cell');
      cells.add(key);
    });
  });
  return data;
}

fetch('assets/feeding-guides/feeding-guides.json')
  .then(response=>{ if(!response.ok) throw Error('Guide file unavailable'); return response.json(); })
  .then(data=>{ FEEDING_GUIDES = validateFeedingGuides(data); feedingGuideStatus = 'ready'; })
  .catch(()=>{ FEEDING_GUIDES = null; feedingGuideStatus = 'unavailable'; })
  .finally(()=>{ if(typeof updateFeedingMode === 'function') updateFeedingMode(); });

function calcPortion(petType, weightKg, meValue = 3997) {
  if (!['dog','cat'].includes(petType) || !Number.isFinite(weightKg) || weightKg <= 0) throw Error('Enter a positive pet weight.');
  if (petType === 'cat') return Math.round(16.5 * Math.pow(weightKg, 0.75));
  if (!Number.isFinite(meValue) || meValue <= 0) throw Error('Enter a positive metabolic energy value.');
  return Math.round((63.3 * Math.pow(weightKg, 0.75) / meValue) * 1000);
}

function getFeedingResult({mode,petType,weightKg,meValue,productId,ageMonths,matureWeightKg,breedSize}, data = FEEDING_GUIDES) {
  if (!['estimate','guide'].includes(mode)) throw Error('Choose a feeding basis.');
  const source = productId ? FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id === productId && validatedSourceIds.has(p.product_id)) : null;
  if (productId && (!source || source.species !== petType)) throw Error('Choose a valid product for this pet type.');
  if (mode === 'guide') {
    const link = GUIDE_LINKS[productId];
    if (!link || petType !== 'dog') throw Error('No supplied guide is linked to this formula.');
    if (productId === 'P0020' && breedSize !== 'maxi') throw Error('This supplied Prime guide is for Maxi puppies. Medium and Mini puppies need their own guide.');
    if (!data) throw Error('The guide is not available. Try again when it has loaded.');
    const guide = data.guides.find(g=>g.id === link.id && g.product_id === productId);
    const rows = guide?.rows.filter(row=>row.age_months === ageMonths && row.mature_weight_kg === matureWeightKg) || [];
    if (rows.length !== 1) throw Error('Choose an age and expected adult weight listed in the supplied guide.');
    if (rows[0].adult_food) throw Error('This table cell specifies adult food. Use the appropriate adult product guide.');
    return {grams:rows[0].grams_per_day,source:'guide',label:link.label,pdf:link.pdf,ageMonths,matureWeightKg};
  }
  const stage = productId && Object.values(CATALOG_LINKS).find(link=>link.ids.includes(productId))?.stage;
  if (['puppy','kitten'].includes(stage)) throw Error('Adult formula estimates are not provided for puppy or kitten products. Use the product’s feeding guide.');
  const grams = calcPortion(petType,weightKg,meValue);
  if (!Number.isFinite(grams) || grams <= 0) throw Error('These inputs do not produce a valid portion. Check the weight and energy values.');
  return {grams,source:'estimate',label:'Adult formula estimate'};
}
