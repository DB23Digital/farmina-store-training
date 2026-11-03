// ═══════════════════════════════════════
// FARMINA STAFF TRAINING — SERVICE WORKER
// Strategy: Cache-first for this app's local assets only.
// Training data is local; optional analytics stays online-only. Offline use is supported
// after the first load.
//
// To force a cache refresh after deploying updates, increment the
// CACHE_NAME version below, preserving the apex-training- prefix.
// ═══════════════════════════════════════

// IMPORTANT: Bump this version on every deploy to force users to get the latest assets!
const CACHE_NAME = 'apex-training-v13';
const WORKER_URL = new URL(self.location.href);
if (WORKER_URL.pathname !== '/training/service-worker.js') throw Error('Worker must be served from /training/service-worker.js');
const APP_ROOT = new URL('/training/', WORKER_URL);

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/analytics.js',
  './js/farmina-data.js',
  './js/catalog-links.js',
  './js/products.js',
  './js/product-images.js',
  './js/ingredients.js',
  './js/quiz.js',
  './js/tips.js',
  './js/calculator.js',
  './js/feeding.js',
  './js/matcher.js',
  './js/search.js',
  './js/app.js',
  './js/buddy.js',
  './js/voice-agent.js',
  './assets/logo.png',
  './assets/apexlogo-mark.png',
  './assets/products/sources.json',
  './assets/products/P0001.png',
  './assets/products/P0002.png',
  './assets/products/P0003.png',
  './assets/products/P0004.png',
  './assets/products/P0005.png',
  './assets/products/P0006.png',
  './assets/products/P0007.png',
  './assets/products/P0008.png',
  './assets/products/P0009.png',
  './assets/products/P0010.png',
  './assets/products/P0011.png',
  './assets/products/P0012.png',
  './assets/products/P0013.png',
  './assets/products/P0014.png',
  './assets/products/P0015.png',
  './assets/products/P0016.png',
  './assets/products/P0017.png',
  './assets/products/P0018.png',
  './assets/products/P0019.png',
  './assets/products/P0020.png',
  './assets/products/P0021.png',
  './assets/products/P0022.png',
  './assets/products/P0023.png',
  './assets/products/P0024.png',
  './assets/products/P0025.png',
  './assets/products/P0026.png',
  './assets/products/P0027-large.png',
  './assets/products/P0027.png',
  './assets/products/P0028-large.png',
  './assets/products/P0028.png',
  './assets/products/P0029-large.png',
  './assets/products/P0029.png',
  './assets/products/P0030-large.png',
  './assets/products/P0030.jpg',
  './assets/products/P0031-large.png',
  './assets/products/P0031.png',
  './assets/feeding-guides/feeding-guides.json',
  './assets/feeding-guides/nd-grain-free-canine-2-chicken-puppy-maxi.pdf',
  './assets/feeding-guides/nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon.png',
];

// ── Install: precache all assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches and notify clients if updated ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('apex-training-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
  // Notify clients to reload if a new service worker is activated
  self.clients.matchAll({type: 'window'}).then(clients => {
    clients.forEach(client => {
      client.postMessage({type: 'NEW_VERSION_AVAILABLE'});
    });
  });
});

// ── Fetch: cache-first, fall back to network ──
self.addEventListener('fetch', event => {
  // Only handle GET requests inside this app's directory.
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Leave analytics, external requests and other Apex apps to the network.
  if (url.origin !== APP_ROOT.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => cache.match(event.request)).then(cached => {
      if (cached) return cached;
      // Not in cache — try network and cache the response for next time
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      });
    })
  );
});
