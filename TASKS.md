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

## Needs Deon

- [ ] Test the responsive build on a physical Android phone and tablet, including the voice widget position
- [ ] Upload the latest release ZIP from `dist/` to `public_html/training/`
- [ ] Spot-check five transcribed values against the guide images (listed in chat, 30/10/2026)
- [ ] Supply guides: Quinoa Duck Skin & Coat Medium & Maxi (P0024), Ancestral Grain Light Mini (P0013)
- [ ] Decide the six card figures that conflict with the price list (docs/RRP-AND-RESOURCE-VERIFICATION-2026-10-30.md)
- [ ] Keep or remove two unsourced Tips claims (heart-study wording; "48%+ vs 15–20%")
- [ ] Widget UX choice for in-between weights (pick printed weight vs show neighbouring rows)

## Next improvements

- [ ] Ocean and Prime quizzes
- [ ] Store supplier codes against each SKU so price checks match exactly
- [ ] Apply the engine fixes so the Shopify widget matches the printed guides
