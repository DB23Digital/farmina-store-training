# Deployment URL change — 26 October 2026

The owner changed the public target to **https://apexpetgroup.co.za/training/**. The local repository directory remains `store_training/`.

Updated the production analytics path allowlist, virtual page locations, analytics cookie path and withdrawal path, package target metadata, release checker, local preview server, tests and active documentation. The GA4 measurement ID remains **G-6TZ2T58GQD**. The relative PWA manifest and worker registration resolve under `/training/` without hardcoded URL changes.

The new cache namespace is `apex-training-`. It preserves caches associated with the old route and other Apex applications. Tests confirm that the retired `/store-training/` route cannot enable this analytics module and is not intercepted by the new worker.

## Replacement package

- Release: `024b2fcd7c2c`.
- Archive: `dist/store-training-024b2fcd7c2c.zip`.
- SHA-256: `9fdc4e5e317a778e48bab1af3d5044d704ab4460b306cc19ec249f6540e6aea1`.
- Upload/extract destination: **`public_html/training/`**, with `index.html` directly inside it.

This replaces the earlier deployment package. Earlier dated assessment/completion documents retain their original URLs and evidence, with a supersession note.

## Verification

- 22 Node application tests passed, including the new path, old-path exclusion and cache-isolation assertions.
- Python deterministic-package test passed.
- Verified 48 runtime checksums, 13 JavaScript files including the worker, 18 HTML asset references and all 23 precached files.
- Local HTTP checks under `/training/` returned HTTP 200 for all 23 precached URLs.
- Read-only public checks returned HTTP 404 for `/training` and `/training/` on 26 October 2026. No remote files or settings were changed.

After uploading, update the GA4 web stream's Website URL to `https://apexpetgroup.co.za/training/` if it still points to the old route, then perform the documented live checks. The host must serve `/training` with a redirect to `/training/` for correct relative asset resolution. Previously installed PWAs keep their old start URL; if an old-route installation exists, install from the new URL. Redirects or removal of an old host directory were not configured by this local update.
