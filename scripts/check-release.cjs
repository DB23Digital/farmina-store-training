const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');

(async()=>{
  const root = path.resolve(process.argv[2] || JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/latest-release.json'),'utf8')).stage);
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
  let scripts = 0;
  for(const entry of manifest.files){
    const bytes = fs.readFileSync(path.join(root,entry.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.path);
    if(entry.path.endsWith('.js')){ new vm.Script(bytes.toString(),{filename:entry.path}); scripts++; }
    if(entry.path.endsWith('.json')) JSON.parse(bytes);
  }
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const origin = 'https://apexpetgroup.co.za';
  const basePath = html.match(/<base\b[^>]*href="([^"]+)"/i)?.[1];
  assert.equal(basePath,'/training/','HTML base must stay in /training/');
  const documentBase = new URL(basePath,origin);
  const refs = [...html.matchAll(/<(?:script|link|img|source)\b[^>]*?\b(?:src|href)="([^"]+)"/gi)]
    .map(m=>new URL(m[1],documentBase)).filter(url=>url.origin === origin);
  function verifyResource(url){
    assert.ok(url.pathname.startsWith('/training/'),url.href);
    assert.ok(fs.statSync(path.join(root,decodeURIComponent(url.pathname.slice('/training/'.length)))).isFile(),url.href);
  }
  refs.forEach(verifyResource);
  const webManifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  for(const key of ['id','start_url','scope']) assert.equal(webManifest[key],'/training/',key);
  webManifest.icons.forEach(icon=>verifyResource(new URL(icon.src,new URL('manifest.json',documentBase))));
  const shots = vm.runInNewContext(fs.readFileSync(path.join(root,'js/product-images.js'),'utf8')+'\nPRODUCT_SHOTS',{});
  const productImages = JSON.parse(fs.readFileSync(path.join(root,'assets/products/sources.json'),'utf8'));
  assert.equal(Object.keys(shots).length,31);
  assert.equal(productImages.files.length,36);
  for(const entry of productImages.files){
    const file = path.join(root,'assets/products',entry.name);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),entry.sha256);
  }
  for(const shot of Object.values(shots)) for(const ref of [shot.standard,shot.large].filter(Boolean))
    verifyResource(new URL(ref,documentBase));
  assert.equal(manifest.hosting_directory,'/home/apexpetgroup/public_html/training/');
  const context = vm.createContext({URL,self:{location:{href:'https://apexpetgroup.co.za/training/service-worker.js'},addEventListener(){}}});
  vm.runInContext(fs.readFileSync(path.join(root,'service-worker.js'),'utf8'),context);
  assert.equal(vm.runInContext('CACHE_NAME',context),manifest.cache_name);
  const assets = Array.from(vm.runInContext('PRECACHE_ASSETS',context));
  for(const ref of assets) assert.ok(fs.existsSync(path.join(root,ref)),ref);
  const base = process.argv[3];
  if(base){
    const url = new URL(base);
    assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'HTTP smoke checks are local-only');
    assert.equal(url.pathname,'/training/','Smoke test must use the deployment subdirectory');
    const results = await Promise.allSettled(assets.map(async ref=>{
      const response = await fetch(new URL(encodeURI(ref),url),{signal:AbortSignal.timeout(10000)});
      assert.equal(response.status,200,ref);
      await response.arrayBuffer();
    }));
    const failures = results.filter(r=>r.status==='rejected');
    assert.equal(failures.length,0,failures.map(r=>r.reason.message).join('\n'));
  }
  console.log(JSON.stringify({release_id:manifest.release_id,checksums:manifest.files.length,scripts,html_assets:refs.length,product_images:productImages.files.length,precache_assets:assets.length,http_checks:base?assets.length:0}));
})().catch(error=>{ console.error(error.message); process.exitCode=1; });
