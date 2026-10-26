# Apex training installation

Target URL: https://apexpetgroup.co.za/training/

**Extract into `apexpetgroup/public_html/training/`, using the intended `apexpetgroup` account.** On a standard cPanel filesystem the absolute path is `/home/apexpetgroup/public_html/training/`; confirm the account's actual home and domain document root in cPanel Domains. The user corrected the earlier `apexpetg` account name. That earlier account is not the intended destination.

After the corrected release was uploaded, the open cPanel File Manager still showed home `(/home/apexpetg)`, and its `public_html/training` listing contained `store-training-20fa5bac6739.zip` plus the extracted files. Public `/training/index.html` still returned 404. To check the account before another extraction, look at the File Manager left tree: its home must show `(/home/apexpetgroup)` (or the hosting provider's confirmed equivalent), and the cPanel Domains page must identify the document root that serves the existing public Apex homepage.

1. Open the hosting account serving the existing public Apex website. The public domain resolved to `92.205.168.105` on 26 October 2026. The inspected `apexpetg` account on `cp71.domains.co.za` uses `169.239.218.71`; its visible upload did not establish publication on the public server. Confirm the `apexpetgroup` account and active domain document root before uploading.
2. Back up only the existing `training/` folder, if present. Open/create `training/` within the existing website's document root. Preserve its parent website files and configuration.
3. Upload the ZIP named in `dist/latest-release.json` into that `training/` folder. Extract **there**, without adding another enclosing folder. The result must be `training/index.html`, `training/assets/` (including `assets/products/`), `training/css/`, `training/js/`, `training/manifest.json`, `training/service-worker.js`, `training/.htaccess` and `training/release-manifest.json`. Show hidden files to check `.htaccess`. Use normal directory permissions 0755 and file permissions 0644.
4. Open https://apexpetgroup.co.za/training/index.html and https://apexpetgroup.co.za/training/ in a fresh browser session. Both must return the training page. `/training` should redirect to `/training/`. Check `/training/css/styles.css`, `/training/js/app.js`, `/training/assets/apexlogo-mark.png`, `/training/manifest.json` and `/training/service-worker.js` individually. A missing explicit `index.html` is a hosting/routing problem, not a CSS/JS path problem.
5. Test all seven menu screens and the puppy guide. After the first successful online load, reload, then test offline. Check an existing PWA as well as a fresh browser. The worker scope must be exactly `https://apexpetgroup.co.za/training/`; manifest start URL and scope must be `/training/`. External fonts and analytics require connectivity.
6. Validate the separate GA4 property `G-6TZ2T58GQD` after choosing analytics consent; follow [ANALYTICS.md](ANALYTICS.md). Localhost is deliberately excluded from GA4.

The archive is root-flat and contains the homepage exit link, 36 Farmina pack shots, and the shop-floor **Help a customer** guide. Check `dist/latest-release.json` for its content-derived name and SHA-256 after each build.

Do not extract into `public_html` itself, replace the main site's `index.html`, change its document root to `training/`, or point DNS at the other account to make this upload appear. No root configuration change is required by this package. The supplied `.htaccess` belongs only inside `training/`.

If the explicit HTML URL still returns 404, give the host this request:

> Please identify the HTTPS virtual host serving apexpetgroup.co.za on 92.205.168.105 and confirm its effective DocumentRoot and hosting account. The intended account is apexpetgroup, with the training application inside the existing site's public_html/training directory. Another account named apexpetg on cp71.domains.co.za (169.239.218.71) contains an upload, while the public /training/index.html returns 404. Confirm whether any proxy/alias connects those servers. Locate the training files in the active document root, and inspect the matching access/error log entry and applicable parent rewrite/proxy rules for GET /training/index.html. Preserve the main website and its root configuration; explain any proposed routing change before applying it.

See [hosting evidence and verification](HOSTING-DIAGNOSIS-2026-10-26.md).
