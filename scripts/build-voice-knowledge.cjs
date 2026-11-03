#!/usr/bin/env node
// Builds docs/VOICE-AGENT-KNOWLEDGE.md from the app's own data, so the voice agent's
// knowledge matches the catalogue. Run after any content change, then reload the file
// in ElevenLabs. --check fails if the committed file is out of date.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'docs', 'VOICE-AGENT-KNOWLEDGE.md');
const context = vm.createContext({ window: {} });
for (const name of ['farmina-data', 'catalog-links', 'products', 'ingredients', 'quiz', 'tips']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8'), context, { filename: name + '.js' });
}
const data = JSON.parse(vm.runInContext('JSON.stringify({PRODUCTS,INGREDIENTS,BODY_CONDITIONS,QUIZZES,TIPS})', context));
const { guides } = JSON.parse(fs.readFileSync(path.join(root, 'assets/feeding-guides/feeding-guides.json'), 'utf8'));
const urls = JSON.parse(fs.readFileSync(path.join(__dirname, 'farmina-product-urls.json'), 'utf8'));
const links = JSON.parse(vm.runInContext('JSON.stringify(CATALOG_LINKS)', context));
const platform = fs.readFileSync(path.join(root, 'docs/TRAINING-PLATFORM-RAG.md'), 'utf8').replace(/\r\n/g, '\n');

const plain = text => String(text ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const pack = sku => (sku.pack_size_grams >= 1000 ? `${sku.pack_size_grams / 1000} kg` : `${sku.pack_size_grams} g`);
const rand = value => 'R' + Number(value).toLocaleString('en-US');
const stageLabel = { puppy: 'Puppy', adult: 'Adult', light: 'Light', kitten: 'Kitten', neutered: 'Neutered' };
const title = p => `${p.lineName} ${p.name}, ${p.variant}`;
const out = [];

out.push(`# Farmina N&D store training: voice agent knowledge

Generated from the training app's data for release use at https://apexpetgroup.co.za/training/. Prices are the June 2026 RRP list. Do not edit by hand: run \`node scripts/build-voice-knowledge.cjs\`.

---

## CHUNK rules-01: How to answer

**Keywords:** rules, how to answer, unknown, not sure, price, allergy, medical, vet, diagnosis, privacy

You help Apex Pet Group store staff with the Farmina N&D range and the training app.

- Answer in short, spoken sentences. Give the answer first. Ask one question if you need the pet type, life stage or breed size.
- Use only this document and the Farmina South Africa website. Never invent a price, percentage, feeding amount, product, pack size or health benefit.
- If you do not have the answer, say so, and suggest checking the pack label or asking a manager.
- Prices are June 2026 RRP. Always tell staff to confirm the shelf price.
- Feeding amounts are Farmina's printed guide amounts only. Never work out an amount between printed rows. Give both printed rows, and say the guide is a starting point to adjust so the pet keeps a healthy weight.
- You do not diagnose allergies or medical conditions, and you do not confirm a food is safe for an allergic or unwell pet. Say what the ingredient list declares, ask staff to check the pack, and refer health questions to a vet.
- Do not promise cures or results. Use wording like "supports", not "treats" or "prevents".
- Do not ask for or repeat customer names, phone numbers or addresses.
- Only discuss products in this document. If asked about wet food or anything else not listed, say it is not in the range covered here.

## CHUNK rules-02: Which source wins

**Keywords:** source, website, conflict, price list, pack label, percentage, Andrew Fourie, claim, proof, who says

Use this document first. Use the Farmina South Africa website (https://farmina.com/za/) as a reference for detail not covered here. If the two differ, give the figure in this document. If asked why, say the training team chose the figure printed on the approved source.

Known differences, all decided by the training team:

- N&D Ocean dog recipes: use 96% of protein from animal sources, as printed on the pack. The website says 98% ocean-sourced protein.
- N&D Ocean Herring & Orange cat: 98% of protein from animal sources.
- N&D Quinoa Skin & Coat dog: 92%, and N&D Quinoa Urinary cat: 94%, of protein from animal sources. Those website pages give no figure, so these come from the price list.
- N&D Quinoa Skin & Coat: treat as Adult Dog, as on the price list. The website mentions nutrient profiles for all life stages.

Ingredient percentages come only from the feeding guides, the June 2026 price list, pack labels and the Farmina South Africa product pages.

The qualified product specialist for supported claims is Andrew Fourie, Chief Technical Officer, Apex Pet Group. That includes "38% lower cost per day than comparable premium brands" and "the most cost-effective food available in South Africa", both for N&D Ancestral Adult. If staff ask for the source of these claims, name him.

The Selling Tips and Ingredient sections below are sales talking points supplied for training. Do not state them as proven facts about competitors or health outcomes.`);

// Range overview, for "what do we carry" questions.
const lines = [...new Set(data.PRODUCTS.map(p => p.lineName))];
const finder = data.PRODUCTS.reduce((map, p) => {
  const key = `${p.pet}|${p.stage}`;
  (map[key] = map[key] || new Set()).add(`${p.lineName} ${p.name}`);
  return map;
}, {});
out.push(`## CHUNK range-01: The whole range

**Keywords:** range, what do we carry, how many products, lines, dog, cat, puppy, adult, light, kitten, neutered, mini, medium, maxi

The range is ${data.PRODUCTS.length} products: ${data.PRODUCTS.filter(p => p.pet === 'dog').length} dog and ${data.PRODUCTS.filter(p => p.pet === 'cat').length} cat. Each of the ${new Set(data.PRODUCTS.filter(p => p.pet === 'dog').map(p => p.family)).size} dog recipes comes in Mini and Medium & Maxi kibble. Cats have one kibble size.

Lines: ${lines.join('; ')}.

Dog life stages are Puppy, Adult and Light. Cat life stages are Kitten, Adult and Neutered. N&D Ancestral Grain is dog only.

${Object.entries(finder).map(([key, names]) => {
    const [pet, stage] = key.split('|');
    return `- **${stageLabel[stage]} ${pet}:** ${[...names].join('; ')}.`;
  }).join('\n')}`);

// Products.
for (const p of data.PRODUCTS) {
  const packs = (p.scraped_skus || []).map(sku => `${pack(sku)} at ${rand(sku.price_current)}`).join('; ');
  const url = urls[p.id];
  if (!url) throw Error('No Farmina URL for ' + p.id);
  out.push(`## CHUNK product-${p.id}: ${title(p)}

**Keywords:** ${p.name}, ${p.protein}, ${p.lineName}, ${p.pet}, ${p.stage}${p.kibble ? ', ' + p.kibble : ''}, price, ingredients, protein

**Product:** ${title(p)}. For ${p.pet === 'dog' ? 'dogs' : 'cats'}, life stage ${stageLabel[p.stage]}${p.kibble ? `, ${p.kibble} kibble` : ''}. Main protein: ${p.protein}.

**Packs and June 2026 RRP:** ${packs || 'Pricing unavailable. Check the shelf.'}. Confirm the shelf price.

**Protein:** ${p.nutrition.protein}% crude protein, with ${p.nutrition.proteinAnimal}% of the protein from animal sources.

**Recipe breakdown:** ${p.macros.meat} meat and fats, ${p.macros.grains} grains, ${p.macros.fruits} fruits, vegetables, botanicals, vitamins and minerals. ${p.macros.fresh} of the meats are fresh or raw.

**Selling point:** ${plain(p.sell)}

**Claims:** ${p.highlights.join(', ')}.

**Suitable for:** ${plain(p.suitable)}

**Ingredients:** ${plain(p.composition)}

**Analytical constituents:** ${plain(p.analysis)}

**Energy:** ${p.energy} kcal per kg. **Registration:** ${p.registration}.

**Farmina page:** ${url}`);
}

// Feeding guides.
const guideFor = guide => {
  const cards = data.PRODUCTS.filter(p => links[p.id].ids.includes(guide.product_id));
  return [...new Set(cards.map(p => `${p.pet} ${stageLabel[p.stage]}`))].join(', ');
};
out.push(`## CHUNK feeding-00: How feeding guides work

**Keywords:** feeding, how much, grams, portion, feeding guide, printed, missing guide, between weights

The amounts below are Farmina's printed daily amounts. Adult and cat guides give a minimum and maximum by the pet's current weight. Puppy guides give grams by age and expected adult weight. The kitten guide gives a range by age and kitten weight.

If a weight falls between two printed weights, give both printed rows. Do not calculate an amount in between. If a weight is outside the printed rows, give no amount: say to check the pack and ask a vet.

No guide is available yet for Ancestral Grain Light Mini or Quinoa Duck Skin & Coat Medium & Maxi. For those, tell staff to use the guide printed on the bag.`);
for (const guide of guides) {
  let body;
  if (guide.kind === 'puppy') {
    const ages = [...new Set(guide.rows.map(row => row.age_months))].sort((a, b) => a - b);
    body = ages.map(age => {
      const rows = guide.rows.filter(row => row.age_months === age);
      return `- **${age} months:** ` + rows.map(row => `${row.mature_weight_kg} kg adult weight: ${row.adult_food ? 'move to adult food' : row.grams_per_day + ' g'}`).join('; ') + '.';
    }).join('\n');
  } else if (guide.kind === 'kitten') {
    const bands = [...new Set(guide.rows.map(row => row.age_band))];
    body = bands.map(band => `- **${/\d/.test(band) ? band + ' months' : 'At weaning'}:** ` + guide.rows.filter(row => row.age_band === band).map(row => `${row.weight_kg} kg: ${row.grams_min}–${row.grams_max} g`).join('; ') + '.').join('\n');
  } else {
    body = guide.rows.map(row => `${row.weight_kg} kg: ${row.grams_min}–${row.grams_max} g`).join('; ') + '.';
  }
  out.push(`## CHUNK feeding-${guide.id}: Feeding guide, ${plain(guide.label)}

**Keywords:** feeding, how much, grams per day, ${plain(guide.label)}, ${guideFor(guide)}

Printed daily amounts for ${plain(guide.label)}:

${body}`);
}

// Ingredients.
for (const i of data.INGREDIENTS) {
  const parts = [
    i.nutritional_role && `**Nutritional role:** ${plain(i.nutritional_role)}`,
    `**What it is:** ${plain(i.what)}`,
    `**Why it matters:** ${plain(i.why)}`,
    i.benefit_statement && `**Benefits:** ${plain(i.benefit_statement)}`,
    i.scraped_lines?.length && `**Appears in lines:** ${i.scraped_lines.join(', ')}`,
    i.notes && `**Notes:** ${plain(i.notes)}`,
    `**How to talk about it:** ${plain(i.sell)}`,
  ].filter(Boolean);
  out.push(`## CHUNK ingredient-${i.id}: ${i.name}

**Keywords:** ingredient, ${i.name}, ${i.catLabel}${(i.conditions || []).length ? ', ' + i.conditions.join(', ') : ''}

${parts.join('\n\n')}`);
}
out.push(`## CHUNK ingredient-conditions: Ingredients by condition

**Keywords:** condition, digestion, joints, skin, coat, immunity, brain, eyes, heart, sensitivities

${data.BODY_CONDITIONS.map(c => `- **${c.label}:** ${plain(c.blurb)} Ingredients: ${data.INGREDIENTS.filter(i => (i.conditions || []).includes(c.id)).map(i => i.name).join(', ') || 'none listed'}.`).join('\n')}

These are general ingredient talking points, not health advice.`);

// Selling tips.
data.TIPS.forEach((category, index) => {
  out.push(`## CHUNK selling-${String(index + 1).padStart(2, '0')}: Selling tips, ${plain(category.title)}

**Keywords:** selling, tips, script, objection, ${plain(category.title)}

${category.items.map(item => `**${plain(item.q)}**\n${plain(item.a)}${item.script ? `\nSuggested wording: ${plain(item.script)}` : ''}`).join('\n\n')}`);
});

// Quizzes.
for (const [key, quiz] of Object.entries(data.QUIZZES)) {
  out.push(`## CHUNK quiz-${key}: Quiz questions and answers, ${quiz.name}

**Keywords:** quiz, answer, test, ${quiz.name}

${quiz.questions.map(q => `**Q: ${plain(q.q)}**\nAnswer: ${plain(q.opts[q.ans])}. ${plain(q.explain)}`).join('\n\n')}`);
}

// How the app works: the chunks of the platform file, without its appendices.
const chunks = platform.slice(platform.indexOf('## CHUNK overview-01'), platform.indexOf('\n---\n\n## Appendix')).trim();
out.push(chunks);

const document = out.join('\n\n') + '\n';
if (process.argv.includes('--check')) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== document) {
    console.error('docs/VOICE-AGENT-KNOWLEDGE.md is out of date. Run: node scripts/build-voice-knowledge.cjs');
    process.exit(1);
  }
} else {
  fs.writeFileSync(outputPath, document);
  console.log(JSON.stringify({ path: outputPath, characters: document.length, chunks: (document.match(/^## CHUNK /gm) || []).length }));
}
