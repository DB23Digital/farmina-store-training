# Deployment review — 26 October 2026

Subsequent update: the owner changed the deployment URL to `https://apexpetgroup.co.za/training/`. The findings and HTTP evidence below retain their original URLs. Use [current deployment instructions](DEPLOYMENT.md) and the [URL-change record](URL-CHANGE-2026-10-26.md) for the current package.

## Recommendation

Use **GPT-6.1 Sol with High reasoning effort** for the deployment foundation, calculator/data corrections and release verification. Use **Medium** for subsequent well-scoped content, styling and analytics edits. Reserve **GPT-6 Astra with High** for unusually difficult design decisions or unresolved debugging; Extra High/Max is not justified as the default for this codebase.

This is a project-specific recommendation, not the result of a model benchmark. OpenAI's current [model selection guide](https://developers.openai.com/api/docs/guides/model-selection) positions GPT-6.1 Sol for complex technical work with cost awareness. Its [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning) supports High for difficult planning/debugging and Medium as a balanced working level. The model is a development tool; the deployed training app needs no AI model or API key.

Keep the static architecture. A framework migration would add deployment dependencies without solving the observed problems.

## Verified project map

The Git repository is `store_training/`, beneath the workspace directory. Local branch `main`, starting HEAD `cebe886`; remote `Farmina-SA/farmina-store-training`. No fetch was performed, so local tracking status does not establish current remote state. A sibling historical worktree was not edited.

At intake, `.gitignore`, `index.html` and `js/calculator.js` were already modified. Existing calculator changes include a metabolic-energy input and changed dog portion formula. These were preserved. Pre-edit HTML/calculator and other touched-file snapshots are in the workspace's `assessment-2026-10-26/before/`; the clean original manifest is recoverable from HEAD and also copied there. No commit, push, deployment or GA dashboard change was made.

| Area | Current implementation |
| --- | --- |
| Runtime | Plain HTML, CSS and classic global JavaScript; no npm/build step/backend |
| Interface | Seven screens: products, ingredients, quiz, calculator, tips, matcher, search |
| Catalogue | 22 display cards in `js/products.js`; 31 source records and 75 SKUs in `js/farmina-data.js` |
| Product linkage | Name scoring, species filter and stage bonus; tied matches merged by pack size |
| Knowledge | 36 ingredient entries; three quizzes containing 15 questions; selling-tip content |
| Calculator | Optional feeding-guide request plus formula fallback; source guide CSV is under `assets/feeding-guides/` |
| PWA | Manifest, cache-first service worker and relative worker registration |
| Hosting history | README describes cPanel; `vercel.json` and historical project notes describe Vercel |
| Analytics | New standalone, consent-controlled GA4 integration for the owner's separate training property |

`farmina_data/` and parent Python scripts are source/extraction material, not application runtime files. The older parent `PROJECT_STATUS.md` and application `CLAUDE.md` are stale: they say five screens/no service worker and list a neutered-cat card as missing, while the current source contains seven screens, a worker and that card. Treat the actual source and this dated assessment as the current findings.

## Host evidence

Read-only HTTP checks on 26 October 2026 returned:

| URL | Result |
| --- | --- |
| `https://apexpetgroup.co.za/` | HTTP 200, Apache, existing homepage GA4 ID `G-QLFDMFNF03` |
| `https://apexpetgroup.co.za/store-training` | HTTP 404 |
| `https://apexpetgroup.co.za/store-training/` | HTTP 404 |

The owner explicitly chose a separate training property and supplied **G-6TZ2T58GQD**. That ID is used in the new integration. Root hosting configuration and cPanel access were not inspected. Vercel headers do not configure Apache.

## Changes completed locally

1. Added `js/analytics.js`, with consent choices, production hostname/path gating, whitelisted event fields, manual screen views and separate training cookies. Added hooks to existing feature functions. See [analytics setup](ANALYTICS.md).
2. Scoped worker fetch handling to this application's origin and directory. External Google requests bypass it. Cache reads use only the current application cache; cleanup deletes only older `apex-store-training-` caches, preserving other origin caches. Ambiguous historical `farmina-v*` caches are deliberately left intact.
3. Bumped the final cache to `apex-store-training-v10` and included both the directory entry point and analytics code in precaching.
4. Changed manifest `id`, `start_url` and `scope` to `./`, keeping installation/launch in the training subdirectory.
5. Escaped user-entered search text in the no-results message. Previously a markup query was inserted into `innerHTML`. Corrected quiz search indexing to use `q.opts`, rather than nonexistent `q.a1` through `q.a4`.
6. Added 14 focused tests using Node's built-in test runner. No third-party runtime or build dependency was added.

## Remaining work before release sign-off

| Priority | Finding and evidence | Required change |
| --- | --- | --- |
| High | `js/matcher.js:31` maps adult-dog allergies to puppy products `dp1` and `do1`. Line 39 also includes puppy `do1` for adult skin results; line 47 includes adult `dp2` for puppies. Line 36 maps adult-cat digestion to neutered `cp5`. | Review these five stage mismatches against authoritative suitability data; use explicit IDs and an eligibility check. Audit allergy claims against full compositions rather than headline protein. Do not guess replacements. |
| High | `js/calculator.js:10` requests `feeding-guides.txt`, which does not exist at the app root. The file is actually `assets/feeding-guides/feeding-guides.txt` and is not precached. | Repair the whole loading/lookup contract and offline coverage together. A path-only fix could activate incorrect lookups. |
| High | Calculator lookup accepts partial product names and the first highest-scoring guide row. Puppy guide rows include age and expected mature weight, but the UI supplies neither. `crNote` can say "official feeding guide" whenever any guide data is loaded, even when the selected product fell back to a formula. Negative energy input also produces a negative portion in a direct function probe. | Use explicit product/guide identities, validated inputs, the needed age/maturity fields, and an explicit result source. Reconfirm formula/feeding authority; no feeding formula was changed in this session. |
| Medium | Product/SKU matching uses additive fuzzy scoring and deduplicates tied records by bag weight. Same-sized conflicting records can be silently collapsed. Prices are dated June 2026; this session did not reconcile prices/nutrition against current authority. | Add an explicit mapping table and validation for identity, life stage, pack size and conflicting prices. Confirm current product data before release. |
| Medium | Apache deployment currently has no reproducible package or host-specific cache-header configuration. Worker updates still rely on changing a manual cache version. | Add an explicit runtime-file package, subdirectory staging check and release checklist. Ensure `service-worker.js` and HTML revalidate; verify every deployed CSS/JS/image URL, not only the HTML status. |
| Medium | Quiz completion is only an in-memory object (`js/quiz.js:87`); reloading loses local completion state. There is no authentication, server-side progress or named learner identity. | Decide whether aggregate analytics is sufficient. If per-staff learning records are needed, define identity, persistence and access rules as a separate feature. |
| Low | Seven tabs and manual DOM handlers need mobile/accessibility checks; the viewport disables zoom. Several operational docs describe older behaviour. | Allow zoom, review keyboard/focus behaviour, test narrow mobile layouts, and refresh operational documentation. |

## Suggested order for the next development pass

1. On a focused development branch, correct calculator data selection and validate matcher eligibility with the owner-approved product information. Define expected cases before making replacements.
2. Replace fuzzy catalogue identity with an explicit mapping. Validate source date, identities, sizes and prices without importing stale data.
3. Add deterministic Apache/cPanel packaging and scoped header instructions. Retain the current static runtime.
4. Verify first install, offline launch, worker update, Android/iOS layouts and all seven screens on staging. Then deploy the reviewed runtime files to `/store-training/` and verify the same assets on the actual host.
5. Complete GA4 dashboard setup and production Realtime/DebugView checks after deployment. Analytics reporting is implemented locally; Google receipt is not yet proven.

## Validation and limits

- **Passed:** `node --test tests/analytics.test.cjs` — 14 tests. Covers production gating, default/declined/accepted consent, repeat consent, withdrawal and cookie scope, screen deduplication/referrers, event allowlists, blocked localStorage, offline drops, worker cache ownership/fetch scope, PWA paths, search escaping/indexing and feature-event wiring.
- **Passed:** All ten application JavaScript files and the worker parse. All HTML local asset references and original precache files existed at initial inspection; tests cover the final precache list.
- **Browser checked locally:** catalogue render, quiz start/answer feedback and calculator output (10 kg dog, 7 kg bag at R999, ME 3997 produced 89 g/day and R12.70/day using the existing formula). This checks application behaviour, not nutritional correctness.
- **Browser checked locally:** consent UI, accept/reopen/decline and search use after declining. The isolated consent preview uses a local Google-transport substitute, and no real Google tag script was loaded there.
- **Browser checked locally:** the old worker served stale search code; after worker activation and reload, the entered `<strong>qa</strong>` string remained plain text with no injected element. This confirms final-code behaviour and demonstrates why release cache versions matter.
- **Not run:** live deployment, GA property access/setup, real GA event receipt, production cache headers, full iOS/Android/offline browser matrix, or an authoritative price/nutrition audit.

Local source facts are recorded in the workspace's `assessment-2026-10-26/codebase-facts.json`. The consent screenshot there is a local QA image, not production evidence.
