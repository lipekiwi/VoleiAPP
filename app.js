
// Simple PWA Training App logic
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
    div.onclick = ()=>{ openDay(k); };
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

document.getElementById('startBtn').addEventListener('click', ()=>{ openDay(todayName()); });
document.getElementById('clearDay').addEventListener('click', ()=>{
  const d = todayName();
  delete state.completed[d]; save(); openDay(d); renderWeek(); showToast('Limpo');
});

// profile
document.getElementById('openProfile').addEventListener('click', ()=>{ document.getElementById('profileModal').classList.remove('hidden'); document.getElementById('inpName').value = state.profile.name||''; document.getElementById('inpHeight').value = state.profile.height||''; });
document.getElementById('closeProfile').addEventListener('click', ()=>{ document.getElementById('profileModal').classList.add('hidden'); });
document.getElementById('saveProfile').addEventListener('click', ()=>{ state.profile.name = document.getElementById('inpName').value; state.profile.height = document.getElementById('inpHeight').value; save(); document.getElementById('profileModal').classList.add('hidden'); showToast('Perfil salvo'); });

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

function showToast(t){ const el = document.getElementById('toast'); el.textContent = t; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),1500); }

// sample data utility if empty
if(!state.records || state.records.length===0){
  state.records = [{d:new Date().toISOString().slice(0,10), jump:48, rdl:115}];
  save();
}

renderWeek();
openDay(todayName());
renderQuick();
buildCharts();
