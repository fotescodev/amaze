# Talk to Rocky — Product Requirements Document

**Status:** Draft v1.0 | **Author:** Dmitrii Fotesco | **Updated:** March 2026

## 1. Vision

Talk to Rocky is a web app where you type in English and receive an in-character response as Rocky — the spider-crab alien from *Project Hail Mary* — rendered in Eridian chord notation and played as simultaneous tones via the Web Audio API. Claude doesn't just translate; it thinks and speaks like Rocky, generating chord assignments using a principled system derived from the novel and Ray Porter's audiobook.

This project exists for three reasons: it's for Barbara, who fell in love with the book; it's a portfolio showcase for AI-as-substance product work; and it's a learning exercise in Web Audio, Claude API prompt engineering, and AI product design. Every invented element is labeled. Canon is canon. Fan-extended is fan-extended.

## 2. Canonical Constraints

Sources: novel text (Chapters 11–12), Weir's "Eridian.doc" biology supplement, and Porter's audiobook renditions.

**Physical mechanism:** Five gas-bladder pairs produce up to 5 simultaneous tones (hard ceiling). All frequencies within ~80–1,100 Hz. Rocky has perfect pitch.

**Structural vocabulary:** "One" = 2 tones. "Two" = 4 tones. "Three" = 2 syllables (2 tones + 5 tones). Structure is non-negotiable; frequencies are invented.

**Grammar (partial canon):** Question particle (terminal rising two-tone chord). Tripling for emphasis. Octave shift for emotion. SVO word order (adopted for Grace). No inflection or conjugation.

**Tonal character (audiobook-derived):** Warm, resonant, whale-like, physically present, non-threatening.

## 3. Creative Gap Policy

Five constraint rules govern every chord assignment:

1. **Five-voice ceiling.** No word exceeds 5 simultaneous tones.
2. **Human hearing range.** All tones 80–1,100 Hz.
3. **Interval semantics.** Consonant intervals = positive concepts. Dissonant intervals = negative/warning. Open intervals = neutral/scientific.
4. **Audiobook tonal character.** Low fundamentals (below 400 Hz where possible) with upper partials.
5. **Structural canon first.** Book-specified structures are honored exactly before frequencies are assigned.

AI-generated chords follow the same rules and are tagged `AI-EXTENDED`. Every piece of Eridian content carries one of four labels: `CANON`, `AUDIOBOOK-DERIVED`, `FAN-EXTENDED`, or `AI-EXTENDED`. Nothing is presented as canonical that isn't.

**Out of scope:** Tense/aspect systems, plural morphology, conditionals, native word order, vocabulary described but not shown on-page.

## 4. Feature Set (V1 MoSCoW)

| Priority | Feature |
|----------|---------|
| **Must** | Rocky AI persona via Claude API |
| **Must** | Chord playback via Web Audio (1–5 sine oscillators) |
| **Must** | Eridian notation display with frequency labels |
| **Must** | Fidelity label on every translation |
| **Must** | Base lexicon (~40 words across numbers, science, social, emotional, verbs) |
| **Must** | Waveform visualizer per chord |
| **Should** | Sequential "play full response" playback |
| **Should** | Octave shift toggle, emphasis tripling, question particle |
| **Could** | Shareable phrase cards, Rocky's name chord on load |
| **Won't** | Full grammar, mobile app, mic input, multiplayer |

**Core flows:** (A) Chat with Rocky — type English, get in-character response with chords and playback. (B) Translate a word — lookup or AI-generate with caching. (C) Browse the lexicon — tap, hear, read rationale.

## 5. Rocky AI Persona

Rocky is blunt but warm, genuinely curious, practical, grammatically simple, emotionally rich through repetition. He never breaks character.

The system prompt has four components: (1) identity/situation aboard the Hail Mary, (2) speech rules (short sentences, "is" as copula, tripling, no idioms, "human-Grace" address), (3) chord generation rules (structured JSON with tones, fidelity, interval type, rationale), (4) what Rocky doesn't know (apps, this project, meta-awareness).

API responses return `rocky_english` (chat text) and `chords` (array of word objects with Hz values, fidelity labels, and rationale). Fallback to English-only if JSON parsing fails.

## 6. Technical Architecture

| Layer | Choice |
|-------|--------|
| UI | React (single JSX file), Tailwind |
| Audio | Web Audio API — sine oscillators, ADSR envelope (40ms attack, 80ms decay, 70% sustain, 200ms release), 150ms inter-word gap, gain normalized by chord density |
| AI | Claude API (claude-sonnet-4-6), structured system prompt |
| State | useState/useReducer, in-memory conversation history, session-level chord cache |
| Deploy | V1: Claude.ai artifact. V2: Vercel + Next.js |

## 7. Fidelity UI

Labels appear as small tags below each notation card: `CANON` (amber), `AUDIOBOOK-DERIVED` (teal), `FAN-EXTENDED` (grey-blue), `AI-EXTENDED` (purple with tooltip rationale). Every word card has an expandable "why this chord" section. A persistent footer clarifies that chord assignments are fan-extended interpretations.

## 8. Open Questions

- Glyph system: design a visual language or keep Unicode simple?
- Rocky's name chord: what should it sound like?
- Conversation starters: what three prompts make the first interaction magical?
- Error states: in-character fallbacks ("Is problem. Signal bad.")
- Film timing: *Project Hail Mary* releases March 20, 2026 — target shareable by then?

---

*Built with care, labeled with honesty, dedicated to Barbara.* "Is good good good." — Rocky
