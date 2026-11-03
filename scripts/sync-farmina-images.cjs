// Copy verified Farmina /za product pack images into this offline training app.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const auditPath = process.argv[2] || path.resolve(root, '../assessment-2026-10-26/farmina-source-audit.json');
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
if (audit.errors.length || audit.records.length !== 31) throw Error('Complete Farmina source audit required');

async function download(urlString, name) {
  const url = new URL(urlString);
  if (url.protocol !== 'https:' || url.hostname !== 'www.farmina.com' ||
      !url.pathname.startsWith('/fotoprodotti/')) throw Error('Unexpected image URL: ' + urlString);
  const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw Error(`${name}: HTTP ${response.status}`);
  const contentType = response.headers.get('content-type')?.split(';')[0];
  const ext = contentType === 'image/png' ? '.png' : contentType === 'image/jpeg' ? '.jpg' : null;
  if (!ext) throw Error(`${name}: unsupported image type ${contentType}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000 || bytes.length > 3_000_000) throw Error(`${name}: unexpected image size`);
  const valid = ext === '.png' ? bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) :
    bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'));
  if (!valid) throw Error(`${name}: image signature mismatch`);
  return {name: name + ext, bytes, url: url.href,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex')};
}

(async () => {
  const tasks = audit.records.flatMap(record => [
    {record, kind: 'standard', url: record.image_url, name: record.product_id},
    ...(record.large_page ? [{record, kind: 'large', url: record.large_page.image_url,
      name: record.product_id + '-large'}] : [])
  ]);
  const images = [];
  let next = 0;
  await Promise.all(Array.from({length: 5}, async () => {
    while (next < tasks.length) {
      const task = tasks[next++];
      images.push({...await download(task.url, task.name), product_id: task.record.product_id,
        kind: task.kind,
        source_page: task.kind === 'large' ? task.record.large_page.source_url : task.record.source_url});
    }
  }));
  images.sort((a, b) => a.name.localeCompare(b.name));
  const directory = path.join(root, 'assets/products');
  fs.mkdirSync(directory, {recursive: true});
  for (const image of images) fs.writeFileSync(path.join(directory, image.name), image.bytes);
  const manifest = images.map(({bytes, ...entry}) => entry);
  fs.writeFileSync(path.join(directory, 'sources.json'), JSON.stringify({checked_at: audit.checked_at,
    files: manifest}, null, 2) + '\n');
  const grouped = Object.fromEntries(audit.records.map(record => [record.product_id, {
    standard: 'assets/products/' + images.find(image => image.product_id === record.product_id && image.kind === 'standard').name,
    ...(record.large_page ? {large: 'assets/products/' + images.find(image => image.product_id === record.product_id && image.kind === 'large').name} : {}),
    name: record.product_name
  }]));
  fs.writeFileSync(path.join(root, 'js/product-images.js'),
    '// Local copies of pack shots from the reviewed Farmina South Africa pages.\n' +
    'const PRODUCT_SHOTS = ' + JSON.stringify(grouped, null, 2) + ';\n');
  console.log(JSON.stringify({products: audit.records.length, images: images.length,
    bytes: images.reduce((total, image) => total + image.bytes.length, 0)}));
})().catch(error => { console.error(error); process.exitCode = 1; });
