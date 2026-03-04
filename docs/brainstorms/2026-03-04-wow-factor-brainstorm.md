# Brainstorm: WOW Factor — Living Eridian Communication Experience

**Date:** 2026-03-04
**Status:** Reviewed

---

## What We're Building

Transform the "Talk to Rocky" app from a static chat interface into a living alien communication experience that makes Project Hail Mary fans say "wow." Three pillars:

### 1. Rocky Comes Alive
Rocky's SVG body **reacts** to the conversation in real-time.

**Hero Rocky (header, ~80-100px):**
- Shows Rocky's current emotional state derived from his latest response
- Sound waves intensify/dim based on audio playback
- Body language shifts: bounces on happy, droops on sad, wiggles carapace on confusion
- Framer Motion spring physics for organic, alien-feeling movement
- Always visible — the centerpiece of the chat view
- Requires SVGs with **named, animatable layers** (legs, carapace, soundwaves) — existing SVGs must be audited/rebuilt for this

**Per-message avatars (32px):**
- Sound wave arcs pulse in sync with chord playback for that specific message
- Only the **currently-playing** avatar subscribes to audio data (receives `isPlaying` prop, not raw frequency data)
- Other avatars are static — avoids 40+ context consumers in long conversations
- Use `rocky-thinking.svg` (with sonar rings!) for the loading state — currently unused

**Emotion detection — hybrid approach:**
Primary signal: **chord `interval_type` ratio** from Rocky's response JSON
- Majority `consonant` chords -> joyful
- Majority `dissonant` chords -> distressed
- Majority `open` chords -> neutral/scientific
- Fallback for empty chords: keyword scan of `rocky_english` text

Secondary signal: **keyword confirmation + emphasis detection**
- Tripled words ("amaze amaze amaze") -> emphatic variant of the base emotion
- `question` suffix -> curious overlay

**Emotion states:**
| State | Trigger | Rocky Visual |
|---|---|---|
| `neutral` | Default, open-interval majority, no strong keywords | Gentle idle glow, slow sound waves |
| `joyful` | Consonant majority, happy/good/amaze/friend keywords | Bouncy, bright amber, fast waves |
| `distressed` | Dissonant majority, bad/sad/problem keywords | Slower, dimmer, slight droop |
| `curious` | Response ends with question particle | Tilted, searching outward |
| `emphatic` | Tripled words detected | 1.5x exaggeration of base state |
| `thinking` | Loading state (awaiting API response) | Swap to rocky-thinking.svg sonar rings |

**Emotion lifecycle:** New response -> detect emotion -> hold until next response or loading starts. During loading, switch to `thinking`. Between responses, hold the last emotion.

### 2. Pentagonal Chord Visualizer
Replace the broken `WaveformVisualizer` (which is deleted) with a **real-time pentagonal orbit visualization**.

**Concept:**
- Central point (Rocky's "voice") with up to 5 orbital rings (one per possible tone)
- Each tone = a glowing particle orbiting at a radius proportional to its frequency
- Lower tones orbit closer (larger, slower), higher tones orbit farther (smaller, faster)
- Particles arranged on a pentagonal path (matching Rocky's 5-fold body symmetry)
- Consonant chords: particles orbit smoothly, trails form clean pentagons
- Dissonant chords: particles jitter, paths become irregular

**States:**
- **Active playback**: Particles bright, orbiting, trail-drawing. Highlighted word's particles are vivid, others are dim.
- **Idle**: Slow pentagonal rotation with ghost particles (dim placeholders). Meditative ambient feel.
- **Reduced motion**: Static pentagon frame showing particle positions as dots (no animation).

**Performance budget:** Max 5 particles (biological limit) + 5 trail segments each = 30 draw calls per frame. Trivial for Canvas 2D.

**Dual API mode:**
- `mode="live"` — reads from AudioAnalysisContext (for chat playback)
- `mode="static"` — accepts tone arrays directly (for landing page quote carousel)

### 3. Subtle Sci-Fi Atmosphere
Enhance the existing dark glass aesthetic without overwhelming the chat content.

**Xenonite panel effect:**
- CSS `::before` pseudo-element with animated conic gradient on the chat panel border
- Subtle prismatic shimmer that moves slowly around the border edge
- No SVG filters (too expensive) — pure CSS gradient animation

**Particle drift:**
- Max **12 particles** on desktop, **6 on mobile** (performance budget)
- Slow-moving amber dots in the background (behind chat, low z-index)
- Speed responds to audio volume via shared context (faster when Rocky speaks)
- **Pauses on `visibilitychange`** (tab backgrounded) to save battery
- Shares canvas with `PentagonalChordViz` if possible (single rAF loop)

**Audio-reactive scan-lines:**
- Existing scan-line overlay opacity modulates with RMS volume from context
- CSS custom property `--scan-opacity` updated via JS, consumed by the overlay
- Minimal implementation: one `useEffect` reading volume ref

**Reduced motion:** All particle/scan-line animation stops. Xenonite shimmer becomes static gradient. PentagonalChordViz shows static dots.

---

## Why This Approach

**Shared Audio Bus architecture:**
- A React context (`AudioAnalysisContext`) wraps the chat view
- Frequency data stored in a **`ref`** (not state) — avoids re-render storms
- Visual components read via `useRef` callback pattern on their own rAF loops
- Context exposes: `analyserRef`, `volumeRef`, `isPlaying` (state), `emotionState` (state)
- Only `isPlaying` and `emotionState` are React state (cause re-renders); audio data is imperative
- `playSequence` API modified to accept external `destination: AudioNode` parameter
- `cancel()` fixed to actually call `osc.stop()` on all scheduled oscillators

**Framer Motion + Canvas 2D:**
- Framer Motion (~45-55KB gzipped realistically) for Rocky's body reactions
- Each Framer Motion component checks `useReducedMotion()` independently (CSS media query alone doesn't suppress JS springs)
- Canvas 2D for chord visualizer and particle effects
- CSS for xenonite shimmer (conic gradient animation)
- No Three.js

---

## Key Decisions

1. **Hero Rocky + per-message avatars** — both, not one or the other
2. **Pentagonal orbit** metaphor for chord visualization (not sonar rings or spectrogram)
3. **Subtle atmosphere** — enhance, don't overwhelm the chat content
4. **Framer Motion + Canvas** — balanced approach, no Three.js
5. **Shared AudioAnalysisContext** — ref-based frequency data, state-based emotion/playing
6. **Emotion detection from chord interval ratios** (primary) + keyword confirmation (secondary)
7. **Delete WaveformVisualizer** — replaced entirely by PentagonalChordViz
8. **Use unused SVG assets** — rocky-thinking.svg for loading state
9. **SVGs need named layers** — audit/rebuild existing SVGs for animatable parts
10. **Descope landing page viz for v1** — quote carousel keeps current bar visualization; pentagonal viz integration is a stretch goal
11. **"Fist my bump" animation is a stretch goal** — requires special SVG pose; implement as easter egg after core features ship

---

## Resolved Questions

| Question | Resolution |
|---|---|
| Who owns AudioContext lifecycle? | `AudioAnalysisProvider` calls existing `getAudioContext()` singleton. Handles `suspended` state by attempting `resume()` on first play. |
| How does cancel() stop audio? | Refactor to track all scheduled `OscillatorNode`s and call `osc.stop()` on cancel. |
| What's the neutral emotion? | Explicit `neutral` state — gentle idle glow, slow sound waves. Default for scientific/open-interval responses. |
| Keyword conflicts (positive + negative)? | Chord interval ratio is primary signal, resolves conflicts. Keywords are secondary confirmation only. |
| Per-message avatar performance? | Only the currently-playing avatar gets audio-reactive behavior (via `isPlaying` prop). Others are static. |
| Tab backgrounding? | `visibilitychange` listener pauses all rAF loops. Resumes on tab focus. |
| Bundle size? | Framer Motion is ~45-55KB gzipped (not 30KB). Acceptable for the value it adds. Verify with `@next/bundle-analyzer`. |

---

## Component Inventory

| Component | Tech | Purpose |
|---|---|---|
| `AudioAnalysisProvider` | React Context + Web Audio | Shared audio bus: `analyserRef`, `volumeRef`, `isPlaying`, `emotionState` |
| `PentagonalChordViz` | Canvas 2D | Orbital particle visualization. Dual mode: `live` (context) / `static` (props) |
| `ReactiveRockyHero` | Framer Motion + SVG | Large header Rocky, emotion-reactive body language |
| `ReactiveRockyAvatar` | Framer Motion + SVG | Per-message avatar, audio-synced only when active |
| `AtmosphereLayer` | Canvas 2D + CSS | Background particles (12 desktop / 6 mobile) + scan-line modulation |
| `XenonitePanel` | CSS | Conic gradient shimmer border on chat panel |

---

## Accessibility Spec

| Feature | Reduced Motion | Screen Reader |
|---|---|---|
| PentagonalChordViz | Static pentagon dots, no animation | `role="img"` + `aria-label` announcing current chord tones in Hz |
| ReactiveRockyHero | Static pose matching current emotion | `aria-label` updates with emotion: "Rocky sounds joyful" |
| ReactiveRockyAvatar | Static SVG, no pulse | Decorative (`aria-hidden="true"`) |
| AtmosphereLayer | No particles, no scan-line modulation | Decorative (`aria-hidden="true"`) |
| XenonitePanel | Static gradient (no animation) | Decorative, no impact |
| Chord playback | Audio still plays (motion =/= sound) | Existing play button labels maintained |

---

## Wow Moments Map

| Trigger | Visual Response |
|---|---|
| User sends first message | Hero Rocky "wakes up" — glow intensifies, sound waves appear |
| Rocky responds | Pentagonal orbits spin up, avatar sound waves pulse, emotion state updates |
| Chord playback starts | Particles fade in at orbital positions, begin pentagonal paths |
| "amaze amaze amaze" | Emphatic joyful — orbits accelerate, particles burst brighter, Rocky bounces |
| "bad bad bad" | Emphatic distressed — orbits slow, particles drift inward, Rocky droops |
| "happy happy happy" | Emphatic joyful — everything brightens, bouncy spring motion |
| Rocky thinking (loading) | Hero Rocky enters `thinking` state, per-message avatar uses rocky-thinking.svg |
| Idle (no activity) | Ambient pentagonal drift, ghost particles, gentle scan-lines |
| Tab backgrounded | All animation pauses. Resumes on focus. |
| **Stretch:** "fist my bump" | Special animation — Rocky extends a hand toward the screen |
| **Stretch:** Quote carousel play | Landing page pentagonal viz in miniature (static mode) |
