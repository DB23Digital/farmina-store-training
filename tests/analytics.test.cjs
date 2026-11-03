const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/analytics.js'), 'utf8');

function browser({ url = 'https://apexpetgroup.co.za/training/?email=private', consent, online = true, blockedStorage = false } = {}) {
  const elements = new Map();
  const scripts = [];
  const deletedCookies = [];
  const storage = new Map(consent ? [['apex-training-analytics-consent-v1', consent]] : []);
  const events = {};
  const document = {
    referrer: 'https://example.org/training-invite?email=private',
    head: { appendChild(script) { scripts.push(script); } },
    createElement() { return {}; },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        hidden: true, listeners: {}, focus() {},
        addEventListener(name, handler) { this.listeners[name] = handler; }
      });
      return elements.get(id);
    },
    get cookie() { return '_ga=homepage; apex_training_ga=training; apex_training_ga_6TZ2T58GQD=session'; },
    set cookie(value) { deletedCookies.push(value); }
  };
  const window = { addEventListener(name, handler) { events[name] = handler; } };
  const navigator = { onLine: online };
  vm.runInNewContext(source, {
    window, document, navigator, location: new URL(url), URL,
    localStorage: {
      getItem(key) { if (blockedStorage) throw Error('blocked'); return storage.get(key) || null; },
      setItem(key, value) { if (blockedStorage) throw Error('blocked'); storage.set(key, value); }
    }
  });
  return {
    api: window.TrainingAnalytics, window, navigator, scripts, storage, elements, deletedCookies, events,
    click(id) { elements.get(id).listeners.click(); },
    calls() { return Array.from(window.dataLayer || [], item => Array.from(item)); },
    hits() { return this.calls().filter(item => item[0] === 'event'); }
  };
}

test('local, preview, wrong directory and HTTP pages cannot load or emit analytics', () => {
  for (const url of ['http://localhost:4173/training/', 'https://farmina-store-training.vercel.app/',
    'https://apexpetgroup.co.za/', 'https://apexpetgroup.co.za/store-training/',
    'https://apexpetgroup.co.za/training-preview/', 'http://apexpetgroup.co.za/training/']) {
    const b = browser({ url, consent: 'granted' });
    b.api.screen('quiz');
    b.api.track('quiz_start', { quiz_line: 'prime' });
    assert.equal(b.scripts.length, 0, url);
    assert.equal(b.hits().length, 0, url);
  }
});

test('no Google script or events before a choice; declined choice persists', () => {
  const b = browser();
  assert.equal(b.elements.get('analyticsConsent').hidden, false);
  b.api.track('product_view', { product_id: 'dp1' });
  b.click('analyticsDecline');
  assert.equal(b.scripts.length, 0);
  assert.equal(b.hits().length, 0);
  assert.equal(b.storage.get('apex-training-analytics-consent-v1'), 'denied');
  const returning = browser({ consent: 'denied' });
  assert.equal(returning.elements.get('analyticsConsent').hidden, true);
  assert.equal(returning.scripts.length, 0);
});

test('accept uses the separate training property and emits exactly one initial view', () => {
  const b = browser();
  b.click('analyticsAccept');
  assert.match(b.scripts[0].src, /id=G-6TZ2T58GQD$/);
  const config = b.calls().find(c => c[0] === 'config');
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].cookie_prefix, 'apex_training');
  assert.equal(config[2].cookie_path, '/training/');
  b.click('analyticsPreferences');
  b.click('analyticsAccept');
  assert.equal(b.scripts.length, 1);
  assert.equal(b.hits().length, 1);
});

test('views follow effective screen changes, with clean URLs and previous virtual referrers', () => {
  const b = browser({ consent: 'granted' });
  b.api.screen('quiz');
  b.api.screen('quiz');
  b.api.screen('unknown');
  const hits = b.hits();
  assert.equal(hits.length, 2);
  assert.equal(hits[0][2].page_referrer, 'https://example.org/training-invite');
  assert.equal(hits[1][2].page_referrer, 'https://apexpetgroup.co.za/training/?screen=catalog');
  assert.equal(hits[1][2].page_location, 'https://apexpetgroup.co.za/training/?screen=quiz');
  assert.ok(!JSON.stringify(b.calls()).includes('private'));
});

test('unconsented activities are dropped; acceptance views only the current screen', () => {
  const b = browser();
  b.api.screen('quiz');
  b.api.track('quiz_complete', { score: 5 });
  b.click('analyticsAccept');
  assert.equal(b.hits().length, 1);
  assert.equal(b.hits()[0][2].training_screen, 'quiz');
});

test('event allowlists discard unknown fields, identifiers containing personal text and invalid numbers', () => {
  const b = browser({ consent: 'granted' });
  b.api.track('search_used', { search_surface: 'overlay', result_count: 3, search_term: 'private@example.org' });
  b.api.track('product_view', { product_id: 'private@example.org', pet_type: 'dog' });
  b.api.track('quiz_complete', { score: Infinity, question_count: -1 });
  b.api.track('unknown', { email: 'private@example.org' });
  assert.equal(b.hits().length, 4);
  assert.equal(b.hits()[1][2].result_count, 3);
  assert.equal(b.hits()[2][2].product_id, undefined);
  assert.equal(b.hits()[3][2].score, undefined);
  assert.equal(b.hits()[3][2].question_count, undefined);
  assert.ok(!JSON.stringify(b.calls()).includes('private@example.org'));
});

test('conversation guide emits aggregate activity without customer answers', () => {
  const b = browser({ consent: 'granted' });
  b.api.screen('buddy');
  b.api.track('buddy_start', { customer_name: 'private@example.org' });
  b.api.track('buddy_complete', { result_count: 2, pet_type: 'dog', customer_name: 'private@example.org' });
  const hits = b.hits();
  assert.equal(hits[1][2].training_screen, 'buddy');
  assert.equal(hits[3][2].result_count, 2);
  assert.ok(!JSON.stringify(hits).includes('private@example.org'));
  assert.equal(hits[3][2].pet_type, undefined);
});

test('voice widget request records no conversation data', () => {
  const b = browser({ consent: 'granted' });
  b.api.track('voice_widget_requested', { transcript: 'private@example.org' });
  const event = b.hits().at(-1);
  assert.equal(event[1], 'voice_widget_requested');
  assert.equal(event[2].transcript, undefined);
});

test('withdrawal stops application hits and deletes only training cookies; reacceptance resumes', () => {
  const b = browser({ consent: 'granted' });
  b.click('analyticsDecline');
  assert.equal(b.window['ga-disable-G-6TZ2T58GQD'], true);
  b.api.screen('calc');
  b.api.track('calculator_used', { pet_type: 'dog' });
  assert.equal(b.hits().length, 1);
  assert.equal(b.deletedCookies.length, 2);
  assert.ok(b.deletedCookies.every(c => c.startsWith('apex_training_')));
  b.click('analyticsAccept');
  b.api.track('calculator_used', { pet_type: 'dog' });
  assert.equal(b.scripts.length, 1);
  assert.equal(b.hits().length, 3);
});

test('offline activities are not queued or replayed on reconnect', () => {
  const b = browser({ consent: 'granted', online: false });
  b.api.track('quiz_complete', { score: 5 });
  b.api.screen('quiz');
  assert.equal(b.scripts.length, 0);
  b.navigator.onLine = true;
  b.events.online();
  assert.equal(b.hits().length, 1);
  assert.equal(b.hits()[0][1], 'page_view');
  assert.equal(b.hits()[0][2].training_screen, 'quiz');
});

test('blocked localStorage does not prevent an in-session choice or training', () => {
  const b = browser({ blockedStorage: true });
  b.click('analyticsAccept');
  assert.equal(b.hits().length, 1);
});

function worker(url = 'https://apexpetgroup.co.za/training/service-worker.js') {
  const handlers = {};
  const deleted = [];
  const matched = [];
  const requestedCaches = [];
  const context = vm.createContext({
    URL,
    self: { location: { href: url },
      addEventListener(name, fn) { handlers[name] = fn; },
      clients: { claim: async () => {}, matchAll: async () => [] } },
    caches: {
      keys: async () => ['homepage-v1', 'farmina-v8', 'apex-store-training-v11', 'apex-training-v12', 'apex-training-v13'],
      delete: async name => deleted.push(name),
      open: async name => { requestedCaches.push(name); return { match: async req => { matched.push(req.url); return 'cached-app-response'; } }; }
    }
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), context);
  return { handlers, deleted, matched, requestedCaches, context };
}

test('worker activation deletes only older caches in its own namespace', async () => {
  const w = worker();
  let ready;
  w.handlers.activate({ waitUntil(p) { ready = p; } });
  await ready;
  assert.deepEqual(w.deleted, ['apex-training-v12']);
});

test('worker passes analytics, other Apex paths and POST requests through untouched', async () => {
  const w = worker();
  for (const url of ['https://www.googletagmanager.com/gtag/js?id=G-6TZ2T58GQD',
    'https://www.google-analytics.com/g/collect', 'https://apexpetgroup.co.za/',
    'https://apexpetgroup.co.za/store-training/js/app.js',
    'https://apexpetgroup.co.za/training-other/index.html']) {
    w.handlers.fetch({ request: { method: 'GET', url }, respondWith() { assert.fail(url); } });
  }
  w.handlers.fetch({ request: { method: 'POST', url: 'https://apexpetgroup.co.za/training/events' }, respondWith() { assert.fail('POST intercepted'); } });
  let response;
  w.handlers.fetch({ request: { method: 'GET', url: 'https://apexpetgroup.co.za/training/js/app.js' }, respondWith(p) { response = p; } });
  assert.equal(await response, 'cached-app-response');
  assert.deepEqual(w.requestedCaches, ['apex-training-v13']);
});

test('all precached assets exist, analytics is available offline, and PWA launch stays in its directory', () => {
  const w = worker();
  const assets = Array.from(vm.runInContext('PRECACHE_ASSETS', w.context));
  assert.ok(assets.includes('./js/analytics.js'));
  assert.ok(assets.includes('./'), 'directory launch must work offline after the first installation');
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, asset)), asset);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert.equal(new URL(manifest.start_url, 'https://apexpetgroup.co.za/training/manifest.json').pathname, '/training/');
  assert.equal(manifest.scope, '/training/');
  assert.equal(manifest.id, '/training/');
  for(const icon of manifest.icons) assert.ok(icon.src.startsWith('/training/assets/'));
});

function registrationPage(controller) {
  const listeners = {};
  const docListeners = {};
  const state = { reloads: 0, updates: 0, label: { textContent: '' }, listeners, docListeners };
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/i)[1];
  const registration = { update: () => { state.updates++; return Promise.resolve(); } };
  vm.runInNewContext(script, {
    Boolean,
    navigator: { serviceWorker: { controller, ready: new Promise(() => {}),
      addEventListener(name, fn) { listeners[name] = fn; },
      register: async () => registration } },
    window: { addEventListener: (_event, callback) => callback() },
    document: { visibilityState: 'visible', getElementById: () => state.label,
      addEventListener(name, fn) { docListeners[name] = fn; } },
    location: { reload() { state.reloads++; } }
  });
  return state;
}

test('a page already run by a worker reloads once when a new release takes over', () => {
  const page = registrationPage({});
  page.listeners.controllerchange();
  page.listeners.controllerchange();
  assert.equal(page.reloads, 1);
});

test('a first visit does not reload when its first worker takes over', () => {
  const page = registrationPage(null);
  page.listeners.controllerchange();
  assert.equal(page.reloads, 0);
});

test('returning to an open app checks for a new release', async () => {
  const page = registrationPage({});
  await new Promise(resolve => setImmediate(resolve));
  page.docListeners.visibilitychange();
  assert.equal(page.updates, 1);
});

test('the worker reports the short release version and the page shows it', () => {
  const w = worker();
  const sent = [];
  vm.runInContext("CACHE_NAME", w.context);
  w.handlers.message({ data: { type: 'GET_VERSION' }, source: { postMessage: m => sent.push(m) } });
  assert.equal(sent[0].type, 'VERSION');
  assert.equal(sent[0].version, 'v13');
  const page = registrationPage({});
  page.listeners.message({ data: { type: 'VERSION', version: '1c7fb5' } });
  assert.equal(page.label.textContent, 'Version 1c7fb5');
  page.listeners.message({ data: { type: 'OTHER' } });
  assert.equal(page.label.textContent, 'Version 1c7fb5');
});

test('worker refuses installation from the website root or another directory', () => {
  assert.throws(()=>worker('https://apexpetgroup.co.za/service-worker.js'), /Worker must be served/);
  assert.throws(()=>worker('https://apexpetgroup.co.za/other/service-worker.js'), /Worker must be served/);
});

test('HTML base and worker registration keep resources and control inside /training/', () => {
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const base = html.match(/<base\b[^>]*href="([^"]+)"/i)?.[1];
  assert.equal(base,'/training/');
  const registrations = [];
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
  for(const script of scripts) vm.runInNewContext(script[1], {
    navigator:{serviceWorker:{addEventListener(){},ready:new Promise(()=>{}),
      register:(url,options)=>{registrations.push({url,scope:options.scope});return new Promise(()=>{});}}},
    window:{addEventListener:(_event,callback)=>callback()}
  });
  assert.deepEqual(registrations,[{url:'/training/service-worker.js',scope:'/training/'}]);
  for(const entry of ['https://apexpetgroup.co.za/training','https://apexpetgroup.co.za/training/index.html']) {
    const documentBase = new URL(base,entry);
    assert.equal(new URL('js/app.js',documentBase).pathname,'/training/js/app.js');
    assert.equal(new URL('assets/feeding-guides/feeding-guides.json',documentBase).pathname,'/training/assets/feeding-guides/feeding-guides.json');
  }
});

test('search displays entered markup as text and indexes quiz answer options', () => {
  const context = vm.createContext({});
  for (const file of ['quiz.js', 'search.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context);
  const result = vm.runInContext(`(() => {
    buildSearchIndex();
    const answersIndexed = searchIndex.every(item => !item.searchText.includes('undefined'));
    performSearch('<img src=x onerror=alert(1)>');
    return { answersIndexed, html: formatSearchResultsHtml() };
  })()`, context);
  assert.equal(result.answersIndexed, true);
  assert.ok(!result.html.includes('<img'));
  assert.ok(result.html.includes('&lt;img'));
});

test('feature flows emit completed actions once and pass only the intended metadata', () => {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, { value: '', style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c),
          toggle(c, force) { const on = force === undefined ? !classes.has(c) : force; on ? classes.add(c) : classes.delete(c); return on; } }
      });
    }
    return elements.get(id);
  }
  const hits = [];
  const scheduled = [];
  const document = {
    getElementById: element,
    querySelectorAll: selector => selector === '.opt' ? [0, 1, 2, 3].map(i => element('option-' + i)) : []
  };
  const context = vm.createContext({ document,
    window: { addEventListener() {}, TrainingAnalytics: { screen: name => hits.push(['page_view', { name }]),
      track: (name, params) => hits.push([name, params]), isEnabled: () => true } },
    fetch: async () => ({ ok: false }),
    setTimeout: fn => { scheduled.push(fn); return scheduled.length; }, clearTimeout() {},
    alert() { assert.fail('unexpected validation failure'); }
  });
  for (const name of ['farmina-data', 'catalog-links', 'products', 'product-images', 'ingredients', 'quiz', 'tips', 'feeding', 'calculator', 'matcher', 'search', 'app']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8'), context);
  }
  context.guideFixture = JSON.parse(fs.readFileSync(path.join(root, 'assets/feeding-guides/feeding-guides.json'), 'utf8'));
  vm.runInContext("FEEDING_GUIDES = validateFeedingGuides(guideFixture); feedingGuideStatus = 'ready';", context);
  for (const [id, value] of Object.entries({ cPetType: 'dog', cProductSelect: 'P0012', cGuideWeight: '10', cBagSize: '12000', cPrice: '1549' })) element(id).value = value;
  vm.runInContext(`
    showScreen('quiz', document.getElementById('nav-quiz'));
    startQuiz('quinoa');
    for(let i=0; i<5; i++) { selectAns(document.querySelectorAll('.opt')[0], true); nextQ(); }
    showResult();
    toggleCard('dp1-mini'); toggleCard('dp1-mini');
    openIng('i1');
    initMatcher(); selectMatcherPet('dog'); selectMatcherStage('adult'); selectMatcherConcern('skin');
    runCalc();
    toggleTip(0); toggleTip(0);
    onSearchInput({target:{id:'screenSearchInput',value:'chicken'}});
  `, context);
  scheduled.forEach(fn => fn());
  const names = hits.map(h => h[0]);
  for (const name of ['page_view', 'quiz_start', 'quiz_complete', 'product_view', 'ingredient_view',
    'matcher_start', 'matcher_complete', 'calculator_used', 'tip_view', 'search_used']) {
    assert.equal(names.filter(n => n === name).length, 1, name);
  }
  assert.equal(hits.find(h => h[0] === 'quiz_complete')[1].score, 5);
  assert.equal(hits.find(h => h[0] === 'calculator_used')[1].product_id, 'P0012');
  assert.equal(element('crPortion').textContent, '90g–160g');
  assert.ok(!JSON.stringify(hits).includes('chicken'));
});
