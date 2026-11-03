# Store training: open work

Updated 03/11/2026. Source of truth for in-progress work on this repo.

## Done (30/10/2026)

- [x] Matcher rebuilt on declared composition and claims; allergy exclusion filter; Ingredients condition panels fixed
- [x] All 75 prices verified against column G of the June 2026 RRP workbook (no changes needed)
- [x] Quiz, tips and card copy corrected to name only products in the price list
- [x] 34 Farmina feeding guides wired into the calculator (puppy, adult/cat, kitten); 9 image tables read twice and locked by SHA-256
- [x] Calculator shows printed guide amounts only: product required, no formula estimate, no generic bag sizes
- [x] Weights between printed rows show both printed rows; weights outside them get no amount
- [x] Products pet filter: Dog, Cat, Reset
- [x] Shopify widget fixes documented in apex-feeding-engine/docs/FEEDING-GUIDE-ACCURACY-FIXES.md (not actioned)

## Done (03/11/2026)

- [x] Responsive layout for tablet and desktop, phone layout kept as the base
- [x] Products filters: Pet narrows Life Stage, Pet and Life Stage narrow Line, all from catalogue data
- [x] Fixed: pack-size tap toggled the card; search product result left the overlay open; jumps to a filtered-out product did nothing; 320px Ingredients overflow; installed app locked to portrait

## Two-week list (03/11/2026)

- [x] Six card figures now follow the approved workbook
- [x] Two unsourced Tips claims removed
- [x] Ocean and Prime quizzes added
- [x] Quiz progress saved on the device
- [x] Version shown in the header; the app updates itself when opened online
- [x] Catalogue lists all 36 products from the Shopify master, with a Kibble Size filter
- [x] Ingredient percentages limited to the price list, pack-label source and Farmina ZA pages
- [x] Protein figures checked against all 36 Farmina ZA product pages (docs/FARMINA-WEB-VERIFICATION-2026-11-03.md)
- [ ] Confirm GA4 receipt in Realtime or DebugView (Deon)
- [ ] Shadow 5 salespeople in store (Deon)

## Needs Deon

- [ ] Upload docs/VOICE-AGENT-KNOWLEDGE.md to the ElevenLabs agent, add https://farmina.com/za/ as a reference, and paste the prompt from docs/VOICE-AGENT.md

- [ ] Spot-check two or three real bags against the Shopify master, starting with the Urinary cat
- [ ] Reconcile two master SKUs with the price list: Quail Medium & Maxi 7 kg (PND 0700087 vs PND0700034) and Prime Puppy Mini 7 kg (PND 0700081 missing). The Farmina pages show no SKU codes

- [ ] Test the responsive build on a physical Android phone and tablet, including the voice widget position
- [ ] Upload the latest release ZIP from `dist/` to `public_html/training/`
- [ ] Spot-check five transcribed values against the guide images (listed in chat, 30/10/2026)
- [ ] Get the two missing feeding guides, from the bag or Farmina: Quinoa Duck Skin & Coat Medium & Maxi (P0024) and Ancestral Grain Light Mini (P0013). Until then the calculator says to use the guide on the bag. The two PDFs added on 03/11/2026 (`1031_03_...` and `112_15_...`) are copies of guides already in use, so they do not fill this gap. Farmina's Light Mini page links the Medium & Maxi file `112_15`, which starts at 10 kg
- [ ] Widget UX choice for in-between weights (pick printed weight vs show neighbouring rows)

## Next improvements

- [ ] Store supplier codes against each SKU so price checks match exactly
- [ ] Apply the engine fixes so the Shopify widget matches the printed guides
