/**
 * Base Eridian Lexicon — ~40 words
 *
 * Constraint rules (from PRD §3.1):
 *   1. Five-voice ceiling: max 5 simultaneous tones
 *   2. Human hearing range: 80–1,100 Hz
 *   3. Interval Semantics: consonant=positive, dissonant=negative, open=neutral
 *   4. Audiobook tonal character: low fundamentals (<400 Hz), warm/resonant
 *   5. Structural canon before frequency invention
 *
 * Canon structural constraints (Chapter 11):
 *   "one"   = 2 simultaneous tones
 *   "two"   = 4 simultaneous tones
 *   "three" = 2 syllables: first=2 tones, second=5 tones
 */

export type Fidelity = "CANON" | "AUDIOBOOK-DERIVED" | "FAN-EXTENDED" | "AI-EXTENDED";
export type IntervalType = "consonant" | "dissonant" | "open";

export interface ChordSyllable {
  tones: number[]; // Hz values, length 1–5
}

export interface LexiconEntry {
  word: string;
  syllables: ChordSyllable[];
  fidelity: Fidelity;
  intervalType: IntervalType;
  glyph: string;
  gloss: string;
}

// Helper: build a single-syllable word
function mono(
  word: string,
  tones: number[],
  fidelity: Fidelity,
  intervalType: IntervalType,
  glyph: string,
  gloss: string
): LexiconEntry {
  return { word, syllables: [{ tones }], fidelity, intervalType, glyph, gloss };
}

// ─── Numbers (Canon structure, fan-extended frequencies) ─────────────────────

const numbers: LexiconEntry[] = [
  // "one" = 2 tones (CANON structure)
  mono("one", [220, 330], "CANON", "consonant", "◉◉",
    "Perfect fifth — simplest consonance. 2-tone structure is canon."),

  // "two" = 4 tones (CANON structure)
  mono("two", [196, 247, 330, 392], "CANON", "consonant", "◉◉◉◉",
    "Major 7th voicing — 4-tone structure is canon."),

  // "three" = 2 syllables: first=2 tones, second=5 tones (CANON structure)
  {
    word: "three",
    syllables: [
      { tones: [165, 247] },
      { tones: [131, 165, 196, 262, 330] },
    ],
    fidelity: "CANON",
    intervalType: "consonant",
    glyph: "◉◉ ~ ◉◉◉◉◉",
    gloss: "Two syllables — 2+5 tone structure is canon. Open fifths and octaves.",
  },

  // four through six: fan-extended, following base-6 counting
  mono("four", [175, 220, 330], "FAN-EXTENDED", "open", "◉◉◉",
    "Open power chord — 3 tones, neutral counting word."),

  mono("five", [147, 196, 262, 349], "FAN-EXTENDED", "open", "◉◉◉◉",
    "Suspended voicing — 4 tones, no third, neutral."),

  mono("six", [131, 165, 196, 262, 392], "FAN-EXTENDED", "consonant", "◉◉◉◉◉",
    "Full 5-tone chord — base-6 completion, major feel. Six is significant in Eridian math."),
];

// ─── Astrophage / Science ────────────────────────────────────────────────────

const science: LexiconEntry[] = [
  mono("astrophage", [110, 165, 220, 330], "FAN-EXTENDED", "open", "◈◈◈◈",
    "Open fifths stacked — neutral scientific term, foundational importance."),

  mono("star", [131, 196, 262], "FAN-EXTENDED", "open", "✦✦✦",
    "Open fifth + octave — celestial, neutral, vast."),

  mono("planet", [147, 220, 294], "FAN-EXTENDED", "open", "◉◈◉",
    "Open fifth voicing — solid, grounded, neutral."),

  mono("sun", [165, 247, 330], "FAN-EXTENDED", "consonant", "✦◉✦",
    "Major triad root — life-giving warmth, positive."),

  mono("erid", [110, 175, 220, 330, 440], "FAN-EXTENDED", "consonant", "◈✦◈✦◈",
    "Full 5-tone major — home, deep warmth, everything."),

  mono("tau-ceti", [98, 131, 165, 220], "FAN-EXTENDED", "dissonant", "◈~◈~◈◈",
    "Minor voicing — the threatened star, source of danger."),

  mono("ship", [175, 262, 349], "FAN-EXTENDED", "open", "◉◉◉",
    "Open fourth + fifth — vessel, functional, neutral."),

  mono("space", [87, 131, 175, 262], "FAN-EXTENDED", "open", "◈◈◈◈",
    "Low open voicing — vastness, emptiness, neutral awe."),

  mono("radiation", [117, 148, 175, 233], "FAN-EXTENDED", "dissonant", "⚠◈⚠◈",
    "Minor seconds and tritone — danger, invisible threat."),

  mono("temperature", [196, 262, 349], "FAN-EXTENDED", "open", "◉◉◉",
    "Open voicing — measurable, scientific, neutral."),

  mono("gravity", [98, 147, 196, 294], "FAN-EXTENDED", "open", "◉◈◉◈",
    "Low stacked fifths — heavy, fundamental force."),
];

// ─── Social / Greeting ───────────────────────────────────────────────────────

const social: LexiconEntry[] = [
  mono("friend", [220, 330, 440], "FAN-EXTENDED", "consonant", "♡◉♡",
    "Perfect fifth + octave — pure warmth, trust."),

  mono("human", [196, 262, 392], "FAN-EXTENDED", "consonant", "◉♡◉",
    "Major triad — Rocky's warm regard for Grace's species."),

  mono("rocky", [131, 196, 262, 392, 523], "FAN-EXTENDED", "consonant", "◈~⊕~◈",
    "Full 5-tone major stack — self-reference, warm and complete."),

  mono("grace", [220, 277, 330, 440], "FAN-EXTENDED", "consonant", "♡◉◉♡",
    "Major with added sixth — specific warmth, personal bond."),

  mono("hello", [196, 294, 392], "FAN-EXTENDED", "consonant", "◉◉◉",
    "Open fifth — simple greeting, warm."),

  mono("yes", [262, 392], "FAN-EXTENDED", "consonant", "◉◉",
    "Perfect fifth — affirmation, clean agreement."),

  mono("no", [196, 233], "FAN-EXTENDED", "dissonant", "◈◈",
    "Minor second — negation, slight dissonance."),

  mono("thank", [220, 330, 440, 550], "FAN-EXTENDED", "consonant", "♡◉♡◉",
    "Overtone series — gratitude, harmonic richness."),

  mono("help", [175, 262, 350, 440], "FAN-EXTENDED", "consonant", "◉◉◉◉",
    "Major seventh — earnest, reaching upward."),

  mono("sleep", [110, 165, 220], "FAN-EXTENDED", "consonant", "◉◉◉",
    "Low octave + fifth — dormancy, deep rest, safety."),
];

// ─── Emotional ───────────────────────────────────────────────────────────────

const emotional: LexiconEntry[] = [
  mono("good", [264, 396, 528], "FAN-EXTENDED", "consonant", "◉◉◉",
    "Major triad — positive valence, open fifths."),

  mono("bad", [185, 220, 262], "FAN-EXTENDED", "dissonant", "⚠⚠⚠",
    "Stacked minor seconds — negative, tense, warning."),

  mono("happy", [220, 330, 440, 554], "FAN-EXTENDED", "consonant", "♡♡♡♡",
    "Major triad + major third — joy, bright consonance."),

  mono("scared", [131, 156, 185, 220], "FAN-EXTENDED", "dissonant", "⚠◈⚠◈",
    "Chromatic cluster — fear, tight intervals, low register."),

  mono("angry", [110, 147, 175, 233], "FAN-EXTENDED", "dissonant", "⚠⚠⚠⚠",
    "Tritone + minor third — aggression, harsh dissonance."),

  mono("sad", [147, 175, 220], "FAN-EXTENDED", "dissonant", "◈◈◈",
    "Minor triad — melancholy, gentle dissonance."),

  mono("amaze", [196, 262, 330, 440, 554], "FAN-EXTENDED", "consonant", "✦✦✦✦✦",
    "Full 5-tone major ninth — wonder, awe, the biggest emotion. Rocky's signature."),

  mono("worry", [165, 196, 247, 294], "FAN-EXTENDED", "dissonant", "◈⚠◈⚠",
    "Diminished voicing — anxiety, unresolved tension."),
];

// ─── Core Verbs ──────────────────────────────────────────────────────────────

const verbs: LexiconEntry[] = [
  mono("know", [196, 294, 392], "FAN-EXTENDED", "open", "◉◉◉",
    "Open fifth stacked — knowledge, clarity, neutral."),

  mono("think", [220, 277, 370, 415], "FAN-EXTENDED", "open", "◈◉◈◉",
    "Diminished seventh — cognitive complexity, neutral-tense valence."),

  mono("want", [175, 262, 349], "FAN-EXTENDED", "open", "◉◉◉",
    "Perfect fourth stacked — desire, reaching, open."),

  mono("make", [165, 247, 330, 440], "FAN-EXTENDED", "open", "◉◈◉◈",
    "Quartal voicing — building, constructing, neutral craft."),

  mono("understand", [196, 262, 330, 392], "FAN-EXTENDED", "consonant", "◉◉◉◉",
    "Major seventh — comprehension, resolution."),

  mono("eat", [147, 196, 262], "FAN-EXTENDED", "open", "◉◉◉",
    "Open fifth — sustenance, biological, neutral."),

  mono("go", [220, 330], "FAN-EXTENDED", "open", "◉◉",
    "Perfect fifth — movement, simple direction."),

  mono("see", [262, 349, 440], "FAN-EXTENDED", "open", "◉◉◉",
    "Open fourth — perception (ironic for eyeless Rocky, adopted from Grace)."),

  mono("try", [196, 247, 330], "FAN-EXTENDED", "open", "◉◈◉",
    "Minor third + fourth — effort, mild tension, open resolve."),
];

// ─── Question Particle (Canon grammar) ───────────────────────────────────────

export const QUESTION_PARTICLE: LexiconEntry = {
  word: "?",
  syllables: [{ tones: [440, 554] }],
  fidelity: "CANON",
  intervalType: "consonant",
  glyph: "⟋",
  gloss: "Rising major third — question terminal marker. Canon grammar.",
};

// ─── Combined Lexicon ────────────────────────────────────────────────────────

export const BASE_LEXICON: LexiconEntry[] = [
  ...numbers,
  ...science,
  ...social,
  ...emotional,
  ...verbs,
];

// Quick lookup map
export const LEXICON_MAP: Map<string, LexiconEntry> = new Map(
  BASE_LEXICON.map((entry) => [entry.word.toLowerCase(), entry])
);

// Semantic clusters for the explorer UI
export const LEXICON_CLUSTERS = {
  "Numbers (Base-6)": numbers,
  "Astrophage & Science": science,
  "Social & Greeting": social,
  "Emotional": emotional,
  "Core Verbs": verbs,
} as const;

export type ClusterName = keyof typeof LEXICON_CLUSTERS;
