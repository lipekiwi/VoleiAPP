
// V3: editable exercises (add/edit/delete), show today's workout by default, jump records input + deletions
const STORAGE_KEY = 'volei_v3_state_v1';
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
function showToast(txt){ const t = el('#toast'); t.textContent = txt; t.classList.remove('hidden'); setTimeout(()=> t.classList.add('hidden'),1400); }

// Navigation/views
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.bottombar button');
function showView(name){
  views.forEach(v=> v.dataset.view===name ? v.classList.remove('hidden') : v.classList.add('hidden'));
  navBtns.forEach(b=> b.classList.toggle('active', b.dataset.view===name));
  if(name==='home') renderHome();
  if(name==='treinos') renderEditor();
  if(name==='profile') fillProfile();
}
navBtns.forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));
// profile buttons
el('#btnProfile').addEventListener('click', ()=> showView('profile'));
el('#backHome').addEventListener('click', ()=> showView('home'));

// profile
function fillProfile(){ el('#inpName').value = state.profile.name||''; el('#inpHeight').value = state.profile.height||''; el('#inpRole').value = state.profile.role||'Ponteiro'; el('#userName').textContent = state.profile.name||'Atleta'; }
el('#saveProfile').addEventListener('click', ()=>{ state.profile.name = el('#inpName').value.trim(); state.profile.height = el('#inpHeight').value.trim(); state.profile.role = el('#inpRole').value; save(); showToast('Perfil salvo'); showView('home'); });

// Today navigation: show today's day by default and allow prev/next
const dayOrder = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
let currentDayIndex = new Date().getDay(); // 0-6
function getDayName(idx){ return dayOrder[idx%7]; }
function prevDay(){ currentDayIndex = (currentDayIndex+6)%7; renderToday(); }
function nextDay(){ currentDayIndex = (currentDayIndex+1)%7; renderToday(); }
el('#prevDay').addEventListener('click', prevDay);
el('#nextDay').addEventListener('click', nextDay);

// render today's workout focused view
function renderToday(){
  const dayName = getDayName(currentDayIndex);
  const day = state.days[dayName];
  el('#todayName').textContent = dayName;
  el('#todayWorkoutName').textContent = day.name || 'Sem nome';
  const container = el('#exercisesList'); container.innerHTML = '';
  if(day.exercises && day.exercises.length){
    day.exercises.forEach((ex,i)=>{
      const div = document.createElement('div'); div.className='exItem';
      div.innerHTML = `<div><strong>${ex.name}</strong><div class="exMeta">${ex.sets}x${ex.reps} ${ex.weight?('• '+ex.weight+'kg'):''}</div></div>
        <div class="row">
          <button class="iconBtn editEx" data-i="${i}">✎</button>
          <button class="iconBtn delEx" data-i="${i}">🗑</button>
          <input type="checkbox" data-i="${i}" ${ex.done?'checked':''}>
        </div>`;
      // edit
      div.querySelector('.editEx').addEventListener('click', ()=> editExercise(dayName, i));
      // delete
      div.querySelector('.delEx').addEventListener('click', ()=> { if(confirm('Remover exercício?')){ state.days[dayName].exercises.splice(i,1); save(); renderToday(); showToast('Excluído'); } });
      // checkbox
      div.querySelector('input[type=checkbox]').addEventListener('change', (e)=>{ state.days[dayName].exercises[i].done = e.target.checked; save(); showToast(e.target.checked?'Marcado':'Desmarcado'); });
      container.appendChild(div);
    });
  } else {
    container.innerHTML = '<div class="muted">Nenhum exercício para este dia</div>';
  }
}

// add exercise to current day
el('#addExerciseToday').addEventListener('click', ()=>{
  const dayName = getDayName(currentDayIndex);
  const name = prompt('Nome do exercício:');
  if(!name) return;
  const sets = prompt('Séries (ex: 3):','3');
  const reps = prompt('Repetições (ex: 8):','8');
  const weight = prompt('Carga (kg) - opcional:','');
  state.days[dayName].exercises.push({ name:name.trim(), sets:Number(sets)||0, reps:Number(reps)||0, weight:weight.trim(), done:false });
  save(); renderToday(); showToast('Exercício adicionado');
});

el('#clearToday').addEventListener('click', ()=>{
  const dayName = getDayName(currentDayIndex);
  if(!state.days[dayName].exercises) return;
  state.days[dayName].exercises.forEach(e=> e.done=false);
  save(); renderToday(); showToast('Limpo');
});

function editExercise(dayName, idx){
  const ex = state.days[dayName].exercises[idx];
  const name = prompt('Nome do exercício:', ex.name);
  if(name===null) return;
  const sets = prompt('Séries:', ex.sets);
  const reps = prompt('Repetições:', ex.reps);
  const weight = prompt('Carga (kg):', ex.weight||'');
  ex.name = name.trim(); ex.sets = Number(sets)||0; ex.reps = Number(reps)||0; ex.weight = weight.trim();
  save(); renderToday(); showToast('Atualizado');
}

// Treinos editor (full view)
function renderEditor(){
  const container = el('#daysEditor'); container.innerHTML='';
  Object.keys(state.days).forEach(dayName=>{
    const day = state.days[dayName];
    const card = document.createElement('div'); card.className='dayCard';
    card.innerHTML = `<div class="dayHeader"><div><strong>${dayName}</strong><div class="muted">${day.name||'Sem nome'}</div></div><div class="row"><button class="iconBtn editDay">Editar nome</button><button class="iconBtn addEx">+Ex</button></div></div><div class="exList"></div>`;
    card.querySelector('.editDay').onclick = ()=>{ const newName = prompt('Nome do treino para '+dayName, day.name||''); if(newName!==null){ day.name=newName.trim(); save(); renderEditor(); showToast('Nome atualizado'); } };
    card.querySelector('.addEx').onclick = ()=>{ const n=prompt('Nome do exercício:'); if(!n) return; const s=prompt('Séries:','3'); const r=prompt('Reps:','8'); day.exercises.push({name:n.trim(), sets:Number(s)||0, reps:Number(r)||0, weight:'', done:false}); save(); renderEditor(); showToast('Adicionado'); };
    const exList = card.querySelector('.exList');
    if(day.exercises && day.exercises.length){
      day.exercises.forEach((ex,i)=>{
        const exEl = document.createElement('div'); exEl.className='exItem';
        exEl.innerHTML = `<div><strong>${ex.name}</strong><div class="exMeta">${ex.sets}x${ex.reps} ${ex.weight?('• '+ex.weight+'kg'):''}</div></div><div class="row"><button class="iconBtn editEx">✎</button><button class="iconBtn delEx">🗑</button></div>`;
        exEl.querySelector('.editEx').addEventListener('click', ()=>{ const name=prompt('Nome:', ex.name); if(name===null) return; const s=prompt('Séries:', ex.sets); const r=prompt('Reps:', ex.reps); ex.name=name.trim(); ex.sets=Number(s)||0; ex.reps=Number(r)||0; save(); renderEditor(); showToast('Atualizado'); });
        exEl.querySelector('.delEx').addEventListener('click', ()=>{ if(confirm('Remover exercício?')){ day.exercises.splice(i,1); save(); renderEditor(); showToast('Excluído'); } });
        exList.appendChild(exEl);
      });
    } else {
      exList.innerHTML = '<div class="muted">Nenhum exercício</div>';
    }
    container.appendChild(card);
  });
}

// import example
el('#importSample').addEventListener('click', ()=>{ if(!confirm('Importar exemplo? Substituirá seus treinos.')) return; state.days=JSON.parse(JSON.stringify(DEFAULT_DAYS)); save(); renderEditor(); showToast('Exemplo importado'); });

// Jump records: add / remove / chart
el('#addJump').addEventListener('click', ()=>{
  const v = Number(el('#jumpInput').value);
  if(!v || v<=0){ alert('Digite um valor válido (cm)'); return; }
  const d = new Date().toISOString().slice(0,10);
  state.records.push({ d, jump: v });
  save(); el('#jumpInput').value=''; renderJumps(); buildJumpChart(); showToast('Registro adicionado');
});

el('#clearJumps').addEventListener('click', ()=>{ if(!confirm('Limpar todos os registros de salto?')) return; state.records=[]; save(); renderJumps(); buildJumpChart(); showToast('Limpo'); });

function renderJumps(){
  const list = el('#jumpList'); list.innerHTML='';
  if(!state.records || state.records.length===0){ list.textContent='Nenhum registro de salto'; return; }
  state.records.forEach((r,i)=>{
    const div = document.createElement('div'); div.style.display='flex'; div.style.justifyContent='space-between'; div.style.padding='6px 0';
    div.innerHTML = `<div>${r.d} — ${r.jump} cm</div><div><button class="iconBtn" data-i="${i}">Remover</button></div>`;
    div.querySelector('button').addEventListener('click', ()=>{ if(confirm('Remover este registro?')){ state.records.splice(i,1); save(); renderJumps(); buildJumpChart(); showToast('Removido'); } });
    list.appendChild(div);
  });
}

// build chart
function buildJumpChart(){
  const ctx = el('#chartJump').getContext('2d');
  const labels = state.records.map(r=>r.d);
  const data = state.records.map(r=>r.jump);
  if(window._cj) window._cj.destroy();
  window._cj = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Salto (cm)', data, borderColor:'#5B2E8A', tension:0.3, fill:false }] }, options:{responsive:true, plugins:{legend:{display:false}}} });
}

// initial render
renderToday();
renderJumps();
buildJumpChart();
renderEditor();
