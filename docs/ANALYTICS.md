# Store training analytics

The training application uses the separate GA4 measurement ID **G-6TZ2T58GQD**, supplied by the owner on 26 October 2026. The Apex homepage's property is not configured by this app.

## Collection behaviour

- `js/analytics.js` loads before feature scripts. It loads Google's tag only after the visitor allows analytics, on HTTPS at `apexpetgroup.co.za/training/` or the equivalent `www` hostname.
- Localhost and Vercel previews do not load Google or emit events. There is no URL parameter that enables production tracking on previews.
- The visitor can reopen **Analytics choices** in the Products header, decline, or allow. Choices persist in localStorage when it is available. Declining disables this property's measurement and expires only this app's prefixed cookies.
- Advertising consent remains denied. Google Signals and advertising personalisation are disabled in the tag configuration.
- Cookies use the `apex_training` prefix, a host-only domain and `/training/` path. The app's consent key is `apex-training-analytics-consent-v1`.
- Raw search text, entered weight, entered price, personal names and email addresses are not application event parameters. Page/referrer query strings are removed, apart from our fixed virtual `screen` value. Campaign parameters are consequently not preserved by this implementation.
- Google's normal web analytics still processes browser/session/device/network metadata. This implementation is not a named employee attendance or certification system.
- Activities before consent or while offline are dropped. There is no persistent analytics queue or retrospective upload. Advertising blockers and network failures can also reduce coverage.

## Events

All events target only `G-6TZ2T58GQD`. Feature events include the current `training_screen`.

| Event | Trigger | Other parameters |
| --- | --- | --- |
| `page_view` | Initial consented screen and effective tab changes | `page_location`, `page_title`, `page_referrer` |
| `product_view` | Product details expanded | `product_id`, `product_line`, `pet_type` |
| `ingredient_view` | Ingredient detail opened | `ingredient_id` |
| `quiz_start` | Quiz started or retried | `quiz_line`, `question_count` |
| `quiz_complete` | Results displayed | `quiz_line`, `score`, `question_count` |
| `calculator_used` | Calculation produces a positive finite result | `pet_type`, `product_id` (`custom` when none selected) |
| `matcher_start` | Matcher opened or reset | None |
| `matcher_complete` | Concern selected and results shown | `pet_type`, `life_stage`, `concern`, `result_count` |
| `buddy_start` | Help a customer opened | None |
| `buddy_complete` | Product starting points shown | `result_count` |
| `voice_widget_requested` | Visitor asks to load the ElevenLabs widget | None |
| `search_used` | Nonempty knowledge search pauses for 700 ms | `search_surface`, `result_count` |
| `tip_view` | Selling-tip category expanded | `tip_index` |

`search_used` covers the knowledge-base screen and search overlay. The product and ingredient filter text fields are not separately tracked. A matcher completion means results were shown; it can have zero results.

Virtual page locations are `/training/?screen=catalog`, `?screen=quiz`, etc. These are analytics labels; the implementation does not add deep-link navigation. Automatic initial pageviews are disabled with `send_page_view: false` to avoid duplicate counts. Re-clicking the active tab does not create a new view.

The conversation guide records starts, completions and result counts only. Pet profile, recipe choices and any customer details are not sent in its events.
The voice widget event records the request to load it, not call audio, transcripts or agent answers. ElevenLabs has its own data-handling settings; GA4 consent does not control a voice conversation.

## GA4 property setup after deployment

These are dashboard actions still to perform; this session did not change the GA account.

1. Confirm this measurement ID belongs to the intended training web stream and its website URL is `https://apexpetgroup.co.za/training/`.
2. Review Enhanced Measurement. This app sends manual screen pageviews. Disable history-based automatic pageview tracking if enabled; for strict control of collection, disable other automatic interaction measurements and use the explicit events above.
3. Register event-scoped custom dimensions needed in reports: `training_screen`, `product_id`, `product_line`, `pet_type`, `ingredient_id`, `quiz_line`, `life_stage`, `concern`, and `search_surface`. Register numerical custom metrics as needed for `score`, `question_count` and `result_count`. `tip_index` can be registered as a dimension if category breakdowns are wanted.
4. Mark `quiz_complete` as a key event if a completed quiz is the desired outcome.
5. In a fresh production browser session, allow analytics and open several tabs. Check Realtime and use Tag Assistant/DebugView for detailed validation. `debug_mode` is deliberately not enabled for all visitors.
6. Confirm one view per screen change, one completion per quiz result, correct event parameters and the correct destination ID. Verify a declined session makes no initial Google tag request. Verify withdrawal stops further application events.
7. Publish or update the site's explanation of training analytics and its purpose through the owner's normal process. The choice UI is a technical control, not a legal compliance assessment.

Suggested first reports: screens visited; product/ingredient interest; quiz starts versus completions and score distribution; calculator usage; matcher completions and zero-result rate; returning visitors and engagement. Per-person completion records would need a separate identity/progress design.

## Local verification

From the application directory:

```powershell
node --test tests/analytics.test.cjs
```

The suite uses Node's built-in runner and no third-party packages. Google transport and browser storage are mocked; passing these tests does not prove Google received production events.

The isolated local consent preview is in `../../assessment-2026-10-26/preview.cjs`. Run it from the workspace parent with `node assessment-2026-10-26/preview.cjs`, then visit `http://127.0.0.1:4173/training/_consent-preview.html`. It serves a local substitute for Google's transport and must never be deployed.

## Official implementation references

- [Google: single-page application measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
- [Google: manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Google: consent configuration](https://developers.google.com/tag-platform/security/guides/consent)
- [Google: cookie and page configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
