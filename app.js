
// VôleiApp v2 - Treinos por dia, perfil, progresso, checklist, offline storage
const STORAGE_KEY = 'volei_v2_state_v1';
let state = { profile: {}, days: {}, records: [] };

function load(){ try{ const s = JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'); if(s) state = s; }catch(e){} }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
load();

const DEFAULT_DAYS = {
  "Segunda": { name: "Lower Explosão", exercises: [ {name:"Box Jumps", sets:5, reps:4, weight:""},{name:"RDL", sets:4, reps:6, weight:""} ] },
  "Terça": { name: "Pelada", exercises: [] },
  "Quarta": { name: "Upper Força", exercises: [{name:"Supino", sets:4, reps:5, weight:""}] },
  "Quinta": { name: "Treino equipe", exercises: [] },
  "Sexta": { name: "Pelada", exercises: [] },
  "Sábado": { name: "Lower força", exercises: [] },
  "Domingo": { name: "Recuperação", exercises: [] }
};

function ensureDays(){ if(!state.days || Object.keys(state.days).length===0){ state.days = JSON.parse(JSON.stringify(DEFAULT_DAYS)); save(); } }
ensureDays();

function el(q, ctx=document){ return ctx.querySelector(q); }
function elAll(q, ctx=document){ return Array.from(ctx.querySelectorAll(q)); }
function showToast(txt){ const t = el('#toast'); t.textContent = txt; t.classList.remove('hidden'); setTimeout(()=> t.classList.add('hidden'),1500); }

// navigation
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.bottombar button');
function showView(name){
  views.forEach(v=> v.dataset.view===name ? v.classList.remove('hidden') : v.classList.add('hidden'));
  navBtns.forEach(b=> b.classList.toggle('active', b.dataset.view===name));
  if(name==='home') renderHome();
  if(name==='treinos') renderDays();
  if(name==='history') renderHistory();
  if(name==='profile') fillProfile();
}
navBtns.forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));
showView('home');

// profile
function fillProfile(){ el('#inpName').value = state.profile.name||''; el('#inpHeight').value = state.profile.height||''; el('#inpRole').value = state.profile.role||'Ponteiro'; el('#userName').textContent = state.profile.name||'Atleta'; }
el('#saveProfile').addEventListener('click', ()=>{ state.profile.name = el('#inpName').value.trim(); state.profile.height = el('#inpHeight').value.trim(); state.profile.role = el('#inpRole').value; save(); showToast('Perfil salvo'); showView('home'); });
el('#backHome').addEventListener('click', ()=> showView('home')); el('#btnProfile').addEventListener('click', ()=> showView('profile'));

// home render
function getTodayName(){ const map=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"]; return map[new Date().getDay()]; }
function renderHome(){ fillProfile(); const today=getTodayName(); const day = state.days[today]; el('#todayTitle').textContent = day.name||'—'; el('#todaySummary').textContent = day.exercises && day.exercises.length ? day.exercises.slice(0,3).map(e=>e.name).join(', ') : 'Nenhum exercício definido. Edite em Treinos.'; el('#openToday').onclick = ()=>{ showView('treinos'); setTimeout(()=> scrollToDay(today),200); }; el('#openTreinos').onclick = ()=> showView('treinos'); buildCharts(); renderHistory(); }

// days
function renderDays(){ const container = el('#daysList'); container.innerHTML=''; Object.keys(state.days).forEach(dayName=>{ const day = state.days[dayName]; const card = document.createElement('div'); card.className='dayCard'; card.innerHTML = `<div class="dayHeader"><div><strong>${dayName}</strong><div class="muted">${day.name||'Sem nome'}</div></div><div class="row"><button class="iconBtn editDay">Editar</button><button class="iconBtn addEx">+Ex</button><button class="iconBtn dupDay">⤾</button></div></div><div class="exList"></div>`; card.querySelector('.editDay').onclick = ()=> editDay(dayName); card.querySelector('.addEx').onclick = ()=> addExercise(dayName); card.querySelector('.dupDay').onclick = ()=> duplicateDay(dayName); const exList = card.querySelector('.exList'); if(day.exercises && day.exercises.length){ day.exercises.forEach((ex,i)=>{ const exEl = document.createElement('div'); exEl.className='exItem'; exEl.innerHTML = `<div><strong>${ex.name}</strong><div class="exMeta">${ex.sets}x${ex.reps} ${ex.weight?('• '+ex.weight+'kg'):''}</div></div><div class="row"><input type="checkbox" data-day="${dayName}" data-i="${i}" ${ex.done?'checked':''}></div>`; exEl.querySelector('input').addEventListener('change', (ev)=>{ const idx = Number(ev.target.dataset.i); const d = ev.target.dataset.day; state.days[d].exercises[idx].done = ev.target.checked; save(); showToast(ev.target.checked?'Marcado':'Desmarcado'); }); exList.appendChild(exEl); }); } else { exList.innerHTML = '<div class="muted">Nenhum exercício</div>'; } container.appendChild(card); }); }

function scrollToDay(day){ renderDays(); const cards = elAll('.dayCard'); const idx = Object.keys(state.days).indexOf(day); if(cards[idx]) cards[idx].scrollIntoView({behavior:'smooth', block:'center'}); }

function addExercise(dayName){ const name = prompt('Nome do exercício:' ); if(!name) return; const sets = prompt('Séries (ex: 3):','3'); const reps = prompt('Repetições por série (ex: 8):','8'); const weight = prompt('Carga (kg) - opcional:',''); const ex = { name: name.trim(), sets: Number(sets)||0, reps: Number(reps)||0, weight: weight.trim(), done:false }; state.days[dayName].exercises.push(ex); save(); renderDays(); showToast('Exercício adicionado'); }

function duplicateDay(dayName){ const target = prompt('Copiar para qual dia? (ex: Segunda)'); if(!target || !state.days[target]) return alert('Dia inválido'); state.days[target].exercises = JSON.parse(JSON.stringify(state.days[dayName].exercises)); save(); renderDays(); showToast('Dia duplicado'); }

function editDay(dayName){ const day = state.days[dayName]; const newName = prompt('Nome do treino para '+dayName, day.name||''); if(newName===null) return; day.name = newName.trim(); save(); renderDays(); showToast('Nome atualizado'); }

el('#importSample').addEventListener('click', ()=>{ if(!confirm('Importar exemplo? Isso substituirá seus treinos.')) return; state.days = JSON.parse(JSON.stringify(DEFAULT_DAYS)); save(); renderDays(); showToast('Importado'); });
el('#addDayBtn').addEventListener('click', ()=>{ const name = prompt('Nome do dia (ex: Segunda)'); if(!name) return; if(state.days[name]) return alert('Dia já existe'); state.days[name] = { name: 'Novo treino', exercises: [] }; save(); renderDays(); showToast('Criado'); });

// history and records
function renderHistory(){ const elh = el('#historyList'); if(!state.records || state.records.length===0){ elh.textContent = 'Nenhum registro salvo.'; return; } elh.innerHTML = ''; state.records.slice().reverse().forEach(r=>{ const d = document.createElement('div'); d.className='card'; d.style.marginBottom='8px'; d.innerHTML = `<strong>${r.d}</strong><div class="muted">Salto: ${r.jump||'-'} cm — Nota: ${r.note||'-'}</div>`; elh.appendChild(d); }); }

// charts (simple)
function buildCharts(){ const ctx = el('#chartJump').getContext('2d'); const labels = state.records.map(r=>r.d); const data = state.records.map(r=>r.jump||0); if(window._cj) window._cj.destroy(); window._cj = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Salto (cm)', data, borderColor:'#5B2E8A', tension:0.3 }]}, options:{responsive:true} }); }

// initial render
renderDays();
renderHome();
buildCharts();
