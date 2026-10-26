# Store training status — 26 October 2026

This is the current handoff for the static training application. The deployment target is `https://apexpetgroup.co.za/training/`, with the ZIP extracted directly into the active `apexpetgroup/public_html/training/` directory. The main website's `public_html/index.html` and root configuration are outside this application.

## Ready in the local source

- Seven training screens, Apex branding and a homepage exit link; scoped `/training/` manifest and service worker.
- Explicit links between 22 display cards and 31 catalogue source records. Invalid or changed identity and contradictory pack prices fail closed. The source price and nutrition snapshot has not been rewritten.
- 36 local Farmina pack shots with provenance and checksums. The public `/za` offers matched 74 of 75 displayed prices by product page and pack size; P0019 / S0044, Puppy Mini 7 kg at R1349, remains unverified by that source. This is not an approved supplier-RRP reconciliation.
- Two exact supplied puppy feeding tables, a labelled adult estimate, and matcher eligibility safeguards. Unsupported cells and young-product estimates do not silently fall back.
- Offline **Help a customer** product guide. The optional **Ask by voice** control loads the owner-supplied ElevenLabs widget only after a tap; it does not pass catalogue/customer data or start a microphone call. Voice requires internet.
- Consent-controlled GA4 activity events for the separate `G-6TZ2T58GQD` property. The application does not record named staff progress or send voice transcripts to GA4.

See [sales buddy limits](SALES-BUDDY.md), [voice setup](VOICE-AGENT.md), [analytics setup](ANALYTICS.md), [pack shots and prices](PRODUCT-IMAGES-PRICE-AUDIT-2026-10-26.md), and [deployment instructions](DEPLOYMENT.md) for the supporting detail.

## Current local verification

- `node --test tests/analytics.test.cjs tests/buddy.test.cjs tests/foundation.test.cjs tests/voice-agent.test.cjs`: 34 passed.
- `python tests/package.test.py`: passed; builds are deterministic and the ZIP extracts with `index.html` at its top level.
- `node scripts/check-release.cjs`: passed, checking 88 runtime checksums, 16 scripts, 21 HTML asset references, 36 product images and 64 precache entries. No HTTP smoke checks were requested in this invocation.
- Candidate release: `dist/store-training-db649417f126.zip`, SHA-256 `e317d8eb7b9e5a2e6fdded7e2b667a188c2d515dd3d2e10377042fea50807086`. `dist/` is ignored by Git; regenerate with `python scripts/package.py` after cloning.

Earlier local browser checks covered the main training screens, a supported puppy guide calculation, offline app launch and pack images. They do not establish production behaviour. A later in-app browser crashed while loading the ElevenLabs widget. A normal Chrome check stopped when the computer-use tool could not verify the current browser URL. The actual voice conversation, microphone permission and mobile widget layout remain unverified. No call was made.

## Production checks still open

1. Confirm that the domain's effective document root is the intended `apexpetgroup` account. The earlier 404 investigation found the public site and an inspected `apexpetg` cPanel account on different IPs; files in that other account did not become public at `/training/`. The latest live status was not established in this handoff. See [hosting evidence](HOSTING-DIAGNOSIS-2026-10-26.md).
2. Before uploading this candidate, test the voice control in a normal desktop and phone browser. In ElevenLabs, confirm the agent is public, the Apex domain is allowed, its product knowledge is current, and its audio/transcript settings are acceptable. Check that it declines unknown prices and product claims.
3. If approved for production, extract the ZIP in the training directory only, then test the page, CSS/JS, images, navigation, worker update and offline guide on the actual HTTPS host. Test both a fresh session and an installed PWA.
4. Confirm current supplier SKU and pack-size authority before any price change; resolve the one unverified public-page offer. Check feeding-guide edition and formula authority with the owner.
5. Complete GA4 web-stream configuration and verify consented events in Realtime/DebugView, plus no tag request before consent. Analytics receipt has not been proven on the live site.

This status describes local source and package verification. It is not a claim that this candidate ZIP is installed on the live website.
