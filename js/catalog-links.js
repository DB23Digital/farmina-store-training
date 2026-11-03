// Explicit links to the existing source snapshot. No names are scored at runtime.
const CATALOG_LINKS = {
  'dp1-mm': { ids:['P0020'], pet:'dog', stage:'puppy', line:'prime' },
  'dp1-mini': { ids:['P0019'], pet:'dog', stage:'puppy', line:'prime' },
  'dp2-mm': { ids:['P0022'], pet:'dog', stage:'adult', line:'prime' },
  'dp2-mini': { ids:['P0021'], pet:'dog', stage:'adult', line:'prime' },
  'do1-mm': { ids:['P0018'], pet:'dog', stage:'puppy', line:'ocean' },
  'do1-mini': { ids:['P0017'], pet:'dog', stage:'puppy', line:'ocean' },
  'do2-mm': { ids:['P0016'], pet:'dog', stage:'adult', line:'ocean' },
  'do2-mini': { ids:['P0015'], pet:'dog', stage:'adult', line:'ocean' },
  'dp3-mm': { ids:['P0031'], grams:[12000], pet:'dog', stage:'puppy', line:'pumpkin' },
  'dp3-mini': { ids:['P0031'], grams:[800,2500,7000], pet:'dog', stage:'puppy', line:'pumpkin' },
  'dp4-mm': { ids:['P0028'], grams:[12000], pet:'dog', stage:'puppy', line:'pumpkin' },
  'dp4-mini': { ids:['P0028'], grams:[800,2500,7000], pet:'dog', stage:'puppy', line:'pumpkin' },
  'dp5-mm': { ids:['P0027'], grams:[12000], pet:'dog', stage:'adult', line:'pumpkin' },
  'dp5-mini': { ids:['P0027'], grams:[800,2500,7000], pet:'dog', stage:'adult', line:'pumpkin' },
  'dp6-mm': { ids:['P0030'], grams:[12000], pet:'dog', stage:'adult', line:'pumpkin' },
  'dp6-mini': { ids:['P0030'], grams:[800,2500,7000], pet:'dog', stage:'adult', line:'pumpkin' },
  'dp7-mm': { ids:['P0029'], grams:[12000], pet:'dog', stage:'adult', line:'pumpkin' },
  'dp7-mini': { ids:['P0029'], grams:[800,2500,7000], pet:'dog', stage:'adult', line:'pumpkin' },
  'dl1-mm': { ids:['P0010'], pet:'dog', stage:'puppy', line:'lag' },
  'dl1-mini': { ids:['P0009'], pet:'dog', stage:'puppy', line:'lag' },
  'dl2-mm': { ids:['P0012'], pet:'dog', stage:'adult', line:'lag' },
  'dl2-mini': { ids:['P0011'], pet:'dog', stage:'adult', line:'lag' },
  'dl3-mm': { ids:['P0014'], pet:'dog', stage:'light', line:'lag' },
  'dl3-mini': { ids:['P0013'], pet:'dog', stage:'light', line:'lag' },
  'dq1-mm': { ids:['P0023'], pet:'dog', stage:'adult', line:'quinoa' },
  'dq1-mini': { ids:['P0026'], pet:'dog', stage:'adult', line:'quinoa' },
  'dq2-mm': { ids:['P0024'], pet:'dog', stage:'adult', line:'quinoa' },
  'dq2-mini': { ids:['P0025'], pet:'dog', stage:'adult', line:'quinoa' },
  cp1: { ids:['P0002'], pet:'cat', stage:'kitten', line:'prime' },
  cp2: { ids:['P0003'], pet:'cat', stage:'adult', line:'prime' },
  cp3: { ids:['P0006'], pet:'cat', stage:'adult', line:'prime' },
  cp4: { ids:['P0005'], pet:'cat', stage:'adult', line:'prime' },
  cp6: { ids:['P0004'], pet:'cat', stage:'neutered', line:'prime' },
  co1: { ids:['P0001'], pet:'cat', stage:'adult', line:'ocean' },
  cp5: { ids:['P0007'], pet:'cat', stage:'neutered', line:'pumpkin' },
  cq1: { ids:['P0008'], pet:'cat', stage:'adult', line:'quinoa' }
};

let catalogIssues = [];
let validatedSourceIds = new Set();

function resolveCatalogProduct(product, sources) {
  const link = CATALOG_LINKS[product.id];
  if (!link || ['pet','stage','line'].some(key => product[key] !== link[key])) throw Error('Display identity mismatch');
  const records = link.ids.map(id => {
    const matches = sources.filter(p => p.product_id === id);
    const expected = SOURCE_PRODUCT_IDENTITIES[id];
    if (matches.length !== 1 || !expected) throw Error('Missing or duplicate source identity: ' + id);
    const source = matches[0];
    if (source.product_name !== expected.name || source.species !== expected.species ||
        source.line !== expected.line || source.product_url !== expected.url || source.species !== product.pet) {
      throw Error('Source identity changed: ' + id);
    }
    return source;
  });
  const byWeight = new Map();
  const skuIds = new Set();
  records.forEach(record => {
    if (!record.skus?.length) throw Error('Missing SKU data: ' + record.product_id);
    record.skus.forEach(sku => {
      const declaredGrams = Number(sku.pack_size_value) * (sku.pack_size_unit === 'kg' ? 1000 : sku.pack_size_unit === 'g' ? 1 : NaN);
      if (sku.product_id !== record.product_id || !sku.sku_id || skuIds.has(sku.sku_id) ||
          !Number.isFinite(sku.pack_size_grams) || sku.pack_size_grams <= 0 ||
          declaredGrams !== sku.pack_size_grams ||
          !Number.isFinite(sku.price_current) || sku.price_current <= 0 || sku.currency !== 'ZAR') {
        throw Error('Invalid SKU: ' + (sku.sku_id || record.product_id));
      }
      skuIds.add(sku.sku_id);
      const duplicate = byWeight.get(sku.pack_size_grams);
      if (duplicate && duplicate.price_current !== sku.price_current) throw Error('Conflicting prices at ' + sku.pack_size_grams + 'g');
      if (!duplicate) byWeight.set(sku.pack_size_grams, sku);
    });
  });
  const skus = [...byWeight.values()].filter(sku => !link.grams || link.grams.includes(sku.pack_size_grams));
  if (!skus.length) throw Error('No packs for this kibble size');
  return { records, skus:skus.sort((a,b) => a.pack_size_grams - b.pack_size_grams) };
}

// Canonical fields copied from the reviewed source records on 2026-10-26.
const SOURCE_PRODUCT_IDENTITIES = {
  "P0001": {
    "name": "HERRING & ORANGE ADULT",
    "species": "cat",
    "line": "N&D Ocean",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-ocean-feline/494-herring-&-orange-adult.html"
  },
  "P0002": {
    "name": "CHICKEN & POMEGRANATE KITTEN",
    "species": "cat",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-prime-grain-free-feline/144-chicken-&-pomegranate-kitten.html"
  },
  "P0003": {
    "name": "CHICKEN & POMEGRANATE ADULT",
    "species": "cat",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-prime-grain-free-feline/145-chicken-&-pomegranate-adult.html"
  },
  "P0004": {
    "name": "CHICKEN & POMEGRANATE NEUTERED",
    "species": "cat",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-prime-grain-free-feline/146-chicken-&-pomegranate-neutered.html"
  },
  "P0005": {
    "name": "BOAR & APPLE ADULT",
    "species": "cat",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-prime-grain-free-feline/147-boar-&-apple-adult.html"
  },
  "P0006": {
    "name": "LAMB & BLUEBERRY ADULT",
    "species": "cat",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-prime-grain-free-feline/149-lamb-&-blueberry-adult.html"
  },
  "P0007": {
    "name": "NEUTERED, LAMB, PUMPKIN AND BLUEBERRY ADULT",
    "species": "cat",
    "line": "N&D Pumpkin",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-pumpkin-grain-free-feline/710-neutered,-lamb,-pumpkin-and-blueberry-adult.html"
  },
  "P0008": {
    "name": "URINARY DUCK",
    "species": "cat",
    "line": "N&D Quinoa",
    "url": "https://www.farmina.com/za/eshop/cat-food/n&d-quinoa-grain-free-feline/438-urinary-duck.html"
  },
  "P0009": {
    "name": "CHICKEN & POMEGRANATE PUPPY MINI",
    "species": "dog",
    "line": "N&D Low Ancestral Grain",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-low-ancestral-grain-canine/106-chicken-&-pomegranate-puppy-mini.html"
  },
  "P0010": {
    "name": "CHICKEN & POMEGRANATE PUPPY MEDIUM&MAXI",
    "species": "dog",
    "line": "N&D Low Ancestral Grain",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-low-ancestral-grain-canine/108-chicken-&-pomegranate-puppy-medium&maxi.html"
  },
  "P0011": {
    "name": "CHICKEN & POMEGRANATE ADULT MINI",
    "species": "dog",
    "line": "N&D Low Ancestral Grain",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-low-ancestral-grain-canine/109-chicken-&-pomegranate-adult-mini.html"
  },
  "P0012": {
    "name": "CHICKEN & POMEGRANATE ADULT MEDIUM&MAXI",
    "species": "dog",
    "line": "N&D Low Ancestral Grain",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-low-ancestral-grain-canine/111-chicken-&-pomegranate-adult-medium&maxi.html"
  },
  "P0013": {
    "name": "CHICKEN & POMEGRANATE LIGHT MINI",
    "species": "dog",
    "line": "N&D Low Ancestral Grain",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-low-ancestral-grain-canine/112-chicken-&-pomegranate-light-mini.html"
  },
  "P0014": {
    "name": "CHICKEN & POMEGRANATE LIGHT MEDIUM&MAXI",
    "species": "dog",
    "line": "N&D Low Ancestral Grain",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-low-ancestral-grain-canine/113-chicken-&-pomegranate-light-medium&maxi.html"
  },
  "P0015": {
    "name": "COD, PUMPKIN & ORANGE ADULT MINI",
    "species": "dog",
    "line": "N&D Ocean",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-ocean-canine/580-cod,-pumpkin-&-orange-adult-mini.html"
  },
  "P0016": {
    "name": "COD, PUMPKIN & ORANGE ADULT MEDIUM & MAXI",
    "species": "dog",
    "line": "N&D Ocean",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-ocean-canine/582-cod,-pumpkin-&-orange-adult-medium-&-maxi.html"
  },
  "P0017": {
    "name": "COD, PUMPKIN AND CANTALOUPE MELON PUPPY MINI",
    "species": "dog",
    "line": "N&D Ocean",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-ocean-canine/704-cod,-pumpkin-and-cantaloupe-melon-puppy-mini.html"
  },
  "P0018": {
    "name": "COD, PUMPKIN AND CANTALOUPE MELON PUPPY MEDIUM & MAXI",
    "species": "dog",
    "line": "N&D Ocean",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-ocean-canine/705-cod,-pumpkin-and-cantaloupe-melon-puppy-medium-&-maxi.html"
  },
  "P0019": {
    "name": "CHICKEN & POMEGRANATE PUPPY MINI",
    "species": "dog",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-prime-grain-free-canine/585-chicken-&-pomegranate-puppy-mini.html"
  },
  "P0020": {
    "name": "CHICKEN & POMEGRANATE PUPPY MEDIUM&MAXI",
    "species": "dog",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-prime-grain-free-canine/92-chicken-&-pomegranate-puppy-medium&maxi.html"
  },
  "P0021": {
    "name": "CHICKEN & POMEGRANATE ADULT MINI",
    "species": "dog",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-prime-grain-free-canine/93-chicken-&-pomegranate-adult-mini.html"
  },
  "P0022": {
    "name": "CHICKEN & POMEGRANATE ADULT MEDIUM&MAXI",
    "species": "dog",
    "line": "N&D Prime",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-prime-grain-free-canine/95-chicken-&-pomegranate-adult-medium&maxi.html"
  },
  "P0023": {
    "name": "SKIN & COAT QUAIL MEDIUM & MAXI",
    "species": "dog",
    "line": "N&D Quinoa",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-quinoa-grain-free-canine/1031-skin-&-coat-quail-medium-&-maxi.html"
  },
  "P0024": {
    "name": "SKIN & COAT DUCK MEDIUM & MAXI",
    "species": "dog",
    "line": "N&D Quinoa",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-quinoa-grain-free-canine/1033-skin-&-coat-duck-medium-&-maxi.html"
  },
  "P0025": {
    "name": "SKIN & COAT DUCK MINI",
    "species": "dog",
    "line": "N&D Quinoa",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-quinoa-grain-free-canine/693-skin-&-coat-duck-mini.html"
  },
  "P0026": {
    "name": "SKIN & COAT QUAIL MINI",
    "species": "dog",
    "line": "N&D Quinoa",
    "url": "https://www.farmina.com/za/eshop/dog-food/n&d-quinoa-grain-free-canine/696-skin-&-coat-quail-mini.html"
  },
  "P0027": {
    "name": "CHICKEN, PUMPKIN & POMEGRANATE ADULT",
    "species": "dog",
    "line": "N&D Pumpkin",
    "url": ""
  },
  "P0028": {
    "name": "CHICKEN, PUMPKIN & POMEGRANATE PUPPY",
    "species": "dog",
    "line": "N&D Pumpkin",
    "url": ""
  },
  "P0029": {
    "name": "WILD BOAR, PUMPKIN & APPLE ADULT",
    "species": "dog",
    "line": "N&D Pumpkin",
    "url": ""
  },
  "P0030": {
    "name": "LAMB, PUMPKIN & BLUEBERRY ADULT",
    "species": "dog",
    "line": "N&D Pumpkin",
    "url": ""
  },
  "P0031": {
    "name": "LAMB, PUMPKIN & BLUEBERRY PUPPY",
    "species": "dog",
    "line": "N&D Pumpkin",
    "url": ""
  }
};
