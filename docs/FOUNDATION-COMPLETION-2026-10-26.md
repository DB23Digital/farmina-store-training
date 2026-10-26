# Local deployment foundation — completion record

Superseded deployment URL/package: the owner subsequently changed the target to `https://apexpetgroup.co.za/training/`. The earlier release and verification evidence below are historical. Use the [URL-change record](URL-CHANGE-2026-10-26.md) for the replacement package.

Completed locally on 26 October 2026, branch `codex/store-training-deployment-foundation`. The branch started at the existing HEAD after a successful main-reference fetch showed no divergence. All pre-existing uncommitted work was retained. The workspace's `assessment-2026-10-26/foundation-before.zip` is the pre-work snapshot (SHA-256 `cd71356aa43a55a407d979548f90d899616edbfb658a7f89e301256c1aac268e`). No commit, push, live deployment or account configuration was performed.

## Implemented

- Added the exact supplied Apex logo and the visible **Training powered by Apex Pet Group** masthead on all seven screens. Preserved Farmina branding. Enabled browser zoom and wrapped mobile catalogue filters so every group is visible.
- Replaced runtime name scoring with explicit links between 22 display cards and 31 source records. Source identity changes, invalid SKU/pack data and contradictory same-size prices fail closed. Calculator choices include only validated source records.
- Corrected the five matcher stage mismatches by removing unsupported entries and adding a species/stage eligibility check. No replacement product suitability was invented. The allergy flow now explains how to review complete ingredients and makes no allergy recommendation from headline proteins.
- Rebuilt the two supplied puppy tables from their PDF sources, with source hashes. There are 168 exact cells: 152 numeric dosages and 16 Adult-food transition cells. The old CSV had only 131 numeric rows. The JSON is served and precached from the correct asset path.
- Added exact product/age/expected-adult-weight selection, with a required Maxi breed choice for the Prime Maxi PDF. Unsupported products, missing cells, Adult transitions and unavailable tables do not silently fall back to a formula.
- Retained the existing adult estimate constants, labelled their output as estimates, rejected invalid weight/energy/price/size values, and disabled that path for known puppy/kitten products. Results identify the actual source used. No new feeding methodology was asserted or approved.
- Retained the separate consent-controlled GA4 property `G-6TZ2T58GQD` and existing event schema. Entered age, weight, price and search text are not added to analytics parameters.
- Added scoped Apache configuration, deterministic runtime packaging, a file checksum manifest, a content-derived release cache identity, and a local release checker.

## Executed verification

| Check | Result |
| --- | --- |
| Node application tests | 22 passed |
| Python package test | Passed; two builds produced identical ZIP checksums |
| Staged release verification | 48 runtime file hashes verified; 13 JS files including the worker parse; 18 HTML asset references exist |
| Local HTTP smoke check | All 23 precached URLs returned HTTP 200 |
| Source-data preservation | `js/farmina-data.js` is byte-identical to the pre-work snapshot; prices/nutrition were not rewritten |
| Browser layout | Apex logo/heading checked at desktop width and 390 × 844; mobile filters wrap |
| Browser calculator | Exact Ancestral source cell at 4 months / 40 kg expected adult weight returned 355 g; with a 12 kg bag at R1549, the application calculated R45.82/day |
| Browser unsupported mode | Puppy product in adult-estimate mode showed an inline message and hid the result |
| Browser field visibility | Metabolic-energy field has no layout box in guide mode after the independent-review fix |
| Cached launch | After stopping the local server and confirming an uncached HTTP request failed, the browser reloaded the application with 22 cards and seven screens; the supported guide's eight age options, including its placeholder, were still available |
| Diff hygiene | `git diff --check` passed |

The cached-launch check does not claim a full network-off iOS/Android matrix. A further offline calculator button sequence was not completed reliably through the browser controls. Exact calculation behaviour is covered by the online browser result and focused tests.

## Review

An independent manual source review found the conflicting `display`/`hidden` treatment of the metabolic-energy field. It was fixed and the browser confirmed the field is hidden in guide mode. The final delta also received an independent read-only check with no further retained actionable findings. See [review coverage and limitations](reviews/2026-10-26-foundation-manual-review.md).

The formal Compound Engineering review pipeline was not completed: the Windows Bash probe returned `E_ACCESSDENIED`, and the remaining external/multi-stage workflow was not pursued for this local package task. No formal completion receipt or external-model review is claimed.

## Prepared artifact

Release ID: `9cacc75c1611`.

- Archive: `dist/store-training-9cacc75c1611.zip`.
- Archive SHA-256: `35dfc2a16311b4a1399f93ebf1d01b62a97abc432e389449ea53faafb16c8ff8`.
- Staging directory: `dist/store-training-9cacc75c1611/`.
- The ZIP contains 49 entries: 48 runtime files plus `release-manifest.json`.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for extraction into `public_html/store-training/` and the subsequent live checks. Never upload the workspace parent or the assessment snapshots.

## Remaining production checks

Internal identity validation is complete for the existing snapshot. Current manufacturer/guide edition applicability and supplier SKU/pack identity still need authoritative sign-off; synthetic training SKU IDs do not establish supplier SKU identity. Prices and nutrition were deliberately preserved. Named employee progress/certification remains a separate feature.

Apache header behaviour, production asset paths, physical Android/iOS installation, and receipt of events in the separate Google Analytics property remain live verification steps. This session did not deploy the package or change GA settings.
