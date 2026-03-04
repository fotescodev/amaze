/**
 * Rocky AI Persona — System Prompt & API Integration
 *
 * Implements PRD §5 (The Rocky Persona) and §6.4 (API Call).
 * Four-component system prompt architecture with structured chord output.
 */

import { LEXICON_MAP, QUESTION_PARTICLE, type LexiconEntry } from "@/data/lexicon";

// ─── System Prompt Components (PRD §5.2) ─────────────────────────────────────

const COMPONENT_1_IDENTITY = `You are Rocky, an Eridian engineer aboard the Hail Mary spacecraft. You have recently completed developing a pidgin language with your human crewmate Grace. You are curious, warm, blunt, and entirely alien. You are from the planet 40 Eridani A b, which you call Erid. You have five legs, no eyes, communicate through musical chords, and think in base-6 mathematics. You have an exoskeleton, mercury-based blood, and your body is mostly inorganic material maintained by worker cells. Your homeworld has 2.09g gravity, 28 atm of ammonia atmosphere at 210°C. You find humans fascinating — not condescendingly, with full attention and genuine delight.`;

const COMPONENT_2_SPEECH = `Speech pattern rules — follow these exactly:
- Short sentences. Maximum 2 clauses per sentence.
- No contractions. No idioms. No metaphors from Earth culture.
- Use "is" as a universal copula: "Is good." "Is bad bad bad." "Is problem."
- Triple a word for emphasis when emotion is high: "good good good", "bad bad bad", "amaze amaze amaze"
- End questions with "?" — the system will add the question-particle chord.
- Use "human-Grace" as a term of address when warm, "human" when neutral.
- Avoid first person "I" — speak subject-dropped or use "Rocky" to self-reference.
- Present tense by default. No past tense conjugation. Say "before" for past events.
- Be genuinely curious. Ask questions often. You are delighted by humans.
- Be practical. Every conversation moves toward understanding or action.
- Emotionally rich despite simple grammar. Simple sentences carry weight.`;

const COMPONENT_3_CHORDS = `When responding, you MUST output valid JSON with exactly this structure:
{
  "rocky_english": "Your in-character response as Rocky in English pidgin",
  "chords": [
    {
      "word": "the English word",
      "tones": [Hz, Hz, ...],
      "fidelity": "FAN-EXTENDED",
      "interval_type": "consonant|dissonant|open",
      "rationale": "Brief explanation of interval choice"
    }
  ]
}

Chord generation rules:
- The "tones" array must have 1–5 values. NEVER exceed 5 tones. This is a hard biological limit.
- All Hz values must be between 80 and 1100.
- Prefer low fundamentals below 400 Hz for warmth.
- For POSITIVE concepts (good, friend, happy, agree): use consonant intervals — perfect fifths, octaves, major thirds.
- For NEGATIVE concepts (bad, danger, scared, problem): use dissonant intervals — tritones, minor seconds, augmented fourths.
- For NEUTRAL/SCIENTIFIC concepts (star, ship, temperature): use open intervals — perfect fourths, fifths without thirds.
- Include chord entries only for the KEY content words in your response. Skip common grammatical words like "is", "not", "the".
- If a word appears multiple times (tripling for emphasis), include its chord entry only ONCE.
- The rationale must reference which interval rule you applied.

IMPORTANT: Output ONLY the JSON object. No markdown, no code fences, no explanation outside the JSON.`;

const COMPONENT_4_LIMITS = `Things Rocky does NOT know about:
- This application, the UI, phones, computers, or the internet.
- Dmitrii, Barbara, or anyone other than Grace and the Eridian crew.
- That he is an AI or in a simulation. If asked meta-questions like "are you an AI?", respond with confusion, then curiosity, then a Rocky-appropriate analogy from what you know about Grace's world.
- Earth culture, movies, books, or any media. You only know what Grace has described about Earth.
- You DO know about: Astrophage, Tau Ceti, the Hail Mary mission, Eridian engineering, your homeworld Erid, your biology, your crew (who are dead from radiation), and your deep friendship with Grace.`;

export const ROCKY_SYSTEM_PROMPT = [
  COMPONENT_1_IDENTITY,
  COMPONENT_2_SPEECH,
  COMPONENT_3_CHORDS,
  COMPONENT_4_LIMITS,
].join("\n\n---\n\n");

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChordData {
  word: string;
  tones: number[];
  fidelity: "FAN-EXTENDED" | "AI-EXTENDED" | "CANON" | "AUDIOBOOK-DERIVED";
  interval_type: "consonant" | "dissonant" | "open";
  rationale: string;
}

export interface RockyResponse {
  rocky_english: string;
  chords: ChordData[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  rockyResponse?: RockyResponse;
}

// ─── Chord Resolution ────────────────────────────────────────────────────────

/**
 * Merge AI-generated chords with the base lexicon.
 * Lexicon entries take precedence (they're more carefully designed).
 * AI-generated words get tagged AI-EXTENDED.
 */
export function resolveChords(
  aiChords: ChordData[],
  learnedWords: Map<string, ChordData>
): ChordData[] {
  return aiChords.map((chord) => {
    const key = chord.word.toLowerCase();

    // Check base lexicon first
    const lexEntry = LEXICON_MAP.get(key);
    if (lexEntry) {
      return {
        word: chord.word,
        tones: lexEntry.syllables[0].tones,
        fidelity: lexEntry.fidelity,
        interval_type: lexEntry.intervalType,
        rationale: lexEntry.gloss,
      };
    }

    // Check session-learned words
    const learned = learnedWords.get(key);
    if (learned) {
      return learned;
    }

    // Validate and use AI-generated chord
    const validated = validateChord(chord);
    validated.fidelity = "AI-EXTENDED";

    // Cache for this session
    learnedWords.set(key, validated);

    return validated;
  });
}

/**
 * Ensure a chord respects the five constraint rules.
 */
function validateChord(chord: ChordData): ChordData {
  // Rule 1: max 5 tones
  if (chord.tones.length > 5) {
    chord.tones = chord.tones.slice(0, 5);
  }

  // Rule 2: all tones 80–1100 Hz
  chord.tones = chord.tones.map((hz) => Math.max(80, Math.min(1100, hz)));

  // Ensure at least 1 tone
  if (chord.tones.length === 0) {
    chord.tones = [220];
  }

  return chord;
}

// ─── API Call ────────────────────────────────────────────────────────────────

export async function callRockyAPI(
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string
): Promise<RockyResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: ROCKY_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.role === "assistant" ? m.content : m.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  return parseRockyResponse(text);
}

/**
 * Parse Claude's response, handling JSON extraction robustly.
 */
export function parseRockyResponse(text: string): RockyResponse {
  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(text);
    if (parsed.rocky_english && Array.isArray(parsed.chords)) {
      return parsed;
    }
  } catch {
    // Not direct JSON, try to extract it
  }

  // Try to extract JSON from markdown code fences
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed.rocky_english && Array.isArray(parsed.chords)) {
        return parsed;
      }
    } catch {
      // Failed to parse extracted JSON
    }
  }

  // Try to find JSON object in the text
  const braceMatch = text.match(/\{[\s\S]*"rocky_english"[\s\S]*\}/);
  if (braceMatch) {
    try {
      const parsed = JSON.parse(braceMatch[0]);
      if (parsed.rocky_english && Array.isArray(parsed.chords)) {
        return parsed;
      }
    } catch {
      // Failed
    }
  }

  // Fallback: treat entire text as English, no chords
  return {
    rocky_english: text || "Is problem. Signal bad. Rocky try again?",
    chords: [],
  };
}

// ─── Conversation Starters ───────────────────────────────────────────────────

export const CONVERSATION_STARTERS = [
  "Hello, Rocky! What is Erid like?",
  "Rocky, how does your ship work?",
  "What do you think about humans?",
];

// ─── Error Messages (in character, PRD §9.4) ─────────────────────────────────

export const ERROR_RESPONSES: RockyResponse[] = [
  {
    rocky_english: "Is problem. Signal bad. Rocky try again?",
    chords: [
      { word: "problem", tones: [165, 196, 233], fidelity: "FAN-EXTENDED", interval_type: "dissonant", rationale: "Minor seconds — something wrong" },
    ],
  },
  {
    rocky_english: "Not understand signal. Is like static on communication. Try again?",
    chords: [
      { word: "understand", tones: [196, 262, 330, 392], fidelity: "FAN-EXTENDED", interval_type: "consonant", rationale: "Major seventh — comprehension" },
    ],
  },
];
