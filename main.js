// script.js (module)
const PAGES = [
  'start',
  'room1-step1','room1-step2',
  'room2-step1','room2-step2',
  'room3',
  'room4-step1','room4-step2',
  'final','fail'
];

let currentIndex = 0;
let completedSteps = 0;
const TOTAL_STEPS = 8; // 4 rooms * 2 pages
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

function showPage(name) {
  document.querySelectorAll('[data-page]').forEach(s => s.classList.add('hidden'));
  const el = document.querySelector(`[data-page="${name}"]`);
  if (el) el.classList.remove('hidden');
  currentIndex = PAGES.indexOf(name);
}

// increment progress bar
function incProgress() {
  completedSteps = Math.min(TOTAL_STEPS, completedSteps + 1);
  const pct = Math.round((completedSteps / TOTAL_STEPS) * 100);
  progressBar.style.width = pct + '%';
  progressText.textContent = `${completedSteps} / ${TOTAL_STEPS}`;
}

// Timer
let timerEnd = null;
const timerEl = document.getElementById('timer');
timerEl.textContent = "15:00";

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2,'0');
  const s = (sec % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function startTimer() {
  if (timerEnd) return; // already started
  timerEnd = Date.now() + 15 * 60 * 1000;

  const tick = () => {
    const remaining = Math.round((timerEnd - Date.now()) / 1000);
    if (remaining <= 0) {
      timerEl.textContent = "00:00";
      failGame();
      return;
    }
    timerEl.textContent = formatTime(remaining);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Show inline error message
function showError(containerId, message) {
  const el = document.getElementById(containerId + '-error');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// Fail game when time runs out
function failGame() {
  document.querySelectorAll('[data-page]').forEach(s => s.classList.add('hidden'));
  document.querySelector('[data-page="fail"]').classList.remove('hidden');
}

// ---------------- START ----------------
document.getElementById('startBtn').addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  const division = document.getElementById('playerDivision').value.trim();
  const email = document.getElementById('playerEmail').value.trim();
  if (!name || !division || !email) {
    showError('start', 'Please enter Name, Division, and Email.');
    return;
  }
  sessionStorage.setItem('playerName', name);
  sessionStorage.setItem('playerDivision', division);
  sessionStorage.setItem('playerEmail', email);

  showPage('room1-step1');
  startTimer();
});

// ---------------- ROOM 1 ----------------
document.getElementById('room1-step1-submit').addEventListener('click', () => {
  const chosen = [...document.querySelectorAll('#r1choices input:checked')].map(i => i.value);
  const required = [
    "Monitoring her phone",
    "Isolation from friends",
    "Controlling behaviors",
    "Making her feel unsafe"
  ];
  const allIncluded = required.every(r => chosen.includes(r));
  if (!allIncluded) {
    showError('room1-step1', 'Incorrect selection! Try again.');
    return;
  }
  incProgress();
  showPage('room1-step2');
});

document.getElementById('room1-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r1code').value || '').trim().toUpperCase();
  if (v !== 'ALERT') {
    showError('room1-step2', 'Incorrect code! Try again.');
    return;
  }
  incProgress();
  showPage('room2-step1');
});

// ---------------- ROOM 2 ----------------
const matchSelections = { A: null, B: null, C: null };
['A','B','C'].forEach(key => {
  document.querySelectorAll(`.btn-group[data-for="${key}"] .btn-choice`).forEach(btn => {
    btn.addEventListener('click', () => {
      matchSelections[key] = btn.dataset.val;
      document.querySelectorAll(`.btn-group[data-for="${key}"] .btn-choice`).forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

document.getElementById('room2-step1-submit').addEventListener('click', () => {
  if (matchSelections.A === 'RA 9262' &&
      matchSelections.B === 'Safe Spaces Act' &&
      matchSelections.C === 'Anti-Trafficking') {
    incProgress();
    showPage('room2-step2');
  } else {
    showError('room2-step1', 'Incorrect match! Try again.');
  }
});

document.getElementById('room2-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r2code').value || '').trim().toUpperCase();
  if (v !== 'VAWC') {
    showError('room2-step2', 'Incorrect code! Try again.');
    return;
  }
  incProgress();
  showPage('room3');
});

// ---------------- ROOM 3 (combined) ----------------
document.getElementById('room3-submit').addEventListener('click', () => {
  const sel = [...document.querySelectorAll('.r3:checked')].map(i => i.value);
  const needed = ['1','2','3']; // correct messages
  const allSelectedCorrect = needed.every(n => sel.includes(n)) && sel.length === 3;

  const code = (document.getElementById('r3code').value || '').trim().toUpperCase();
  const correctCode = 'SAFE';

  if (!allSelectedCorrect) {
    showError('room3', 'Incorrect messages selected! Try again.');
    return;
  }
  if (code !== correctCode) {
    showError('room3', 'Incorrect code! Try again.');
    return;
  }

  // If both correct
  incProgress(); // Step for message selection
  incProgress(); // Step for code
  showPage('room4-step1');
});

// ---------------- ROOM 4 ----------------
const posSelections = { p1: null, p2: null, p3: null, p4: null };
['p1','p2','p3','p4'].forEach(key => {
  document.querySelectorAll(`.btn-group[data-for="${key}"] .btn-choice`).forEach(btn => {
    btn.addEventListener('click', () => {
      posSelections[key] = btn.dataset.val;
      document.querySelectorAll(`.btn-group[data-for="${key}"] .btn-choice`).forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

document.getElementById('room4-step1-submit').addEventListener('click', () => {
  if (posSelections.p1 === 'Barangay VAW Desk' &&
      posSelections.p2 === 'Barangay Protection Order' &&
      posSelections.p3 === 'WCPD' &&
      posSelections.p4 === 'Social Worker') {
    incProgress();
    showPage('room4-step2');
  } else {
    showError('room4-step1', 'Incorrect sequence! Try again.');
  }
});

document.getElementById('room4-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r4code').value || '').trim();
  if (v !== '911') {
    showError('room4-step2', 'Incorrect hotline! Try again.');
    return;
  }
  incProgress();
  showPage('final');
});

// ---------------- FINISH ----------------
document.getElementById('finishBtn').addEventListener('click', async () => {
  const name = sessionStorage.getItem('playerName') || 'Unknown';
  const division = sessionStorage.getItem('playerDivision') || '';
  const email = sessionStorage.getItem('playerEmail') || '';
  const reflection = document.getElementById('reflection').value || '';
  const finishTime = new Date().toLocaleString();
  const spentSeconds = Math.max(0, Math.round((timerEnd - Date.now())/1000));
  const duration = `${Math.floor((15*60-spentSeconds)/60)}m ${(15*60-spentSeconds)%60}s`;

  // --- EmailJS send ---
  try {
    await emailjs.send(
      'service_mqqndw9',      // replace with your service ID
      'template_pzaou61',     // replace with your template ID
      {
        player_name: name,
        player_division: division,
        player_email: email,
        reflection: reflection,
        duration: duration,
        finished_at: finishTime
      },
      '4uCGVPBz3H1dGhGwQ'       // replace with your EmailJS public key
    );
    console.log('Email sent successfully!');
  } catch(err) {
    console.error('Email failed:', err);
  }

  // --- Show final message ---
  document.querySelectorAll('[data-page]').forEach(s => s.classList.add('hidden'));
  const finalEl = document.querySelector('[data-page="final"]');
  finalEl.classList.remove('hidden');
  finalEl.innerHTML = `<h2 class="text-2xl font-bold mb-3">CONGRATULATIONS</h2>
    <p class="text-slate-300 mb-4">You finished the Break the Silence: VAW Escape Room Challenge.</p>
    <p class="text-sm text-slate-300 mb-6"><strong>${name}</strong> — ${division} / ${email}<br>Duration: ${duration}</p>
    <div class="flex justify-center"><button class="btn-primary w-48" onclick="location.reload()">Play again</button></div>`;
});

// ---------------- INIT ----------------
showPage('start');
progressBar.style.width = '0%';
progressText.textContent = `0 / ${TOTAL_STEPS}`;
