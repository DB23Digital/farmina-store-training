# Help a customer — first release

The Products screen opens an offline conversation guide. Staff select dog or cat, the displayed life-stage profile, dog breed size where relevant, and a recipe preference. The result shows up to two product families to compare, a pack photo where an exact source record is known, the product line and protein, and a link to the existing catalogue card.

The guide uses a reviewed shortlist in `js/buddy.js`. Product IDs must resolve through `CATALOG_LINKS`, the identity-checked Farmina source records, and valid pack data. When any of those checks fail, the product disappears from the guide. The first release includes everyday Prime, Ocean, Pumpkin and Low Ancestral Grain products. Specialised Quinoa Skin & Coat and Urinary products remain available in the catalogue but are not suggested by this general conversation guide.

Mini and Medium/Maxi pack sizes are shown only when the source data has a separate product record with that breed-size label. Some Pumpkin recipes share one source record across pack sizes; those results explicitly ask staff to confirm the exact physical bag. An unknown dog breed size also suppresses pack-specific guidance. The guide does not infer breed size from bag weight or photograph.

Results are starting points based on product identity, life stage and recipe preference. They do not diagnose conditions or establish allergy suitability. Staff should review the complete composition and seek veterinary advice for allergies or ongoing health concerns. The result does not display the dated price snapshot; staff should check the current shelf price.

GA4, when consented on production, records only `buddy_start`, `buddy_complete` and the number of results. Customer answers are not analytics parameters or stored locally. The guide adds no login, backend or AI model.

Run `node --test tests/buddy.test.cjs tests/analytics.test.cjs tests/foundation.test.cjs` to check the shortlist, source identity, breed-size behaviour and event privacy. The release package includes `js/buddy.js` in the scoped service-worker cache for offline use.
