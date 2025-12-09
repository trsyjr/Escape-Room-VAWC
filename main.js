document.addEventListener('DOMContentLoaded', () => {

  const PAGES = [
    'start','room1-step1','room1-step2',
    'room2-step1','room2-step2',
    'room3','room3-unlock',
    'room4-step1','room4-step2',
    'final','fail'
  ];

  let completedSteps = 0;
  const TOTAL_STEPS = 8;
  const $ = id => document.getElementById(id);

  // Elements
  const progressBar = $('progressBar');
  const progressText = $('progressText');
  const timerEl = $('timer');
  const startBtn = $('startBtn');
  const finishBtn = $('finishBtn');
  const playerName = $('playerName');
  const playerOffice = $('playerOffice');
  const playerEmail = $('playerEmail');

  const room1Step1Submit = $('room1-step1-submit');
  const room1Step2Submit = $('room1-step2-submit');
  const room2Step1Submit = $('room2-step1-submit');
  const room2Step2Submit = $('room2-step2-submit');
  const room3Submit = $('room3-submit');
  const room3UnlockSubmit = $('room3-unlock-submit');
  const room4Step1Submit = $('room4-step1-submit');
  const room4Step2Submit = $('room4-step2-submit');

  const r1code = $('r1code');
  const c1 = $('c1');
  const c2 = $('c2');
  const c3 = $('c3');
  const r2code = $('r2code');
  const r3decoded = $('r3decoded');
  const r3code = $('r3code');
  const r4a = $('r4a');
  const r4b = $('r4b');
  const r4hotline = $('r4hotline');

  // Timer tracking
  let startTime = null;
  let timerEnd = null;
  let timerFrame = null; // store requestAnimationFrame ID

  function showPage(name) {
    document.querySelectorAll('[data-page]').forEach(p => p.classList.add('hidden'));
    const page = document.querySelector(`[data-page="${name}"]`);
    if (page) page.classList.remove('hidden');
  }

  function incProgress() {
    completedSteps = Math.min(TOTAL_STEPS, completedSteps + 1);
    if(progressBar) progressBar.style.width = `${Math.round((completedSteps/TOTAL_STEPS)*100)}%`;
    if(progressText) progressText.textContent = `${completedSteps} / ${TOTAL_STEPS}`;
  }

  function showError(id, msg) {
    const el = $(id + '-error');
    if(!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
  }

  function stopTimer() {
    if(timerFrame) cancelAnimationFrame(timerFrame);
  }

  function failGame() {
    stopTimer(); // stop timer when failed
    showPage('fail');
    const failSection = document.querySelector('[data-page="fail"]');
    if(!failSection) return;
    failSection.innerHTML = `
      <h2 class="text-3xl font-bold text-rose-400 mb-3">TIME'S UP!</h2>
      <p class="text-slate-300 mb-6 text-lg">You failed to escape the room.</p>
      <button id="failClose" class="btn-primary w-48">Close</button>
    `;
    $('failClose')?.addEventListener('click', () => {
      window.open('', '_self');
      window.close();
    });
  }

  function startTimer() {
    if(timerEnd) return;
    startTime = Date.now();
    timerEnd = startTime + 15*60*1000; // 15 min

    const tick = () => {
      const remaining = Math.round((timerEnd - Date.now()) / 1000);
      if(remaining <= 0){
        if(timerEl) timerEl.textContent = "00:00";
        failGame();
        return;
      }
      const m = String(Math.floor(remaining/60)).padStart(2,'0');
      const s = String(remaining%60).padStart(2,'0');
      if(timerEl) timerEl.textContent = `${m}:${s}`;
      timerFrame = requestAnimationFrame(tick);
    };
    timerFrame = requestAnimationFrame(tick);
  }

  // Start button
  startBtn?.addEventListener('click', () => {
    const name = playerName?.value.trim() || '';
    const office = playerOffice?.value.trim() || '';
    const email = playerEmail?.value.trim() || '';
    if(!name || !office || !email){
      showError('start','Please complete all fields');
      return;
    }
    sessionStorage.setItem('playerName', name);
    sessionStorage.setItem('playerOffice', office);
    sessionStorage.setItem('playerEmail', email);
    showPage('room1-step1');
    startTimer();
  });

  // Room submissions
  room1Step1Submit?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="r1"]:checked')?.value || '';
    if(selected.toLowerCase() !== 'emotional abuse') { showError('room1-step1','Incorrect answer'); return; }
    incProgress(); showPage('room1-step2');
  });

  room1Step2Submit?.addEventListener('click', () => {
    if(r1code?.value.trim().toUpperCase() !== "EMOTION"){ showError('room1-step2','Incorrect code'); return; }
    incProgress(); showPage('room2-step1');
  });

  room2Step1Submit?.addEventListener('click', () => {
    if(
      c1?.value.trim().toLowerCase() !== 'cyberstalking' ||
      c2?.value.trim().toLowerCase() !== 'digital monitoring' ||
      c3?.value.trim().toLowerCase() !== 'revenge porn'
    ){ showError('room2-step1','Incorrect answers'); return; }
    incProgress(); showPage('room2-step2');
  });

  room2Step2Submit?.addEventListener('click', () => {
    if(r2code?.value.trim().toUpperCase() !== "ONLINE"){ showError('room2-step2','Incorrect platform'); return; }
    incProgress(); showPage('room3');
  });

  room3Submit?.addEventListener('click', () => {
    if(r3decoded?.value.trim().toUpperCase() !== "TAKES YOUR MONEY AWAY"){ showError('room3','Incorrect decoding'); return; }
    incProgress(); showPage('room3-unlock');
  });

  room3UnlockSubmit?.addEventListener('click', () => {
    if(r3code?.value.trim().toUpperCase() !== "CONTROL"){ showError('room3-unlock','Incorrect'); return; }
    incProgress(); showPage('room4-step1');
  });

  room4Step1Submit?.addEventListener('click', () => {
    const msg = r4a?.value.trim().toUpperCase() || '';
    const code = r4b?.value.trim() || '';
    if(msg !== "RESCUE US" && msg !== "RESCUEUS"){ showError('room4-step1','Incorrect acrostic'); return; }
    if(code !== "1343"){ showError('room4-step1','Incorrect code'); return; }
    incProgress(); showPage('room4-step2');
  });

  room4Step2Submit?.addEventListener('click', () => {
    if(r4hotline?.value.trim() !== "911"){ showError('room4-step2','Incorrect hotline'); return; }
    incProgress(); showPage('final');
  });

  // Google Sheets submission
  async function sendToGSheet(data){
    const url = "https://script.google.com/macros/s/AKfycbz3WhLuzawwXbBURvwFxIJKHi9E7naPg7qk2RBK2YVTadDCNgMOL2AP9KgGVwNRJHls/exec";
    try {
      await fetch(url,{
        method:"POST",
        mode:"no-cors",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type: "formSubmit", sheet: "PART II", ...data })
      });
    } catch(err){ console.warn("Google Sheets error:", err); }
  }

  finishBtn?.addEventListener('click', () => {
    stopTimer(); // Stop the timer when finishing
    const name = sessionStorage.getItem('playerName') || '';
    const office = sessionStorage.getItem('playerOffice') || '';
    const email = sessionStorage.getItem('playerEmail') || '';
    const reflectionText = $('reflection')?.value.trim() || '';

    // Calculate duration
    const endTime = Date.now();
    const durationSec = startTime ? Math.round((endTime - startTime)/1000) : 0;
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const durationText = `${minutes}m ${seconds}s`;

    // Send to Google Sheets
    sendToGSheet({
      name,
      office,
      email,
      reflection: reflectionText,
      duration: durationText,
      finishedAt: new Date().toLocaleString()
    });

    // Show enhanced congratulations page
    showPage('final');
    const finalPage = document.querySelector('[data-page="final"]');
    if(finalPage) finalPage.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl shadow-2xl animate__animated animate__fadeIn">
        <h2 class="text-6xl font-extrabold text-white mb-6 animate__pulse animate__infinite">CONGRATULATIONS!</h2>
        <p class="text-white text-2xl mb-4">You successfully completed Escape Room PART II!</p>
        <p class="text-white text-xl font-semibold mb-6">Time Taken: <span class="underline">${durationText}</span></p>
        <button id="finishClose" class="mt-6 px-10 py-4 text-lg font-bold rounded-xl shadow-lg bg-yellow-400 text-black hover:bg-yellow-300 transition">Close</button>
      </div>
    `;

    // Confetti continuously
    const confettiInterval = setInterval(() => {
      confetti({
        particleCount: 250,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1b9', '#f9bec7']
      });
    }, 500);

    $('finishClose')?.addEventListener('click', () => {
      clearInterval(confettiInterval); // stop confetti
      window.location.reload();
    });
  });

  // Intro modal
  const introModalBtn = $('closeModal');
  introModalBtn?.addEventListener('click', () => {
    const modal = $('introModal');
    if(modal) modal.classList.add('hidden');
    showPage('start');
  });

  showPage('start');
  if(progressBar) progressBar.style.width="0%";
  if(progressText) progressText.textContent="0 / 8";

});
