// ═══════════════════════════════════════
// SELLING TIPS DATA & LOGIC
// ═══════════════════════════════════════

const TIPS = [
  {icon:'🏆',title:'Why Choose Farmina?',items:[
    {q:'"Why is this better than [popular brand]?"',
     a:'Most popular brands use meat meals, by-products, corn and synthetic additives. Farmina starts with fresh, named proteins. You can actually name every ingredient.',
     script:'"With Farmina, the first ingredient is always fresh named meat — not \'meat meal\' or \'animal derivatives\'. You know exactly what your pet is eating, and it\'s human-grade quality."'},
    {q:'"What is Farmina\'s philosophy?"',
     a:'Italian brand. Backed by clinical research and veterinary nutritionists. The N&D range was specifically formulated around ancestral pet nutrition — what dogs and cats evolved to eat.',
     script:'"Farmina was founded by veterinary nutritionists. Every recipe is scientifically formulated and clinically tested. It\'s not just pet food — it\'s precision nutrition."'},
    {q:'"Is Farmina Italian? Does that matter?"',
     a:'Yes — Italy has some of the strictest food production standards in Europe. Italian free-range chicken and wild boar come from regulated, traceable farms. Origin matters for quality.',
     script:'"The chicken in N&D Prime is specifically Italian free-range. That\'s not marketing fluff — it means higher animal welfare standards and better quality protein."'},
  ]},
  {icon:'💰',title:'Price Objection Handling',items:[
    {q:'"It\'s so expensive compared to what I\'m currently buying."',
     a:'Cost per feeding day is the right comparison, not bag price. Premium food is fed in smaller quantities (higher nutrient density = better absorption). Do the daily feeding cost comparison.',
     script:'"A 7kg bag lasts longer than you\'d expect because smaller portions are needed. What are you paying per day currently? Let\'s compare that — most customers are surprised."'},
    {q:'"I can\'t afford to feed premium food every day."',
     a:'Offer rotation or mixing strategies. Even feeding Farmina 50% of the time is a significant upgrade. Or suggest the LAG range as an accessible premium entry point.',
     script:'"Completely understand. You could also mix Farmina with your current food — even partial replacement improves nutrition significantly. The LAG range is a great starting point."'},
    {q:'"Vets bills are already expensive. Why spend more on food?"',
     a:'Preventive nutrition reduces vet visits. Joint support, gut health, skin health, dental health — addressed through food before they become vet problems.',
     script:'"Think of premium food as preventive medicine. Glucosamine, prebiotics, omega-3s — these are things vets charge for as supplements. They\'re already in Farmina."'},
  ]},
  {icon:'🔍',title:'Choosing the Right Product',items:[
    {q:'Customer has a dog with food allergies or skin issues.',
     a:'Compare: N&D Ocean Cod, Pumpkin & Orange, N&D Pumpkin Boar, Pumpkin & Apple, or the N&D Quinoa Skin & Coat recipes (quail or duck, mono protein). Farmina lists Quinoa Skin & Coat for reducing ingredient and nutrient intolerances and supporting skin and coat. A protein the dog has not eaten before is the usual starting point for an elimination diet, agreed with the vet.',
     script:'"For food sensitivities, the usual starting point is a protein they haven\'t eaten before. Has your dog had cod, wild boar, quail or duck? Let\'s compare those, and check the plan with your vet."'},
    {q:'Customer has a dog with loose stools or digestive issues.',
     a:'Recommend: N&D Pumpkin range. The 5% pumpkin is a proven natural digestive regulator. Psyllium husk also helps. The prebiotic trio (inulin + FOS + MOS) rebuilds gut flora.',
     script:'"Pumpkin is actually the first thing most vets recommend for GI upset. The N&D Pumpkin range has 5% dried pumpkin in every formula — plus three types of prebiotics."'},
    {q:'Customer is transitioning from mainstream supermarket food.',
     a:'Start with N&D Low Ancestral Grain. It\'s less of a dietary shock than going fully grain-free. Build the habit first, then consider upgrading to Quinoa or Pumpkin later.',
     script:'"I\'d suggest starting with Low Ancestral Grain — it\'s a premium upgrade that doesn\'t change the diet too dramatically. Once you\'re comfortable, we can look at fully grain-free."'},
    {q:'Customer has a senior dog with joint problems.',
     a:'Every N&D adult dog formula lists glucosamine and chondroitin. N&D Pumpkin Lamb, Pumpkin & Blueberry and N&D Ocean Cod, Pumpkin & Orange also list green tea and rosemary extracts.',
     script:'"All N&D adult dog formulas include glucosamine and chondroitin. The Lamb, Pumpkin & Blueberry and the Cod, Pumpkin & Orange also add green tea and rosemary extracts."'},
    {q:'Customer has a neutered or overweight cat.',
     a:'Compare the two neutered formulas: N&D Prime Chicken & Pomegranate Neutered and N&D Pumpkin Lamb, Pumpkin & Blueberry Neutered. Both are for neutered adult cats and list 11% fat, against 20% in the N&D Prime and N&D Ocean adult cat formulas.',
     script:'"After neutering, cats usually need fewer calories. We have two neutered formulas: Prime Chicken & Pomegranate and Pumpkin Lamb & Blueberry. Both are lower in fat than the standard adult recipes."'},
  ]},
  {icon:'🔄',title:'Transition Tips to Share with Customers',items:[
    {q:'How long does it take to transition to Farmina?',
     a:'7–10 days is standard. Day 1-3: 25% Farmina, 75% old food. Day 4-6: 50/50. Day 7-9: 75% Farmina. Day 10+: 100% Farmina.',
     script:'"The golden rule is 7-10 days. Mix gradually — sudden changes upset even healthy digestive systems. The good news is the prebiotics in Farmina actually help the transition go smoother."'},
    {q:'Customer says their pet won\'t eat new food.',
     a:'Palatability is a Farmina strength. 48-51% fresh meat gives it an aroma commercial food can\'t match. Suggest warming the food slightly, or adding warm water to release the aromas.',
     script:'"Try adding a small amount of warm water and let it sit for a minute — the fresh meat smell really opens up. Most picky eaters are converted within 3 days."'},
    {q:'Customer notices softer stools during transition.',
     a:'Normal and expected. The gut microbiome is adjusting. The prebiotics are actively changing the bacterial environment. Typically resolves by day 5-7. The Pumpkin range can help if it persists.',
     script:'"That\'s completely normal — it means the food is working and the gut is adjusting. It usually settles by day 5-7. If it continues, the Pumpkin range with added pumpkin fiber will help firm things up."'},
  ]},
  {icon:'🌿',title:'Key Ingredient Talking Points',items:[
    {q:'Customer asks: "What are meat meals?"',
     a:'Meat meal = rendered animal tissue, dried at high heat. It can include feet, beaks, feathers, organs, and unspecified parts. All Farmina products are MEAT MEAL FREE.',
     script:'"Meat meal is what you get when you render down various animal parts at very high temperatures. Farmina uses only named, fresh meats — no meat meal ever."'},
    {q:'Customer asks: "Why grain-free?"',
     a:'Ancestral diet argument: dogs evolved as carnivores. Grains (especially corn and wheat) are not part of their evolutionary diet. Grain-free reduces blood sugar spikes and inflammation risk.',
     script:'"Dogs evolved eating prey, not corn fields. Grains are used in cheap pet food as a low-cost filler. Farmina uses sweet potato or peas instead — complex carbs that don\'t spike blood sugar."'},
    {q:'Customer asks: "What are prebiotics?"',
     a:'Prebiotics feed beneficial gut bacteria. Farmina uses inulin, FOS AND MOS — three different prebiotics that work together. This is different from probiotics (live bacteria), which have shorter shelf lives.',
     script:'"Prebiotics are food for the good bacteria already in your pet\'s gut. Farmina includes three different types that work together — most brands include none. Think of it as feeding the whole gut ecosystem."'},
    {q:'Customer asks about GMO-free claims.',
     a:'All Farmina N&D products are GMO-free — including proteins, grains and botanicals. This is a verified claim, not just a marketing label.',
     script:'"Every ingredient in Farmina is GMO-free. That includes the grains in the Low Ancestral Grain range. It\'s a non-negotiable brand standard."'},
  ]},
  {icon:'⚠️',title:'Handling Common Objections',items:[
    {q:'"My dog/cat is fine on their current food. Why change?"',
     a:'Fine is not thriving. Cheaper foods mask digestive issues, skin dullness, and low energy. Result: more vet visits later. Premium nutrition is preventive. Show energy/coat difference in 4 weeks.',
     script:'"\'Fine\' often means we haven\'t noticed the problems yet. In 4 weeks on Farmina, you\'ll see shinier coat, firmer stools, better energy, and better breath. Then you can\'t unsee the difference."'},
    {q:'"I\'ve heard grain-free is bad for dogs\' hearts."',
     a:'The AAFCO heart study was misinterpreted by media. The study showed NO causal link to grain-free diets. Farmina uses named proteins and healthy ingredients — the formula matters, not the grain-free claim.',
     script:'"That study actually doesn\'t prove grain-free causes heart issues — it showed correlation in specific boutique brands, not in established brands like Farmina with veterinary backing."'},
    {q:'"Why not just buy a cheaper premium brand — looks the same."',
     a:'Price is often justified by fresh meat content. Compare: 48%+ fresh meat (Farmina) vs 15-20% (competitors). Check their first 5 ingredients — notice the difference?',
     script:'"Let\'s look at ingredients side by side. Farmina\'s first ingredient is always fresh named meat. Most competitors? Meat meal or grains. One 7kg bag will show you the fur quality difference."'},
    {q:'"My vet recommended [competitor brand]."',
     a:'Respect the vet. Some brands have relationships with clinics. Ask your vet specifically: "Have they tested Farmina N&D?" Veterinary nutritionists designed Farmina; many vets just aren\'t familiar with it yet.',
     script:'"Your vet knows your pet best. Many vets stock certain brands — it doesn\'t mean Farmina isn\'t excellent. Would you ask them specifically about N&D? They often recommend it once they see the results."'},
    {q:'"Can I mix Farmina with cheaper food to save money?"',
     a:'Yes, and it helps. Even 50% Farmina + 50% current food is a significant nutritional upgrade. The prebiotics and fresh meat quality do work at any mixing ratio.',
     script:'"Absolutely. Even mixing 50/50 gives you the benefits — better digestion, healthier coat, more energy. You can gradually increase Farmina as you see results."'},
    {q:'"How long until I see results?"',
     a:'Energy/behavior: 3-5 days. Coat shine: 2-3 weeks. Digestive improvement: 5-7 days. Weight/muscle tone: 6-8 weeks. Frame it as a journey, not a promise.',
     script:'"You\'ll notice better energy within a week. Coat shine takes 2-3 weeks. The real magic is what happens over 2-3 months — weight stabilizes, vet bills drop, pure vitality."'},
  ]},
  {icon:'⏱️',title:'The 20-Second Pitch',items:[
    {q:'"What is Farmina in a nutshell?"',
     a:'Italian nutrition where Nature is the inspiration and Science is the method. Research-backed, natural antioxidants, and nitrogen-packed for freshness.',
     script:'"Farmina is Italian nutrition where Nature is the inspiration and Science is the method. Recipes are designed through research, use natural antioxidants, and are packed in a protective atmosphere where nitrogen replaces oxygen to help keep food fresh."'}
  ]},
  {icon:'🚀',title:'The 60-Second Sales Flow',items:[
    {q:'Step 1: ASK (3 key questions)',
     a:'1. Dog or cat — and age? \n2. Any sensitivities: tummy, skin/coat, or weight? \n3. What are you feeding now, and what’s not working?',
     script:'"To help find the right match, can I ask: is it for a dog or cat, and what age? Any specific sensitivities with skin or tummy? And what are they eating currently that isn\'t quite working?"'},
    {q:'Step 2: MATCH (Type of solution)',
     a:'Grain-free preference → N&D Grain-free lines. \nBalanced with selected grains → Ancestral Grain (spelt + oats). \nWeight control → "Light" positioning.',
     script:'"Based on that, if you prefer grain-free, our N&D lines are ideal. If you want a balanced option with selected ancient grains like spelt and oats, Ancestral Grain is the perfect low-GI choice."'},
    {q:'Step 3: PROVE (Science & Freshness)',
     a:'- Natural antioxidants (tocopherols). \n- Nitrogen packing (replaces oxygen). \n- Cold infusion vitamins. \n- Research with Univ. of Naples.',
     script:'"What makes it different is that we replace oxygen with nitrogen in the bag to keep it fresh without heavy chemicals, and we use a cold-infusion process so the vitamins stay effective for longer."'},
    {q:'Step 4: CLOSE (The 2-Option Choice)',
     a:'Offer a primary recommendation based on their needs and one alternative.',
     script:'"Based on what you said, I’d choose the Pumpkin line for digestive comfort. If you prefer a more traditional fish-based option, the Ocean line is the alternative. Which feels right for your pet?"'}
  ]},
  {icon:'📉',title:'Explaining Low GI',items:[
    {q:'"What does Low GI mean for my pet?"',
     a:'It means steady energy release throughout the day rather than blood sugar spikes and crashes.',
     script:'"Think of it as steady energy across the day. It\'s designed with a low glycaemic index approach using either grain-free ingredients or selected ancestral grains to avoid those sugar spikes."'}
  ]},
  {icon:'📈',title:'Helpful Upselling & Add-ons',items:[
    {q:'Value Close: Choosing the right size.',
     a:'Moving up one bag size usually provides the best cost-per-day value for the customer.',
     script:'"If you have the space, going up just one bag size usually gives you the best cost-per-day value. It works out significantly cheaper in the long run."'},
    {q:'Trial sizes: lowering the risk of trying.',
     a:'Most dog recipes have an 800g bag (Mini kibble) and every cat recipe has a 300g bag. N&D Ancestral Grain Light has no 800g bag.',
     script:'"If you\'d like to try it first, there\'s a smaller bag — 800g for most dog recipes and 300g for cats."'},
    {q:'Transition Tip: Reducing returns.',
     a:'7–10 day transition, fresh water always, and a warning that mild temporary stool shifts can happen.',
     script:'"Just a tip: do a slow 7–10 day transition. A few mild stool shifts are normal at first, but it ensures they settle onto the new food perfectly."'}
  ]},
  {icon:'🗣️',title:'Staff Cheat Lines (Compliant)',items:[
    {q:'How to talk about benefits safely.',
     a:'Use "supports" language to stay compliant while highlighting results.',
     script:'"This recipe supports digestive comfort through correct portions... It supports skin & coat wellbeing through balanced nutrition... It supports healthy weight management."'}
  ]},
  {icon:'🏪',title:'Merchandising for Conversion',items:[
    {q:'How to organize the shelf for sales.',
     a:'Block by need: Puppy/Kitten → Adult → Light/Weight. Use shelf talkers for Nitrogen Freshness and Low GI.',
     script:'"We find customers choose faster when we block by need — start with puppies, then adults, then weight management. Adding a note about the nitrogen packing for freshness really helps conversion."'}
  ]},
];

// ── Tips functions ──
function renderTips(){
  document.getElementById('tcon').innerHTML = TIPS.map((cat,ci)=>`
<div class="tcat">
  <div class="tch" onclick="toggleTip(${ci})">
    <div class="tchi">${cat.icon}</div>
    <div class="tchtitle">${cat.title}</div>
    <svg class="tchev" id="tchev-${ci}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="18" height="18"><path d="M6 9l6 6 6-6"/></svg>
  </div>
  <div class="tcontent" id="tc-${ci}">
    ${cat.items.map(ti=>`
    <div class="ti">
      <div class="tiq">💬 ${ti.q}</div>
      <div class="tia">${ti.a}</div>
      ${ti.script?`<div class="script">"${ti.script.replace(/^"|"$/g,'')}"</div>`:''}
    </div>`).join('')}
  </div>
</div>`).join('');
}

function toggleTip(idx){
  const tc=document.getElementById('tc-'+idx);
  const chev=document.getElementById('tchev-'+idx);
  const open=tc.classList.toggle('open');
  chev.classList.toggle('open',open);
  if(open) window.TrainingAnalytics?.track('tip_view', {tip_index:idx});
}
