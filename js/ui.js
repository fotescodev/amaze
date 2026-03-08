/**
 * UI Controller
 * Handles DOM events, input, microphone, character display, and mobile layout.
 */

import { ensureAudioReady, translateText, getAnalyser, getDictionary } from './audio-engine.js';
import { setTranslating } from './rocky.js';
import { startVisualization, stopVisualization } from './visualizer.js';

let translateBtn, inputText, micBtn, statusText, charDisplay;
let isPlaying = false;
let recognition = null;

export function initUI() {
  translateBtn = document.getElementById('translate-btn');
  inputText = document.getElementById('input-text');
  micBtn = document.getElementById('mic-btn');
  statusText = document.getElementById('status-text');
  charDisplay = document.getElementById('char-display');

  // Translate button
  translateBtn.addEventListener('click', handleTranslate);

  // Enter key to translate (Ctrl/Cmd+Enter)
  inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  });

  // Microphone
  micBtn.addEventListener('click', handleMicrophone);

  // Initialize speech recognition if available
  initSpeechRecognition();
}

async function handleTranslate() {
  const text = inputText.value.trim();
  if (!text || isPlaying) return;

  isPlaying = true;
  translateBtn.disabled = true;
  translateBtn.querySelector('.btn-text').textContent = 'Translating...';

  try {
    await ensureAudioReady();

    // Build character display
    buildCharDisplay(text);

    // Start translation
    const { totalDuration, charTimings, startTime } = translateText(text);

    // Start visualizer and Rocky animation
    startVisualization();
    setTranslating(true, 1.0);

    statusText.textContent = `Translating ${text.length} characters...`;

    // Animate character highlights in sync with audio
    const analyser = getAnalyser();
    animateCharHighlights(charTimings, startTime);

    // Wait for playback to complete
    setTimeout(() => {
      isPlaying = false;
      translateBtn.disabled = false;
      translateBtn.querySelector('.btn-text').textContent = 'Translate';
      setTranslating(false);
      stopVisualization();
      statusText.textContent = `Translation complete — ${text.length} chords played`;

      // Mark all chars as played
      const chars = charDisplay.querySelectorAll('.char');
      chars.forEach(c => {
        c.classList.remove('active');
        c.classList.add('played');
      });
    }, totalDuration * 1000 + 100);

  } catch (err) {
    console.error('Translation error:', err);
    isPlaying = false;
    translateBtn.disabled = false;
    translateBtn.querySelector('.btn-text').textContent = 'Translate';
    setTranslating(false);
    statusText.textContent = 'Error — click to retry';
  }
}

function buildCharDisplay(text) {
  charDisplay.innerHTML = '';
  const lowerText = text.toLowerCase();

  for (let i = 0; i < lowerText.length; i++) {
    const span = document.createElement('span');
    const char = lowerText[i];

    if (char === ' ') {
      span.className = 'char space';
    } else {
      span.className = 'char';
      span.textContent = char;
    }
    span.dataset.index = i;
    charDisplay.appendChild(span);
  }
}

function animateCharHighlights(charTimings, audioStartTime) {
  const chars = charDisplay.querySelectorAll('.char');
  const analyser = getAnalyser();

  for (let i = 0; i < charTimings.length; i++) {
    const { time, isChord } = charTimings[i];
    const delay = (time - audioStartTime) * 1000;

    setTimeout(() => {
      // Remove active from previous
      if (i > 0) {
        chars[i - 1]?.classList.remove('active');
        chars[i - 1]?.classList.add('played');
      }
      // Highlight current
      if (chars[i]) {
        chars[i].classList.add('active');
        chars[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, Math.max(0, delay));
  }
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.title = 'Speech recognition not supported in this browser';
    micBtn.style.opacity = '0.3';
    micBtn.style.cursor = 'not-allowed';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    inputText.value = transcript;
  };

  recognition.onend = () => {
    micBtn.classList.remove('recording');
    statusText.textContent = 'Speech captured — click Translate';
  };

  recognition.onerror = (event) => {
    micBtn.classList.remove('recording');
    statusText.textContent = `Mic error: ${event.error}`;
  };
}

function handleMicrophone() {
  if (!recognition) return;

  if (micBtn.classList.contains('recording')) {
    recognition.stop();
    micBtn.classList.remove('recording');
  } else {
    recognition.start();
    micBtn.classList.add('recording');
    statusText.textContent = 'Listening...';
  }
}
