/**
 * Eridian Translation Engine (Web Audio API)
 * Translates English text characters into polyphonic musical chords.
 */

// Exact frequency mapping: English letter → base Hz
const eridianDictionary = {
  "a": 261.63, "b": 277.18, "c": 293.66, "d": 311.13,
  "e": 329.63, "f": 349.23, "g": 369.99, "h": 392.00,
  "i": 415.30, "j": 440.00, "k": 466.16, "l": 493.88,
  "m": 523.25, "n": 554.37, "o": 587.33, "p": 622.25,
  "q": 659.25, "r": 698.46, "s": 739.99, "t": 783.99,
  "u": 830.61, "v": 880.00, "w": 932.33, "x": 987.77,
  "y": 1046.50, "z": 1108.73
};

// ADSR timing constants (seconds)
const ATTACK = 0.04;
const DECAY = 0.06;
const SUSTAIN_LEVEL = 0.6;
const SUSTAIN_DURATION = 0.08;
const RELEASE = 0.12;
const CHORD_DURATION = ATTACK + DECAY + SUSTAIN_DURATION + RELEASE; // ~0.30s

const SPACE_DELAY = 0.2;       // 200ms pause for spaces
const PUNCTUATION_DELAY = 0.4; // 400ms pause for punctuation
const MASTER_GAIN = 0.25;

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
  getAudioContext(); // ensure created
  return analyserNode;
}

/**
 * Play a single Eridian chord for one character.
 * Spawns 3 OscillatorNodes: Root, Root * 1.25, Root * 1.5 (triad).
 */
function playEridianChord(baseFreq, ctx, startTime) {
  const triad = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
  const perOscGain = MASTER_GAIN / Math.sqrt(triad.length);

  for (const freq of triad) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime); // small initial value to avoid log issues

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
    osc.stop(startTime + CHORD_DURATION + 0.02);
  }
}

/**
 * Translate and play an entire text string as Eridian chords.
 * Returns { totalDuration, charTimings[], cancel() }.
 */
export function translateText(text) {
  const ctx = getAudioContext();
  const chars = text.toLowerCase().split('');
  let offset = ctx.currentTime + 0.05;

  const charTimings = []; // { char, time, isChord }

  for (const char of chars) {
    const freq = eridianDictionary[char];

    if (freq) {
      // Mapped character → play chord
      playEridianChord(freq, ctx, offset);
      charTimings.push({ char, time: offset, isChord: true });
      offset += CHORD_DURATION + 0.02; // small gap between chords
    } else if (char === ' ') {
      // Space → short silence
      charTimings.push({ char: ' ', time: offset, isChord: false });
      offset += SPACE_DELAY;
    } else {
      // Punctuation or unmapped → longer silence
      charTimings.push({ char, time: offset, isChord: false });
      offset += PUNCTUATION_DELAY;
    }
  }

  const totalDuration = offset - ctx.currentTime;

  return {
    totalDuration,
    charTimings,
    startTime: ctx.currentTime
  };
}

/**
 * Get the character-to-frequency dictionary (for UI display).
 */
export function getDictionary() {
  return { ...eridianDictionary };
}

export { CHORD_DURATION };
