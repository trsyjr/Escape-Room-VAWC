// script.js (module)
const PAGES = [
  'start',
  'room1-step1','room1-step2',
  'room2-step1','room2-step2',
  'room3-step1','room3-step2',
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
  // update currentIndex
  currentIndex = PAGES.indexOf(name);
}
function incProgress() {
  completedSteps = Math.min(TOTAL_STEPS, completedSteps + 1);
  const pct = Math.round((completedSteps / TOTAL_STEPS) * 100);
  progressBar.style.width = pct + '%';
  progressText.textContent = `${completedSteps} / ${TOTAL_STEPS}`;
}

// Timer
let timeLeft = 15 * 60; // seconds
const timerEl = document.getElementById('timer');
timerEl.textContent = formatTime(timeLeft);
let timerInterval = null;

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2,'0');
  const s = (sec % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      failGame();
    }
  }, 1000);
}

// Try to close or redirect (browsers may block window.close)
function attemptClose() {
  try {
    window.open('', '_self').close();
    window.close();
  } catch (e) {
    try { location.href = 'about:blank'; } catch {}
  }
}

// Failure (time up or wrong answer)
function failGame() {
  // lock UI and show fail page
  document.querySelectorAll('[data-page]').forEach(s => s.classList.add('hidden'));
  document.querySelector('[data-page="fail"]').classList.remove('hidden');
  // attempt to close tab
  setTimeout(() => attemptClose(), 700);
}

/* ---------------- START PAGE ---------------- */
document.getElementById('startBtn').addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  const division = document.getElementById('playerDivision').value.trim();
  const email = document.getElementById('playerEmail').value.trim();
  if (!name || !division || !email) {
    alert('Please enter your Name, Division and Email before starting.');
    return;
  }
  // store basic info in session variables
  sessionStorage.setItem('playerName', name);
  sessionStorage.setItem('playerDivision', division);
  sessionStorage.setItem('playerEmail', email);

  showPage('room1-step1');
  startTimer();
});

/* ---------------- ROOM 1 ---------------- */
// Page 1: checkbox selection
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
    // wrong -> fail immediately
    failGame();
    return;
  }
  incProgress();
  showPage('room1-step2');
});

// Page 2: short answer code ALERT
document.getElementById('room1-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r1code').value || '').trim().toUpperCase();
  if (v !== 'ALERT') { failGame(); return; }
  incProgress();
  showPage('room2-step1');
});

/* ---------------- ROOM 2 ---------------- */
// match buttons logic: we store selections in an object
const matchSelections = { A: null, B: null, C: null };
document.querySelectorAll('.btn-group[data-for="A"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    matchSelections.A = btn.dataset.val;
    // visual
    document.querySelectorAll('.btn-group[data-for="A"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.btn-group[data-for="B"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    matchSelections.B = btn.dataset.val;
    document.querySelectorAll('.btn-group[data-for="B"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.btn-group[data-for="C"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    matchSelections.C = btn.dataset.val;
    document.querySelectorAll('.btn-group[data-for="C"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('room2-step1-submit').addEventListener('click', () => {
  if (matchSelections.A === 'RA 9262' &&
      matchSelections.B === 'Safe Spaces Act' &&
      matchSelections.C === 'Anti-Trafficking') {
    incProgress();
    showPage('room2-step2');
  } else {
    failGame();
  }
});

// room2 code
document.getElementById('room2-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r2code').value || '').trim().toUpperCase();
  if (v !== 'VAWC') { failGame(); return; }
  incProgress();
  showPage('room3-step1');
});

/* ---------------- ROOM 3 ---------------- */
// page1: select harassing messages (should be 1,2,3)
document.getElementById('room3-step1-submit').addEventListener('click', () => {
  const sel = [...document.querySelectorAll('.r3:checked')].map(i => i.value);
  const needed = ['1','2','3'];
  const ok = needed.every(n => sel.includes(n)) && sel.length === 3;
  if (!ok) { failGame(); return; }
  incProgress();
  showPage('room3-step2');
});

// page2: code SAFE
document.getElementById('room3-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r3code').value || '').trim().toUpperCase();
  if (v !== 'SAFE') { failGame(); return; }
  incProgress();
  showPage('room4-step1');
});

/* ---------------- ROOM 4 ---------------- */
// select positions p1..p4
const posSelections = { p1: null, p2: null, p3: null, p4: null };
document.querySelectorAll('.btn-group[data-for="p1"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    posSelections.p1 = btn.dataset.val;
    document.querySelectorAll('.btn-group[data-for="p1"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.btn-group[data-for="p2"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    posSelections.p2 = btn.dataset.val;
    document.querySelectorAll('.btn-group[data-for="p2"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.btn-group[data-for="p3"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    posSelections.p3 = btn.dataset.val;
    document.querySelectorAll('.btn-group[data-for="p3"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.btn-group[data-for="p4"] .btn-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    posSelections.p4 = btn.dataset.val;
    document.querySelectorAll('.btn-group[data-for="p4"] .btn-choice').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
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
    failGame();
  }
});

// page2: final hotline code
document.getElementById('room4-step2-submit').addEventListener('click', () => {
  const v = (document.getElementById('r4code').value || '').trim();
  if (v !== '911') { failGame(); return; }
  incProgress();
  showPage('final');
});

/* ---------------- FINISH ---------------- */
document.getElementById('finishBtn').addEventListener('click', async () => {
  // finalization: collect info, stop timer, send email
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  const name = sessionStorage.getItem('playerName') || 'Unknown';
  const division = sessionStorage.getItem('playerDivision') || '';
  const email = sessionStorage.getItem('playerEmail') || '';
  const reflection = document.getElementById('reflection').value || '';
  const finishTime = new Date().toLocaleString();
  const spentSeconds = (15 * 60) - timeLeft;
  const duration = `${Math.floor(spentSeconds/60)}m ${spentSeconds%60}s`;

  // Prepare email payload
  const emailBody = `
Player: ${name}
Division: ${division}
Email: ${Email}
Finished at: ${finishTime}
Duration: ${duration}
Time left: ${formatTime(timeLeft)}
Reflection:
${reflection}
  `;

  // Try EmailJS if configured
  try {
    // Replace these placeholders with your EmailJS values
    const SERVICE_ID = 'service_mqqndw9';
    const TEMPLATE_ID = 'template_pzaou61';
    const PUBLIC_KEY = '4uCGVPBz3H1dGhGwQ';

    // If user replaced keys and emailjs is loaded
    if (window.emailjs && SERVICE_ID !== 'service_mqqndw9' && TEMPLATE_ID !== 'template_pzaou61' && PUBLIC_KEY !== '4uCGVPBz3H1dGhGwQ') {
      // init if not initialized (safe)
      try { emailjs.init(PUBLIC_KEY); } catch(e){}
      // template parameters: adapt in your EmailJS template to use these
      const templateParams = {
        player_name: name,
        player_division: division,
        player_email: email,
        finish_time: finishTime,
        duration: duration,
        time_left: formatTime(timeLeft),
        reflection: reflection,
        to_emails: 'jpfutalan@dswd.gov.ph,amlpineda@dswd.gov.ph'
      };
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
      alert('Completed — confirmation email sent.');
    } else {
      // fallback to mailto (user must send)
      const subject = encodeURIComponent('Escape Room Completion — ' + name);
      const body = encodeURIComponent(emailBody);
      window.open(`mailto:jpfutalan@dswd.gov.ph,amlpineda@dswd.gov.ph?subject=${subject}&body=${body}`, '_blank');
      alert('No EmailJS configured. A mail compose window was opened so you can send details.');
    }
  } catch (err) {
    console.error('Email error', err);
    alert('Error sending email — check console and EmailJS config.');
  }

  // show a simple congratulations overlay on success
  document.querySelectorAll('[data-page]').forEach(s => s.classList.add('hidden'));
  const finalEl = document.querySelector('[data-page="final"]');
  finalEl.classList.remove('hidden');
  finalEl.innerHTML = `<h2 class="text-2xl font-bold mb-3">CONGRATULATIONS</h2>
    <p class="text-slate-300 mb-4">You finished the Break the Silence: VAW Escape Room Challenge.</p>
    <p class="text-sm text-slate-300 mb-6"><strong>${name}</strong> — ${division} / ${email}<br>Duration: ${duration}</p>
    <div class="flex justify-center"><button class="btn-primary w-48" onclick="location.reload()">Play again</button></div>`;
});

/* ---------------- initialization ---------------- */
showPage('start');
progressBar.style.width = '0%';
progressText.textContent = `0 / ${TOTAL_STEPS}`;

// failClose button
document.getElementById('failClose').addEventListener('click', () => {
  // try to close tab or reload
  try { attemptClose(); } catch {}
  location.reload();
});
