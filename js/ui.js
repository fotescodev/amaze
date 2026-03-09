/**
 * UI Controller
 * Handles DOM events, input, microphone, word-level character display,
 * emotion-driven Rocky states, and mobile layout.
 */

import { ensureAudioReady, translateText, getAnalyser } from './audio-engine.js';
import { LEXICON_MAP } from './lexicon.js';
import { setTranslating } from './rocky.js';
import { startVisualization, stopVisualization } from './visualizer.js';

let translateBtn, inputText, micBtn, statusText, charDisplay;
let isPlaying = false;
let cancelFn = null;
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

  // Cancel any previous playback
  if (cancelFn) {
    cancelFn();
    cancelFn = null;
  }

  isPlaying = true;
  translateBtn.disabled = true;
  translateBtn.querySelector('.btn-text').textContent = 'Translating...';

  try {
    await ensureAudioReady();

    // Translate using full lexicon engine
    const result = translateText(text);
    const { totalDuration, wordTimings, resolvedWords, emotion, startTime, cancel } = result;
    cancelFn = cancel;

    // Build word-level display
    buildWordDisplay(wordTimings);

    // Start visualizer and Rocky animation with emotion intensity
    startVisualization();
    const intensity = emotion.intensity === 'emphatic' ? 1.5 : 1.0;
    setTranslating(true, intensity);

    // Count known vs fallback words
    const knownCount = resolvedWords.filter(r => r && r.type === 'lexicon').length;
    const totalWords = wordTimings.length;
    statusText.textContent = `Translating ${totalWords} words (${knownCount} in lexicon)...`;

    // Animate word highlights in sync with audio
    animateWordHighlights(wordTimings, startTime);

    // Wait for playback to complete
    setTimeout(() => {
      isPlaying = false;
      cancelFn = null;
      translateBtn.disabled = false;
      translateBtn.querySelector('.btn-text').textContent = 'Translate';
      setTranslating(false);
      stopVisualization();

      const emotionLabel = emotion.state !== 'neutral' ? ` — ${emotion.state}` : '';
      statusText.textContent = `Translation complete — ${totalWords} chords played${emotionLabel}`;

      // Mark all words as played
      const words = charDisplay.querySelectorAll('.word-chip');
      words.forEach(w => {
        w.classList.remove('active');
        w.classList.add('played');
      });
    }, totalDuration * 1000 + 100);

  } catch (err) {
    console.error('Translation error:', err);
    isPlaying = false;
    cancelFn = null;
    translateBtn.disabled = false;
    translateBtn.querySelector('.btn-text').textContent = 'Translate';
    setTranslating(false);
    statusText.textContent = 'Error — click to retry';
  }
}

/**
 * Build word-level display showing each word with its glyph and source.
 */
function buildWordDisplay(wordTimings) {
  charDisplay.innerHTML = '';

  for (let i = 0; i < wordTimings.length; i++) {
    const { word, resolved } = wordTimings[i];
    if (!word) continue;

    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.dataset.index = i;

    const wordLabel = document.createElement('span');
    wordLabel.className = 'word-label';
    wordLabel.textContent = word;

    const glyphLabel = document.createElement('span');
    glyphLabel.className = 'word-glyph';

    if (resolved) {
      const isLexicon = resolved.type === 'lexicon';
      glyphLabel.textContent = resolved.glyph || '';
      chip.classList.add(isLexicon ? 'lexicon-word' : 'fallback-word');
      if (resolved.entry) {
        chip.title = resolved.gloss || '';
      }
    } else {
      glyphLabel.textContent = '?';
      chip.classList.add('unknown-word');
    }

    chip.appendChild(wordLabel);
    chip.appendChild(glyphLabel);
    charDisplay.appendChild(chip);
  }
}

/**
 * Animate word highlights in sync with audio playback.
 */
function animateWordHighlights(wordTimings, audioStartTime) {
  const chips = charDisplay.querySelectorAll('.word-chip');

  for (let i = 0; i < wordTimings.length; i++) {
    const { time, duration } = wordTimings[i];
    const delay = (time - audioStartTime) * 1000;

    // Highlight on start
    setTimeout(() => {
      // Deactivate previous
      if (i > 0) {
        chips[i - 1]?.classList.remove('active');
        chips[i - 1]?.classList.add('played');
      }
      // Activate current
      if (chips[i]) {
        chips[i].classList.add('active');
        chips[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
