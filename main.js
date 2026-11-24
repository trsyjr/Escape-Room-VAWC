import {
  loadQuestionnaire,
  indexSteps,
  getStep,
  checkFields,
} from './quiz.js';

const DATA = await loadQuestionnaire('./questionnaire.json');
const PART = DATA.parts.part2;
const STEPS = indexSteps(PART);
const step = (id) => getStep(STEPS, id);

const TOTAL_STEPS = PART.totalSteps;
const $ = (id) => document.getElementById(id);

let completedSteps = 0;

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

// Timer tracking
let startTime = null;
let timerEnd = null;
let timerFrame = null;

function showPage(name) {
  document.querySelectorAll('[data-page]').forEach((page) => page.classList.add('hidden'));
  const page = document.querySelector(`[data-page="${name}"]`);
  if (page) page.classList.remove('hidden');
}

function incProgress() {
  completedSteps = Math.min(TOTAL_STEPS, completedSteps + 1);
  if (progressBar) progressBar.style.width = `${Math.round((completedSteps / TOTAL_STEPS) * 100)}%`;
  if (progressText) progressText.textContent = `${completedSteps} / ${TOTAL_STEPS}`;
}

function showError(id, message) {
  const el = $(id + '-error');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function stopTimer() {
  if (timerFrame) cancelAnimationFrame(timerFrame);
}

function failGame() {
  stopTimer();
  showPage('fail');
  const failSection = document.querySelector('[data-page="fail"]');
  if (!failSection) return;
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
  if (timerEnd) return;
  startTime = Date.now();
  timerEnd = startTime + PART.timeLimitSeconds * 1000;

  const tick = () => {
    const remaining = Math.round((timerEnd - Date.now()) / 1000);
    if (remaining <= 0) {
      if (timerEl) timerEl.textContent = '00:00';
      failGame();
      return;
    }
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
    timerFrame = requestAnimationFrame(tick);
  };
  timerFrame = requestAnimationFrame(tick);
}

// Start button
startBtn?.addEventListener('click', () => {
  const name = playerName?.value.trim() || '';
  const office = playerOffice?.value.trim() || '';
  const email = playerEmail?.value.trim() || '';
  if (!name || !office || !email) {
    showError('start', 'Please complete all fields');
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
  if (!checkFields(step('room1-step1'), (id) => $(id)?.value)) {
    showError('room1-step1', 'Incorrect answer');
    return;
  }
  incProgress();
  showPage('room1-step2');
});

room1Step2Submit?.addEventListener('click', () => {
  if (!checkFields(step('room1-step2'), (id) => $(id)?.value)) {
    showError('room1-step2', 'Incorrect code');
    return;
  }
  incProgress();
  showPage('room2-step1');
});

room2Step1Submit?.addEventListener('click', () => {
  if (!checkFields(step('room2-step1'), (id) => $(id)?.value)) {
    showError('room2-step1', 'Incorrect answers');
    return;
  }
  incProgress();
  showPage('room2-step2');
});

room2Step2Submit?.addEventListener('click', () => {
  if (!checkFields(step('room2-step2'), (id) => $(id)?.value)) {
    showError('room2-step2', 'Incorrect platform');
    return;
  }
  incProgress();
  showPage('room3');
});

room3Submit?.addEventListener('click', () => {
  if (!checkFields(step('room3'), (id) => $(id)?.value)) {
    showError('room3', 'Incorrect decoding');
    return;
  }
  incProgress();
  showPage('room3-unlock');
});

room3UnlockSubmit?.addEventListener('click', () => {
  if (!checkFields(step('room3-unlock'), (id) => $(id)?.value)) {
    showError('room3-unlock', 'Incorrect');
    return;
  }
  incProgress();
  showPage('room4-step1');
});

room4Step1Submit?.addEventListener('click', () => {
  if (!checkFields(step('room4-step1'), (id) => $(id)?.value)) {
    showError('room4-step1', 'Incorrect acrostic or code');
    return;
  }
  incProgress();
  showPage('room4-step2');
});

room4Step2Submit?.addEventListener('click', () => {
  if (!checkFields(step('room4-step2'), (id) => $(id)?.value)) {
    showError('room4-step2', 'Incorrect hotline');
    return;
  }
  incProgress();
  showPage('final');
});

// Google Sheets submission
async function sendToGSheet(data) {
  const url = 'https://script.google.com/macros/s/AKfycbz3WhLuzawwXbBURvwFxIJKHi9E7naPg7qk2RBK2YVTadDCNgMOL2AP9KgGVwNRJHls/exec';
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'formSubmit', sheet: 'PART II', ...data }),
    });
  } catch (err) {
    console.warn('Google Sheets error:', err);
  }
}

finishBtn?.addEventListener('click', () => {
  stopTimer();
  const name = sessionStorage.getItem('playerName') || '';
  const office = sessionStorage.getItem('playerOffice') || '';
  const email = sessionStorage.getItem('playerEmail') || '';
  const reflectionText = $('reflection')?.value.trim() || '';

  const endTime = Date.now();
  const durationSec = startTime ? Math.round((endTime - startTime) / 1000) : 0;
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const durationText = `${minutes}m ${seconds}s`;

  sendToGSheet({
    name,
    office,
    email,
    reflection: reflectionText,
    duration: durationText,
    finishedAt: new Date().toLocaleString(),
  });

  showPage('final');
  const finalPage = document.querySelector('[data-page="final"]');
  if (finalPage) {
    finalPage.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center p-6 md:p-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl shadow-2xl animate__animated animate__fadeIn max-w-3xl mx-auto">
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate__pulse animate__infinite">CONGRATULATIONS!</h2>
        <p class="text-white text-lg md:text-2xl mb-4">You successfully completed Escape Room PART II!</p>
        <p class="text-white text-base md:text-xl font-semibold mb-6">Time Taken: <span class="underline">${durationText}</span></p>
        <button id="finishClose" class="mt-4 md:mt-6 px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-bold rounded-xl shadow-lg bg-yellow-400 text-black hover:bg-yellow-300 transition">Close</button>
      </div>
    `;
  }

  const confettiInterval = setInterval(() => {
    confetti({
      particleCount: 250,
      spread: 160,
      origin: { y: 0.6 },
      colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1b9', '#f9bec7'],
    });
  }, 500);

  $('finishClose')?.addEventListener('click', () => {
    clearInterval(confettiInterval);
    window.location.reload();
  });
});

// Intro modal
$('closeModal')?.addEventListener('click', () => {
  $('introModal')?.classList.add('hidden');
  showPage('start');
});

showPage('start');
if (progressBar) progressBar.style.width = '0%';
if (progressText) progressText.textContent = `0 / ${TOTAL_STEPS}`;
