# Farmina pack shots and price check — 26 October 2026

The catalogue shows 22 product cards built from 31 explicit Farmina source records. Each source record already had a South African Farmina product URL, except five Pumpkin records with blank URLs. Those five were matched to Farmina `/za` Mini pages by stable product ID; their 12 kg offers and Medium/Maxi images were checked on five separate `/za` pages. The [source audit](../../assessment-2026-10-26/farmina-source-audit.json) records all 36 pages, image URLs, offers and individual pack comparisons.

The release includes 36 local Farmina pack photos (400×600 source images, 11.7 MB total) and [image provenance with SHA-256 checksums](../assets/products/sources.json). The card image follows its selected source record. For the five Pumpkin cards, choosing a 12 kg bag switches to its Medium/Maxi photo. Photos are precached under `/training/` so the app can display them offline after the worker installs. The images identify the product formula and breed size; the photo need not depict the selected bag's exact weight.

Farmina's live South African product offer data matched **74 of 75** training prices by the same product page and pack size. No conflicting prices were found. The single unresolved row is **P0019 / S0044, N&D Prime Chicken & Pomegranate Puppy Mini, 7 kg, R1349**. Farmina's current `/za` Mini page did not publish a 7 kg offer, so the R1349 snapshot value remains unverified by that source. The Apex Shopify storefront lists a 7 kg Mini variant at R1349 but its supplier SKU is blank; that listing does not close the identity gap. No application price was silently changed. Update 30/10/2026: the June 2026 RRP workbook lists this pack as `PND 0700081` at R1349, and all 75 app prices match its column G. See [RRP and resource verification](RRP-AND-RESOURCE-VERIFICATION-2026-10-30.md).

The check establishes agreement with Farmina's current public retail pages for 74 rows. It is not an independent reconciliation to an approved supplier RRP workbook. For that, match the verified supplier SKU **and pack size** to the current approved workbook, report exceptions, then read back any price edits. Never map internal `S...` IDs or barcode/EAN to supplier SKUs by guesswork.

To refresh the evidence without a model doing 36 repetitive lookups:

```powershell
node scripts/audit-farmina-source.cjs ../assessment-2026-10-26/farmina-source-audit.json
node scripts/sync-farmina-images.cjs ../assessment-2026-10-26/farmina-source-audit.json
python tests/package.test.py
node scripts/check-release.cjs
```

Review the audit's `exceptions` before price updates. The scripts validate that image URLs are on Farmina's own domain, download real image bytes, and record hashes. They generate local image paths and never write prices.

For occasional missing-page identity decisions, use **GPT-6 Luna with low reasoning effort** on a short exception list, then manually verify the source page and pack. Use **GPT-6.1 Sol at medium effort** only when identity or price evidence conflicts. The code and exact comparisons handle routine rows. This follows [official OpenAI model selection guidance](https://developers.openai.com/api/docs/guides/model-selection).
