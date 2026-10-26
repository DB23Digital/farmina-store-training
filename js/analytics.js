// Training has its own GA4 property. Preview and local usage never load Google.
(function () {
  'use strict';
  const measurementId = 'G-6TZ2T58GQD';
  const consentKey = 'apex-training-analytics-consent-v1';
  const production = location.protocol === 'https:' &&
    ['apexpetgroup.co.za', 'www.apexpetgroup.co.za'].includes(location.hostname) &&
    /^\/training(?:\/|$)/.test(location.pathname);
  const screens = ['catalog', 'buddy', 'ingredients', 'quiz', 'calc', 'tips', 'matcher', 'search'];
  const fields = {
    product_view: ['product_id', 'product_line', 'pet_type'],
    ingredient_view: ['ingredient_id'],
    quiz_start: ['quiz_line', 'question_count'],
    quiz_complete: ['quiz_line', 'score', 'question_count'],
    calculator_used: ['pet_type', 'product_id'],
    matcher_start: [],
    matcher_complete: ['pet_type', 'life_stage', 'concern', 'result_count'],
    buddy_start: [],
    buddy_complete: ['result_count'],
    voice_widget_requested: [],
    search_used: ['search_surface', 'result_count'],
    tip_view: ['tip_index']
  };
  let consent = null;
  let started = false;
  let currentScreen = 'catalog';
  let lastScreen = null;
  let previousPage = '';
  try {
    if (document.referrer) {
      const referrer = new URL(document.referrer);
      previousPage = referrer.origin + referrer.pathname;
    }
    consent = localStorage.getItem(consentKey);
  } catch (_) { /* A blocked storage API must not break training. */ }

  function gtag() { window.dataLayer.push(arguments); }

  function start() {
    if (!production || consent !== 'granted' || started || navigator.onLine === false) return;
    started = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: 'apex_training',
      cookie_path: '/training/',
      cookie_domain: 'none',
      page_location: pageUrl(),
      page_referrer: previousPage
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function pageUrl() {
    return location.origin + '/training/?screen=' + currentScreen;
  }

  function available() {
    return production && consent === 'granted' && started && navigator.onLine !== false;
  }

  function screen(name) {
    if (!screens.includes(name)) return;
    currentScreen = name;
    if (!available() || lastScreen === name) return;
    const page = {
      page_location: pageUrl(),
      page_title: 'Farmina Training | ' + name,
      page_referrer: previousPage
    };
    gtag('set', page);
    gtag('event', 'page_view', { ...page, send_to: measurementId, training_screen: name });
    lastScreen = name;
    previousPage = page.page_location;
  }

  function track(name, params = {}) {
    if (!available() || !Object.hasOwn(fields, name)) return;
    const safe = {};
    fields[name].forEach(key => {
      const value = params[key];
      if ((typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
          (typeof value === 'string' && /^[a-z0-9_:-]{1,64}$/i.test(value))) safe[key] = value;
    });
    gtag('event', name, { ...safe, send_to: measurementId, training_screen: currentScreen });
  }

  const banner = document.getElementById('analyticsConsent');
  const preferences = document.getElementById('analyticsPreferences');

  function choose(value) {
    const wasGranted = consent === 'granted';
    consent = value;
    try { localStorage.setItem(consentKey, value); } catch (_) { /* Session choice still applies. */ }
    banner.hidden = true;
    if (value === 'granted') {
      window['ga-disable-' + measurementId] = false;
      if (started) gtag('consent', 'update', { analytics_storage: 'granted' });
      start();
      if (!wasGranted) lastScreen = null;
      screen(currentScreen);
    } else {
      window['ga-disable-' + measurementId] = true;
      if (started) gtag('consent', 'update', { analytics_storage: 'denied' });
      // Delete only this app's host-only GA cookies; preserve Apex's other analytics.
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('apex_training_')) {
          document.cookie = name + '=; Max-Age=0; Path=/training/; Secure; SameSite=Lax';
        }
      });
    }
    preferences.focus();
  }

  window.TrainingAnalytics = Object.freeze({ screen, track, isEnabled: available });
  if (!production) return;
  window['ga-disable-' + measurementId] = consent !== 'granted';
  preferences.hidden = false;
  preferences.addEventListener('click', () => {
    banner.hidden = false;
    document.getElementById('analyticsAccept').focus();
  });
  document.getElementById('analyticsAccept').addEventListener('click', () => choose('granted'));
  document.getElementById('analyticsDecline').addEventListener('click', () => choose('denied'));
  banner.hidden = consent === 'granted' || consent === 'denied';
  start();
  screen(currentScreen);
  window.addEventListener('online', () => {
    start();
    screen(currentScreen);
  });
})();
