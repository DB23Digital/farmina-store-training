# Farmina SA Staff Training: how the platform works (RAG source)

Purpose: a retrieval-ready knowledge base describing how store staff use the training app at `https://apexpetgroup.co.za/training/`. Each chunk is self-contained so it can be embedded and retrieved on its own. Chunk IDs are stable; keep them when editing. A video script outline is in the appendix.

Source of truth: `index.html` and `js/*.js` as of 29/10/2026. Prices in the app are a June 2026 snapshot. Chunks marked **[Verify live]** describe behaviour that local code cannot prove (see `docs/DEPLOYMENT.md`).

Ground rules the app itself follows, and any answer built from this file should follow too:

- The app is a product-knowledge and conversation aid. It does not diagnose allergies or medical conditions, and it does not replace veterinary advice.
- Prices shown are a dated snapshot. Staff must check the current shelf price.
- Staff must check the exact pack label and full ingredient list before recommending a product.

---

## CHUNK overview-01: What the app is

**Keywords:** overview, what is this, staff training, PWA, install, offline

The Farmina SA Staff Training Guide is a mobile-first web app (a Progressive Web App) for store staff, published under Apex Pet Group at `apexpetgroup.co.za/training/`. It teaches Farmina N&D product knowledge and gives staff quick tools to use on the shop floor. It has seven screens, reached from the bottom navigation bar: Products, Ingredients, Quiz, Calculator, Tips, Matcher and Search. After a first online load, the core app works offline. Staff can leave at any time with the **Log out** link in the top bar, which returns to the Apex Pet Group home page.

## CHUNK nav-01: Moving around

**Keywords:** navigation, bottom bar, tabs, screens, magnifier, search icon, log out

- The bottom navigation bar has seven buttons: Products, Ingredients, Quiz, Calculator, Tips, Matcher, Search. The highlighted one is the current screen.
- The magnifier icon at the top right of the Products screen opens a quick search overlay on any page it appears on. The Search tab is the full-screen version of the same search.
- **Help a customer** is not in the bottom bar. It starts from the blue call-to-action panel on the Products screen.
- Tapping a result in the Matcher, an ingredient condition pill, or "Find in catalogue" in Help a customer jumps back to the Products screen and scrolls to that product card.

## CHUNK products-01: Products screen (catalogue)

**Keywords:** products, catalogue, filter, pet, life stage, line, cards, price, pack size, composition

The Products screen is the home screen. It lists the Farmina N&D range as cards, grouped under a banner for each line.

Filters, all combinable, in three rows of chips:
- **Pet:** Dog, Cat, and **Reset**. Reset clears every filter (pet, life stage, line) and the search box, so the whole range shows again.
- **Life stage:** All, Puppy, Adult, Light, Kitten, Neutered.
- **Line:** All, N&D Quinoa, N&D Pumpkin, N&D Ocean, N&D Prime, N&D Ancestral Grain.

There is also a text box, "Search by name or ingredient". It matches the product name, variant, protein and full composition. If nothing matches, the screen says "No products match your filters"; clear a chip or the text to get results back.

Each card collapsed shows: pack photo (where an exact source record exists), line, pet and life-stage badges, product name, variant and protein, the selected pack's price and size, and a row of pack-size buttons (for example "7000 g · R...") to switch size and price. Four mini-stats show animal-source percentage, grains, fruit and vegetables, and fresh/raw meat. Two bars show crude protein and the share of protein from animal sources. A value with an asterisk is estimated; confirm it from the packaging.

Tap a card header to expand it. The expanded card shows: Key Selling Point, Product Claims, Available Sizes, Suitable For, and Full Composition. Opening a card is counted as a product view if the member of staff accepted analytics.

If a card shows "Pricing unavailable — catalogue needs review", the app could not match that card to a verified supplier record. Do not quote a price; check the shelf.

## CHUNK buddy-01: Help a customer (shop-floor guide)

**Keywords:** help a customer, buddy, shortlist, recommend, wizard, mini, medium maxi, grain-free, ancestral, chicken, fish, lamb, boar

Use it when a customer is standing in front of you. It is on the Products screen, in the panel headed "Helping a customer right now?", button **Help a customer**. It takes about a minute and works offline.

Steps:
1. **Who is the food for?** Dog or Cat.
2. **Which pet profile fits?** Dog: Puppy, Adult, or Adult · light formula. Cat: Kitten, Adult, or Neutered adult.
3. **Dog only: breed size.** Mini, Medium or Maxi, or Not sure yet.
4. **Preference** (only shown when it makes a difference): Show starting points, Grain-free range, With ancestral grains, or a protein: Chicken, Fish, Lamb, Boar. Only options that exist for that profile are offered.
5. **Product starting points:** up to two products to compare. Each result shows a pack photo, product name, line and variant, why it is worth comparing (life stage, protein, grain-free or Ancestral Grain), the listed pack sizes, and a **Find in catalogue** button that opens the full card.

Back buttons walk one step back. At the first step the back button returns to Products. A progress label (for example "Step 3 of 4") shows how far along you are.

Rules to say out loud:
- Results are starting points, not a diagnosis or an allergy check.
- The guide does not show prices. Check the shelf price.
- If the dog's breed size is unknown, or a recipe shares one source record across sizes, the result says "Confirm the exact breed-size pack on the shelf before recommending it". Do not guess from bag weight or the photo.
- Specialised Quinoa Skin & Coat and Urinary products are not suggested here. They stay in the catalogue.
- If nothing matches the choices, it says "No catalogue product matches these choices. Browse the full catalogue instead."
- Customer answers are not stored and are not sent to analytics.

## CHUNK voice-01: Ask by voice

**Keywords:** voice, ask by voice, microphone, ElevenLabs, agent, offline, privacy **[Verify live]**

Next to **Help a customer** is **Ask by voice**. Tapping it loads an external voice assistant from ElevenLabs. Staff then start the conversation inside the widget and the browser asks for microphone permission at that point.

- It needs an internet connection. Offline, the button explains that it needs a connection and **Help a customer** keeps working.
- The page warns: "Voice uses ElevenLabs online. Avoid sharing customer details; check the pack label and shelf price." Do not say customer names, phone numbers or addresses.
- The voice agent is configured outside this app. Always verify what it says against the product card and the pack, especially for prices, health claims and allergies.
- Nothing from the catalogue, the customer or analytics identifiers is passed into the widget.

## CHUNK ingredients-01: Ingredient Encyclopedia

**Keywords:** ingredients, encyclopedia, by type, by condition, protein, prebiotic, botanical, grain, joint, fruit, digestion, skin, immunity, brain, eye, heart, sensitivities

Screen: **Ingredients**. Purpose: learn what is in the food and how to talk about it.

Two modes, switched by the toggle at the top:
- **By Type:** chips for All, Protein, Prebiotics, Botanicals, Grains, Joint Health, Fruits.
- **By Condition:** eight tiles: Digestion, Joints, Skin & Coat, Immunity, Brain, Eyes, Heart, Sensitivities. Choosing one shows a short explanation and a row of product pills. Tap a pill to jump to that product's card.

A search box filters by ingredient name or category. Tap an ingredient tile to open a pop-up with: Nutritional Role, What it is, Why it matters, Benefits, conditions and lines where it appears, Notes, and **How to sell it**, a plain-language talking point. Close with the Close button or by tapping outside the pop-up.

## CHUNK quiz-01: Knowledge Quiz

**Keywords:** quiz, test, score, stars, badge, retry, N&D Quinoa, N&D Pumpkin, Low Ancestral Grain

Screen: **Quiz**. There are three quizzes of five questions each: **N&D Quinoa**, **N&D Pumpkin**, and **N&D Low Ancestral Grain**. There are no quizzes yet for Ocean or Prime.

How it works:
1. Tap a line card.
2. Read the question and tap one answer. The correct answer turns green; a wrong pick turns red. An explanation appears straight away, so each question teaches as well as tests.
3. Tap **Next Question**, then **See Results** after question five.
4. Results show stars and a message: 0–1 "Keep Studying", 2 "Good Start!", 3 "Solid Knowledge", 4 "Great Work!", 5 "Expert Level!". Choose **Try Again** or **All Quizzes**.

A finished quiz shows its score on the line card (for example "4/5 ✓"). Scores are kept only while the page is open. Refreshing or closing the app clears them. If the member of staff accepted analytics, quiz start and score are recorded as aggregate training data. Tip: read the Ingredients and Products screens first, then do the quiz.

## CHUNK calc-01: Cost Calculator

**Keywords:** calculator, cost per day, bag, price, portion, grams per day, days per bag, per month, feeding guide, puppy guide, adult guide, cat guide, breed size, estimate

Screen: **Calculator**. It turns a bag price into a cost per day, which is the fair way to answer price objections.

Basic use, adult pet:
1. Choose Pet Type: Dog or Cat.
2. Enter the pet's weight in kg.
3. Optionally choose a Formula. This fills the bag sizes and the current snapshot prices for that product. You can also tap a **Bag SKU pricing** button to set bag size and price in one go. Leave Formula blank to enter a custom bag size and price.
4. Check **Feeding basis** is "Adult formula estimate". For dogs, the Metabolic Energy field (kcal/kg) can be adjusted; it is pre-filled for convenience.
5. Tap **Calculate**. Results: grams per day, cost per day, days per bag, and cost per month.

Supplied feeding guides: the calculator matches the feeding guide printed on the bag. When you choose a Farmina product, it always uses Farmina's own guide; the formula estimate is only for a custom bag with no product chosen. For kittens, choose the age (Weaning, 1–3, 4–6 or 7–12 months), then a weight printed for that age. If the bag record covers several breed sizes, choose the breed size first (Mini, Medium or Maxi). Then:
- Adult dog and cat guides: type the pet's current weight. If that weight is printed in the guide, the result shows Farmina's min–max grams per day for it, with cost per day, days per bag and monthly cost as ranges. If it falls between two printed weights (for example 12 kg, between 10 kg and 15 kg), both printed rows are shown side by side, each labelled with its weight; nothing is calculated in between. A weight outside the printed ones gets no amount: check the pack and ask a vet. The printed weights are listed under the box. Kittens work the same way within the chosen age.
- Puppy guides: choose the age in months and the expected adult weight. The result shows the printed grams per day. Ages where the guide says to move to adult food give no puppy portion.
Only amounts printed in the guide are ever shown; nothing in between is calculated. "View supplied guide" opens Farmina's guide; for most guides that needs a connection. No guide is available yet for Ancestral Grain Light Mini or Quinoa Duck Skin & Coat Medium & Maxi; the calculator says to use the guide printed on the bag for those.

Things to say:
- The adult figure is an **estimate**. Confirm it against the selected product's own feeding instructions.
- If bag size or price is zero, empty or not a positive number, the calculator shows an error instead of a result.
- Prices are the June 2026 snapshot. Confirm the current retail price.
- Changing any input hides the old result, so press Calculate again.

A "Value Context" panel under the calculator carries Farmina's comparison message for N&D Ancestral Adult. Treat that as brand positioning supplied with the training, and do not quote percentages to customers unless your manager has approved the wording.

## CHUNK tips-01: Selling Tips

**Keywords:** tips, selling, scripts, objections, price objection, transition, 60-second sales flow, 20-second pitch, low GI, upselling, merchandising, compliant language

Screen: **Tips**. Tap a category to open it. Each item has the customer's question, a short answer for you, and a ready-to-say **script** in quotes.

Categories: Why Choose Farmina; Price Objection Handling; Choosing the Right Product; Transition Tips to Share with Customers; Key Ingredient Talking Points; Handling Common Objections; The 20-Second Pitch; The 60-Second Sales Flow; Explaining Low GI; Helpful Upselling and Add-ons; Staff Cheat Lines (Compliant); Merchandising for Conversion.

The 60-second sales flow in four steps: **Ask** (dog or cat and age; any tummy, skin/coat or weight concerns; what they feed now and what is not working), **Match** (grain-free, Ancestral Grain, or Light), **Prove** (natural antioxidants, nitrogen packing, cold-infusion vitamins, research), **Close** (offer one main recommendation and one alternative).

Standard transition advice: 7–10 days, mixing gradually from 25% new food up to 100%, with fresh water always available.

Use the "supports" wording from Staff Cheat Lines when talking about benefits. The scripts are conversation aids; do not promise cures or results.

## CHUNK matcher-01: Sensitivity Matcher

**Keywords:** matcher, sensitivity, concern, allergies, exclude ingredients, digestion, skin, joints, immunity, urinary, compare, other life stage

Screen: **Matcher**. A four-step guided comparison.

1. What pet do you have? Dog or Cat.
2. Life stage: Dog: Puppy, Adult, Light. Cat: Kitten, Adult, Neutered/Spayed.
3. Main concern: Food Allergies/Sensitivities, Digestive Issues, Skin & Coat, Joint/Mobility Support, Immune Support, and for cats only, Urinary Support.
4. **Products to compare**. The top three are shown first, with **Show all** for the rest. Each has a "Why listed" line naming the declared ingredients or claim behind it, for example "Dedicated Skin & Coat formula · declares fish oil, linseed". Tap a result to open its card. **Back** steps back; **Start Over** restarts.

How results are chosen (from each card's declared composition and claims):
- Digestion: dried pumpkin, psyllium, beet pulp, inulin, FOS or MOS. Skin & coat: fish oil or linseed. Joints: both glucosamine and chondroitin. Immunity: inulin, FOS or MOS. Urinary: the dedicated Quinoa Urinary cat formula.
- Dedicated formulas rank first: Quinoa Skin & Coat (dog) and Quinoa Urinary (cat).
- Results for the chosen life stage come first. A formula for another life stage appears only in a separate, labelled section, with "Check the pack's life-stage guidance before recommending". That happens for dedicated formulas, and when no formula at the chosen stage matches. For example, a neutered cat with a urinary concern is shown the adult Urinary formula, labelled.

Food Allergies/Sensitivities works differently. Staff tick the ingredients the owner or vet has confirmed must be avoided: chicken, egg, fish (including fish oil), lamb, duck, wild boar, quail, peas and legumes, potato and sweet potato, or grains. The app lists formulas whose composition text does not name them. A formula listing "hydrolysed animal protein" without a species is left out whenever an animal ingredient is excluded. Every catalogue formula lists fish or fish oil, and every cat formula lists egg and potato or sweet potato, so those exclusions honestly return no product.

Important: it lists products to **compare**, not to prescribe. It does not diagnose or establish allergy suitability. Confirm the full ingredient list on the pack and follow veterinary advice. Exclusion choices are never sent to analytics.

## CHUNK search-01: Search and Knowledge Base

**Keywords:** search, find, knowledge base, global search, results, products, ingredients, tips, quiz

Two ways in, same engine: the magnifier icon on the Products screen (a pop-up) and the **Search** tab (full screen, keyboard opens automatically). Type any word. Results are grouped by type: products, ingredients, tips and quiz. Tap a result to jump to it. Matching is simple text matching, so try the shorter or alternative word if you get "No results". Search text is never sent to analytics; only the fact that search was used and the result count are recorded, and only with consent.

## CHUNK privacy-01: Analytics and privacy

**Keywords:** analytics, consent, GA4, privacy, Analytics choices, data

On first visit to the live page, a panel "Help improve staff training" asks to allow Google Analytics. Choices: **Allow analytics** or **No thanks**. The choice can be changed any time with the **Analytics choices** button under the app title on the Products screen.

If allowed, the app records aggregate events only: screens visited, product, ingredient and tip views, quiz start and score, calculator use, matcher use, Help a customer start and completion with a result count, search used with a result count, and voice widget requested. It does not send search text, customer answers, voice audio or personal details. If staff decline, the app works the same and sends nothing. Analytics only runs on the live `/training/` page and not while offline.

## CHUNK offline-01: Install and offline use

**Keywords:** install, add to home screen, offline, PWA, mobile data, update, cache **[Verify live]**

- Open `https://apexpetgroup.co.za/training/` in Chrome (Android) or Safari (iPhone), then use the browser menu to **Add to Home Screen** for an app-style icon.
- Load it once online. After that the screens, catalogue, quiz, calculator and Help a customer work without a connection, which suits store dead zones and keeps data use low.
- Needs internet: Ask by voice, Google Fonts on the first load, and Analytics.
- After an update is released, the app picks up the new version when staff next open it online; closing and reopening it may be needed.
- If something looks out of date, refresh the page while online.

## CHUNK flow-01: A typical shift: which tool for which moment

**Keywords:** workflow, when to use, which tool, scenario, customer asks, learning, study

- **Learning before your shift or on a quiet day:** Products (read cards), Ingredients, then the Quiz for each line, then Tips.
- **A customer walks up and doesn't know what they want:** Help a customer, then open the result's catalogue card, then show the pack.
- **A customer says "It's expensive":** Calculator, to compare cost per day, then the price-objection scripts in Tips.
- **A customer has a concern (digestion, skin, joints):** Matcher to compare, then the Ingredients "By Condition" view to explain why. For allergies, review the full ingredient list and refer to a vet.
- **A customer asks about a single ingredient or term:** the Search tab or the magnifier, then the ingredient pop-up's "How to sell it".
- **You don't know the answer:** say so, point to the pack label, and ask a colleague or manager. Do not guess.

## CHUNK faq-01: Quick answers

**Q: Does the quiz save my score?** Only until you close or refresh the page.
**Q: Why does a product have no price?** It could not be matched to a verified supplier record. Check the shelf.
**Q: Why does Help a customer show only two products?** It is a shortlist to start a comparison, not a full catalogue. Use Products to see everything.
**Q: Can the matcher tell me what is safe for an allergic pet?** No. It can list formulas whose ingredient text leaves out what you ticked. Check the pack and follow veterinary advice.
**Q: Are the prices current?** They match the June 2026 Farmina RRP list, checked on 30/10/2026. Always confirm the shelf price.
**Q: Does the app work without data?** Yes, after one online load, except Ask by voice.
**Q: Is the calculator exact?** For Farmina products it shows the amounts printed in Farmina's feeding guide, exactly. Only a custom bag with no product chosen uses a rough estimate. Always confirm with the pack.
**Q: Where do I turn analytics off?** Products screen, Analytics choices.
**Q: How do I leave?** Log out, top right of the page.

---

## Appendix: training video outline

Written for store staff on mid-range phones, so keep the video short, vertical-friendly, and captioned. Target 4–5 minutes total, or one 60–90 second clip per screen if you prefer a series. Every segment should show the real app, recorded on a phone, with a voice-over taken from the chunk named in brackets.

| # | Segment | Length | Source chunk | On screen |
|---|---|---|---|---|
| 1 | Welcome and what the app is | 20s | overview-01, nav-01 | Open the app, Add to Home Screen, tap through the seven tabs |
| 2 | Find a product | 35s | products-01 | Filter Dog, Puppy, Prime. Expand a card. Switch pack size |
| 3 | Help a customer | 50s | buddy-01 | Full walk-through for a dog, then a cat. Pause on the caution line |
| 4 | Ask by voice | 20s | voice-01 | Tap button, show warning text. Do not show a real customer call |
| 5 | Learn the ingredients | 30s | ingredients-01 | By Condition, tap a pill, open an ingredient pop-up |
| 6 | Test yourself | 25s | quiz-01 | One question with the explanation, then results |
| 7 | Cost per day | 40s | calc-01 | Pick formula, bag, weight, Calculate. Say "estimate" |
| 8 | Selling tips | 25s | tips-01 | Open Price Objection Handling, read a script |
| 9 | Matcher and Search | 30s | matcher-01, search-01 | Matcher for digestion. Show the allergy message. Search an ingredient |
| 10 | Privacy and offline | 20s | privacy-01, offline-01 | Show consent panel and Analytics choices. Switch to airplane mode and open the app |
| 11 | Wrap-up: which tool when | 20s | flow-01 | Simple list graphic |

Production notes:
- Record on a real Android phone with the app at its mobile size. Use dummy data only; no real customers on screen.
- Do not quote prices in the narration, since the app prices are a dated snapshot. Say "check the shelf price".
- Do not make allergy, health or "best for" claims in the voice-over. Use the app's own wording: "products to compare".
- Add on-screen captions for the cautions in buddy-01, matcher-01 and calc-01.
- Re-record if screens change. Chunks cite the code as of 29/10/2026.

## Appendix: using this file as a RAG source

- Split on lines starting `## CHUNK`. Each chunk's ID, keywords and body are one retrieval unit, typically 150–450 words.
- Store the chunk ID and title as metadata and return them as the citation.
- Retrieval is only as good as the file. If the app changes, update the matching chunk and its date, then re-embed.
- Instruct any assistant that uses it to answer only from retrieved chunks, to say "I don't have that" when nothing matches, and never to invent prices, feeding amounts, or health suitability.
- If this will feed the ElevenLabs voice agent, review its prompt and knowledge settings as described in `docs/VOICE-AGENT.md` first. Uploading it there is configured outside this repo and is a decision for Deon.
