# Talk to Rocky — Eridian Communication Interface

> **An AI-powered alien language experience built entirely with Claude Code.**
> No prior coding experience required. Just curiosity, creativity, and a good prompt.

Talk to Rocky is an interactive web app inspired by *Project Hail Mary* by Andy Weir. You chat with Rocky — a five-legged Eridian engineer — who responds in character through AI-generated text and *playable musical chords*, just like in the book. Every response comes alive with sound, animation, and an alien visual language.

**This entire project was built by a non-developer using [Claude Code](https://claude.com/claude-code)** as a showcase of what's possible when you pair AI with ambition.

---

## What It Does

- **Chat with Rocky** — An AI persona backed by Claude that speaks in Rocky's distinctive pidgin English, complete with personality, lore accuracy, and emotional range.
- **Hear Eridian chords** — Every key word in Rocky's response maps to a musical chord (1–5 simultaneous sine waves via Web Audio API). Tap play and *hear* the alien language.
- **See Rocky react** — Rocky's avatar animates with Framer Motion based on the emotional tone of his response: joyful, curious, distressed, or thinking.
- **Pentagonal chord visualizer** — Five orbital particles trace pentagonal paths (matching Rocky's five-fold body symmetry) and pulse in real-time with audio frequency data.
- **Ambient atmosphere** — Background particle drift and a prismatic shimmer border create a living sci-fi interface.
- **Eridian Lexicon** — Browse the full dictionary of Eridian words with their chord assignments, fidelity ratings (canon, audiobook, fan-extended), and glyphs.

## The Story Behind It

This project started as a question: *"Can someone who doesn't know how to code build something genuinely impressive with AI?"*

The answer is this app. Every component — from the audio engine to the SVG animations to the chord visualization system — was designed and implemented through conversation with Claude Code. The process involved:

1. **Brainstorming** — Describing the vision and iterating on ideas
2. **Planning** — Breaking features into structured implementation plans
3. **Building** — Claude Code writing every line of TypeScript, React, and CSS
4. **Testing** — End-to-end verification of the full user experience

No code was written by hand. The entire codebase is the output of human creativity + AI engineering.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | Framer Motion + Canvas 2D |
| Audio | Web Audio API (OscillatorNode synthesis) |
| AI | Claude API (direct browser call) |
| Font | JetBrains Mono |

## Quick Start

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/) (used client-side only, never stored)

### Run Locally

```bash
git clone https://github.com/your-username/talk-to-rocky.git
cd talk-to-rocky
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your API key, and click **Enter the Hail Mary**.

## How It Works

### Audio Engine

Rocky communicates through simultaneous tones — chords. Each word in the Eridian lexicon maps to 1–5 frequencies between 80–1100 Hz. The audio engine synthesizes these as sine waves with ADSR envelopes (Attack 40ms, Decay 80ms, Sustain 70%, Release 200ms), creating an organic alien soundscape.

### Emotion Detection

The system analyzes the musical intervals in Rocky's response to determine emotional state:
- **Consonant intervals** (perfect fifths, octaves, major thirds) → joyful
- **Dissonant intervals** (tritones, minor seconds) → distressed
- **Open intervals** (perfect fourths without thirds) → neutral
- **Question endings** → curious

This drives real-time avatar animations and visualizer behavior.

### Chord Fidelity System

Every word carries a fidelity tag indicating its source:
- **Canon** — Directly from the novel
- **Audiobook-derived** — Interpreted from Ray Porter's narration
- **Fan-extended** — Community-created chord assignments
- **AI-extended** — Generated in real-time by Claude

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page + quote carousel
│   ├── layout.tsx            # Root layout, fonts, metadata
│   └── globals.css           # Design system, animations, effects
├── components/
│   ├── ChatInterface.tsx     # Main chat UI with message bubbles
│   ├── AudioAnalysisProvider # Shared audio bus context
│   ├── PentagonalChordViz    # Canvas 2D orbital particle visualizer
│   ├── ReactiveRockyHero     # Emotion-reactive header Rocky (Framer Motion)
│   ├── ReactiveRockyAvatar   # Per-message avatar with animation states
│   ├── AtmosphereLayer       # Background particle drift system
│   ├── XenonitePanel         # CSS prismatic shimmer border
│   ├── ChordCard.tsx         # Individual chord display component
│   ├── LexiconExplorer.tsx   # Eridian dictionary browser
│   └── svg/                  # Inline SVG components with motion layers
├── lib/
│   ├── audio-engine.ts       # Web Audio synthesis + ADSR envelopes
│   ├── rocky-persona.ts      # System prompt + API integration
│   └── emotion-detector.ts   # Chord interval → emotion mapping
└── data/
    └── lexicon.ts            # Eridian word database (200+ entries)
```

## Accessibility

- Full keyboard navigation with visible focus indicators
- `prefers-reduced-motion` respected across all animations and Canvas renders
- ARIA roles, labels, and live regions for screen readers
- Skip-to-content link
- High contrast text on dark backgrounds

## Design Philosophy

The UI draws from sci-fi communication interfaces — think alien translation terminals. Key design choices:

- **Dark-first** — Deep navy background (`#0a0e1a`) with amber (`#f59e0b`) as the primary accent
- **Glass morphism** — Frosted panels with `backdrop-filter: blur(24px)`
- **Subtle motion** — Animations enhance meaning (Rocky's body language) rather than decorate
- **Performance-conscious** — Canvas animations use `requestAnimationFrame`, skip when hidden, and pause on reduced motion. Refs over state for high-frequency audio data to prevent re-render storms.

## Built With Claude Code

This project demonstrates a complete AI-assisted development workflow:

- **Brainstorming** — Explored what would make the experience feel alive
- **Planning** — Created structured implementation plans with phased delivery
- **Implementation** — 20 TypeScript files, ~2,500 lines of code
- **Testing** — Automated E2E pipeline verification
- **Iteration** — Multiple design passes to refine the visual experience

If you're curious about building with AI, this is proof that the barrier to creating rich, interactive web experiences is lower than ever.

## Acknowledgments

- **Andy Weir** — for creating Rocky, one of the most lovable characters in science fiction
- **Ray Porter** — whose audiobook performance brought Eridian chords to life
- **Anthropic** — for Claude and Claude Code
- The *Project Hail Mary* fan community — for extended Eridian language work

---

*A fan project. Not affiliated with Andy Weir, Crown Publishing, or Audible.*
*Eridian chord assignments are fan-extended interpretations.*
