# Apex store training deployment

Target: `https://apexpetgroup.co.za/training/`. Retain the static runtime; no Node/Python server or AI API is required on the production host.

The optional ElevenLabs voice widget loads its external script only after the visitor taps **Ask by voice**. It is not available offline. Check the [agent settings and live voice test](VOICE-AGENT.md) before promoting a package with that control.

Current installation instructions: [CPANEL-INSTALLATION.md](CPANEL-INSTALLATION.md). The intended account is **apexpetgroup**, with extraction into `apexpetgroup/public_html/training/` (normally `/home/apexpetgroup/public_html/training/`). The inspected **apexpetg** account was a different destination. Read the [hosting diagnosis](HOSTING-DIAGNOSIS-2026-10-26.md) before uploading: the public domain and inspected cPanel account use different server IPs.

## Build and verify locally

From `store_training/`:

```powershell
node --test tests/analytics.test.cjs tests/buddy.test.cjs tests/foundation.test.cjs tests/voice-agent.test.cjs
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
6. Test core training screens and supported guide selection after disconnecting. Source PDF links for the two supported tables are precached. External fonts and analytics require a network connection.
7. Complete the separate GA4 property setup and production verification in [ANALYTICS.md](ANALYTICS.md). The training ID remains `G-6TZ2T58GQD`.

## Data boundaries before production sign-off

- Catalogue identity now uses explicit links, not fuzzy scoring. Missing/changed identities, invalid pack data and conflicting same-size prices suppress that card's pricing and exclude its sources from calculator choices. This validates the internal snapshot; it does not prove current manufacturer or supplier authority.
- The source price/nutrition snapshot was not rewritten. Training SKU IDs are internal `S...` IDs, not supplier SKUs. A supplier reconciliation must first establish explicit supplier SKU identity and pack size; the existence of a June RRP list does not authorise a name-based price import.
- The supplied PDFs provide two puppy tables. The generated JSON contains 168 cells: 152 numeric dosages and 16 cells specifying adult food. The Prime PDF is explicitly Maxi; that mode requires a Maxi breed-size choice. Ancestral covers Medium/Maxi. No cells are interpolated and an unsupported cell does not fall back to an adult estimate.
- Adult formula constants from the existing app are retained and clearly labelled as estimates. They are not newly approved feeding policy. Puppy/kitten products cannot use that estimate path. Product/guide edition applicability and current nutrition/price authority remain owner checks before production sign-off.
- The matcher filters exact displayed species/life stage. It does not diagnose allergies or infer allergy suitability from a headline protein. The allergy branch gives ingredient-review guidance without fabricated recommendations.
- Analytics is aggregate activity reporting. Named employee identity, attendance, certification and server-side progress are separate features; this release adds none of them. Quiz completion remains in memory for the current visit.

## Verification record

See [foundation completion](FOUNDATION-COMPLETION-2026-10-26.md) for the executed checks and remaining limits. A packaged build is prepared locally; it has not been uploaded or deployed by this session.
