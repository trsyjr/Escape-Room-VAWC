// --- Pages & Progress ---
const PAGES = [
  'start','room1-step1','room1-step2',
  'room2-step1','room2-step2',
  'room3','room4-step1','room4-step2',
  'final','fail'
];

let currentIndex = 0;
let completedSteps = 0;
const TOTAL_STEPS = 8; // 4 rooms * 2 steps
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const timerEl = document.getElementById('timer');

// --- Helper Functions ---
function showPage(name){
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.add('hidden'));
  document.querySelector(`[data-page="${name}"]`)?.classList.remove('hidden');
  currentIndex = PAGES.indexOf(name);
}

function incProgress(){
  completedSteps = Math.min(TOTAL_STEPS, completedSteps+1);
  const pct = Math.round((completedSteps/TOTAL_STEPS)*100);
  progressBar.style.width = pct+'%';
  progressText.textContent = `${completedSteps} / ${TOTAL_STEPS}`;
}

function showError(id,msg){
  const el = document.getElementById(id+'-error');
  if(!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),3000);
}

function failGame(){
  showPage('fail');
}

// --- Timer ---
let timerEnd = null;
function formatTime(sec){
  const m = String(Math.floor(sec/60)).padStart(2,'0');
  const s = String(sec%60).padStart(2,'0');
  return `${m}:${s}`;
}
function startTimer(){
  if(timerEnd) return;
  timerEnd = Date.now() + 15*60*1000;
  const tick = ()=> {
    const remaining = Math.round((timerEnd - Date.now())/1000);
    if(remaining<=0){ timerEl.textContent='00:00'; failGame(); return; }
    timerEl.textContent = formatTime(remaining);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// --- START ---
document.getElementById('startBtn')?.addEventListener('click',()=>{
  const name = (document.getElementById('playerName')?.value||'').trim();
  const office = (document.getElementById('playerOffice')?.value||'').trim();
  const email = (document.getElementById('playerEmail')?.value||'').trim();
  if(!name || !office || !email){ showError('start','Please fill all fields'); return; }
  sessionStorage.setItem('playerName',name);
  sessionStorage.setItem('playerOffice',office);
  sessionStorage.setItem('playerEmail',email);
  showPage('room1-step1');
  startTimer();
});

// --- ROOM 1 ---
document.getElementById('room1-step1-submit')?.addEventListener('click',()=>{
  const chosen = [...document.querySelectorAll('#r1choices input:checked')].map(i=>i.value);
  const required = ["Monitoring her phone","Isolation from friends","Controlling behaviors","Making her feel unsafe"];
  if(!required.every(r=>chosen.includes(r))){ showError('room1-step1','Incorrect selection'); return; }
  incProgress(); showPage('room1-step2');
});
document.getElementById('room1-step2-submit')?.addEventListener('click',()=>{
  const code = (document.getElementById('r1code')?.value||'').trim().toUpperCase();
  if(code!=='ALERT'){ showError('room1-step2','Incorrect code'); return; }
  incProgress(); showPage('room2-step1');
});

// --- ROOM 2 ---
const matchSelections = {A:null,B:null,C:null};
['A','B','C'].forEach(k=>{
  document.querySelectorAll(`.btn-group[data-for="${k}"] .btn-choice`).forEach(btn=>{
    btn.addEventListener('click',()=>{
      matchSelections[k]=btn.dataset.val;
      document.querySelectorAll(`.btn-group[data-for="${k}"] .btn-choice`).forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});
document.getElementById('room2-step1-submit')?.addEventListener('click',()=>{
  if(matchSelections.A==='RA 9262' && matchSelections.B==='Safe Spaces Act' && matchSelections.C==='Anti-Trafficking'){
    incProgress(); showPage('room2-step2');
  } else showError('room2-step1','Incorrect match');
});
document.getElementById('room2-step2-submit')?.addEventListener('click',()=>{
  if((document.getElementById('r2code')?.value||'').trim().toUpperCase()!=='VAWC'){ showError('room2-step2','Incorrect code'); return; }
  incProgress(); showPage('room3');
});

// --- ROOM 3 ---
document.getElementById('room3-submit')?.addEventListener('click',()=>{
  const sel = [...document.querySelectorAll('.r3:checked')].map(i=>i.value);
  if(!['1','2','3'].every(n=>sel.includes(n)) || sel.length!==3){ showError('room3','Incorrect selection'); return; }
  if((document.getElementById('r3code')?.value||'').trim().toUpperCase()!=='SAFE'){ showError('room3','Incorrect code'); return; }
  incProgress(); incProgress(); showPage('room4-step1');
});

// --- ROOM 4 ---
const posSelections = {p1:null,p2:null,p3:null,p4:null};
['p1','p2','p3','p4'].forEach(k=>{
  document.querySelectorAll(`.btn-group[data-for="${k}"] .btn-choice`).forEach(btn=>{
    btn.addEventListener('click',()=>{
      posSelections[k]=btn.dataset.val;
      document.querySelectorAll(`.btn-group[data-for="${k}"] .btn-choice`).forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});
document.getElementById('room4-step1-submit')?.addEventListener('click',()=>{
  if(posSelections.p1==='Barangay VAW Desk' && posSelections.p2==='Barangay Protection Order' && posSelections.p3==='WCPD' && posSelections.p4==='Social Worker'){
    incProgress(); showPage('room4-step2');
  } else showError('room4-step1','Incorrect sequence');
});
document.getElementById('room4-step2-submit')?.addEventListener('click',()=>{
  if((document.getElementById('r4code')?.value||'').trim()!=='911'){ showError('room4-step2','Incorrect hotline'); return; }
  incProgress(); showPage('final');
});

// --- SEND TO GOOGLE SHEETS ---
async function sendToGSheet(data){
  const url = "https://script.google.com/a/macros/dswd.gov.ph/s/AKfycbwi8vRAOlYHx5J2rDKD7KgNmiuuGxFqOoTCXZp1x8hc4PZ_zkx06yHLTjaN-ts1bV_t/exec";  // <-- Replace with your Web App URL

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

// --- FINISH ---
document.getElementById('finishBtn')?.addEventListener('click',()=>{
  const name = sessionStorage.getItem('playerName')||'Unknown';
  const office = sessionStorage.getItem('playerOffice')||'';
  const email = sessionStorage.getItem('playerEmail')||'';
  const reflection = document.getElementById('reflection')?.value||'';

  const spentSec = Math.max(0,Math.round((timerEnd-Date.now())/1000));
  const duration = `${Math.floor((15*60-spentSec)/60)}m ${(15*60-spentSec)%60}s`;
  const finishedAt = new Date().toLocaleString();

  // Local save
  const finished = JSON.parse(localStorage.getItem('escapeRoomFinished')||'[]');
  finished.push({name,office,email,reflection,duration,finishedAt});
  localStorage.setItem('escapeRoomFinished',JSON.stringify(finished));

  // SEND TO GOOGLE SHEET
  sendToGSheet({
  type: "formSubmit",
  name,
  office,
  email,
  reflection,
  duration,
  finishedAt
});

  // Show final screen
  const finalEl = document.querySelector('[data-page="final"]');
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.add('hidden'));
  finalEl.classList.remove('hidden');
  finalEl.innerHTML = `
    <h2 class="text-2xl font-bold mb-3">CONGRATULATIONS</h2>
    <p class="text-slate-300 mb-4">You finished the Break the Silence: VAW Escape Room Challenge.</p>
    <p class="text-sm text-slate-300 mb-6"><strong>${name}</strong> — ${office} / ${email}<br>Duration: ${duration}</p>
    <div class="flex justify-center"><button class="btn-primary w-48" onclick="location.reload()">Play again</button></div>
  `;
});

// --- FAIL CLOSE ---
document.getElementById('failClose')?.addEventListener('click',()=>location.reload());

// --- INIT ---
showPage('start');
progressBar.style.width='0%';
progressText.textContent=`0 / ${TOTAL_STEPS}`;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("introModal");
  const closeModalBtn = document.getElementById("closeModal");
  const startPage = document.querySelector('[data-page="start"]');

  // Start page stays hidden until modal is closed
  closeModalBtn.addEventListener("click", () => {
    // Hide the modal
    modal.classList.add("hidden");

    // Show the start page
    startPage.classList.remove("hidden");
  });
});
