
// V4 - Home minimal + Treinos editor + Progress + Profile
const STORAGE_KEY = 'volei_v4_state_v1';
let state = { profile:{}, days:{}, records:[] };

function load(){ try{ const s = JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'); if(s) state = s; }catch(e){} }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
load();

const DEFAULT = {
  "Segunda": { name:"Lower Explosão", exercises:[{name:"Box Jumps",sets:5,reps:4,weight:""},{name:"RDL",sets:4,reps:6,weight:""}] },
  "Terça": { name:"Pelada", exercises:[] },
  "Quarta": { name:"Upper Força", exercises:[{name:"Supino",sets:4,reps:5,weight:""}] },
  "Quinta": { name:"Treino equipe", exercises:[] },
  "Sexta": { name:"Pelada", exercises:[] },
  "Sábado": { name:"Lower força", exercises:[] },
  "Domingo": { name:"Recuperação", exercises:[] }
};

function ensure(){ if(!state.days || Object.keys(state.days).length===0){ state.days = JSON.parse(JSON.stringify(DEFAULT)); save(); } }
ensure();

// helpers
const el = (s,ctx=document)=> ctx.querySelector(s);
const elAll = (s,ctx=document)=> Array.from(ctx.querySelectorAll(s));
const showToast = t => { const x = el('#toast'); x.textContent=t; x.classList.remove('hidden'); setTimeout(()=>x.classList.add('hidden'),1400); }

// view navigation
const views = elAll('.view');
const navBtns = elAll('.bottombar button');
function showView(name){
  views.forEach(v=> v.dataset.view===name ? v.classList.remove('hidden') : v.classList.add('hidden'));
  navBtns.forEach(b=> b.classList.toggle('active', b.dataset.view===name));
  if(name==='home') renderHome();
  if(name==='treinos') renderTreinos();
  if(name==='progress') { renderJumps(); buildJumpChart(); }
  if(name==='profile') fillProfile();
}
navBtns.forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));
// header profile button
el('#btnProfile').addEventListener('click', ()=> showView('profile'));

// profile
function fillProfile(){ el('#inpName').value= state.profile.name||''; el('#inpHeight').value= state.profile.height||''; el('#inpRole').value= state.profile.role||'Ponteiro'; el('#greeting').textContent = 'Olá, '+(state.profile.name||'Atleta')+' 👋'; }
el('#saveProfile').addEventListener('click', ()=>{ state.profile.name=el('#inpName').value.trim(); state.profile.height=el('#inpHeight').value.trim(); state.profile.role=el('#inpRole').value; save(); showToast('Perfil salvo'); showView('home'); });

// HOME: minimal
function getTodayName(){ return ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][new Date().getDay()]; }
function renderHome(){
  fillProfile();
  const t = getTodayName();
  const day = state.days[t] || {name:'—', exercises:[]};
  el('#homeTodayName').textContent = day.name || '—';
  el('#homeTodaySub').textContent = day.exercises && day.exercises.length ? day.exercises.slice(0,3).map(x=>x.name).join(', ') : 'Nenhum exercício definido';
  const last = state.records && state.records.length ? state.records[state.records.length-1].jump : null;
  el('#homeLastJump').textContent = last ? (last+' cm') : '—';
  el('#gotoTreinos').onclick = ()=> showView('treinos');
  el('#gotoProgress').onclick = ()=> showView('progress');
  el('#openProfileBtn').onclick = ()=> showView('profile');
}

// TREINOS: show today's workout focus and allow navigation within treinos view
let currentIndex = new Date().getDay();
const order = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
function idxToDay(i){ return order[(i+7)%7]; }
function renderTreinos(){
  // set currentIndex to today's if entering from home
  const dayName = idxToDay(currentIndex);
  const day = state.days[dayName] || {name:'Sem nome', exercises:[]};
  el('#treDayName').textContent = dayName;
  el('#treDayTitle').textContent = day.name || 'Sem nome';
  const container = el('#treExercises'); container.innerHTML='';
  if(day.exercises && day.exercises.length){
    day.exercises.forEach((ex,i)=>{
      const div = document.createElement('div'); div.className='exItem';
      div.innerHTML = `<div><strong>${ex.name}</strong><div class="exMeta">${ex.sets}x${ex.reps} ${ex.weight?('• '+ex.weight+'kg'):''}</div></div>
        <div class="row"><button class="iconBtn editEx">✎</button><button class="iconBtn delEx">🗑</button><input type="checkbox" ${ex.done?'checked':''}></div>`;
      div.querySelector('.editEx').addEventListener('click', ()=> editExercise(dayName,i));
      div.querySelector('.delEx').addEventListener('click', ()=> { if(confirm('Remover exercício?')){ state.days[dayName].exercises.splice(i,1); save(); renderTreinos(); showToast('Excluído'); } });
      div.querySelector('input[type=checkbox]').addEventListener('change', e=>{ state.days[dayName].exercises[i].done = e.target.checked; save(); });
      container.appendChild(div);
    });
  } else {
    container.innerHTML = '<div class="muted">Nenhum exercício para este dia</div>';
  }
  // actions
  el('#addEx').onclick = ()=> addExercise(idxToDay(currentIndex));
  el('#importSample').onclick = ()=> { if(confirm('Importar exemplo?')){ state.days = JSON.parse(JSON.stringify(DEFAULT)); save(); renderTreinos(); showToast('Importado'); } };
  el('#trePrev').onclick = ()=> { currentIndex = (currentIndex+6)%7; renderTreinos(); };
  el('#treNext').onclick = ()=> { currentIndex = (currentIndex+1)%7; renderTreinos(); };
}

// edit/add helpers
function addExercise(dayName){
  const name = prompt('Nome do exercício:');
  if(!name) return;
  const sets = prompt('Séries (ex: 3):','3');
  const reps = prompt('Repetições (ex: 8):','8');
  const weight = prompt('Carga (kg) - opcional:','');
  state.days[dayName].exercises.push({name:name.trim(),sets:Number(sets)||0,reps:Number(reps)||0,weight:weight.trim(),done:false});
  save(); renderTreinos(); showToast('Adicionado');
}
function editExercise(dayName, idx){
  const ex = state.days[dayName].exercises[idx];
  const name = prompt('Nome:', ex.name);
  if(name===null) return;
  const sets = prompt('Séries:', ex.sets);
  const reps = prompt('Reps:', ex.reps);
  const weight = prompt('Carga (kg):', ex.weight||'');
  ex.name = name.trim(); ex.sets = Number(sets)||0; ex.reps = Number(reps)||0; ex.weight = weight.trim();
  save(); renderTreinos(); showToast('Atualizado');
}

// PROGRESS (jump)
el('#addJump').addEventListener('click', ()=>{
  const v = Number(el('#jumpInput').value);
  if(!v || v<=0){ alert('Digite valor válido (cm)'); return; }
  const d = new Date().toISOString().slice(0,10);
  state.records.push({d,jump:v});
  save(); el('#jumpInput').value=''; renderJumps(); buildJumpChart(); showToast('Registro adicionado');
});
el('#clearJumps').addEventListener('click', ()=>{ if(!confirm('Limpar registros?')) return; state.records=[]; save(); renderJumps(); buildJumpChart(); showToast('Limpo'); });
function renderJumps(){
  const list = el('#jumpList'); list.innerHTML='';
  if(!state.records || state.records.length===0){ list.textContent='Nenhum registro'; return; }
  state.records.forEach((r,i)=>{
    const d = document.createElement('div'); d.style.display='flex'; d.style.justifyContent='space-between'; d.style.padding='6px 0';
    d.innerHTML = `<div>${r.d} — ${r.jump} cm</div><div><button class="iconBtn" data-i="${i}">Remover</button></div>`;
    d.querySelector('button').addEventListener('click', ()=>{ if(confirm('Remover?')){ state.records.splice(i,1); save(); renderJumps(); buildJumpChart(); showToast('Removido'); } });
    list.appendChild(d);
  });
}
function buildJumpChart(){
  const ctx = el('#chartJump').getContext('2d');
  const labels = state.records.map(r=>r.d);
  const data = state.records.map(r=>r.jump);
  if(window._cj) window._cj.destroy();
  window._cj = new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Salto (cm)',data,borderColor:'#5B2E8A',tension:0.3,fill:false}]},options:{responsive:true,plugins:{legend:{display:false}}}});
}

// initial render
renderHome();
renderTreinos();
renderJumps();
buildJumpChart();
