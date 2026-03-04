/**
 * Eridian Chord Audio Engine
 *
 * Renders Rocky's speech as simultaneous sine-wave chords via Web Audio API.
 *
 * Design (from PRD §6.2):
 *   - 1–5 OscillatorNodes per chord, all type: "sine"
 *   - ADSR envelope: Attack 40ms, Decay 80ms, Sustain 70%, Release 200ms
 *   - Per-oscillator gain normalized by chord density
 *   - 150ms gap between words
 *   - AudioContext created on first user interaction (autoplay policy)
 */

import type { ChordSyllable } from "@/data/lexicon";

// ADSR timing constants (seconds)
const ATTACK = 0.04;
const DECAY = 0.08;
const SUSTAIN_LEVEL = 0.7;
const SUSTAIN_DURATION = 0.25;
const RELEASE = 0.2;

const CHORD_DURATION = ATTACK + DECAY + SUSTAIN_DURATION + RELEASE; // ~0.57s
const SYLLABLE_GAP = 0.08; // 80ms between syllables of a multi-syllable word
const WORD_GAP = 0.15; // 150ms between words

const MASTER_GAIN = 0.35;

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play a single chord (one syllable).
 * Returns the end time of the chord for scheduling the next one.
 */
function scheduleChord(
  ctx: AudioContext,
  destination: AudioNode,
  tones: number[],
  startTime: number,
  octaveShift: boolean = false
): number {
  const count = tones.length;
  const perOscGain = MASTER_GAIN / Math.sqrt(count); // normalize loudness

  for (const baseHz of tones) {
    const hz = octaveShift ? baseHz * 2 : baseHz;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(hz, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);

    // Attack
    gain.gain.linearRampToValueAtTime(perOscGain, startTime + ATTACK);
    // Decay
    gain.gain.linearRampToValueAtTime(
      perOscGain * SUSTAIN_LEVEL,
      startTime + ATTACK + DECAY
    );
    // Sustain (hold)
    gain.gain.setValueAtTime(
      perOscGain * SUSTAIN_LEVEL,
      startTime + ATTACK + DECAY + SUSTAIN_DURATION
    );
    // Release
    gain.gain.linearRampToValueAtTime(
      0,
      startTime + CHORD_DURATION
    );

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + CHORD_DURATION + 0.01);
  }

  return startTime + CHORD_DURATION;
}

export interface PlayableWord {
  syllables: ChordSyllable[];
}

/**
 * Play a single word (one or more syllables).
 * Returns the end time.
 */
export function playWord(
  word: PlayableWord,
  octaveShift: boolean = false,
  startTime?: number
): { endTime: number; analyser: AnalyserNode } {
  const ctx = getAudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.connect(ctx.destination);

  let t = startTime ?? ctx.currentTime + 0.05;

  for (let i = 0; i < word.syllables.length; i++) {
    t = scheduleChord(ctx, analyser, word.syllables[i].tones, t, octaveShift);
    if (i < word.syllables.length - 1) {
      t += SYLLABLE_GAP;
    }
  }

  return { endTime: t, analyser };
}

/**
 * Play a sequence of words (a full Rocky response).
 * Returns a promise that resolves when playback completes.
 * The onWordStart callback fires for each word index.
 */
export function playSequence(
  words: PlayableWord[],
  octaveShift: boolean = false,
  onWordStart?: (index: number) => void
): { promise: Promise<void>; cancel: () => void } {
  const ctx = getAudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.connect(ctx.destination);

  let cancelled = false;
  let t = ctx.currentTime + 0.05;
  const wordTimes: number[] = [];

  for (let w = 0; w < words.length; w++) {
    wordTimes.push(t);
    const word = words[w];
    for (let s = 0; s < word.syllables.length; s++) {
      t = scheduleChord(ctx, analyser, word.syllables[s].tones, t, octaveShift);
      if (s < word.syllables.length - 1) {
        t += SYLLABLE_GAP;
      }
    }
    if (w < words.length - 1) {
      t += WORD_GAP;
    }
  }

  const totalDuration = t - ctx.currentTime;

  const promise = new Promise<void>((resolve) => {
    if (onWordStart) {
      // Schedule callbacks for word highlights
      for (let i = 0; i < wordTimes.length; i++) {
        const delay = (wordTimes[i] - ctx.currentTime) * 1000;
        setTimeout(() => {
          if (!cancelled) onWordStart(i);
        }, Math.max(0, delay));
      }
    }

    setTimeout(() => {
      if (!cancelled) resolve();
    }, totalDuration * 1000 + 50);
  });

  const cancel = () => {
    cancelled = true;
  };

  return { promise, cancel };
}

/**
 * Get waveform data from an analyser node for visualization.
 */
export function getWaveformData(analyser: AnalyserNode): Float32Array {
  const data = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatTimeDomainData(data);
  return data;
}

export { CHORD_DURATION, WORD_GAP };
