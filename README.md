# Farmina SA Staff Training Guide

Mobile-first PWA for Farmina Pet Foods SA instore staff. Core training screens work offline after first load; analytics, external fonts and uncached supporting documents require a connection.

The Products screen includes **Help a customer**, an offline conversation guide for pet profile, breed size where applicable, and recipe preference. It presents up to two product families to compare. See [sales buddy scope and data limits](docs/SALES-BUDDY.md).

The **Ask by voice** button loads the owner-supplied ElevenLabs agent only after a tap. It needs a connection and is separate from the offline guide and GA4 consent. See [voice agent setup and live checks](docs/VOICE-AGENT.md).

Current handoff: [project status, local checks and production work](docs/PROJECT-STATUS-2026-10-26.md). Earlier deployment review: [26 October 2026](docs/DEPLOYMENT-REVIEW-2026-10-26.md). Analytics configuration and remaining GA4 dashboard setup: [ANALYTICS.md](docs/ANALYTICS.md).

Deployment foundation implementation: [build/upload instructions](docs/DEPLOYMENT.md) and [completion record](docs/FOUNDATION-COMPLETION-2026-10-26.md). The earlier dated assessment remains the original findings record.

Current pack-shot provenance and price comparison: [Farmina source audit](docs/PRODUCT-IMAGES-PRICE-AUDIT-2026-10-26.md). The top-right “Log out” link returns to the main Apex homepage; this static site has no account login session.

---

## Deploying to cPanel / public_html

Use the [current cPanel installation instructions](docs/CPANEL-INSTALLATION.md) and [hosting diagnosis](docs/HOSTING-DIAGNOSIS-2026-10-26.md). The intended account is **apexpetgroup**, not the previously inspected **apexpetg** account. Confirm the active public website's document root before extraction.

1. Log in to cPanel and open **File Manager**.
2. For the Apex deployment, create/open `apexpetgroup/public_html/training/` in the correct account (normally `/home/apexpetgroup/public_html/training/`), corresponding to `https://apexpetgroup.co.za/training/`.
3. Upload the application runtime files into that directory, preserving relative paths:
   ```
   index.html
   manifest.json
   service-worker.js
   css/       (all styles)
   js/        (all application scripts, including analytics.js)
   assets/    (all icons, logo and supporting feeding-guide documents)
   ```
   Do not upload `.git/`, `.vercel/`, `tests/`, `docs/`, agent configuration or workspace assessment/backups. Do not upload the parent `farmina_data/` source folder. There is no application build step.
4. The service worker **requires HTTPS** to activate. Confirm HTTPS, the directory's trailing-slash redirect, and HTML/worker cache revalidation on Apache. `vercel.json` does not configure cPanel/Apache.
5. Open the URL in Chrome on mobile, tap the browser menu → **Add to Home Screen** to install as a PWA.

> Packaged releases get a new content-derived cache name whenever runtime files change. The development source uses `apex-training-v13`. Check an existing installation after activation and reload, as well as a fresh session.

GA4 uses the separate training property `G-6TZ2T58GQD`, loads only on the Apex production training path after consent, and tracks virtual screens and feature activities. Local and Vercel preview use is excluded. Complete the [analytics validation](docs/ANALYTICS.md) after deployment. The dated deployment review lists unresolved calculator/matcher issues to address before release sign-off.

---

## Updating product data

Display definitions live in **[js/products.js](js/products.js)**. Prices/SKUs live in `js/farmina-data.js`; `js/catalog-links.js` explicitly links their identities. Changed or missing links suppress pricing instead of guessing a match. New entries need a reviewed source link as well as a display definition.

### Add a new product
Copy an existing entry and change the fields:
```js
{id:'q8', line:'quinoa', lineName:'N&D Quinoa', pet:'dog', stage:'adult',
 name:'New Flavour', variant:'Adult Dog', icon:'🐕',
 protein:'Italian Free-Range Chicken',
 nutrition:{protein:30, proteinAnimal:96, fat:18, moisture:9},
 macros:{meat:'75%', grains:'0%', fruits:'22%', legumes:'3%', fresh:'46%'},
 highlights:['GMO Free','Meat Meal Free','Grain Free'],
 composition:'Full ingredient list here...',
 suitable:'All breeds and all life stages.',
 sizes:['2.5kg','7kg'],
 sell:'Your selling point here.'},
```

### Edit an existing product
Find the product by its `id` (e.g. `l2` = LAG Adult Dog) and update any field directly.

### Protein bar display
The Crude Protein bar width is calculated as `protein / 50 * 100` (capped at 100%). So a product with 50%+ crude protein will show a full bar. The "From Animal" bar uses `proteinAnimal` directly as a percentage (0–100).

---

## Updating calculator pricing

The calculator uses validated SKU prices from `js/farmina-data.js` or a manually entered bag price. The current dataset is a June 2026 snapshot. Establish exact supplier SKU and pack-size identity before reconciling or changing it; the training application's `S...` IDs are not supplier SKUs. Keep price authority, effective dates and exceptions documented.

After reviewing a runtime change, build with `python scripts/package.py`. The packaged worker gets a content-derived cache identity, so no manual version change is needed for a packaged deployment. Use [DEPLOYMENT.md](docs/DEPLOYMENT.md) for verification and upload.

---

## Adding or replacing the logo

Replace `assets/logo.png` with the new file (keep the same filename). The logo displays at 46×46 px in the header — any square or circular image works well.

---

## Tech notes

- No framework, no npm, no build step required.
- Fonts load from Google Fonts (requires internet on first load; cached by the browser thereafter).
- All product, ingredient, quiz and tip data is embedded in the JS files — no server or API needed.
- The service worker caches all local assets on first load, enabling full offline use.
