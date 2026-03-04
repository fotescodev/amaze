/**
 * Emotion Detection for Rocky's Responses
 *
 * Derives Rocky's emotional state from chord interval_type ratios (primary)
 * and keyword analysis (secondary fallback).
 *
 * (see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)
 */

import type { RockyResponse } from "./rocky-persona";

export type EmotionState =
  | "neutral"
  | "joyful"
  | "distressed"
  | "curious"
  | "thinking";

export type EmotionIntensity = "normal" | "emphatic";

export interface EmotionResult {
  state: EmotionState;
  intensity: EmotionIntensity;
}

// Tripled word detector: matches "word word word" (case-insensitive)
const TRIPLED_WORD_RE = /\b(\w+)\s+\1\s+\1\b/i;

/**
 * Detect Rocky's emotional state from a response.
 *
 * Algorithm:
 * 1. Check if response ends with question → curious (overrides all)
 * 2. Count chord interval_type ratios → plurality wins
 * 3. Ties broken: consonant > open > dissonant (optimistic default)
 * 4. No chords → neutral
 * 5. Detect tripled words for emphatic intensity
 */
export function detectEmotion(response: RockyResponse): EmotionResult {
  const text = response.rocky_english;
  const chords = response.chords;

  // Detect emphatic intensity from tripled words in text
  const intensity: EmotionIntensity = TRIPLED_WORD_RE.test(text)
    ? "emphatic"
    : "normal";

  // Check for question (overrides chord-based detection)
  // Rocky ends questions with "question?" or just "?"
  const trimmed = text.trim();
  if (
    trimmed.endsWith("?") ||
    /\bquestion\s*[.?!]?\s*$/i.test(trimmed)
  ) {
    return { state: "curious", intensity };
  }

  // No chords → neutral
  if (chords.length === 0) {
    return { state: "neutral", intensity };
  }

  // Count interval types
  let consonant = 0;
  let dissonant = 0;
  let open = 0;

  for (const chord of chords) {
    switch (chord.interval_type) {
      case "consonant":
        consonant++;
        break;
      case "dissonant":
        dissonant++;
        break;
      case "open":
        open++;
        break;
    }
  }

  // Plurality with optimistic tie-breaking: consonant > open > dissonant
  let state: EmotionState;
  if (consonant >= dissonant && consonant >= open) {
    state = "joyful";
  } else if (dissonant > consonant && dissonant > open) {
    state = "distressed";
  } else {
    state = "neutral";
  }

  return { state, intensity };
}
