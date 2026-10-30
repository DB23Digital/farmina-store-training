// Existing formula constants are retained. Supplied-table results have a separate,
// exact lookup contract and never fall back to a formula on a missing table cell.
// Puppy guides: grams per day by age and projected adult weight.
// Adult and cat guides: a min-max gram range by current weight.
// size is the breed size the guide covers; source is the supplied PDF or image.
const GUIDE_LINKS = [
  {id:'ancestral-puppy-mini',productId:'P0009',size:'mini',kind:'puppy',label:'Ancestral Grain Chicken & Pomegranate Puppy — Mini',source:'assets/feeding-guides/nd-ancestral-grain-canine-chicken-puppy-mini.pdf'},
  {id:'ancestral-puppy-medium-maxi',productId:'P0010',size:'medium_maxi',kind:'puppy',label:'Ancestral Chicken & Pomegranate — Medium/Maxi puppy',source:'assets/feeding-guides/nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf'},
  {id:'ancestral-adult-mini',productId:'P0011',size:'mini',kind:'adult',label:'Ancestral Grain Chicken & Pomegranate Adult — Mini',source:'assets/feeding-guides/nd-ancestral-grain-canine-chicken-adult-mini.pdf'},
  {id:'ancestral-adult-medium-maxi',productId:'P0012',size:'medium_maxi',kind:'adult',label:'Ancestral Grain Chicken & Pomegranate Adult — Medium & Maxi',source:'assets/feeding-guides/nd-ancestral-grain-canine-chicken-adult-medium-maxi.pdf'},
  {id:'ancestral-light-medium-maxi',productId:'P0014',size:'medium_maxi',kind:'adult',label:'Ancestral Grain Chicken & Pomegranate Light — Medium & Maxi',source:'assets/feeding-guides/nd-ancestral-grain-canine-chicken-light-medium-maxi.pdf'},
  {id:'ocean-adult-mini',productId:'P0015',size:'mini',kind:'adult',label:'Ocean Cod, Pumpkin & Orange Adult — Mini',source:'assets/feeding-guides/nd-ocean-canine-cod-pumpkin-orange-adult-mini.pdf'},
  {id:'ocean-adult-medium-maxi',productId:'P0016',size:'medium_maxi',kind:'adult',label:'Ocean Cod, Pumpkin & Orange Adult — Medium & Maxi',source:'assets/feeding-guides/nd-ocean-canine-cod-pumpkin-orange-adult-medium-maxi.pdf'},
  {id:'prime-puppy-mini',productId:'P0019',size:'mini',kind:'puppy',label:'Prime Chicken & Pomegranate Puppy — Mini',source:'assets/feeding-guides/nd-prime-canine-1- chicken-puppy-mini.pdf'},
  {id:'prime-puppy-maxi',productId:'P0020',size:'maxi',kind:'puppy',label:'Prime Chicken & Pomegranate — Maxi puppy',source:'assets/feeding-guides/nd-grain-free-canine-2-chicken-puppy-maxi.pdf'},
  {id:'prime-adult-mini',productId:'P0021',size:'mini',kind:'adult',label:'Prime Chicken & Pomegranate Adult — Mini',source:'assets/feeding-guides/nd-grain-free-canine-3-chicken-mini.pdf'},
  {id:'prime-adult-medium-maxi',productId:'P0022',size:'medium_maxi',kind:'adult',label:'Prime Chicken & Pomegranate Adult — Medium & Maxi',source:'assets/feeding-guides/nd-grain-free-canine-4-chicken-medium-maxi.pdf'},
  {id:'pumpkin-chicken-adult-mini',productId:'P0027',size:'mini',kind:'adult',label:'Pumpkin Chicken & Pomegranate Adult — Mini',source:'assets/feeding-guides/nd-pumpkin-canine-3-chicken-mini.pdf'},
  {id:'pumpkin-chicken-adult-medium-maxi',productId:'P0027',size:'medium_maxi',kind:'adult',label:'Pumpkin Chicken & Pomegranate Adult — Medium & Maxi',source:'assets/feeding-guides/nd-pumpkin-canine-4-cicken-medium-maxi.pdf'},
  {id:'pumpkin-boar-adult-mini',productId:'P0029',size:'mini',kind:'adult',label:'Pumpkin Wild Boar & Apple Adult — Mini',source:'assets/feeding-guides/nd-pumpkin-canine-5-wild.boar-mini.pdf'},
  {id:'pumpkin-boar-adult-medium-maxi',productId:'P0029',size:'medium_maxi',kind:'adult',label:'Pumpkin Wild Boar & Apple Adult — Medium & Maxi',source:'assets/feeding-guides/nd-pumpkin-canine-6-wild-boar-medium-maxi.pdf'},
  {id:'pumpkin-lamb-adult-mini',productId:'P0030',size:'mini',kind:'adult',label:'Pumpkin Lamb & Blueberry Adult — Mini',source:'assets/feeding-guides/nd-pumpkin-canine-7-lamb-mini.pdf'},
  {id:'pumpkin-lamb-adult-medium-maxi',productId:'P0030',size:'medium_maxi',kind:'adult',label:'Pumpkin Lamb & Blueberry Adult — Medium & Maxi',source:'assets/feeding-guides/nd-pumpkin-canine-8-lamb-medium-maxi.pdf'},
  {id:'pumpkin-lamb-puppy-mini',productId:'P0031',size:'mini',kind:'puppy',label:'Pumpkin Lamb & Blueberry Puppy — Mini',source:'assets/feeding-guides/nd-pumpkin-canine-1-puppy-lamb-mini.pdf'},
  {id:'pumpkin-lamb-puppy-medium-maxi',productId:'P0031',size:'medium_maxi',kind:'puppy',label:'Pumpkin Lamb & Blueberry Puppy — Medium & Maxi',source:'assets/feeding-guides/nd-pumpkin-canine-2-puppy-lamb-medium-maxi.pdf'},
  {id:'ocean-cat-herring',productId:'P0001',size:'all',kind:'adult',label:'Ocean Herring & Orange Adult Cat',source:'assets/feeding-guides/nd-ocean-feline-herring-orange.pdf'},
  {id:'prime-cat-chicken',productId:'P0003',size:'all',kind:'adult',label:'Prime Chicken & Pomegranate Adult Cat',source:'assets/feeding-guides/nd-prime-feline-2-chicken.pdf'},
  {id:'prime-cat-neutered',productId:'P0004',size:'all',kind:'adult',label:'Prime Chicken & Pomegranate Neutered Cat',source:'assets/feeding-guides/nd-prime-feline-5-chicken-neutered.pdf'},
  {id:'prime-cat-boar',productId:'P0005',size:'all',kind:'adult',label:'Prime Wild Boar & Apple Adult Cat',source:'assets/feeding-guides/nd-prime-feline-3-wild-boar.pdf'},
  {id:'prime-cat-lamb',productId:'P0006',size:'all',kind:'adult',label:'Prime Lamb & Blueberry Adult Cat',source:'assets/feeding-guides/nd-prime-feline-4-lamb.pdf'},
  {id:'ocean-puppy-mini',productId:'P0017',size:'mini',kind:'puppy',label:'Ocean Cod, Pumpkin & Cantaloupe Puppy — Mini',source:'assets/feeding-guides/nd-ocean-canine-cod-pumpkin-cantaloupe-puppy-mini.png'},
  {id:'ocean-puppy-medium-maxi',productId:'P0018',size:'medium_maxi',kind:'puppy',label:'Ocean Cod, Pumpkin & Cantaloupe Puppy — Medium & Maxi',source:'assets/feeding-guides/nd-ocean-canine-cod-pumpkin-cantaloupe-puppy-medium-maxi.png'},
  {id:'pumpkin-chicken-puppy-mini',productId:'P0028',size:'mini',kind:'puppy',label:'Pumpkin Chicken & Pomegranate Puppy — Mini',source:'assets/feeding-guides/nd-pumpkin-canine-chicken-puppy-mini.jpg'},
  {id:'pumpkin-chicken-puppy-medium-maxi',productId:'P0028',size:'medium_maxi',kind:'puppy',label:'Pumpkin Chicken & Pomegranate Puppy — Medium & Maxi',source:'assets/feeding-guides/nd-pumpkin-canine-chicken-puppy-medium-maxi.jpg'},
  {id:'quinoa-quail-medium-maxi',productId:'P0023',size:'medium_maxi',kind:'adult',label:'Quinoa Skin & Coat Quail — Medium & Maxi',source:'assets/feeding-guides/nd-quinoa-canine-quail-skin-coat-medium-maxi.png'},
  {id:'quinoa-quail-mini',productId:'P0026',size:'mini',kind:'adult',label:'Quinoa Skin & Coat Quail — Mini',source:'assets/feeding-guides/nd-quinoa-canine-quail-skin-coat-mini.jpg'},
  {id:'quinoa-duck-mini',productId:'P0025',size:'mini',kind:'adult',label:'Quinoa Skin & Coat Duck — Mini',source:'assets/feeding-guides/nd-quinoa-canine-duck-skin-coat-mini.jpg'},
  {id:'pumpkin-cat-neutered',productId:'P0007',size:'all',kind:'adult',label:'Pumpkin Lamb & Blueberry Neutered Cat',source:'assets/feeding-guides/nd-pumpkin-feline-lamb-neutered.jpg'},
  {id:'quinoa-cat-urinary',productId:'P0008',size:'all',kind:'adult',label:'Quinoa Urinary Duck Cat',source:'assets/feeding-guides/nd-quinoa-feline-duck-urinary.jpg'}
];
// Supplied guides whose table shape the calculator does not compute; linked for reading.
const GUIDE_REFERENCES = {
  P0002: {label:'Prime Chicken & Pomegranate Kitten',source:'assets/feeding-guides/nd-prime-feline-1-chicken-kitten.pdf'}
};
// Which guide sizes a chosen breed size may use.
const BREED_SIZE_GUIDES = {mini:['mini'], medium:['medium_maxi'], maxi:['medium_maxi','maxi']};
let FEEDING_GUIDES = null;
let feedingGuideStatus = 'loading';

function guidesForProduct(productId) {
  return GUIDE_LINKS.filter(link=>link.productId === productId);
}

function sourceBreedSize(productId) {
  const name = FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id === productId)?.product_name || '';
  if (/\bMINI\b/i.test(name)) return 'mini';
  if (/\bMEDIUM\s*&\s*MAXI\b/i.test(name)) return 'medium_maxi';
  return null;
}

// A breed size must be chosen when the record spans sizes or the guide covers fewer sizes than the record.
function guideNeedsBreedSize(productId) {
  const links = guidesForProduct(productId);
  if (!links.length || links.every(link=>link.size === 'all')) return false;
  return links.length > 1 || links[0].size !== sourceBreedSize(productId);
}

function selectGuideLink(productId, breedSize) {
  const links = guidesForProduct(productId);
  if (!links.length) throw Error('No supplied guide is linked to this formula.');
  if (!guideNeedsBreedSize(productId)) return links[0];
  if (!BREED_SIZE_GUIDES[breedSize]) throw Error('Choose the breed size for this supplied guide.');
  const link = links.find(l=>BREED_SIZE_GUIDES[breedSize].includes(l.size));
  if (!link) throw Error(`No supplied guide covers ${breedSize} breeds for this formula. Supplied: ${links.map(l=>l.label).join('; ')}.`);
  return link;
}

function validateFeedingGuides(data) {
  if (data?.version !== 2 || !Array.isArray(data.guides) || data.guides.length !== GUIDE_LINKS.length) throw Error('Invalid guide dataset');
  const seen = new Set();
  data.guides.forEach(guide=>{
    const link = GUIDE_LINKS.find(l=>l.id === guide.id);
    if (!link || seen.has(guide.id) || guide.product_id !== link.productId || guide.size !== link.size || guide.kind !== link.kind ||
        guide.source_file !== link.source || guide.label !== link.label || !guide.rows?.length) throw Error('Guide identity mismatch');
    seen.add(guide.id);
    const cells = new Set();
    guide.rows.forEach(row=>{
      const key = link.kind === 'puppy' ? row.age_months + ':' + row.mature_weight_kg : String(row.weight_kg);
      const valid = link.kind === 'puppy'
        ? Number.isFinite(row.age_months) && row.age_months > 0 && Number.isFinite(row.mature_weight_kg) && row.mature_weight_kg > 0 &&
          (row.adult_food ? row.grams_per_day === null : Number.isFinite(row.grams_per_day) && row.grams_per_day > 0)
        : Number.isFinite(row.weight_kg) && row.weight_kg > 0 && Number.isFinite(row.grams_min) && row.grams_min > 0 &&
          Number.isFinite(row.grams_max) && row.grams_max >= row.grams_min;
      if (cells.has(key) || !valid) throw Error('Invalid or duplicate guide cell');
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

function getFeedingResult({mode,petType,weightKg,meValue,productId,ageMonths,matureWeightKg,breedSize,guideWeightKg}, data = FEEDING_GUIDES) {
  if (!['estimate','guide'].includes(mode)) throw Error('Choose a feeding basis.');
  const source = productId ? FARMINA_SCRAPED_PRODUCTS.find(p=>p.product_id === productId && validatedSourceIds.has(p.product_id)) : null;
  if (productId && (!source || source.species !== petType)) throw Error('Choose a valid product for this pet type.');
  if (mode === 'guide') {
    const link = selectGuideLink(productId, breedSize);
    if (!data) throw Error('The guide is not available. Try again when it has loaded.');
    const guide = data.guides.find(g=>g.id === link.id && g.product_id === productId);
    const base = {source:'guide',kind:link.kind,label:link.label,sourceFile:link.source};
    if (link.kind === 'adult') {
      const rows = guide?.rows.filter(row=>row.weight_kg === guideWeightKg) || [];
      if (rows.length !== 1) throw Error('Choose a weight listed in the supplied guide.');
      return {...base,gramsMin:rows[0].grams_min,gramsMax:rows[0].grams_max,weightKg:guideWeightKg};
    }
    const rows = guide?.rows.filter(row=>row.age_months === ageMonths && row.mature_weight_kg === matureWeightKg) || [];
    if (rows.length !== 1) throw Error('Choose an age and expected adult weight listed in the supplied guide.');
    if (rows[0].adult_food) throw Error('This table cell specifies adult food. Use the appropriate adult product guide.');
    return {...base,grams:rows[0].grams_per_day,ageMonths,matureWeightKg};
  }
  const stage = productId && Object.values(CATALOG_LINKS).find(link=>link.ids.includes(productId))?.stage;
  if (['puppy','kitten'].includes(stage)) throw Error('Adult formula estimates are not provided for puppy or kitten products. Use the product’s feeding guide.');
  const grams = calcPortion(petType,weightKg,meValue);
  if (!Number.isFinite(grams) || grams <= 0) throw Error('These inputs do not produce a valid portion. Check the weight and energy values.');
  return {grams,source:'estimate',label:'Adult formula estimate'};
}
