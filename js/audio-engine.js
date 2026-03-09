/**
 * Eridian Chord Audio Engine
 *
 * Renders Eridian speech as simultaneous sine-wave chords via Web Audio API.
 * Supports the full lexicon with multi-syllable words, word-level playback,
 * emotion detection, cancellation, and character-level fallback.
 *
 * Design (from PRD §6.2):
 *   - 1–5 OscillatorNodes per chord, all type: "sine"
 *   - ADSR envelope: Attack 40ms, Decay 80ms, Sustain 70%, Release 200ms
 *   - Per-oscillator gain normalized by chord density
 *   - 80ms gap between syllables, 150ms gap between words
 *   - AudioContext created on first user interaction (autoplay policy)
 */

import { LEXICON_MAP, QUESTION_PARTICLE } from './lexicon.js';

// ADSR timing constants (seconds)
const ATTACK = 0.04;
const DECAY = 0.08;
const SUSTAIN_LEVEL = 0.7;
const SUSTAIN_DURATION = 0.25;
const RELEASE = 0.2;

const CHORD_DURATION = ATTACK + DECAY + SUSTAIN_DURATION + RELEASE; // ~0.57s
const SYLLABLE_GAP = 0.08;  // 80ms between syllables of a multi-syllable word
const WORD_GAP = 0.15;      // 150ms between words
const MASTER_GAIN = 0.35;

// Fallback: single-character frequency mapping for unknown words
const CHAR_FREQUENCIES = {
  "a": 261.63, "b": 277.18, "c": 293.66, "d": 311.13,
  "e": 329.63, "f": 349.23, "g": 369.99, "h": 392.00,
  "i": 415.30, "j": 440.00, "k": 466.16, "l": 493.88,
  "m": 523.25, "n": 554.37, "o": 587.33, "p": 622.25,
  "q": 659.25, "r": 698.46, "s": 739.99, "t": 783.99,
  "u": 830.61, "v": 880.00, "w": 932.33, "x": 987.77,
  "y": 1046.50, "z": 1108.73
};

let audioContext = null;
let analyserNode = null;
let masterGain = null;

/**
 * Lazily create and return the AudioContext.
 */
export function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();

    // Create shared analyser
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.85;

    // Master gain → analyser → destination
    masterGain = audioContext.createGain();
    masterGain.gain.value = MASTER_GAIN;
    masterGain.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
  }
  return audioContext;
}

/**
 * Resume AudioContext on user gesture (required by autoplay policy).
 */
export async function ensureAudioReady() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

/**
 * Get the shared AnalyserNode for visualization.
 */
export function getAnalyser() {
  getAudioContext();
  return analyserNode;
}

/**
 * Schedule a single chord (one syllable) with ADSR envelope.
 * Returns the end time and oscillator references.
 */
function scheduleChord(ctx, tones, startTime, octaveShift = false) {
  const count = tones.length;
  const perOscGain = MASTER_GAIN / Math.sqrt(count);
  const oscillators = [];

  for (const baseHz of tones) {
    const hz = octaveShift ? baseHz * 2 : baseHz;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);

    // Attack
    gain.gain.linearRampToValueAtTime(perOscGain, startTime + ATTACK);
    // Decay → sustain level
    gain.gain.linearRampToValueAtTime(
      perOscGain * SUSTAIN_LEVEL,
      startTime + ATTACK + DECAY
    );
    // Hold sustain
    gain.gain.setValueAtTime(
      perOscGain * SUSTAIN_LEVEL,
      startTime + ATTACK + DECAY + SUSTAIN_DURATION
    );
    // Release
    gain.gain.linearRampToValueAtTime(0.0001, startTime + CHORD_DURATION);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + CHORD_DURATION + 0.01);
    oscillators.push(osc);
  }

  return { endTime: startTime + CHORD_DURATION, oscillators };
}

/**
 * Tokenize input text into words, handling punctuation.
 * Returns array of { word, isQuestion, isPunctuation }.
 */
function tokenize(text) {
  const tokens = [];
  // Split on whitespace, keeping punctuation attached
  const raw = text.trim().toLowerCase().split(/\s+/);

  for (const token of raw) {
    if (!token) continue;

    // Strip trailing punctuation
    const match = token.match(/^([a-z'-]+)([^a-z]*)$/);
    if (match) {
      tokens.push({ word: match[1], punctuation: match[2] || '' });
    } else {
      // Pure punctuation or symbols
      tokens.push({ word: '', punctuation: token });
    }
  }
  return tokens;
}

/**
 * Resolve a word to its playable chord data.
 * Uses lexicon for known words, falls back to character-level synthesis.
 */
function resolveWord(word) {
  // Check lexicon first
  const entry = LEXICON_MAP.get(word);
  if (entry) {
    return {
      type: 'lexicon',
      entry,
      syllables: entry.syllables,
      intervalType: entry.intervalType,
      glyph: entry.glyph,
      gloss: entry.gloss,
    };
  }

  // Fallback: blend unique character frequencies into a single chord (max 5 voices)
  const freqs = [];
  const seen = new Set();
  for (const char of word) {
    const freq = CHAR_FREQUENCIES[char];
    if (freq && !seen.has(freq)) {
      seen.add(freq);
      freqs.push(freq);
    }
  }

  if (freqs.length === 0) return null;

  // Sort and cap at 5 voices (Eridian constraint)
  freqs.sort((a, b) => a - b);
  const tones = freqs.slice(0, 5);

  return {
    type: 'fallback',
    entry: null,
    syllables: [{ tones }],
    intervalType: 'open',
    glyph: '◉'.repeat(tones.length),
    gloss: `Synthesized ${tones.length}-tone chord for "${word}"`,
  };
}

/**
 * Detect emotion from resolved chord data.
 * Algorithm: count interval types, plurality wins.
 * consonant → joyful, dissonant → distressed, open → neutral
 * Tripled words → emphatic intensity.
 */
export function detectEmotion(resolvedWords) {
  let consonant = 0, dissonant = 0, open = 0;

  for (const rw of resolvedWords) {
    if (!rw) continue;
    switch (rw.intervalType) {
      case 'consonant': consonant++; break;
      case 'dissonant': dissonant++; break;
      case 'open': open++; break;
    }
  }

  let state = 'neutral';
  if (consonant >= dissonant && consonant >= open && consonant > 0) {
    state = 'joyful';
  } else if (dissonant > consonant && dissonant > open) {
    state = 'distressed';
  }

  return { state, intensity: 'normal' };
}

/**
 * Translate and play an entire text string as Eridian chords.
 * Uses lexicon for known words, character fallback for unknowns.
 *
 * Returns { totalDuration, wordTimings[], resolvedWords[], emotion, cancel() }.
 */
export function translateText(text) {
  const ctx = getAudioContext();
  const tokens = tokenize(text);
  const isQuestion = text.trim().endsWith('?');

  let offset = ctx.currentTime + 0.05;
  const wordTimings = [];
  const resolvedWords = [];
  const allOscillators = [];

  for (let i = 0; i < tokens.length; i++) {
    const { word, punctuation } = tokens[i];

    if (!word) {
      // Pure punctuation — add a pause
      offset += 0.3;
      continue;
    }

    const resolved = resolveWord(word);
    resolvedWords.push(resolved);

    if (!resolved) {
      // Unresolvable word — skip with short pause
      wordTimings.push({ word, time: offset, duration: 0.1, resolved: null });
      offset += 0.15;
      continue;
    }

    const wordStart = offset;

    // Play each syllable
    for (let s = 0; s < resolved.syllables.length; s++) {
      const { endTime, oscillators } = scheduleChord(
        ctx, resolved.syllables[s].tones, offset
      );
      allOscillators.push(...oscillators);
      offset = endTime;

      // Gap between syllables (not after last)
      if (s < resolved.syllables.length - 1) {
        offset += SYLLABLE_GAP;
      }
    }

    const wordDuration = offset - wordStart;
    wordTimings.push({ word, time: wordStart, duration: wordDuration, resolved });

    // Punctuation pauses
    if (punctuation.includes('.') || punctuation.includes('!')) {
      offset += 0.3;
    } else if (punctuation.includes(',') || punctuation.includes(';')) {
      offset += 0.2;
    }

    // Word gap (not after last)
    if (i < tokens.length - 1) {
      offset += WORD_GAP;
    }
  }

  // Append question particle if applicable
  if (isQuestion) {
    offset += SYLLABLE_GAP;
    const { endTime, oscillators } = scheduleChord(
      ctx, QUESTION_PARTICLE.syllables[0].tones, offset
    );
    allOscillators.push(...oscillators);
    wordTimings.push({
      word: '?',
      time: offset,
      duration: endTime - offset,
      resolved: { type: 'lexicon', entry: QUESTION_PARTICLE, intervalType: 'consonant' }
    });
    offset = endTime;
  }

  const totalDuration = offset - ctx.currentTime;
  const emotion = detectEmotion(resolvedWords);

  // Check for tripled words → emphatic
  const TRIPLED_RE = /\b(\w+)\s+\1\s+\1\b/i;
  if (TRIPLED_RE.test(text)) {
    emotion.intensity = 'emphatic';
  }

  // Check for question → curious
  if (isQuestion) {
    emotion.state = 'curious';
  }

  // Cancel function — gracefully fade out all oscillators
  const cancel = () => {
    const stopTime = ctx.currentTime + RELEASE;
    for (const osc of allOscillators) {
      try { osc.stop(stopTime); } catch { /* already stopped */ }
    }
  };

  return {
    totalDuration,
    wordTimings,
    resolvedWords,
    emotion,
    startTime: ctx.currentTime,
    cancel,
  };
}

export { CHORD_DURATION, WORD_GAP, LEXICON_MAP };
