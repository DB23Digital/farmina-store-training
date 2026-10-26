// ═══════════════════════════════════════
// QUIZ DATA & LOGIC
// ═══════════════════════════════════════

const QUIZZES = {
  quinoa: {
    name:'N&D Quinoa',icon:'🌿',color:'#1B75BC',
    questions:[
      {q:'What percentage of meat and fat from animal sources is in the N&D Quinoa Puppy Dog formula?',
       opts:['65%','75%','80%','90%'],ans:2,
       explain:'N&D Quinoa Puppy contains 80% meat & fat from animal sources, with 48% of those meats being fresh or raw.'},
      {q:'What makes the NZ Lamb & Blueberry product special compared to other proteins in the Quinoa range?',
       opts:['It\'s the only indoor cat formula','Lamb is sourced from New Zealand\'s grass-fed, hormone-free farms','It contains the highest legume content','It\'s the only product with added Vitamin C'],
       ans:1,
       explain:'The lamb comes from New Zealand pasture-raised farms, held to strict standards with no growth hormones or antibiotics — making it a premium, clean protein source.'},
      {q:'Which of the following is NOT a claim on N&D Quinoa products?',
       opts:['GMO Free','Contains Organic Oats','Meat Meal Free','Byproduct Free'],
       ans:1,
       explain:'Organic Oats and Spelt are features of the N&D Low Ancestral Grain range. The Quinoa range is grain-free — no grains of any kind.'},
      {q:'What ingredient in N&D Quinoa provides natural joint support without synthetic supplements?',
       opts:['Sweet potato','Chicken cartilage (source of glucosamine & chondroitin)','Psyllium husk','Turmeric root'],
       ans:1,
       explain:'Chicken cartilages are listed in the Puppy Quinoa composition as a natural source of glucosamine and chondroitin sulfate — the gold standard for joint health.'},
      {q:'Which N&D Quinoa cat formula is specifically designed for sterilised cats?',
       opts:['Indoor Cat','Senior Cat','Neutered Cat','Adult Cat Light'],
       ans:2,
       explain:'The Neutered Cat variant is calorie-managed for cats after sterilisation, when energy requirements drop and weight gain risk increases.'},
    ]
  },
  pumpkin: {
    name:'N&D Pumpkin',icon:'🎃',color:'#2E8ED6',
    questions:[
      {q:'What protein source is used in Cod, Pumpkin & Orange for dogs?',
       opts:['Norwegian Farmed Salmon','Atlantic Wild Caught Cod','Pacific Tuna','Freshwater Trout'],
       ans:1,
       explain:'Cod, Pumpkin & Orange uses Atlantic Wild Caught Cod as its primary protein — a naturally hypoallergenic, lean white fish.'},
      {q:'What is the percentage of dried pumpkin included in N&D Pumpkin formulas?',
       opts:['1%','3%','5%','8%'],
       ans:2,
       explain:'All N&D Pumpkin recipes contain 5% dried pumpkin — a meaningful inclusion that provides real digestive support through natural soluble and insoluble fiber.'},
      {q:'Which is the ONLY cat product in the N&D Pumpkin range?',
       opts:['Chicken & Pomegranate Adult Cat','Boar & Apple Adult Cat','Herring & Orange Adult Cat','Lamb & Blueberry Adult Cat'],
       ans:2,
       explain:'Herring & Orange Adult Cat is the cat-specific offering in the Pumpkin line — wild caught Atlantic herring, exceptionally rich in natural omega-3 fatty acids.'},
      {q:'Why is Wild Boar considered ideal for dogs on elimination diets?',
       opts:['It\'s lower in calories than chicken','It\'s a novel protein most dogs have never been exposed to','It contains more omega-3 than fish','It\'s the easiest protein to digest'],
       ans:1,
       explain:'Novel proteins are key to elimination diets because dogs that haven\'t been exposed to a protein can\'t have developed an immune response (allergy) to it. Wild boar is rarely used in commercial food.'},
      {q:'The NZ Lamb, Pumpkin & Blueberry Adult Mini is available in which bag size not found in the M&M variant?',
       opts:['300g','500g','800g','1kg'],
       ans:2,
       explain:'The Mini variant comes in 800g, 2.5kg and 7kg. The M&M variant comes in 12kg only. The 800g bag is exclusive to the Mini product — great for trial purchases.'},
    ]
  },
  lag: {
    name:'N&D Low Ancestral Grain',icon:'🌾',color:'#0A4070',
    questions:[
      {q:'What organic grains are used in the N&D Low Ancestral Grain range?',
       opts:['Organic Wheat & Barley','Organic Rice & Millet','Organic Spelt & Oats','Organic Corn & Rye'],
       ans:2,
       explain:'N&D Low Ancestral Grain uses organic spelt (10%) and organic oats (10%) — ancient grains that predate modern agricultural breeding, with better digestibility and no GMOs.'},
      {q:'What percentage of the recipe is made up of organic grains in the LAG Adult Dog formula?',
       opts:['10%','15%','20%','30%'],
       ans:2,
       explain:'20% of the recipe is organic grain (10% spelt + 10% oats), leaving 63%+ from animal sources — still a meat-first food, just with clean ancestral carbohydrates.'},
      {q:'True or False: N&D Low Ancestral Grain is completely grain-free.',
       opts:['True — all Farmina products are grain-free','False — it contains 20% organic spelt and oats','True — the grains are removed during processing','False — it contains corn and wheat'],
       ans:1,
       explain:'Low Ancestral Grain deliberately includes 20% organic ancient grains (spelt & oats). It is NOT grain-free — it\'s the middle-ground option for dogs that do better with some complex carbohydrates.'},
      {q:'Which life stage variant is UNIQUE to the N&D Low Ancestral Grain range (not found in Quinoa or Pumpkin)?',
       opts:['Puppy','Senior','Light','Kitten'],
       ans:2,
       explain:'The Light Adult Dog formula is exclusive to the Low Ancestral Grain range. It provides reduced calories for weight management while maintaining premium ingredient quality.'},
      {q:'What is the approximate meat & fat from animal sources percentage in the Chicken & Pomegranate LAG Adult Dog formula?',
       opts:['80%','75%','70%','63.6%'],
       ans:3,
       explain:'The LAG Adult Dog formula contains 63.6% from animal sources — lower than the Quinoa range (75.8%) because organic grains replace some of the calorie density. Still a meat-first formula.'},
    ]
  }
};

// ── Quiz state ──
let currentLine = null;
let currentQ = 0;
let score = 0;
let answered = false;
let quizDone = {};

// ── Quiz functions ──
function renderQuizLines(){
  const container = document.getElementById('qlines');
  container.innerHTML = Object.entries(QUIZZES).map(([key,quiz])=>{
    const done = quizDone[key] !== undefined;
    const scoreLabel = done ? `${quizDone[key]}/5 ✓` : '5 questions';
    return `
<div class="qlc ${done?'done':''}" onclick="startQuiz('${key}')">
  <div class="qlci">${quiz.icon}</div>
  <div class="qlcinfo"><h3>${quiz.name}</h3><p>${done?'Completed — tap to retry':'Tap to start quiz'}</p></div>
  <div class="qlcbadge ${done?'done':'todo'}">${scoreLabel}</div>
</div>`;
  }).join('');
}

function startQuiz(line){
  currentLine=line; currentQ=0; score=0; answered=false;
  window.TrainingAnalytics?.track('quiz_start', {quiz_line:line, question_count:QUIZZES[line].questions.length});
  document.getElementById('qselect').style.display='none';
  document.getElementById('qplay').style.display='block';
  document.getElementById('qres').classList.remove('on');
  document.getElementById('qqcard').style.display='block';
  renderQuestion();
}

function renderQuestion(){
  const quiz = QUIZZES[currentLine];
  const total = quiz.questions.length;
  const q = quiz.questions[currentQ];
  const pct = (currentQ/total)*100;
  document.getElementById('qpf').style.width=pct+'%';
  document.getElementById('qptxt').textContent=`Question ${currentQ+1} of ${total}`;
  document.getElementById('qtxt').textContent=q.q;
  answered=false;
  document.getElementById('qfb').style.display='none';
  document.getElementById('qnxt').classList.remove('on');
  document.getElementById('qopts').innerHTML = q.opts.map((opt,i)=>
    `<button class="opt" onclick="selectAns(this,${i===q.ans})">${opt}</button>`
  ).join('');
}

function selectAns(btn,correct){
  if(answered) return;
  answered=true;
  const allOpts = document.querySelectorAll('.opt');
  allOpts.forEach(b=>b.disabled=true);
  const quiz=QUIZZES[currentLine];
  const q=quiz.questions[currentQ];
  const correctIdx=q.ans;
  allOpts[correctIdx].classList.add('correct');
  if(!correct){ btn.classList.add('wrong'); } else { score++; }
  const fb=document.getElementById('qfb');
  fb.className='fb '+(correct?'ok':'bad');
  fb.innerHTML=(correct?'✅ Correct! ':'❌ Not quite. ')+q.explain;
  fb.style.display='block';
  document.getElementById('qnxt').classList.add('on');
  const last=currentQ===quiz.questions.length-1;
  document.getElementById('qnxt').textContent=last?'See Results →':'Next Question →';
}

function nextQ(){
  const quiz=QUIZZES[currentLine];
  if(currentQ<quiz.questions.length-1){
    currentQ++;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult(){
  if(quizDone[currentLine]===score && document.getElementById('qres').classList.contains('on')) return;
  quizDone[currentLine]=score;
  window.TrainingAnalytics?.track('quiz_complete', {quiz_line:currentLine, score, question_count:QUIZZES[currentLine].questions.length});
  document.getElementById('qqcard').style.display='none';
  const res=document.getElementById('qres');
  res.classList.add('on');
  document.getElementById('qscore').textContent=score;
  const stars = score===5?'⭐⭐⭐⭐⭐':score>=4?'⭐⭐⭐⭐':score>=3?'⭐⭐⭐':score>=2?'⭐⭐':'⭐';
  document.getElementById('qstars').textContent=stars;
  const msgs=[
    ['Keep Studying','Review the product cards and ingredient encyclopedia, then try again!'],
    ['Good Start!','You\'re getting there. Review a few more product details and retry.'],
    ['Solid Knowledge','You know your Farmina basics well. Brush up on the details!'],
    ['Great Work!','You\'re well-equipped to talk Farmina on the shop floor!'],
    ['Expert Level!','You\'re ready to out-talk any Farmina rep. Outstanding!'],
  ];
  const [msg,sub]=score<=1?msgs[0]:score<=2?msgs[1]:score<=3?msgs[2]:score<=4?msgs[3]:msgs[4];
  document.getElementById('qmsg').textContent=msg;
  document.getElementById('qsub').textContent=sub;
}

function retryQ(){ startQuiz(currentLine); }

function backToLines(){
  document.getElementById('qselect').style.display='block';
  document.getElementById('qplay').style.display='none';
  renderQuizLines();
}
