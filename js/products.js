// ═══════════════════════════════════════
// PRODUCTS DATA — SOURCE OF TRUTH
// Based on official product lines document
// Each product is strictly categorized by range, pet type, and life stage
// ═══════════════════════════════════════

const PRODUCTS = [
  // ═══════════════════════════════════════
  // DOG PRODUCTS - STRICTLY CATEGORIZED
  // ═══════════════════════════════════════

  // ── N&D PRIME GRAIN FREE (DOG) ──
  {id:'dp1',line:'prime',lineName:'N&D Prime Grain Free',pet:'dog',stage:'puppy',
   name:'Chicken & Pomegranate',variant:'Puppy Dog',icon:'🐶',
   protein:'Chicken',
   nutrition:{protein:32,proteinAnimal:98,fat:22,moisture:9},
   macros:{meat:'80%',grains:'0%',fruits:'20%',legumes:'0%',fresh:'48%'},
   highlights:['GMO Free','Grain Free','Legume Free','High Fresh Meat','No Plant Protein','Puppy Formula'],
   composition:'Deboned chicken (28%), dried chicken protein (27%), sweet potato, chicken fat, dried eggs, herring, dried herring protein, fish oil (from herring), pea fibre, dried carrots, alfalfa meal, chicken cartilage (source of glucosamine and chondroitin sulphate), inulin, fructooligosaccharides, yeast extract (source of mannan-oligosaccharides), dried pomegranate (0.5%), dried apple, dried spinach, psyllium husks and seeds (0.3%), dried sweet orange, dried blueberry, sodium chloride, dried brewer\'s yeast, turmeric (0.2%), aloe vera extract.',
   suitable:'Puppies and gestating/lactating bitches. All breeds and life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'98% animal-sourced protein with zero legumes — Prime eliminates the pea/lentil debate entirely. The cleanest Farmina puppy formula available.'},

  {id:'dp2',line:'prime',lineName:'N&D Prime Grain Free',pet:'dog',stage:'adult',
   name:'Chicken & Pomegranate',variant:'Adult Dog',icon:'🐕',
   protein:'Chicken',
   nutrition:{protein:34,proteinAnimal:98,fat:18,moisture:9},
   macros:{meat:'76%',grains:'0%',fruits:'24%',legumes:'0%',fresh:'46%'},
   highlights:['GMO Free','Grain Free','Legume Free','High Fresh Meat','No Plant Protein'],
   composition:'Deboned chicken (26%), dried chicken protein (25%), sweet potato, chicken fat, dried eggs, herring, dried herring protein, fish oil (from herring), pea fibre, dried carrots, alfalfa meal, inulin, fructooligosaccharides, yeast extract (source of mannan-oligosaccharides), dried pomegranate (0.5%), dried apple, dried spinach, psyllium husks and seeds (0.3%), dried sweet orange, dried blueberry, sodium chloride, dried brewer\'s yeast, turmeric (0.2%), aloe vera extract, glucosamine, chondroitin sulphate.',
   suitable:'All breeds and all life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'34% protein entirely from named animal sources, no legumes at all. Highest protein content in the adult dog range.'},

  // ── N&D OCEAN (DOG) ──
  {id:'do1',line:'ocean',lineName:'N&D Ocean',pet:'dog',stage:'puppy',
   name:'Cod, Pumpkin & Cantaloupe Melon',variant:'Puppy Dog',icon:'🐶',
   protein:'Cod',
   nutrition:{protein:30,proteinAnimal:96,fat:20,moisture:9},
   macros:{meat:'77%',grains:'0%',fruits:'23%',legumes:'0%',fresh:'49%'},
   highlights:['GMO Free','Mono Protein','Grain Free','Wild Caught Cod','Puppy Formula','High Omega-3'],
   composition:'Cod (26%), dried cod protein (25%), sweet potato, fish oil (from herring), dried herring protein, dried pumpkin (5%), dried shrimp (source of glucosamine and chondroitin sulphate), pea fibre, dried carrots, alfalfa meal, inulin, fructooligosaccharides, yeast extract (source of mannan-oligosaccharides), cantaloupe melon (0.5%), dried apple, dried pomegranate, dried spinach, psyllium husks and seeds, dried blueberry, sodium chloride, potassium chloride, calcium carbonate, dried brewers\' yeast, turmeric (0.2%), aloe vera extract.',
   suitable:'Puppies and gestating/lactating bitches. All breeds and life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'A mono-protein puppy formula built around wild-caught cod — ideal for minimising early allergen exposure.'},

  {id:'do2',line:'ocean',lineName:'N&D Ocean',pet:'dog',stage:'adult',
   name:'Cod, Pumpkin & Orange',variant:'Adult Dog',icon:'🐕',
   protein:'Cod',
   nutrition:{protein:30,proteinAnimal:96,fat:18,moisture:9},
   macros:{meat:'67%',grains:'0%',fruits:'33%',legumes:'0%',fresh:'50%'},
   highlights:['GMO Free','Mono Protein','Grain Free','Wild Caught Cod','High Omega-3','High Taurine'],
   composition:'Fresh wild-caught cod (25%), dehydrated cod (25%), pea starch, herring oil, dehydrated pumpkin (5%), pea fibre, dried carrots, sun-cured alfalfa, inulin, fructooligosaccharides, mannan-oligosaccharides, dried sweet orange (0.5%), dried apple, dried pomegranate, dried spinach, psyllium (0.3%), dried blueberries, sodium chloride, dried beer yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, marigold flower extract (source of lutein), aloe vera gel concentrate, green tea extract, rosemary extract.',
   suitable:'All breeds and all life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'50% fresh/raw cod with exceptional taurine levels. One of the most heart-supportive formulas in the Farmina range.'},

  // ── N&D PUMPKIN GRAIN FREE (DOG) ──
  {id:'dp3',line:'pumpkin',lineName:'N&D Pumpkin Grain Free',pet:'dog',stage:'puppy',
   name:'Lamb, Pumpkin & Blueberry',variant:'Puppy Dog',icon:'🐑',
   protein:'Lamb',
   nutrition:{protein:32,proteinAnimal:96,fat:20,moisture:9},
   macros:{meat:'70%',grains:'0%',fruits:'30%',legumes:'0%',fresh:'50%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','With Pumpkin','Puppy Formula'],
   composition:'Fresh boneless lamb (26%), dehydrated lamb protein (24%), pea starch, chicken fat, dried pumpkin (5%), dried eggs, herring, dehydrated herring protein, fish oil, pea fibre, dried carrots, alfalfa meal, inulin, FOS, MOS, dried blueberry (0.5%), dried apple, dried pomegranate, dried sweet orange, dried spinach, psyllium husks and seeds (0.3%), sodium chloride, dried brewer\'s yeast, turmeric (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein), aloe vera extract, green tea extract, rosemary extract.',
   suitable:'Puppies and gestating/lactating bitches. All breeds and life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'Premium puppy formula with grass-fed lamb and pumpkin for digestive support.'},

  {id:'dp4',line:'pumpkin',lineName:'N&D Pumpkin Grain Free',pet:'dog',stage:'puppy',
   name:'Chicken, Pumpkin & Pomegranate',variant:'Puppy Dog',icon:'🐶',
   protein:'Chicken',
   nutrition:{protein:30,proteinAnimal:96,fat:20,moisture:9},
   macros:{meat:'68%',grains:'0%',fruits:'12%',legumes:'20%',fresh:'51%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','With Pumpkin','Puppy Formula'],
   composition:'Fresh boneless chicken (26%), dehydrated chicken protein (24%), pea starch, chicken fat, dried pumpkin (5%), dried eggs, herring, dehydrated herring protein, fish oil, pea fibre, dried carrots, alfalfa meal, inulin, FOS, yeast extract (MOS), dried pomegranate (0.5%), dried apple, dried spinach, psyllium husks and seeds (0.3%), dried sweet orange, dried blueberries, sodium chloride, dried brewer\'s yeast, turmeric (0.2%), glucosamine, chondroitin sulfate.',
   suitable:'Puppies and gestating/lactating bitches. All breeds and life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'Chicken-based puppy formula with pumpkin for superior digestive support.'},

  {id:'dp5',line:'pumpkin',lineName:'N&D Pumpkin Grain Free',pet:'dog',stage:'adult',
   name:'Chicken, Pumpkin & Pomegranate',variant:'Adult Dog',icon:'🐕',
   protein:'Chicken',
   nutrition:{protein:30,proteinAnimal:96,fat:18,moisture:9},
   macros:{meat:'68.8%',grains:'0%',fruits:'11.5%',legumes:'19.7%',fresh:'51%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','With Pumpkin','Byproduct Free'],
   composition:'Fresh boneless chicken (24%), dehydrated chicken protein (22%), pea starch, chicken fat, dried pumpkin (5%), dried eggs, herring, dehydrated herring protein, fish oil, pea fibre, dried carrots, alfalfa meal, inulin, FOS, yeast extract (MOS), dried pomegranate (0.5%), dried apple, dried spinach, psyllium husks and seeds (0.3%), dried sweet orange, dried blueberries, sodium chloride, dried brewer\'s yeast, turmeric (0.2%), aloe vera extract, glucosamine, chondroitin sulfate.',
   suitable:'All breeds and all life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'The Pumpkin version adds 5% dried pumpkin for superior digestive support.'},

  {id:'dp6',line:'pumpkin',lineName:'N&D Pumpkin Grain Free',pet:'dog',stage:'adult',
   name:'Lamb, Pumpkin & Blueberry',variant:'Adult Dog',icon:'🐑',
   protein:'Lamb',
   nutrition:{protein:30,proteinAnimal:96,fat:18,moisture:9},
   macros:{meat:'67%',grains:'0%',fruits:'33%',legumes:'0%',fresh:'50%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','With Pumpkin','High Antioxidants'],
   composition:'Fresh boneless lamb (22%), dehydrated lamb protein (20%), pea starch, chicken fat, dried pumpkin (5%), dried eggs, herring, dehydrated herring protein, herring oil, pea fibre, dried carrots, sun-cured alfalfa, inulin, FOS, MOS, dried blueberry (0.5%), dried apple, dried pomegranate, dried sweet orange, dried spinach, psyllium husks and seeds (0.3%), sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, marigold flower extract (lutein), aloe vera gel concentrate, green tea extract, rosemary extract.',
   suitable:'All breeds and all life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'Green tea and aloe vera support skin and joint health.'},

  {id:'dp7',line:'pumpkin',lineName:'N&D Pumpkin Grain Free',pet:'dog',stage:'adult',
   name:'Boar, Pumpkin & Apple',variant:'Adult Dog',icon:'🐗',
   protein:'Boar',
   nutrition:{protein:30,proteinAnimal:96,fat:18,moisture:9},
   macros:{meat:'67.5%',grains:'0%',fruits:'15.1%',legumes:'17.4%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Novel Protein','Wild Boar'],
   composition:'Fresh boneless wild boar (24%), dehydrated boar meat (22%), pea starch, chicken fat, dehydrated pumpkin (5%), dehydrated whole eggs, fish oil, pea vegetable fibre, dried carrots, dried alfalfa, inulin, FOS, MOS, dehydrated apple (0.5%), spinach powder, psyllium (0.3%), pomegranate powder, blackcurrant, dehydrated sweet orange, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulphate, Marigold extract (lutein).',
   suitable:'All breeds and all life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'Wild boar is rarely used in pet food — ideal for elimination diets or rotation feeding.'},

  // ── N&D LOW ANCESTRAL GRAIN (DOG) ──
  {id:'dl1',line:'lag',lineName:'N&D Low Ancestral Grain',pet:'dog',stage:'puppy',
   name:'Chicken, Spelt, Oats & Pomegranate',variant:'Puppy Dog',icon:'🐶',
   protein:'Chicken',
   nutrition:{protein:30,proteinAnimal:90,fat:20,moisture:9},
   macros:{meat:'70.3%',grains:'20%',fruits:'9.7%',legumes:'0%',fresh:'45%'},
   highlights:['GMO Free','Meat Meal Free','Organic Spelt & Oats','No Corn/Wheat/Rice','Puppy Formula'],
   composition:'Fresh boneless chicken (24%), dehydrated chicken meat (22%), organic spelt (10%), organic oats (10%), chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, pea fibre, fish oil, dried carrots, dried alfalfa, inulin, FOS, MOS, pomegranate powder (0.5%), dehydrated apple, spinach powder, psyllium (0.3%), blackcurrant, dehydrated sweet orange, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulphate, Marigold extract (lutein).',
   suitable:'Puppies and gestating/lactating bitches. All breeds and life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'Premium puppy nutrition with organic spelt and oats. Perfect for owners wanting quality without fully grain-free.'},

  {id:'dl2',line:'lag',lineName:'N&D Low Ancestral Grain',pet:'dog',stage:'adult',
   name:'Chicken, Spelt, Oats & Pomegranate',variant:'Adult Dog',icon:'🐕',
   protein:'Chicken',
   nutrition:{protein:30,proteinAnimal:90,fat:18,moisture:9},
   macros:{meat:'63.6%',grains:'20%',fruits:'16.4%',legumes:'0%',fresh:'48%'},
   highlights:['GMO Free','Meat Meal Free','Organic Spelt & Oats','No Corn/Wheat/Rice'],
   composition:'Fresh boneless chicken (20%), dehydrated chicken meat (18%), spelt (10%), oats (10%), chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, dried beet pulp, fish oil, dried carrots, dried alfalfa, inulin, FOS, MOS, pomegranate powder (0.5%), dehydrated apple, spinach powder, psyllium (0.3%), blackcurrant, dehydrated sweet orange, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein).',
   suitable:'All breeds and all life stages.',
   sizes:['800g','2.5kg','7kg','12kg'],
   sell:'The bridge product for customers switching from supermarket food. Only organic ancient grains.'},

  {id:'dl3',line:'lag',lineName:'N&D Low Ancestral Grain',pet:'dog',stage:'light',
   name:'Chicken, Spelt, Oats & Pomegranate Light',variant:'Light Adult Dog',icon:'🐕',
   protein:'Chicken',
   nutrition:{protein:34,proteinAnimal:90,fat:11,moisture:9},
   macros:{meat:'62.7%',grains:'20%',fruits:'17.3%',legumes:'0%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Reduced Calorie','Organic Spelt & Oats','Weight Management'],
   composition:'Fresh boneless chicken (20%), dehydrated chicken meat (18%), spelt (10%), oats (10%), fresh herring, dehydrated herring, dehydrated whole eggs, dried beet pulp, dried alfalfa, chicken fat, fish oil, dried carrots, inulin, FOS, MOS, pomegranate powder (0.5%), dehydrated apple, spinach powder, psyllium (0.3%), blackcurrant, dehydrated sweet orange, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein).',
   suitable:'Adult dogs needing weight management. All breeds.',
   sizes:['2.5kg','12kg'],
   sell:'Reduced calorie formula for overweight or less active dogs.'},

  // ── N&D QUINOA GRAIN FREE (DOG - SKIN & COAT) ──
  {id:'dq1',line:'quinoa',lineName:'N&D Quinoa Grain Free',pet:'dog',stage:'adult',
   name:'Quail, Quinoa, Coconut & Turmeric',variant:'Skin & Coat Adult Dog',icon:'🐦',
   protein:'Quail',
   nutrition:{protein:23,proteinAnimal:92,fat:12,moisture:9},
   macros:{meat:'55%',grains:'0%',fruits:'5%',legumes:'38%',fresh:'30%'},
   highlights:['GMO Free','Mono Protein','Grain Free','Skin & Coat','Novel Protein','Lean Protein'],
   composition:'Quail, dehydrated quail protein, pea starch, fish oil from herring, quinoa seed (extracted), linseed, dried coconut, turmeric, inulin, fructooligosaccharides, yeast extract (source of mannooligosaccharides), calcium carbonate, dicalcium phosphate, psyllium husks and seeds, potassium chloride, sodium chloride, dried brewers\' yeast, aloe vera extract, glucosamine, chondroitin sulphate.',
   suitable:'Adult dogs of all breeds. Farmina lists it for reducing ingredient and nutrient intolerances and supporting skin and coat.',
   sizes:['800g','2.5kg','7kg'],
   sell:'Quail is exceptionally lean and highly digestible with omega fatty acid support for skin and coat health.'},

  {id:'dq2',line:'quinoa',lineName:'N&D Quinoa Grain Free',pet:'dog',stage:'adult',
   name:'Duck, Quinoa, Coconut & Turmeric',variant:'Skin & Coat Adult Dog',icon:'🦆',
   protein:'Duck',
   nutrition:{protein:23,proteinAnimal:92,fat:12,moisture:9},
   macros:{meat:'55%',grains:'0%',fruits:'5%',legumes:'38%',fresh:'30%'},
   highlights:['GMO Free','Mono Protein','Grain Free','Skin & Coat','Novel Protein','Omega Rich'],
   composition:'Boneless duck, dehydrated duck protein, pea starch, fish oil from herring, quinoa seed (extracted), linseed, dried coconut, turmeric, inulin, fructooligosaccharides, yeast extract (source of mannooligosaccharides), calcium carbonate, dicalcium phosphate, psyllium husks and seeds, potassium chloride, sodium chloride, dried brewers\' yeast, aloe vera extract, glucosamine, chondroitin sulphate.',
   suitable:'Adult dogs of all breeds. Farmina lists it for reducing ingredient and nutrient intolerances and supporting skin and coat.',
   sizes:['800g','2.5kg','7kg'],
   sell:'Mono-protein skin and coat formula with duck and quinoa for exceptional omega support.'},

  // ═══════════════════════════════════════
  // CAT PRODUCTS - STRICTLY CATEGORIZED
  // ═══════════════════════════════════════

  // ── N&D PRIME GRAIN FREE (CAT) ──
  {id:'cp1',line:'prime',lineName:'N&D Prime Grain Free',pet:'cat',stage:'kitten',
   name:'Chicken & Pomegranate',variant:'Kitten',icon:'🐱',
   protein:'Chicken',
   nutrition:{protein:44,proteinAnimal:98,fat:20,moisture:8},
   macros:{meat:'86.2%',grains:'0%',fruits:'13.3%',legumes:'0.5%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Kitten Formula','High Protein'],
   composition:'Fresh boneless chicken (30%), dehydrated chicken meat (28%), potatoes, chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, fish oil, hydrolyzed animal proteins, fiber vegetable of peas, dried carrots, dried alfalfa, inulin, FOS, MOS, pomegranate powder (0.5%), dehydrated apple, spinach powder, psyllium (0.3%), blackcurrant, sweet orange, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein).',
   suitable:'Kittens and gestating/lactating cats. All breeds and life stages.',
   sizes:['300g','1.5kg'],
   sell:'Cats are obligate carnivores. 86% from animal sources. The highest-quality kitten start available.'},

  {id:'cp2',line:'prime',lineName:'N&D Prime Grain Free',pet:'cat',stage:'adult',
   name:'Chicken & Pomegranate',variant:'Adult Cat',icon:'🐈',
   protein:'Chicken',
   nutrition:{protein:44,proteinAnimal:98,fat:20,moisture:8},
   macros:{meat:'86%',grains:'0%',fruits:'13.5%',legumes:'0.5%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','High Protein','Premium'],
   composition:'Fresh boneless chicken (30%), dehydrated chicken meat (28%), potatoes, chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, fish oil, hydrolyzed animal proteins, peas, dried carrots, dried alfalfa, inulin, FOS, MOS, pomegranate powder (0.5%), dehydrated apple, spinach powder, psyllium (0.3%), blackcurrant, sweet orange, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein).',
   suitable:'All breeds and all life stages.',
   sizes:['300g','1.5kg','5kg'],
   sell:'One of the most biologically appropriate cat foods. High protein, no grains, no fillers.'},

  {id:'cp3',line:'prime',lineName:'N&D Prime Grain Free',pet:'cat',stage:'adult',
   name:'Lamb & Blueberry',variant:'Adult Cat',icon:'🐈',
   protein:'Lamb',
   nutrition:{protein:42,proteinAnimal:98,fat:20,moisture:8},
   macros:{meat:'85%',grains:'0%',fruits:'15%',legumes:'0%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Novel Protein','Antioxidant'],
   composition:'Fresh boneless lamb (28%), dehydrated lamb meat (26%), sweet potato, chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, herring oil, pea fibre, dried carrots, sun-cured alfalfa, inulin, FOS, MOS, blueberry powder (0.5%), dehydrated sweet orange, dehydrated apple, pomegranate powder, spinach powder, psyllium (0.3%), sodium chloride, dried brewer\'s yeast, turmeric (0.2%), glucosamine, chondroitin sulfate, marigold flower extract (lutein), aloe vera gel concentrate, green tea extract, rosemary extract.',
   suitable:'All breeds and all life stages.',
   sizes:['300g','1.5kg','5kg'],
   sell:'Novel protein for cats. Grass-fed lamb with outstanding antioxidant support.'},

  {id:'cp4',line:'prime',lineName:'N&D Prime Grain Free',pet:'cat',stage:'adult',
   name:'Boar & Apple',variant:'Adult Cat',icon:'🐈',
   protein:'Boar',
   nutrition:{protein:44,proteinAnimal:98,fat:20,moisture:8},
   macros:{meat:'85.7%',grains:'0%',fruits:'13.8%',legumes:'0.5%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Novel Protein','Alternative Protein'],
   composition:'Fresh boneless wild boar (25%), dehydrated boar meat (23%), potatoes, fresh boneless chicken, dehydrated chicken meat, chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, hydrolyzed animal protein, fish oil, peas, dried carrots, dried alfalfa, inulin, FOS, MOS, dehydrated apple (0.5%), pomegranate powder, dehydrated sweet orange, spinach powder, psyllium (0.3%), blackcurrant, blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein).',
   suitable:'All breeds and all life stages.',
   sizes:['300g','1.5kg','5kg'],
   sell:'Wild boar — excellent for cats with chicken or beef sensitivities. Perfect for cats with food intolerances.'},

  {id:'cp6',line:'prime',lineName:'N&D Prime Grain Free',pet:'cat',stage:'neutered',
   name:'Chicken & Pomegranate',variant:'Neutered Adult Cat',icon:'🐈‍⬛',
   protein:'Chicken',
   nutrition:{protein:46,proteinAnimal:98,fat:11,moisture:8},
   macros:{meat:'86%',grains:'0%',fruits:'14%',legumes:'0%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Neutered','Weight Management','High Taurine'],
   composition:'Fresh boneless chicken (30%), dehydrated chicken (28%), sweet potato, chicken fat, dehydrated whole eggs, fresh herring, dehydrated herring, herring oil, pea fibre, dried carrots, dried alfalfa, inulin, FOS, MOS, pomegranate powder (0.5%), dehydrated apple, spinach powder, psyllium (0.3%), blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate, Marigold extract (lutein).',
   suitable:'Neutered/sterilised cats. All breeds and all life stages.',
   sizes:['300g','1.5kg','5kg'],
   sell:'High protein (46%) keeps lean muscle, while low fat (11%) manages weight — the right balance for neutered cats. Exceptional taurine levels (8500mg/kg) support heart health throughout their life.'},

  // ── N&D OCEAN (CAT) ──
  {id:'co1',line:'ocean',lineName:'N&D Ocean',pet:'cat',stage:'adult',
   name:'Herring & Orange',variant:'Adult Cat',icon:'🐠',
   protein:'Herring',
   nutrition:{protein:44,proteinAnimal:98,fat:20,moisture:8},
   macros:{meat:'82.6%',grains:'0%',fruits:'16.8%',legumes:'0.6%',fresh:'47%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Wild Caught Fish','High Omega-3'],
   composition:'Fresh herrings (32%), dehydrated herrings (30%), sweet potatoes, fish oil (herring), dried whole eggs, fiber vegetable of peas, dried carrots, dried alfalfa, inulin, FOS, yeast extract (MOS), dried sweet orange (0.5%), dried apple, dried pomegranate, dried spinach, psyllium (0.3%), dried blueberries, sodium chloride, dried brewer\'s yeast, turmeric root (0.2%), glucosamine, chondroitin sulfate.',
   suitable:'All breeds and all life stages.',
   sizes:['300g','1.5kg','5kg'],
   sell:'One of the richest natural sources of Omega-3. Exceptional for cats with skin or coat issues.'},

  // ── N&D PUMPKIN GRAIN FREE (CAT - NEUTERED) ──
  {id:'cp5',line:'pumpkin',lineName:'N&D Pumpkin Grain Free',pet:'cat',stage:'neutered',
   name:'Lamb, Pumpkin & Blueberry',variant:'Neutered Adult Cat',icon:'🐈‍⬛',
   protein:'Lamb',
   nutrition:{protein:46,proteinAnimal:96,fat:11,moisture:8},
   macros:{meat:'80%',grains:'0%',fruits:'20%',legumes:'0%',fresh:'42%'},
   highlights:['GMO Free','Meat Meal Free','Grain Free','Neutered','Weight Management','With Pumpkin'],
   composition:'Lamb, dehydrated lamb protein, sweet potato, dehydrated herring protein, dried pumpkin (5%), dried eggs, chicken fat, fish oil from herring, dried beet pulp, dried carrot, alfalfa meal, inulin, fructooligosaccharides, yeast extract (source of mannooligosaccharides), dried blueberry, dried pomegranate, dried spinach, psyllium husks and seeds, dried sweet orange, dried apple, sodium chloride, dried brewers\' yeast, turmeric, aloe vera extract.',
   suitable:'Neutered/sterilised cats. All breeds and all life stages.',
   sizes:['300g','1.5kg','5kg'],
   sell:'Calorie-controlled for neutered cats. Grass-fed lamb is novel protein. Pumpkin provides natural digestive fibre.'},

  // ── N&D QUINOA GRAIN FREE (CAT - URINARY) ──
  {id:'cq1',line:'quinoa',lineName:'N&D Quinoa Grain Free',pet:'cat',stage:'adult',
   name:'Duck, Quinoa, Cranberry & Chamomile',variant:'Urinary Adult Cat',icon:'🦆',
   protein:'Duck',
   nutrition:{protein:33,proteinAnimal:98,fat:16.5,moisture:8},
   macros:{meat:'85%',grains:'0%',fruits:'15%',legumes:'0%',fresh:'47%'},
   highlights:['GMO Free','Mono Protein','Grain Free','Urinary Support','Novel Protein','Cranberry'],
   composition:'Fresh boneless duck (28%), dehydrated duck meat (26%), sweet potato, duck fat, dehydrated whole eggs, fresh herring, dehydrated herring, herring oil, pea fibre, dried carrots, sun-cured alfalfa, inulin, FOS, MOS, cranberry powder (0.5%), chamomile flowers, dehydrated apple, pomegranate powder, spinach powder, psyllium (0.3%), sodium chloride, dried brewer\'s yeast, turmeric (0.2%), glucosamine, chondroitin sulfate, marigold flower extract (lutein), aloe vera gel concentrate, green tea extract, rosemary extract.',
   suitable:'All breeds and adult life stages. For cats with lower urinary tract disease concerns.',
   sizes:['300g','1.5kg','5kg'],
   sell:'Duck is novel protein. Cranberry and chamomile are included for urinary tract support. Farmina lists it for reducing the recurrence of struvite stones.'},
];

function applyScrapedProductData(){
  catalogIssues = [];
  validatedSourceIds = new Set();
  PRODUCTS.forEach(product=>{
    Object.keys(product).filter(key=>key.startsWith('scraped_')).forEach(key=>delete product[key]);
    product.catalog_error = false;
    try {
      if(typeof FARMINA_SCRAPED_PRODUCTS === 'undefined') throw Error('Source catalogue unavailable');
      const resolved = resolveCatalogProduct(product, FARMINA_SCRAPED_PRODUCTS);
      const best = resolved.records[0];
      product.scraped_product_id = best.product_id;
      product.scraped_product_name = best.product_name;
      product.scraped_product_url = best.product_url;
      product.scraped_line = best.line;
      product.scraped_skus = resolved.skus;
      resolved.records.forEach(record=>validatedSourceIds.add(record.product_id));
      const cheapest = resolved.skus.reduce((best,sku)=>sku.price_current < best.price_current ? sku : best);
      const sizeLabel = cheapest.pack_size_unit === 'g' ? `${parseInt(cheapest.pack_size_grams)} g` : `${cheapest.pack_size_value}${cheapest.pack_size_unit}`;
      product.scraped_price_min = cheapest.price_current;
      product.scraped_price_per_kg = cheapest.price_per_kg;
      product.scraped_price_label = `From R${cheapest.price_current.toFixed(0)} (${sizeLabel})`;
    } catch(error) {
      product.catalog_error = true;
      catalogIssues.push({product_id:product.id,reason:error.message});
    }
  });
}

applyScrapedProductData();
