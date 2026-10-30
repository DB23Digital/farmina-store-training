// ═══════════════════════════════════════
// QUIZ DATA & LOGIC
// ═══════════════════════════════════════

const QUIZZES = {
  quinoa: {
    name:'N&D Quinoa',icon:'🌿',color:'#1B75BC',
    questions:[
      {q:'Which proteins are used in the N&D Quinoa Skin & Coat dog formulas?',
       opts:['Chicken & Lamb','Quail & Duck','Cod & Herring','Wild Boar & Lamb'],ans:1,
       explain:'N&D Quinoa Skin & Coat comes in two mono-protein recipes: Quail, Quinoa, Coconut & Turmeric and Duck, Quinoa, Coconut & Turmeric.'},
      {q:'Which life stage are the N&D Quinoa Skin & Coat dog formulas made for?',
       opts:['Puppy','Adult','Light','Puppy and adult'],
       ans:1,
       explain:'Both Quinoa Skin & Coat recipes are Adult Dog formulas, in Mini and Medium & Maxi kibble. Farmina lists them for reducing ingredient and nutrient intolerances and supporting skin and coat.'},
      {q:'Which of the following is NOT a claim on the N&D Quinoa Skin & Coat product cards?',
       opts:['GMO Free','Contains organic spelt & oats','Mono Protein','Grain Free'],
       ans:1,
       explain:'Organic spelt and oats are in the N&D Ancestral Grain range. N&D Quinoa is grain free.'},
      {q:'What is the N&D Quinoa cat formula designed to support?',
       opts:['Kitten growth','Urinary health','Weight management after neutering','Joint mobility'],
       ans:1,
       explain:'Duck, Quinoa, Cranberry & Chamomile is the N&D Quinoa Urinary formula for adult cats. Farmina lists it for reducing the recurrence of struvite stones and supporting the lower urinary tract.'},
      {q:'Which bag size is available for N&D Quinoa Skin & Coat Medium & Maxi?',
       opts:['800g only','2.5kg only','7kg only','12kg only'],
       ans:2,
       explain:'Medium & Maxi comes in a 7kg bag. The Mini kibble comes in 800g and 2.5kg.'},
    ]
  },
  pumpkin: {
    name:'N&D Pumpkin',icon:'🎃',color:'#2E8ED6',
    questions:[
      {q:'Which recipe is NOT part of the N&D Pumpkin dog range?',
       opts:['Chicken, Pumpkin & Pomegranate','Lamb, Pumpkin & Blueberry','Boar, Pumpkin & Apple','Cod, Pumpkin & Orange'],
       ans:3,
       explain:'Cod, Pumpkin & Orange is in the N&D Ocean range. The N&D Pumpkin dog range is Chicken (puppy and adult), Lamb (puppy and adult) and Boar (adult).'},
      {q:'What is the percentage of dried pumpkin included in N&D Pumpkin formulas?',
       opts:['1%','3%','5%','8%'],
       ans:2,
       explain:'All N&D Pumpkin recipes contain 5% dried pumpkin — a meaningful inclusion that provides real digestive support through natural soluble and insoluble fiber.'},
      {q:'Which is the ONLY cat product in the N&D Pumpkin range?',
       opts:['Chicken & Pomegranate Kitten','Herring & Orange Adult','Lamb, Pumpkin & Blueberry Neutered','Duck, Quinoa, Cranberry & Chamomile'],
       ans:2,
       explain:'The only N&D Pumpkin cat formula is Lamb, Pumpkin & Blueberry for neutered adult cats. Herring & Orange is N&D Ocean, Chicken & Pomegranate Kitten is N&D Prime, and Duck, Quinoa, Cranberry & Chamomile is N&D Quinoa Urinary.'},
      {q:'Why is Wild Boar considered ideal for dogs on elimination diets?',
       opts:['It\'s lower in calories than chicken','It\'s a novel protein most dogs have never been exposed to','It contains more omega-3 than fish','It\'s the easiest protein to digest'],
       ans:1,
       explain:'Novel proteins are key to elimination diets because dogs that haven\'t been exposed to a protein can\'t have developed an immune response (allergy) to it. Wild boar is rarely used in commercial food.'},
      {q:'The NZ Lamb, Pumpkin & Blueberry Adult Mini is available in which bag size not found in the Medium & Maxi variant?',
       opts:['300g','500g','800g','1kg'],
       ans:2,
       explain:'The Mini variant comes in 800g, 2.5kg and 7kg. The Medium & Maxi variant comes in 12kg only. The 800g bag is exclusive to the Mini product — great for trial purchases.'},
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
      {q:'Which dog formula is ONLY available in the N&D Low Ancestral Grain range?',
       opts:['Puppy','Adult','Light','Skin & Coat'],
       ans:2,
       explain:'Light Adult Dog, in Mini and Medium & Maxi, is the only reduced-calorie dog formula in the range, and it is N&D Low Ancestral Grain.'},
      {q:'What share of the protein in N&D Low Ancestral Grain Adult Dog comes from animal sources?',
       opts:['70%','80%','90%','98%'],
       ans:2,
       explain:'Farmina lists N&D Ancestral Grain Adult Dog at 90% of protein from animal sources and 64% meat and fats. For comparison, N&D Prime Adult Dog is listed at 98% and 76%.'},
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
