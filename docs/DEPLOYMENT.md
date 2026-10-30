# Apex store training deployment

Target: `https://apexpetgroup.co.za/training/`. Retain the static runtime; no Node/Python server or AI API is required on the production host.

The optional ElevenLabs voice widget loads its external script only after the visitor taps **Ask by voice**. It is not available offline. Check the [agent settings and live voice test](VOICE-AGENT.md) before promoting a package with that control.

Current installation instructions: [CPANEL-INSTALLATION.md](CPANEL-INSTALLATION.md). The intended account is **apexpetgroup**, with extraction into `apexpetgroup/public_html/training/` (normally `/home/apexpetgroup/public_html/training/`). The inspected **apexpetg** account was a different destination. Read the [hosting diagnosis](HOSTING-DIAGNOSIS-2026-10-26.md) before uploading: the public domain and inspected cPanel account use different server IPs.

## Build and verify locally

From `store_training/`:

```powershell
node --test tests/analytics.test.cjs tests/buddy.test.cjs tests/foundation.test.cjs tests/voice-agent.test.cjs tests/matcher.test.cjs tests/content.test.cjs tests/feeding-guides.test.cjs
python tests/package.test.py
node scripts/check-release.cjs
```

The package test builds twice and verifies identical archive checksums, root-flat POSIX archive paths, the runtime allowlist and file checksums. To build without running tests, use `python scripts/package.py`.

`dist/latest-release.json` identifies the generated archive and staging directory. Every runtime change produces a new release ID and service-worker cache name. The staged worker uses that release cache name; the checked-in worker retains a development version. `release-manifest.json` in the archive lists all runtime SHA-256 hashes.

The archive contains only `index.html`, `manifest.json`, `service-worker.js`, `.htaccess`, application JS/CSS, supporting assets and the release manifest. Repository metadata, source price files, tests, scripts, review artifacts and workspace backups are excluded. Build scripts do not delete directories or alter source files.

For a local HTTP smoke check, serve the staged directory at `/training/`, then run:

```powershell
node scripts/check-release.cjs "<staged directory>" http://127.0.0.1:4177/training/
```

The workspace's `assessment-2026-10-26/preview.cjs` accepts a staging directory and port as arguments. Its optional consent fixture uses a local Google-transport substitute and is not included in the package.

## Upload

1. Keep a recoverable copy of the host's existing `training/` directory if one exists.
2. Upload the generated ZIP to `public_html/training/` and extract it there. `index.html` must be directly in that directory, with no extra nested `store_training` folder. Do not extract the archive at the domain root.
3. Ensure hidden files are shown and the supplied `.htaccess` was extracted. It scopes cache revalidation and security headers to the training directory. Its effective behaviour still needs checking on the actual Apache host.
4. Confirm `/training` redirects to `/training/`, the page and every JS/CSS/image/guide URL return correctly, and the content types are correct. Test the real asset URLs as well as the HTML.
5. Check both a fresh visitor and an already-installed PWA. A newly activated worker controls subsequent loads; reload after activation to load the new document/scripts. Previous `apex-training-*` caches are cleaned without deleting other Apex application caches.
6. Test core training screens and supported guide selection after disconnecting. The guide data (`feeding-guides.json`) and the two original Prime/Ancestral puppy PDFs are precached. The other supplied guide files (about 10 MB of PDFs and images) are served online only, to spare staff mobile data, so their "View supplied guide" link needs a connection. External fonts and analytics require a network connection.
7. Complete the separate GA4 property setup and production verification in [ANALYTICS.md](ANALYTICS.md). The training ID remains `G-6TZ2T58GQD`.

## Data boundaries before production sign-off

- Catalogue identity now uses explicit links, not fuzzy scoring. Missing/changed identities, invalid pack data and conflicting same-size prices suppress that card's pricing and exclude its sources from calculator choices. This validates the internal snapshot; it does not prove current manufacturer or supplier authority.
- The source price/nutrition snapshot was not rewritten. Training SKU IDs are internal `S...` IDs, not supplier SKUs. A supplier reconciliation must first establish explicit supplier SKU identity and pack size; the existence of a June RRP list does not authorise a name-based price import.
- The calculator is meant to match the feeding guide printed on the bag. A selected Farmina product uses only its supplied guide. The formula estimate is available only for a custom bag with no product selected, because across the 227 printed adult and cat cells it lands near or below Farmina's printed minimum. 34 supplied feeding guides are wired in: 9 puppy tables (grams by age and expected adult weight), 24 adult or cat tables (a printed min–max range by current weight) and the Prime Kitten table (a printed min–max by age band and kitten weight; cells printed "—" are not filled). 24 come from text-layer PDFs, parsed by `scripts/extract-feeding-guides.py`, which checks each PDF's printed title. 9 come from Farmina images, typed into `scripts/feeding-guide-transcriptions.json`. Each image was read twice, in full and in two native-resolution halves, and both reads agreed; each entry is locked to its image's SHA-256. Regenerate with `python scripts/extract-feeding-guides.py` (needs `pypdf`). Only printed values can be chosen: nothing is interpolated, and an unsupported cell never falls back to the estimate. Where one product record spans Mini and Medium & Maxi, or a guide covers fewer sizes than its record (Prime Puppy is Maxi only), the calculator asks for breed size first.
- Guides not yet supplied: Ancestral Grain Light Mini (`P0013`) and Quinoa Duck Skin & Coat Medium & Maxi (`P0024`). The calculator tells staff to use the guide printed on the bag for these. The "N&D Grain Free" PDFs are treated as Prime, as confirmed by Deon on 30/10/2026.
- The Shopify feeding widget uses the separate `apex-feeding-engine`, which does not yet match the printed guides. The fixes are listed in that project's `docs/FEEDING-GUIDE-ACCURACY-FIXES.md`.
- Adult formula constants from the existing app are retained and clearly labelled as estimates. They are not newly approved feeding policy. Puppy/kitten products cannot use that estimate path. Product/guide edition applicability and current nutrition/price authority remain owner checks before production sign-off.
- The matcher lists formulas from each card's declared composition and claims, and every result shows the declared ingredients or claim that put it there. Exact life-stage matches come first. Other-stage formulas appear only in a labelled section: dedicated Skin & Coat and Urinary formulas always, and everything else only when the exact stage has none. The allergy branch is an ingredient-exclusion filter: it lists formulas whose composition text does not name the excluded ingredients, and it treats unnamed animal protein as failing every animal exclusion. It does not diagnose allergies or establish suitability. `node scripts/audit-matcher.cjs` prints every combination with its evidence.
- Prices were checked against column G of the June 2026 RRP workbook on 30/10/2026: 75 of 75 matched. See [RRP and resource verification](RRP-AND-RESOURCE-VERIFICATION-2026-10-30.md), which also records the training-copy corrections.
- Analytics is aggregate activity reporting. Named employee identity, attendance, certification and server-side progress are separate features; this release adds none of them. Quiz completion remains in memory for the current visit.

## Verification record

See [foundation completion](FOUNDATION-COMPLETION-2026-10-26.md) for the executed checks and remaining limits. A packaged build is prepared locally; it has not been uploaded or deployed by this session.
