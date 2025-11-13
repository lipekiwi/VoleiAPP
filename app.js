// App logic with view navigation and improved profile handling

const WEEK_TEMPLATE = {
  "Segunda": ["Box Jumps - 5x4","Approach Jump - 4x3","RDL - 4x6","Hip Thrust - 4x5"],
  "Terça": ["Pelada (descanso ativo)"],
  "Quarta": ["Supino - 4x5","Remada - 4x6","Desenv. Militar - 4x6"],
  "Quinta": ["Treino equipe"],
  "Sexta": ["Pelada"],
  "Sábado": ["Agachamento - 4x6","Leg Press - 3x10"],
  "Domingo": ["Upper leve + Core"]
};

const KEY = 'volei_app_v1';
let state = { profile: {}, records: [], completed: {} };
function load(){ try{ const s = JSON.parse(localStorage.getItem(KEY)||'null'); if(s) state = s; }catch(e){} }
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

load();

// --- view navigation ---
const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('[data-view-btn]');
function showView(name){
  views.forEach(v => {
    if(v.dataset.view === name) v.classList.remove('hidden');
    else v.classList.add('hidden');
  });
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.viewBtn === name));
  // extra: update content when entering certain views
  if(name === 'home') { renderWeek(); openDay(todayName()); renderQuick(); buildCharts(); }
  if(name === 'history') { renderHistory(); }
  if(name === 'profile') { fillProfileForm(); }
}
navButtons.forEach(b => b.addEventListener('click', ()=> showView(b.dataset.viewBtn)));
document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', (e)=>{
  const v = e.currentTarget.dataset.nav;
  showView(v);
}));

// default view
showView('home');

// UI elements
const dayLabel = document.getElementById('dayLabel');
const exList = document.getElementById('exList');
const weekGrid = document.getElementById('weekGrid');
const progBar = document.getElementById('progBar');
const chartJumpCtx = document.getElementById('chartJump').getContext('2d');
const chartStrengthCtx = document.getElementById('chartStrength').getContext('2d');

function todayName(){ const d = new Date(); const map = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"]; return map[d.getDay()]; }

function renderWeek(){
  weekGrid.innerHTML='';
  for(let k of Object.keys(WEEK_TEMPLATE)){
    const div = document.createElement('div'); div.className='day';
    if(state.completed[k]) div.classList.add('done');
    div.innerHTML = `<strong>${k}</strong><div class="muted">${WEEK_TEMPLATE[k].slice(0,2).join(', ')}</div>`;
    div.onclick = ()=>{ openDay(k); showView('home'); };
    weekGrid.appendChild(div);
  }
}

function openDay(day){
  dayLabel.textContent = day + ' — ' + (WEEK_TEMPLATE[day]? WEEK_TEMPLATE[day].length+' exercícios':'-');
  exList.innerHTML='';
  const list = WEEK_TEMPLATE[day] || [];
  list.forEach((ex,i)=>{
    const id = `chk_${day}_${i}`;
    const done = !!(state.completed[day] && state.completed[day][i]);
    const div = document.createElement('div'); div.className='quick-item';
    div.innerHTML = `<div>${ex}</div><div><input type="checkbox" id="${id}" ${done?'checked':''}></div>`;
    exList.appendChild(div);
    document.getElementById(id).addEventListener('change', (e)=>{
      state.completed[day] = state.completed[day]||{};
      state.completed[day][i] = e.target.checked;
      save(); renderWeek(); updateProgress(day);
    });
  });
  updateProgress(day);
}

function updateProgress(day){
  const list = WEEK_TEMPLATE[day] || [];
  const total = list.length;
  const done = Object.values(state.completed[day]||{}).filter(Boolean).length;
  const percent = total? Math.round(done/total*100):0;
  progBar.style.width = percent+'%';
}

document.getElementById('startBtn').addEventListener('click', ()=>{ openDay(todayName()); showView('home'); });
document.getElementById('clearDay').addEventListener('click', ()=>{
  const d = todayName();
  delete state.completed[d]; save(); openDay(d); renderWeek(); showToast('Limpo');
});

// profile form
const inpName = document.getElementById('inpName');
const inpHeight = document.getElementById('inpHeight');
const inpRole = document.getElementById('inpRole');
function fillProfileForm(){
  inpName.value = state.profile.name || '';
  inpHeight.value = state.profile.height || '';
  inpRole.value = state.profile.role || 'Ponteiro';
}
document.getElementById('saveProfile').addEventListener('click', ()=>{
  state.profile.name = inpName.value.trim();
  state.profile.height = inpHeight.value ? Number(inpHeight.value) : '';
  state.profile.role = inpRole.value;
  save(); showToast('Perfil salvo'); showView('home');
});
document.getElementById('cancelProfile').addEventListener('click', ()=> showView('home'));

// quick checklist (home)
function renderQuick(){
  const wrapper = document.getElementById('quickChecklist'); wrapper.innerHTML='';
  const today = todayName();
  (WEEK_TEMPLATE[today]||[]).slice(0,4).forEach((ex,i)=>{
    const div = document.createElement('div'); div.className='quick-item';
    div.innerHTML = `<div>${ex}</div><div><input type="checkbox" data-q="${i}" ${ (state.completed[today] && state.completed[today][i])?'checked':'' }></div>`;
    wrapper.appendChild(div);
    div.querySelector('input').addEventListener('change',(e)=>{ state.completed[today] = state.completed[today]||{}; state.completed[today][i]=e.target.checked; save(); renderWeek(); updateProgress(today); buildCharts(); });
  });
}

// Charts (jump & strength)
function buildCharts(){
  const labels = state.records.map(r=>r.d);
  const jump = state.records.map(r=>r.jump);
  const rdl = state.records.map(r=>r.rdl);
  if(window._cj) window._cj.destroy();
  if(window._cs) window._cs.destroy();
  window._cj = new Chart(chartJumpCtx,{type:'line',data:{labels,datasets:[{label:'Salto (cm)',data:jump,fill:false,borderColor:'rgba(91,46,138,0.9)'}]},options:{responsive:true}});
  window._cs = new Chart(chartStrengthCtx,{type:'line',data:{labels,datasets:[{label:'RDL',data:rdl,fill:false,borderColor:'rgba(255,180,0,0.9)'}]},options:{responsive:true}});
}

// history view
function renderHistory(){
  const el = document.getElementById('historyList');
  if(!state.records || state.records.length===0) { el.textContent = 'Nenhum treino registrado ainda.'; return; }
  el.innerHTML = '';
  state.records.slice().reverse().forEach(r=>{
    const d = document.createElement('div');
    d.className='card';
    d.style.marginBottom='8px';
    d.innerHTML = `<strong>${r.d}</strong><div class="muted">Salto: ${r.jump} cm — RDL: ${r.rdl} kg</div>`;
    el.appendChild(d);
  });
}

// toast
function showToast(t){ const el = document.getElementById('toast'); el.textContent = t; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),1400); }

// sample records if empty
if(!state.records || state.records.length===0){
  state.records = [{d:new Date().toISOString().slice(0,10), jump:48, rdl:115}];
  save();
}

// initial render
renderWeek();
openDay(todayName());
renderQuick();
buildCharts();
