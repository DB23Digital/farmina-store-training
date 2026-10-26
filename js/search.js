// ═══════════════════════════════════════
// KNOWLEDGE BASE SEARCH
// Full-text search across products, ingredients, tips, quiz questions
// ═══════════════════════════════════════

let searchIndex = [];
let searchState = {query:'', results:[], resultCount:0};

// ── Build search index on init ──
function buildSearchIndex(){
  searchIndex = [];
  
  // Index all products
  if(typeof PRODUCTS !== 'undefined'){
    PRODUCTS.forEach(p=>{
      const searchText = `${p.name} ${p.variant} ${p.protein} ${p.composition} ${p.suitable} ${p.sell}`.toLowerCase();
      searchIndex.push({
        type:'product',
        id:p.id,
        title:p.name,
        subtitle:p.variant,
        description:`${p.lineName} · ${p.pet === 'cat' ? '🐱 Cat' : '🐶 Dog'}`,
        searchText,
        icon:p.icon,
        highlights:p.highlights || []
      });
    });
  }
  
  // Index all ingredients
  if(typeof INGREDIENTS !== 'undefined'){
    INGREDIENTS.forEach(i=>{
      const searchText = `${i.name} ${i.catLabel} ${i.what} ${i.why}`.toLowerCase();
      searchIndex.push({
        type:'ingredient',
        id:i.id,
        title:i.name,
        subtitle:i.catLabel,
        description:i.what ? i.what.substring(0,80) + '...' : '',
        searchText,
        icon:i.icon
      });
    });
  }
  
  // Index all tips
  if(typeof TIPS !== 'undefined'){
    TIPS.forEach((cat, catIdx)=>{
      cat.items.forEach((item, itemIdx)=>{
        const searchText = `${item.q} ${item.a}`.toLowerCase();
        searchIndex.push({
          type:'tip',
          id:`tip-${catIdx}-${itemIdx}`,
          title:item.q,
          subtitle:cat.title,
          description:item.a.substring(0,100) + '...',
          searchText,
          icon:cat.icon,
          catIdx,
          itemIdx
        });
      });
    });
  }
  
  // Index all quiz questions
  if(typeof QUIZZES !== 'undefined'){
    Object.keys(QUIZZES).forEach(lineKey=>{
      const quiz = QUIZZES[lineKey];
      if(quiz && quiz.questions){
        quiz.questions.forEach((q, qIdx)=>{
          const searchText = `${q.q} ${(q.opts || []).join(' ')}`.toLowerCase();
          searchIndex.push({
            type:'quiz',
            id:`quiz-${lineKey}-${qIdx}`,
            title:q.q,
            subtitle:`Quiz: ${lineKey.replace('_',' ')}`,
            description:q.q.substring(0,100),
            searchText,
            icon:'❓'
          });
        });
      }
    });
  }
}

// ── Search function ──
function performSearch(query){
  if(!query || query.trim().length === 0){
    searchState.query = '';
    searchState.results = [];
    searchState.resultCount = 0;
    return;
  }
  
  const q = query.toLowerCase().trim();
  searchState.query = q;
  
  // Filter index by query
  searchState.results = searchIndex.filter(item=>{
    return item.searchText.includes(q);
  });
  
  searchState.resultCount = searchState.results.length;
}

// ── Render search results ──
function renderSearchResults(){
  // Render to global search overlay
  const globalContainer = document.getElementById('searchResultsContainer');
  if(globalContainer){
    globalContainer.innerHTML = formatSearchResultsHtml();
  }
  
  // Render to search screen
  const screenContainer = document.getElementById('screenSearchResultsContainer');
  if(screenContainer){
    screenContainer.innerHTML = formatSearchResultsHtml();
  }
}

function formatSearchResultsHtml(){
  if(!searchState.query){
    return '<div style="padding:24px 16px;text-align:center;color:var(--muted)">Start typing to search...</div>';
  }
  
  if(searchState.results.length === 0){
    const queryLabel = searchState.query.replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
    return `<div style="padding:24px 16px;text-align:center;color:var(--muted)">
      <div style="font-size:32px;margin-bottom:12px">🔍</div>
      <p>No results for "${queryLabel}"</p>
      <p style="font-size:12px;margin-top:6px">Try different keywords</p>
    </div>`;
  }
  
  // Group by type
  const byType = {};
  searchState.results.forEach(r=>{
    if(!byType[r.type]) byType[r.type] = [];
    byType[r.type].push(r);
  });
  
  // Render grouped results
  let html = '';
  const typeLabels = {product:'🛒 Products',ingredient:'🌿 Ingredients',tip:'💬 Tips',quiz:'❓ Quiz'};
  const typeOrder = ['product','ingredient','tip','quiz'];
  
  typeOrder.forEach(type=>{
    if(!byType[type]) return;
    const items = byType[type];
    html += `
<div class="search-group">
  <div class="search-group-label">${typeLabels[type] || type} (${items.length})</div>`;
    
    items.slice(0, 5).forEach(r=>{
      if(type === 'product'){
        html += `
  <div class="search-result" onclick="jumpToProduct('${r.id}')">
    <div style="font-size:24px;margin-right:12px">${r.icon}</div>
    <div style="flex:1">
      <div class="search-result-title">${r.title}</div>
      <div class="search-result-sub">${r.subtitle}</div>
      <div class="search-result-desc">${r.description}</div>
    </div>
  </div>`;
      } else if(type === 'ingredient'){
        html += `
  <div class="search-result" onclick="openIng('${r.id}'); closeSearchModal()">
    <div style="font-size:24px;margin-right:12px">${r.icon}</div>
    <div style="flex:1">
      <div class="search-result-title">${r.title}</div>
      <div class="search-result-sub">${r.subtitle}</div>
    </div>
  </div>`;
      } else if(type === 'tip'){
        html += `
  <div class="search-result" onclick="jumpToTip(${r.catIdx}); closeSearchModal()">
    <div style="font-size:24px;margin-right:12px">${r.icon}</div>
    <div style="flex:1">
      <div class="search-result-title">${r.title}</div>
      <div class="search-result-sub">${r.subtitle}</div>
      <div class="search-result-desc" style="margin-top:6px;max-height:40px;overflow:hidden">${r.description}</div>
    </div>
  </div>`;
      } else if(type === 'quiz'){
        html += `
  <div class="search-result" onclick="jumpToQuiz('${r.id.split('-')[1]}'); closeSearchModal()">
    <div style="font-size:24px;margin-right:12px">${r.icon}</div>
    <div style="flex:1">
      <div class="search-result-title">${r.title}</div>
      <div class="search-result-sub">${r.subtitle}</div>
    </div>
  </div>`;
      }
    });
    
    if(items.length > 5){
      html += `<div class="search-more">+${items.length - 5} more</div>`;
    }
    
    html += '</div>';
  });
  
  return html;
}

// ── Search UI functions ──
function openSearchModal(){
  const overlay = document.getElementById('searchOverlay');
  if(!overlay) return;
  overlay.classList.add('open');
  const input = document.getElementById('globalSearchInput');
  if(input) input.focus();
}

function closeSearchModal(){
  const overlay = document.getElementById('searchOverlay');
  if(overlay) overlay.classList.remove('open');
}

let searchAnalyticsTimer;
function onSearchInput(e){
  const query = e.target.value;
  performSearch(query);
  renderSearchResults();
  clearTimeout(searchAnalyticsTimer);
  if(query.trim() && window.TrainingAnalytics?.isEnabled()){
    const searchSurface = e.target.id === 'globalSearchInput' ? 'overlay' : 'screen';
    const resultCount = searchState.resultCount;
    searchAnalyticsTimer = setTimeout(()=>{
      window.TrainingAnalytics?.track('search_used', {search_surface:searchSurface, result_count:resultCount});
    }, 700);
  }
}

function clearSearchInput(){
  clearTimeout(searchAnalyticsTimer);
  const input = document.getElementById('globalSearchInput');
  if(input){
    input.value = '';
    searchState.query = '';
    searchState.results = [];
    renderSearchResults();
    input.focus();
  }
}

// ── Highlight helper ──
function highlightQuery(text, query){
  if(!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ── Navigation helpers ──
function jumpToTip(catIdx){
  const btn = document.querySelector('nav button[onclick*="tips"]');
  if(btn) showScreen('tips', btn);
  setTimeout(()=>{
    const el = document.getElementById(`tc-${catIdx}`);
    if(el) el.scrollIntoView({behavior:'smooth'});
  }, 200);
}

function jumpToQuiz(lineKey){
  const btn = document.querySelector('nav button[onclick*="quiz"]');
  if(btn) showScreen('quiz', btn);
  // Quiz doesn't have detailed navigation, just go to quiz screen
}
