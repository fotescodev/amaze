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
  return audioContext;
}

/**
 * Ensure AudioContext is running. Must be called (and awaited) inside
 * a user-gesture handler on iOS/Safari — otherwise audio stays silent.
 */
export async function ensureAudioReady(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

/**
 * Play a single chord (one syllable).
 * Returns the end time and all created oscillators for cancel tracking.
 */
function scheduleChord(
  ctx: AudioContext,
  destination: AudioNode,
  tones: number[],
  startTime: number,
  octaveShift: boolean = false
): { endTime: number; oscillators: OscillatorNode[] } {
  const count = tones.length;
  const perOscGain = MASTER_GAIN / Math.sqrt(count); // normalize loudness
  const oscillators: OscillatorNode[] = [];

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
    oscillators.push(osc);
  }

  return { endTime: startTime + CHORD_DURATION, oscillators };
}

export interface PlayableWord {
  syllables: ChordSyllable[];
}

export interface PlaySequenceOptions {
  octaveShift?: boolean;
  onWordStart?: (index: number) => void;
  destination?: AudioNode;
}

/**
 * Play a single word (one or more syllables).
 * Accepts an optional external destination AudioNode.
 * Returns the end time and analyser (only created if no external destination).
 */
export function playWord(
  word: PlayableWord,
  octaveShift: boolean = false,
  startTime?: number,
  destination?: AudioNode
): { endTime: number; analyser: AnalyserNode | null } {
  const ctx = getAudioContext();

  let dest: AudioNode;
  let analyser: AnalyserNode | null = null;

  if (destination) {
    dest = destination;
  } else {
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(ctx.destination);
    dest = analyser;
  }

  let t = startTime ?? ctx.currentTime + 0.05;

  for (let i = 0; i < word.syllables.length; i++) {
    const { endTime } = scheduleChord(ctx, dest, word.syllables[i].tones, t, octaveShift);
    t = endTime;
    if (i < word.syllables.length - 1) {
      t += SYLLABLE_GAP;
    }
  }

  return { endTime: t, analyser };
}

/**
 * Play a sequence of words (a full Rocky response).
 * Returns a promise that resolves when playback completes.
 *
 * Options:
 *   - octaveShift: double all frequencies (emphatic mode)
 *   - onWordStart: callback fired for each word index during playback
 *   - destination: external AudioNode to route audio through (e.g., shared AnalyserNode)
 */
export function playSequence(
  words: PlayableWord[],
  options: PlaySequenceOptions = {}
): { promise: Promise<void>; cancel: () => void } {
  const { octaveShift = false, onWordStart, destination } = options;
  const ctx = getAudioContext();

  let dest: AudioNode;
  if (destination) {
    dest = destination;
  } else {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(ctx.destination);
    dest = analyser;
  }

  let cancelled = false;
  const allOscillators: OscillatorNode[] = [];
  let t = ctx.currentTime + 0.05;
  const wordTimes: number[] = [];

  for (let w = 0; w < words.length; w++) {
    wordTimes.push(t);
    const word = words[w];
    for (let s = 0; s < word.syllables.length; s++) {
      const { endTime, oscillators } = scheduleChord(
        ctx, dest, word.syllables[s].tones, t, octaveShift
      );
      allOscillators.push(...oscillators);
      t = endTime;
      if (s < word.syllables.length - 1) {
        t += SYLLABLE_GAP;
      }
    }
    if (w < words.length - 1) {
      t += WORD_GAP;
    }
  }

  const totalDuration = t - ctx.currentTime;
  const timeoutIds: ReturnType<typeof setTimeout>[] = [];

  const promise = new Promise<void>((resolve) => {
    if (onWordStart) {
      for (let i = 0; i < wordTimes.length; i++) {
        const delay = (wordTimes[i] - ctx.currentTime) * 1000;
        const id = setTimeout(() => {
          if (!cancelled) onWordStart(i);
        }, Math.max(0, delay));
        timeoutIds.push(id);
      }
    }

    const endId = setTimeout(() => {
      resolve();
    }, totalDuration * 1000 + 50);
    timeoutIds.push(endId);
  });

  const cancel = () => {
    cancelled = true;
    // Clear all scheduled timeouts
    for (const id of timeoutIds) clearTimeout(id);
    // Fade out oscillators over 200ms instead of jarring cutoff
    const stopTime = ctx.currentTime + RELEASE;
    for (const osc of allOscillators) {
      try { osc.stop(stopTime); } catch { /* already stopped */ }
    }
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
