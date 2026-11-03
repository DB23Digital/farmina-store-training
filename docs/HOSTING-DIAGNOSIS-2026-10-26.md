# Training deployment diagnosis — 26 October 2026

This is the hosting evidence record. For the current deployment ZIP, use [cPanel installation](CPANEL-INSTALLATION.md); the release ID and checksum below describe the earlier package present during the 404 investigation.

## Verified hosting evidence

Read-only public checks at 13:35 UTC returned HTTP 200 for the main website, with its expected Apex title. `/training`, `/training/`, `/training/index.html`, `/training/manifest.json`, `/training/service-worker.js`, `/training/css/styles.css` and `/training/assets/apexlogo-mark.png` each returned HTTP 404 and the same 13-byte `404 Not Found` response. In particular, the explicit HTML file is unavailable: relative asset paths cannot cause the initial HTML request's 404. A missing DirectoryIndex alone cannot explain the explicit file's 404.

System DNS lookup and independent Google DNS-over-HTTPS both resolved the public domain to **92.205.168.105**. The DNS-over-HTTPS lookup returned no AAAA address; nameservers were ns49.domaincontrol.com and ns50.domaincontrol.com.

The RIPE RDAP allocation for 92.205.168.105 is `DE-GODADDY-20071017` and lists GoDaddy/Host Europe contacts. This identifies the public IP allocation, not the specific customer's hosting login or effective document root.

The available cPanel session was **cp71.domains.co.za**, account **apexpetg**, shared IP **169.239.218.71**. Its Domains screen mapped apexpetgroup.co.za to `/home/apexpetg/public_html`, with no cPanel redirect. Its File Manager showed `/home/apexpetg/public_html/training/index.html` (23.66 KB, 0644), assets/css/js directories (0755), manifest and worker, and the older uploaded `store-training-024b2fcd7c2c.zip`.

**Follow-up after the new extraction:** all three open File Manager tabs still showed home `(/home/apexpetg)` on `cp71.domains.co.za`. The `public_html/training` listing now contained the new `store-training-20fa5bac6739.zip` (1.67 MB) and an extracted `index.html` (23.71 KB). The public domain still resolved to `92.205.168.105` and returned the same 13-byte 404 for `/training`, `/training/`, `/training/index.html`, `/training/manifest.json` and `/training/css/styles.css`; its root remained HTTP 200. This directly confirms that the latest release was extracted in the `apexpetg` account while the public request continued to miss it. An intentional proxy arrangement would still require host-side proof; none was visible.

**User correction:** the intended destination account is **apexpetgroup**, with directory `apexpetgroup/public_html/training/`. On standard cPanel this is `/home/apexpetgroup/public_html/training/`. That account's live Domains mapping was not available for verification. The inspected `apexpetg` account and its home directory must not be treated as the intended destination.

This establishes a mismatch between the inspected upload/account and the server addressed by public DNS. The leading explanation is that the upload was placed in the other hosting account. A different public IP does not by itself exclude an intentional reverse proxy; no such proxy mapping was available. The effective document root and routing on the public server remain unverified, so the final server-side cause is not fully proven.

A direct HTTPS connection to 169.239.218.71 with the Apex hostname/SNI failed certificate validation with `CERT_HAS_EXPIRED`. Validation was not bypassed. This did not reproduce the public server's 404 and is not asserted as its cause.

## Rewrite investigation and remaining evidence

The available local main-website `.htaccess` copy contains HTTPS/www canonical redirects, an index redirect and guarded extensionless HTML rules; no catch-all training denial was found. This was a local copy, not verification of the active public server's rules. The active server's virtual host, document root, applicable parent `.htaccess`, aliases/proxy configuration and request logs were unavailable.

The host must confirm the `apexpetgroup` account's effective domain document root on 92.205.168.105, whether a proxy connects it to cp71, and the filesystem/routing decision for `/training/index.html`. First place/read back the files in that active website's training subfolder. If 404 persists, inspect its access/error logs and parent rewrite/proxy rules. Do not repoint DNS, move the application to the website root, or replace root configuration without an explained and reviewed need.

Primary hosting references: [cPanel document-root inspection](https://support.cpanel.net/hc/en-us/articles/1500004206502-How-to-find-the-document-root-of-a-domain), [how cPanel domains serve content](https://docs.cpanel.net/knowledge-base/cpanel-product/how-domains-serve-content/), and [Apache DirectoryIndex/DirectorySlash](https://httpd.apache.org/docs/2.4/mod/mod_dir.html).

## Corrected package

- HTML declares `<base href="/training/">`, so relative scripts, styles, logos, navigation links and feeding-guide fetches resolve inside the deployment subdirectory, including when opening the explicit index URL.
- Manifest id, start URL and scope are `/training/`; icon URLs are `/training/assets/icons/...`.
- Worker registration uses `/training/service-worker.js` and explicit scope `/training/`. The worker rejects installation at a different path; its GET handler only serves same-origin `/training/` URLs. It reads its own release cache and only removes old `apex-training-*` caches. External analytics and other website paths are excluded.
- The application-only `.htaccess` specifies index.html and trailing-slash directory handling, with scoped cache/security headers. It adds no root rewrite rules. Its Apache behavior still requires live validation.
- Content-derived runtime release `20fa5bac6739` has a root-flat ZIP with 48 runtime files plus release-manifest.json. The metadata uses the corrected account path. The runtime identity stayed the same when only this destination metadata was corrected; the final ZIP checksum changed.
- Final ZIP SHA-256: `9815d91a77f8b885b1828aff82c3ace925cc0723cefb8a53793fe2a0db5ead1e`.

## Executed verification and limits

**Local automated:** 24 Node tests passed (analytics, worker confinement and application foundation); one Python package test passed, rebuilding twice to verify deterministic archive checksums, root-flat paths, runtime allowlist and manifest file hashes. Release inspection validated 48 runtime checksums, 13 JavaScript files, 18 same-origin HTML resource references and 24 precache URLs. HTTP smoke checks of the staged build at `http://127.0.0.1:4181/training/` returned 200 for all 24 precache URLs. The local server redirected `/training` to `/training/` with 301. Destination metadata was subsequently corrected and the package and checksum checks rerun; runtime bytes were unchanged.

**Local browser:** the staged build displayed the Apex logo and “Training powered by Apex Pet Group”; Products, Ingredients, Quiz, Calculator, Tips, Matcher and Search opened under `/training/`. Searching chicken returned results. The supplied Ancestral Medium/Maxi puppy guide, age 4 months and expected adult weight 40 kg, produced 355 g/day and R45.82/day for the displayed 12 kg/R1549 snapshot bag.

**Local offline:** after the initial load, the preview server was stopped and an independent HTTP request failed with ECONNREFUSED. Reloading the browser still displayed the catalogue; calculator navigation, guide data selection and the same 355 g/day calculation worked. This proves cached same-origin operation with the local server unavailable. It is not a physical-device installation test or full WAN-disconnection test. Browser screenshot capture was unavailable; accessibility observations were used for interaction evidence.

**Live:** the existing main site responded; the training page and sampled assets returned 404. The corrected package has not been uploaded by this session. Production worker registration, cache headers, redirects, installed mobile PWA behavior and GA4 delivery remain unverified until the hosting destination is resolved and this release is installed. A root-flat package and corrected resource paths cannot fix a public server pointing at different files.

Sanitized evidence is kept in the workspace assessment folder: `hosting-diagnosis/live-http-dns.json`, `routing-evidence.json` and `offline-guide-ax.txt`. No remote files, DNS, or root website configuration were changed.

## Later local release

Release `1542cc1eaf79` adds the homepage exit link and 36 local Farmina pack photos. Its 25 Node tests, package reproducibility test, 86 runtime checksums and all 62 `/training/` HTTP precache checks passed locally. A browser showed all 22 card photos, the 12 kg Pumpkin image switch and the exit target `/`. With the local server stopped, the cached page and two product images opened directly. See [pack-shot and price evidence](PRODUCT-IMAGES-PRICE-AUDIT-2026-10-26.md). This later release was not uploaded during these checks, and the public hosting mismatch remains unresolved.
