// ═══════════════════════════════════════
// INGREDIENTS DATA
// To add a new ingredient: copy an existing entry, give it a new id (i26, etc.)
// and add it to the array. Categories: protein, prebiotic, botanical, grain, joint, fruit
// conditions: digestion, joint, skin, immune, brain, eye, heart, allergy
// ═══════════════════════════════════════

const INGREDIENTS = [
  {id:'i1',icon:'🍗',name:'Fresh Boneless Chicken',cat:'protein',catLabel:'Animal Protein',
   conditions:[],
   what:'The number-one ingredient — Italian free-range chicken, used fresh (not dried) to preserve natural amino acids.',
   why:'Fresh meat provides biologically available protein that dogs and cats evolved to digest. Being listed first means it\'s the highest percentage ingredient before water weight is accounted for.',
   sell:'Ask customers: "Would you rather feed your pet fresh chicken or chicken powder?" That\'s the difference.'},

  {id:'i2',icon:'🐔',name:'Dehydrated Chicken Meat',cat:'protein',catLabel:'Concentrated Protein',
   conditions:[],
   what:'Chicken that\'s been gently dried to remove moisture, concentrating the protein content to ~4x that of fresh meat.',
   why:'Provides dense, stable protein.',
   sell:'Explain: fresh chicken contains a lot of water. After cooking, dehydrated meat provides more actual protein per gram.'},

  {id:'i3',icon:'🐗',name:'Italian Wild Boar',cat:'protein',catLabel:'Novel Protein',
   conditions:['allergy'],
   what:'Free-ranging wild boar from Italian forests. A novel protein rarely used in commercial pet food.',
   why:'Novel proteins are key for elimination diets. Dogs with sensitivities to chicken or beef have typically never been exposed to boar — reducing allergic responses.',
   sell:'Perfect for: "My dog keeps scratching and the vet thinks it\'s food allergies." Wild boar = untested protein = fresh immune response.'},

  {id:'i4',icon:'🐑',name:'NZ Grass-Fed Lamb',cat:'protein',catLabel:'Premium Protein',
   conditions:['allergy','skin'],
   what:'Lamb sourced from New Zealand\'s pasture-raised, hormone-free sheep. Considered one of the cleanest protein sources globally.',
   why:'Grass-fed animals have better omega-3 to omega-6 ratios than grain-fed. No growth hormones, no antibiotics — cleaner protein profile.',
   sell:'New Zealand has some of the strictest agricultural regulations in the world. Pure, traceable, premium.'},

  {id:'i5',icon:'🐠',name:'Atlantic Wild Caught Cod',cat:'protein',catLabel:'Fish Protein',
   conditions:['allergy'],
   what:'White fish caught from wild Atlantic waters. Low in fat, high in quality protein, naturally hypoallergenic.',
   why:'Cod is one of the least allergenic proteins available. Rich in B vitamins, phosphorus and selenium. The mild flavour is highly palatable even for picky eaters.',
   sell:'Best for dogs with food sensitivities or those that have reacted to both chicken AND beef.'},

  {id:'i6',icon:'🐟',name:'Wild Caught Herring',cat:'protein',catLabel:'Oily Fish / Omega Source',
   conditions:['skin','brain','heart','joint','allergy'],
   what:'Atlantic herring, wild caught and used both fresh and dehydrated. Exceptionally rich in omega-3 fatty acids (EPA & DHA).',
   why:'EPA and DHA directly reduce inflammation, support brain function, improve coat condition and support cardiovascular health. Herring is one of the richest natural sources.',
   sell:'For cats or dogs with skin issues, dull coats, joint stiffness or anxiety — herring-based food is a powerful natural intervention.'},

  {id:'i7',icon:'🎃',name:'Dried Pumpkin',cat:'botanical',catLabel:'Digestive Support',
   conditions:['digestion'],
   what:'5% dried pumpkin in the Pumpkin range. Rich in soluble and insoluble fiber, beta-carotene and vitamins A, C and E.',
   why:'Pumpkin acts as a natural digestive regulator — soluble fiber helps with diarrhoea, insoluble fiber helps with constipation. A well-known "vet trick" for GI upset.',
   sell:'If a customer mentions their dog has loose stools or irregular digestion, recommend the Pumpkin range. The 5% pumpkin inclusion makes a real functional difference.'},

  {id:'i8',icon:'🌿',name:'Inulin',cat:'prebiotic',catLabel:'Prebiotic Fiber',
   conditions:['digestion','immune'],
   what:'A natural prebiotic fibre extracted from chicory root.',
   why:'Inulin has been shown in nutrition studies to modulate gut microbiota and metabolites in both dogs and cats, supporting a healthy microbiome.',
   sell:'"This food contains inulin, a prebiotic proven to support a healthy balance of gut bacteria, which is the foundation of immunity and digestion."'},

  {id:'i9',icon:'🔬',name:'Fructooligosaccharides (FOS)',cat:'prebiotic',catLabel:'Prebiotic',
   conditions:['digestion','immune'],
   what:'Short-chain carbohydrates that act as prebiotics.',
   why:'Research in dog nutrition shows FOS supports colonic health indices and strengthens the immune status when included as part of a balanced diet.',
   sell:'Farmina uses FOS to specifically support colonic health and immune function. It\'s more than just fibre — it\'s functional gut support.'},

  {id:'i10',icon:'🧫',name:'Mannan-oligosaccharides (MOS)',cat:'prebiotic',catLabel:'Immune Prebiotic',
   conditions:['digestion','immune'],
   what:'Prebiotics derived from yeast cell walls.',
   why:'Dog nutrition research supports MOS for its role in immune-related outcomes and overall gut wall support.',
   sell:'Inulin + FOS + MOS = a triple-action prebiotic approach. MOS specifically helps the immune system respond better to challenges in the gut.'},

  {id:'i11',icon:'🍇',name:'Pomegranate',cat:'fruit',catLabel:'Superfood Antioxidant',
   conditions:['immune','heart','digestion'],
   what:'Dried pomegranate, rich in powerful polyphenols.',
   why:'Pomegranate polyphenols support antioxidant status and provide beneficial effects during hindgut fermentation in dogs.',
   sell:'Pomegranate isn\'t just for flavor; it provides powerful antioxidants that support both the heart and the gut environment.'},

  {id:'i12',icon:'🫐',name:'Blueberries',cat:'fruit',catLabel:'Antioxidant Fruit',
   conditions:['brain','immune','eye'],
   what:'Dried blueberry powder, naturally rich in antioxidants.',
   why:'Used as a functional ingredient to support oxidative stress management and healthy ageing in pets.',
   sell:'Blueberries provide the antioxidant power needed to support your pet\'s brain and immune system as they age.'},

  {id:'i13',icon:'🟡',name:'Turmeric Root',cat:'botanical',catLabel:'Anti-inflammatory Botanical',
   conditions:['joint','digestion'],
   what:'Dried turmeric root. The amount varies by recipe, so check the product card. Contains curcumin — one of the most studied natural anti-inflammatory compounds.',
   why:'Curcumin inhibits inflammatory pathways at the molecular level. Supported by hundreds of studies for joint pain, digestive inflammation and liver health.',
   sell:'Turmeric is a vet-recommended natural supplement for dogs with arthritis. It\'s already in the food — no extra cost, no hassle.'},

  {id:'i14',icon:'🌱',name:'Psyllium Husk',cat:'botanical',catLabel:'Soluble Fiber',
   conditions:['digestion'],
   what:'The husk of Plantago ovata seeds. A powerful soluble fibre.',
   why:'Shown to improve stool quality and help manage both chronic large-bowel diarrhoea and constipation by supporting proper stool formation.',
   sell:'If your pet has loose stools or constipation, Psyllium is a proven natural solution that regulates their digestive system.'},

  {id:'i15',icon:'🦴',name:'Glucosamine',cat:'joint',catLabel:'Joint Support',
   conditions:['joint'],
   what:'A naturally occurring compound essential for cartilage production and maintenance. Often derived from shellfish or chicken cartilage in Farmina.',
   why:'Glucosamine is the building block of joint cartilage. Supplementation has been shown to slow cartilage breakdown and reduce joint pain in dogs.',
   sell:'Large breed owners worry about hip dysplasia. Older dog owners worry about arthritis. This is the supplement vets always recommend — already included.'},

  {id:'i16',icon:'🦴',name:'Chondroitin Sulfate',cat:'joint',catLabel:'Joint Support',
   conditions:['joint'],
   what:'Works alongside glucosamine to maintain joint health. Found naturally in cartilage and connective tissue.',
   why:'Chondroitin draws fluid into cartilage (keeping it cushioned) and inhibits enzymes that break down cartilage. The glucosamine+chondroitin combination is more effective than either alone.',
   sell:'"Glucosamine AND chondroitin" is the gold standard in joint supplements. Farmina includes both in every adult formula.'},

  {id:'i17',icon:'🌼',name:'Marigold Extract (Lutein)',cat:'botanical',catLabel:'Eye Health',
   conditions:['eye'],
   what:'Extract from marigold flowers, a natural source of lutein.',
   why:'Lutein is widely recognized for its antioxidant role in protecting eye tissues and supporting long-term vision health.',
   sell:'Farmina includes marigold extract as a natural source of lutein to proactively protect your pet\'s eyes from oxidative damage.'},

  {id:'i18',icon:'🌾',name:'Organic Spelt',cat:'grain',catLabel:'Ancient Grain (LAG Range)',
   conditions:['digestion'],
   what:'An ancient wheat variety used at 10% in the Low Ancestral Grain range. Organically certified — no pesticides or GMOs.',
   why:'Spelt has a different gluten structure to modern wheat, making it more digestible for many dogs. Rich in B vitamins, magnesium and zinc. Ancient grains were part of the original "ancestral" canine diet.',
   sell:'Not all grains are equal. Organic spelt is nothing like processed corn or wheat derivatives. It\'s a clean, traceable, ancient carbohydrate.'},

  {id:'i19',icon:'🌾',name:'Organic Oats',cat:'grain',catLabel:'Ancient Grain (LAG Range)',
   conditions:['digestion','immune'],
   what:'Whole organic oats at 10% in the Low Ancestral Grain range. Naturally gluten-free in their pure form.',
   why:'Oats contain beta-glucan — a type of soluble fiber proven to reduce cholesterol and support immune function. Rich in iron, manganese and B vitamins.',
   sell:'For dogs that need a calorie source beyond protein and fat, oats are the cleanest option. Naturally energising and easily digested.'},

  {id:'i20',icon:'💧',name:'Fish Oil (Herring)',cat:'protein',catLabel:'Omega-3 Source',
   conditions:['skin','brain','heart','joint'],
   what:'Cold-pressed oil from herring, added as a concentrated source of EPA and DHA omega-3 fatty acids.',
   why:'Omega-3s are anti-inflammatory, support skin and coat condition, improve cognitive function and support heart health. Essential for cats who cannot synthesise DHA efficiently.',
   sell:'Every Farmina formula includes fish oil on top of the fresh/dehydrated fish ingredients. Double the omega-3 support.'},

  {id:'i21',icon:'🍠',name:'Sweet Potato',cat:'grain',catLabel:'Low-GI Carbohydrate',
   conditions:['digestion'],
   what:'Whole sweet potato used as a carbohydrate source in several N&D grain-free formulas, such as N&D Prime Puppy and N&D Ocean Puppy. Rich in beta-carotene, vitamin C, potassium and dietary fibre.',
   why:'Sweet potato has a lower glycaemic index than white potato or rice, providing sustained energy release rather than blood sugar spikes. A nutrient-dense, naturally sweet carb source that is highly palatable and easy to digest.',
   sell:'When customers ask what replaces grains in grain-free food, sweet potato is the answer. Clean energy, no spikes, plus natural vitamins built in.'},

  {id:'i22',icon:'🍈',name:'Cantaloupe Melon',cat:'fruit',catLabel:'Antioxidant Fruit',
   conditions:['eye','immune'],
   what:'Dried cantaloupe melon at 0.5% in the N&D Ocean Puppy formula. Rich in beta-carotene, vitamin C, vitamin A and potassium.',
   why:'Cantaloupe provides natural antioxidant support during the rapid growth phase of puppyhood. Beta-carotene is a precursor to vitamin A, essential for healthy vision, immune function and skin development.',
   sell:'A unique ingredient that sets the Ocean Puppy formula apart — functional fruit nutrition specifically chosen for growing dogs.'},

  {id:'i23',icon:'🦐',name:'Dried Shrimp',cat:'joint',catLabel:'Natural Joint Source',
   conditions:['joint'],
   what:'Dried shrimp used as a natural source of glucosamine and chondroitin sulphate in the N&D Ocean Puppy formula.',
   why:'Marine-sourced glucosamine from shrimp shells is highly bioavailable. Including it from puppyhood supports correct joint and cartilage development, particularly important in medium and large breed puppies.',
   sell:'Most puppy foods use synthetic glucosamine. Farmina Ocean Puppy uses real dried shrimp — natural joint support that starts on day one.'},

  {id:'i24',icon:'🫘',name:'Linseed (Flaxseed)',cat:'botanical',catLabel:'Plant Omega-3',
   conditions:['skin'],
   what:'Cold-pressed linseed (flaxseed) used in the N&D Quinoa Skin & Coat formulas. The richest plant source of ALA omega-3 fatty acids.',
   why:'ALA omega-3 supports skin barrier function and reduces trans-epidermal water loss — keeping skin hydrated and coat glossy. Combined with fish oil, linseed creates a comprehensive omega-3 and omega-6 fatty acid profile.',
   sell:'For dogs with dry, flaky skin or a dull coat, the dual omega approach (fish oil + linseed) in the Skin & Coat formula is the most comprehensive natural solution available.'},

  {id:'i25',icon:'🥥',name:'Dried Coconut',cat:'botanical',catLabel:'Medium-Chain Fatty Acids',
   conditions:['skin'],
   what:'Dried coconut included in the N&D Quinoa Skin & Coat formulas. Contains lauric acid and medium-chain triglycerides (MCTs).',
   why:'MCTs are rapidly absorbed and used directly as energy, bypassing normal fat digestion. Lauric acid has natural antimicrobial properties. MCTs also support skin lipid barriers and coat conditioning.',
   sell:'Coconut oil has been popular in holistic pet care for years. The Skin & Coat formula includes it as a whole food ingredient — natural coat conditioning from the inside out.'},

  {id:'i26',icon:'🥦',name:'Vegetables (general)',cat:'botanical',catLabel:'Nutrient Variety',
   conditions:['digestion', 'immune'],
   what:'Natural source of fibres and micronutrients from various vegetable mixes.',
   why:'Provides essential nutrients that support normal digestion and overall vitality for both dogs and cats.',
   sell:'"A variety of vegetables ensures your pet gets a natural range of micronutrients that support their daily energy and health."'},

  {id:'i27',icon:'🥕',name:'Carrots',cat:'botanical',catLabel:'Digestive & Antioxidant',
   conditions:['digestion', 'immune'],
   what:'Dried carrots providing fibre and carotenoids (pro-vitamin A).',
   why:'Fibre supports stool quality and digestive regularity, while carotenoids contribute to the pet\'s natural antioxidant intake.',
   sell:'"Carrots aren\'t just for crunch — they provide vital fibre for perfect stools and antioxidants for a healthy immune system."'},

  {id:'i28',icon:'🌿',name:'Alfalfa',cat:'botanical',catLabel:'Digestive Regularity',
   conditions:['digestion'],
   what:'Sun-cured alfalfa, a natural source of plant fibre.',
   why:'Helps support normal stool consistency and GI motility as part of a balanced ancestral diet.',
   sell:'"Alfalfa is a natural way to ensure your pet\'s digestive system keeps moving correctly and stools stay consistent."'},

  {id:'i29',icon:'🍎',name:'Apples',cat:'fruit',catLabel:'Healthy Stools',
   conditions:['digestion'],
   what:'Dried apples, a natural source of dietary fibre.',
   why:'Used in small amounts to help support healthy stools and digestive regularity.',
   sell:'"Apples provide a gentle source of fibre that helps maintain regular bowel movements and healthy digestion."'},

  {id:'i30',icon:'🥬',name:'Spinach',cat:'botanical',catLabel:'Antioxidant Support',
   conditions:['immune'],
   what:'Leafy greens providing naturally occurring antioxidants and micronutrients.',
   why:'Leafy greens support overall health and provide essential micronutrients when included appropriately in the diet.',
   sell:'"Spinach is a powerhouse of natural antioxidants that help protect your pet\'s cells and support their immune system."'},

  {id:'i31',icon:'🌾',name:'Fibre (general)',cat:'prebiotic',catLabel:'Satiety & Gut Health',
   conditions:['digestion'],
   what:'A blend of dietary fibres from veterinary-approved sources.',
   why:'Supports the management of GI signs (like loose stools) and promotes gut health and satiety.',
   sell:'"The right blend of fibre is essential for both good digestion and helping your pet feel full and satisfied after meals."'},

  {id:'i32',icon:'🟢',name:'Pea fibre',cat:'prebiotic',catLabel:'Intestinal Transit',
   conditions:['digestion'],
   what:'An insoluble fibre fraction from peas.',
   why:'Helps support healthy intestinal transit and promotes stool firmness, especially in pets with sensitive digestion.',
   sell:'"Pea fibre is a key ingredient for ensuring stools are firm and transit time through the gut is optimal."'},

  {id:'i33',icon:'🍺',name:'Brewer’s yeast',cat:'prebiotic',catLabel:'Immune Modulation',
   conditions:['digestion', 'immune'],
   what:'Yeast components including β-glucans.',
   why:'Studied for its ability to modulate the immune system and support overall gut health in dogs.',
   sell:'"Brewer\'s yeast is a natural way to boost the immune system and support a healthy digestive environment."'},

  {id:'i34',icon:'🌵',name:'Aloe vera',cat:'botanical',catLabel:'Digestive Comfort',
   conditions:['digestion'],
   what:'Controlled gel-derived extracts of the Aloe vera plant.',
   why:'Traditionally associated with providing digestive comfort; Farmina uses strictly controlled extracts to ensure safety and effectiveness.',
   sell:'"Aloe vera is nature\'s way of soothing the digestive tract, providing comfort for pets with sensitive stomachs."'},

  {id:'i35',icon:'🍵',name:'Green tea',cat:'botanical',catLabel:'Natural Antioxidant',
   conditions:['immune'],
   what:'Green tea extract rich in catechins.',
   why:'Provides powerful antioxidant activity to fight oxidative stress; inclusion levels are precisely controlled for maximum safety.',
   sell:'"Green tea extract provides one of the most powerful natural antioxidants known to science, protecting your pet from the inside out."'},

  {id:'i36',icon:'🌿',name:'Rosemary',cat:'botanical',catLabel:'Oxidative Stability',
   conditions:['immune'],
   what:'Rosemary extract, a natural antioxidant used for both food stability and pet health.',
   why:'Documented to provide antioxidant activity and slow the oxidation of fats, ensuring food stays fresh and nutritious.',
   sell:'"Rosemary is our natural preservative, keeping the food fresh while providing a boost of antioxidants for your pet."'},
];

// ═══════════════════════════════════════
// BODY CONDITIONS — for the "By Condition" filter
// id must match the strings used in each ingredient's conditions:[] array
// ═══════════════════════════════════════
const BODY_CONDITIONS = [
  {id:'digestion', icon:'🍏', label:'Digestion',     blurb:'Ingredients that regulate gut health, bowel movements and the microbiome.'},
  {id:'joint',     icon:'🦴', label:'Joints',        blurb:'Natural compounds that build, protect and lubricate joint cartilage.'},
  {id:'skin',      icon:'🐾', label:'Skin & Coat',   blurb:'Omega fatty acids and botanicals that restore skin barrier and coat shine.'},
  {id:'immune',    icon:'🛡️', label:'Immunity',      blurb:'Prebiotics and antioxidants that strengthen the immune response.'},
  {id:'brain',     icon:'🧠', label:'Brain',         blurb:'DHA-rich ingredients that support cognitive function — especially important in seniors.'},
  {id:'eye',       icon:'👁️', label:'Eyes',          blurb:'Carotenoids that protect against age-related eye damage and cataracts.'},
  {id:'heart',     icon:'❤️', label:'Heart',         blurb:'Omega-3 fatty acids and antioxidants that support cardiovascular health.'},
  {id:'allergy',   icon:'🌿', label:'Sensitivities', blurb:'Novel proteins rarely used commercially — ideal for food allergy elimination diets.'},
];

// ═══════════════════════════════════════
// CONDITION → MATCHER RULE
// Formulas are derived in matcher.js from each card's declared composition
// and claims, so the panel cannot point at a missing product id.
// ═══════════════════════════════════════
const CONDITION_MATCHER_RULES = {
  digestion: 'digestion',
  joint:     'joints',
  skin:      'skin',
  immune:    'immunity',
  brain:     'omega3',
  eye:       'eye',
  heart:     'omega3',
  allergy:   'novel',
};

function normalizeIngredientKey(value){
  return (value || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function applyScrapedIngredientData(){
  if(typeof FARMINA_SCRAPED_INGREDIENTS === 'undefined') return;
  const scrapedIndex = new Map(FARMINA_SCRAPED_INGREDIENTS.map(item => [normalizeIngredientKey(item.canonical), item]));
  INGREDIENTS.forEach(item => {
    const key = normalizeIngredientKey(item.name);
    const scraped = scrapedIndex.get(key);
    if(!scraped) return;
    if(!item.conditions || item.conditions.length === 0){
      item.conditions = (scraped.conditions_it_appears_in || '').split(',').map(s=>s.trim()).filter(Boolean);
    }
    if(scraped.benefit_statement){
      item.benefit_statement = scraped.benefit_statement;
    }
    if(scraped.nutritional_role){
      item.nutritional_role = scraped.nutritional_role;
    }
    if(scraped.notes){
      item.notes = scraped.notes;
    }
    if(scraped.conditions_it_appears_in){
      item.scraped_conditions = scraped.conditions_it_appears_in.split(',').map(s=>s.trim()).filter(Boolean);
    }
    if(scraped.lines_it_appears_in){
      item.scraped_lines = scraped.lines_it_appears_in.split(',').map(s=>s.trim()).filter(Boolean);
    }
  });
}

applyScrapedIngredientData();
