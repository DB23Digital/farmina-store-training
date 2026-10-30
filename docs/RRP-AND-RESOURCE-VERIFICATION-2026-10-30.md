# RRP and product-resource verification — 30/10/2026

Scope: compare every training price with column G ("Retail Price Incl VAT") of `docs/Farmina RRP Prices June 2026.xls`, check that each product in the range has its pack photo and feeding guide, and list factual errors found in training copy. No price, product or copy was changed by this check.

## Source workbook

- One sheet, named `Q1 2026`. The title row reads "Farmina Dealer prices June 2026". The file was last saved on 23/10/2026.
- 75 rows carry a supplier product code (`PND…`/`PLG…`), UPC, kibble class, bag size and a column G price. One further row, Quinoa Quail 12 kg, has no code and a blank column G.

## Identity basis

The app's source records (`P0001`–`P0031`, `S0001`–`S0075`) do not store supplier codes or UPCs. Each workbook row was therefore mapped by an explicit table using workbook section (range and species), recipe and life stage, kibble class (`mini`, `med/max`, `cat`, `kitten`) and bag size. The mapping is one-to-one: every row maps to exactly one app record, and no app SKU is left unmapped. It is still a description-based identity, not a supplier-SKU identity. Storing the supplier code against each `S…` SKU would make future checks exact.

## Price result: 75 of 75 match

Three independent reads agree:

1. **Visual read** of the exported sheet against each app record.
2. **Scripted comparison** of exported text with the explicit mapping, in both directions: 75 matches, 0 differences, 0 unmapped, 0 app-only SKUs.
3. **Raw Excel cell values** read through Excel itself: 75 priced rows, no non-integer values, total R67,161. That equals the total of the 75 app prices, and the two price lists are identical as multisets.

The row the October audit could not verify, **P0019 / S0044 Prime Chicken & Pomegranate Puppy Mini 7 kg R1349**, appears in the workbook as `PND 0700081`, UPC `8010276040282`, R1349.

All 22 catalogue cards list "Available Sizes" that equal their priced packs.

Not covered: the workbook's own authority and currency. The title says June 2026 while the sheet tab says Q1 2026. Confirm with the supplier that this is the current approved RRP list.

## Pack photos

All 31 source records have a local pack photo (`assets/products/P0001`–`P0031`). The five Pumpkin dog records also have a separate Medium/Maxi photo (`-large`). Provenance is in `assets/products/sources.json`, per the October audit.

## Feeding guides

There are 23 supplier PDFs in `assets/feeding-guides/`. Only two are used by the calculator, as exact tables: Prime Puppy Maxi (`P0020`) and Ancestral Puppy Medium/Maxi (`P0010`). The PDF text was read to confirm each guide's product:

| Source record(s) | Product | Guide PDF |
|---|---|---|
| P0009 | Ancestral Puppy Mini | `nd-ancestral-grain-canine-chicken-puppy-mini.pdf` |
| P0010 | Ancestral Puppy Medium/Maxi | `nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf` (in calculator) |
| P0011 | Ancestral Adult Mini | `nd-ancestral-grain-canine-chicken-adult-mini.pdf` |
| P0012 | Ancestral Adult Medium/Maxi | `nd-ancestral-grain-canine-chicken-adult-medium-maxi.pdf` |
| P0013 | Ancestral Light Mini | **missing** |
| P0014 | Ancestral Light Medium/Maxi | `nd-ancestral-grain-canine-chicken-light-medium-maxi.pdf` |
| P0015, P0016 | Ocean Cod Adult Mini, Medium/Maxi | `nd-ocean-canine-cod-pumpkin-orange-adult-mini.pdf`, `…-medium-maxi.pdf` |
| P0017, P0018 | Ocean Cod & Cantaloupe Puppy | **missing** |
| P0019 | Prime Puppy Mini | `nd-prime-canine-1- chicken-puppy-mini.pdf` |
| P0020 | Prime Puppy Medium/Maxi | `nd-grain-free-canine-2-chicken-puppy-maxi.pdf` (Maxi only; in calculator) |
| P0021, P0022 | Prime Adult Mini, Medium/Maxi | `nd-grain-free-canine-3-chicken-mini.pdf`, `nd-grain-free-canine-4-chicken-medium-maxi.pdf` |
| P0023–P0026 | Quinoa Skin & Coat Quail, Duck | **missing** |
| P0027 | Pumpkin Chicken Adult | `nd-pumpkin-canine-3-chicken-mini.pdf`, `nd-pumpkin-canine-4-cicken-medium-maxi.pdf` |
| P0028 | Pumpkin Chicken Puppy | **missing** |
| P0029 | Pumpkin Boar Adult | `nd-pumpkin-canine-5-wild.boar-mini.pdf`, `…-6-wild-boar-medium-maxi.pdf` |
| P0030 | Pumpkin Lamb Adult | `nd-pumpkin-canine-7-lamb-mini.pdf`, `…-8-lamb-medium-maxi.pdf` (the second is in Italian) |
| P0031 | Pumpkin Lamb Puppy | **missing** |
| P0001 | Ocean Herring & Orange cat | `nd-ocean-feline-herring-orange.pdf` |
| P0002–P0006 | Prime cat: kitten, chicken, boar, lamb, neutered | `nd-prime-feline-1`…`5` |
| P0007 | Pumpkin Neutered Lamb cat | **missing** |
| P0008 | Quinoa Urinary Duck cat | **missing** |

Notes on guide identity:

- The `nd-grain-free-canine-2/3/4` guides are titled "N&D Grain Free Chicken & Pomegranate". The app treats them as Prime, the current name for that recipe. A supplier should confirm the rename.
- The Pumpkin dog and Prime cat PDFs do not print a product name in their text layer. Their identity rests on the filename and calorie content only.

**Missing:** 10 of 31 source records have no supplied guide (P0013, P0017, P0018, P0023–P0026, P0028, P0031, P0007, P0008).

## Decisions (30/10/2026)

- Deon confirmed the workbook is the latest approved list, and that Prime is the correct current name for the "N&D Grain Free" guides.
- Training copy must never name a product outside the price list. The corrections below are applied, and `tests/content.test.cjs` guards against the known out-of-range names.
- The calculator's "38% lower cost per day" panel is approved as it stands.
- Deon will add the missing feeding guides to `assets/feeding-guides/`.

## Card figures that conflict with the approved list (open)

The workbook gives each recipe as "X% of protein from animal sources / Y% meat & fats". Most cards agree, or differ only by rounding. These cards disagree and are unchanged until the correct source is confirmed:

| Card | Card shows (animal protein / meat & fats) | Approved list |
|---|---|---|
| dp3 Pumpkin Lamb Puppy | 96% / 70% | 96% / 75% |
| dp4 Pumpkin Chicken Puppy | 96% / 68% | 96% / 75% |
| dq1 Quinoa Quail Skin & Coat | 92% / 55% | 92% / 51% |
| dq2 Quinoa Duck Skin & Coat | 92% / 55% | 92% / 51% |
| cp3 Prime Lamb & Blueberry cat | 98% / 85% | 98% / 86% |
| cq1 Quinoa Urinary cat | 98% / 85% | 94% / 70% |

## Training copy that contradicted the product range (corrected 30/10/2026)

Also corrected: the Quinoa Skin & Coat cards said "all life stages" (now adult dogs, per the approved list); quiz distractors named Senior, Indoor, Salmon, Tuna and Trout; a Tips upsell recommended wet food, which is not in the list; and a Tips line said "probiotics" where Farmina uses prebiotics.

These statements conflict with `assets/feeding-guides/product lines.txt` and the catalogue. That source has Quinoa only as dog Skin & Coat (quail, duck) and cat Urinary (duck); Cod is in Ocean; and the only Pumpkin cat is Neutered Lamb.

| File | Statement | Conflict |
|---|---|---|
| `js/quiz.js:9` | "N&D Quinoa Puppy Dog formula … 80%" | There is no Quinoa puppy product |
| `js/quiz.js:12` | NZ Lamb & Blueberry in the Quinoa range | Lamb is Pumpkin (dog) or Prime (cat), not Quinoa |
| `js/quiz.js:21` | Chicken cartilage in "Puppy Quinoa composition" | There is no Quinoa puppy product, and no chicken in Quinoa |
| `js/quiz.js:24` | Quinoa Neutered Cat answer | The only Quinoa cat is Urinary; the neutered cats are Prime and Pumpkin |
| `js/quiz.js:33` | Cod, Pumpkin & Orange asked in the Pumpkin quiz | It is N&D Ocean |
| `js/quiz.js:41` | Herring & Orange is "the ONLY cat product in N&D Pumpkin" | It is Ocean; the Pumpkin cat is Neutered Lamb, Pumpkin & Blueberry |
| `js/tips.js:13` | Italian free-range chicken in N&D Quinoa | The Quinoa products are quail and duck |
| `js/tips.js:30` | "N&D Pumpkin Cod & Orange" and "N&D Quinoa Boar & Apple" | Cod is Ocean; boar is Pumpkin (dog) or Prime (cat) |
| `js/tips.js:39` | NZ Lamb & Blueberry "(both ranges)" with green tea and rosemary | The dog lamb recipe is Pumpkin only |
| `js/tips.js:42` | "N&D Quinoa Neutered Cat" | It should be Prime or Pumpkin Neutered |

These claims remain unsupported by any source in this repository: `js/tips.js` heart/grain-free study wording, and "48%+ vs 15–20%" fresh meat compared with competitors.

## How to repeat

Export the sheet to CSV with Excel, then run the comparison script. The script used for this check is kept out of the repo, because exporting the `.xls` needs Excel. It parses column G and applies the explicit mapping above, both directions.
