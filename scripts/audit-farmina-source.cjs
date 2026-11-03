// Read Farmina South Africa product pages used by the training catalogue.
// Produces a small, reviewable inventory; it never updates application prices.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = vm.runInNewContext(
  fs.readFileSync(path.join(root, 'js/farmina-data.js'), 'utf8') + '\nFARMINA_SCRAPED_PRODUCTS',
  {}
);
// Five Pumpkin records in the older source snapshot have blank URLs. Farmina
// serves these verified South African product IDs independent of the slug.
const pageOverrides = {
  P0027: 390, P0028: 716, P0029: 396, P0030: 392, P0031: 388
};
const largePageIds = {
  P0027: 391, P0028: 717, P0029: 397, P0030: 393, P0031: 389
};

function productFromHtml(html) {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\btype\s*=\s*["']application\/ld\+json["']/i.test(match[1])) continue;
    let parsed;
    // Farmina embeds literal line breaks inside JSON strings; normalize those
    // control characters without changing values such as prices or URLs.
    let inString = false;
    let escaped = false;
    let cleaned = '';
    for (const ch of match[2]) {
      if (inString && ch.charCodeAt(0) < 32) cleaned += ' ';
      else cleaned += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = !inString;
    }
    try { parsed = JSON.parse(cleaned); } catch { continue; }
    const entries = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
    const product = entries.find(entry => entry['@type'] === 'Product' ||
      (Array.isArray(entry['@type']) && entry['@type'].includes('Product')));
    if (product) return product;
  }
  throw Error('No Product JSON-LD');
}

async function inspect(record) {
  const sourceUrl = record.product_url ||
    `https://www.farmina.com/za/eshop/dog-food/n%26d-pumpkin-grain-free-canine/${pageOverrides[record.product_id]}-product.html`;
  const url = new URL(sourceUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'www.farmina.com' ||
      !url.pathname.startsWith('/za/eshop/')) throw Error('Unexpected source URL for ' + record.product_id);
  const response = await fetch(url, {signal: AbortSignal.timeout(20000)});
  if (!response.ok) throw Error(`${record.product_id}: HTTP ${response.status}`);
  const product = productFromHtml(await response.text());
  const image = Array.isArray(product.image) ? product.image[0] : product.image;
  if (!image || new URL(image).hostname !== 'www.farmina.com') throw Error(`${record.product_id}: missing Farmina image`);
  let largePage = null;
  if (largePageIds[record.product_id]) {
    const largeUrl = new URL(`https://www.farmina.com/za/eshop/dog-food/n%26d-pumpkin-grain-free-canine/${largePageIds[record.product_id]}-product.html`);
    const largeResponse = await fetch(largeUrl, {signal: AbortSignal.timeout(20000)});
    if (!largeResponse.ok) throw Error(`${record.product_id}: large page HTTP ${largeResponse.status}`);
    const largeProduct = productFromHtml(await largeResponse.text());
    const largeImage = Array.isArray(largeProduct.image) ? largeProduct.image[0] : largeProduct.image;
    if (!largeImage || new URL(largeImage).hostname !== 'www.farmina.com') throw Error(`${record.product_id}: missing large image`);
    largePage = {source_url: largeUrl.href, page_name: largeProduct.name,
      image_url: largeImage, offers: largeProduct.offers};
  }
  const rawOffers = [product.offers, largePage?.offers].filter(Boolean).flat();
  const offers = rawOffers
    .map(offer => ({sku: offer.sku, price: Number(offer.price), currency: offer.priceCurrency,
      gtin13: offer.gtin13 || null}));
  const comparisons = record.skus.map(sku => {
    const matching = offers.filter(offer => Number(offer.sku?.match(/-(\d+)$/)?.[1]) === sku.pack_size_grams);
    const actual = matching.length === 1 ? matching[0] : null;
    return {sku_id: sku.sku_id, grams: sku.pack_size_grams, training_price: sku.price_current,
      farmina_price: actual?.price ?? null,
      status: !actual || actual.currency !== 'ZAR' ? 'unverifiable' :
        actual.price === sku.price_current ? 'match' : 'mismatch'};
  });
  return {product_id: record.product_id, product_name: record.product_name,
    source_url: url.href, page_name: product.name, image_url: image, offers,
    large_page: largePage && {source_url: largePage.source_url, page_name: largePage.page_name,
      image_url: largePage.image_url}, comparisons,
    training_skus: record.skus.map(sku => ({sku_id: sku.sku_id, grams: sku.pack_size_grams,
      price: sku.price_current}))};
}

(async () => {
  const records = [];
  const errors = [];
  let next = 0;
  await Promise.all(Array.from({length: 5}, async () => {
    while (next < source.length) {
      const record = source[next++];
      try { records.push(await inspect(record)); }
      catch (error) { errors.push({product_id: record.product_id, error: error.message}); }
    }
  }));
  records.sort((a, b) => a.product_id.localeCompare(b.product_id));
  const output = {checked_at: new Date().toISOString(), records, errors};
  const target = process.argv[2];
  if (target) fs.writeFileSync(target, JSON.stringify(output, null, 2) + '\n');
  const comparisons = records.flatMap(record => record.comparisons);
  console.log(JSON.stringify({records: records.length, prices: {
    match: comparisons.filter(row => row.status === 'match').length,
    mismatch: comparisons.filter(row => row.status === 'mismatch').length,
    unverifiable: comparisons.filter(row => row.status === 'unverifiable').length},
    exceptions: records.flatMap(record => record.comparisons.filter(row => row.status !== 'match')
      .map(row => ({product_id: record.product_id, ...row}))), errors,
    sample: records[0] && {product_id: records[0].product_id, image_url: records[0].image_url,
      offers: records[0].offers, training_skus: records[0].training_skus}}));
  if (errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
