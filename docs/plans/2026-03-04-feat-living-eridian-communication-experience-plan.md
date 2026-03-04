---
title: "feat: Living Eridian Communication Experience"
type: feat
status: active
date: 2026-03-04
origin: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md
---

# feat: Living Eridian Communication Experience

## Overview

Transform the "Talk to Rocky" chat interface into a living alien communication experience with three pillars: a reactive Rocky character (Framer Motion + SVG), a pentagonal chord visualizer (Canvas 2D), and subtle sci-fi atmosphere effects. All visual components are unified through a shared `AudioAnalysisContext` that fixes the existing broken AnalyserNode bug and provides real-time audio data via refs.

(see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)

## Problem Statement

The app currently has a broken waveform visualizer (AnalyserNode disconnected from audio signal chain), static Rocky avatars, and no visual feedback during chord playback. Fans see text + hear audio but the visual layer is dead. The gap between the rich audio engine and the static UI undermines the "alien communication" fantasy.

## Proposed Solution

Four-phase implementation building from audio infrastructure up to visual polish:

1. **Foundation** — Shared audio bus context + audio engine fixes + Framer Motion install
2. **Pentagonal Chord Visualizer** — Canvas 2D orbital particle system replacing the broken waveform
3. **Reactive Rocky** — SVG rebuild + emotion-driven Framer Motion animations
4. **Atmosphere** — Background particles, xenonite panel shimmer, audio-reactive scan-lines

## Technical Approach

### Architecture

```
AudioAnalysisProvider (React Context)
├── analyserRef: RefObject<AnalyserNode>    ← imperative, no re-renders
├── volumeRef: RefObject<number>            ← imperative, no re-renders
├── isPlaying: boolean                      ← React state, causes re-renders
├── emotionState: EmotionState              ← React state, causes re-renders
├── playChords(words, octaveShift, onWordStart)  ← wraps playSequence
└── stopPlayback()                          ← calls osc.stop() on all scheduled nodes

Consumers:
├── PentagonalChordViz   → reads analyserRef on own rAF loop
├── ReactiveRockyHero    → reads emotionState + isPlaying via context
├── ReactiveRockyAvatar  → receives isActive prop (only playing msg animates)
├── AtmosphereLayer      → reads volumeRef on own rAF loop
└── ChatInterface        → calls playChords, reads isPlaying/emotionState
```

### Implementation Phases

#### Phase 1: Foundation — Audio Bus + Engine Fixes

**Goal:** Fix the broken audio visualization and establish the shared data layer all visual components depend on.

**Files to modify:**

##### 1.1 Install Framer Motion

```bash
npm install framer-motion
```

Verify bundle impact with `npx @next/bundle-analyzer` after Phase 4.

##### 1.2 Refactor `src/lib/audio-engine.ts`

**Changes required:**

- **Track scheduled oscillators** — Add an `oscillators: OscillatorNode[]` array to `scheduleChord`. Return it so callers can stop them.

```typescript
// src/lib/audio-engine.ts — scheduleChord return type change
function scheduleChord(
  tones: number[],
  startTime: number,
  destination: AudioNode,
  octaveShift: boolean
): { endTime: number; oscillators: OscillatorNode[] }
```

- **Add `destination` parameter to `playSequence`** — Optional external AudioNode. When provided, connect oscillators to it instead of creating an internal analyser.

```typescript
// src/lib/audio-engine.ts — playSequence signature change
export function playSequence(
  words: PlayableWord[],
  octaveShift: boolean,
  onWordStart?: (wordIdx: number) => void,
  destination?: AudioNode  // NEW: external destination (the shared analyser)
): { promise: Promise<void>; cancel: () => void }
```

- **Fix `cancel()` to actually stop audio** — Track all scheduled OscillatorNodes in an array. On cancel, iterate and call `osc.stop()` on each.

```typescript
const allOscillators: OscillatorNode[] = [];
// ... in scheduling loop:
const { endTime: chordEnd, oscillators } = scheduleChord(...);
allOscillators.push(...oscillators);
// ... cancel function:
const cancel = () => {
  cancelled = true;
  allOscillators.forEach(osc => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
};
```

- **Same changes to `playWord`** — Add optional `destination` parameter.

- **Await `ctx.resume()`** — Change `getAudioContext` to return a promise, or have the provider await it.

##### 1.3 Create `src/lib/emotion-detector.ts`

New file. Pure function, no side effects.

```typescript
// src/lib/emotion-detector.ts
import type { RockyResponse, ChordData } from "./rocky-persona";

export type EmotionState = "neutral" | "joyful" | "distressed" | "curious" | "thinking";
export type EmotionIntensity = "normal" | "emphatic";

export interface EmotionResult {
  state: EmotionState;
  intensity: EmotionIntensity;
}

export function detectEmotion(response: RockyResponse): EmotionResult
```

**Detection algorithm:**
1. Count chord `interval_type` ratios: consonant vs dissonant vs open
2. Majority consonant → `joyful`; majority dissonant → `distressed`; majority open or no chords → `neutral`
3. Check `rocky_english` for question particle at end → override to `curious`
4. Detect tripled words (regex: `/\b(\w+)\s+\1\s+\1\b/i`) → set intensity to `emphatic`
5. Case-insensitive keyword scan as secondary confirmation only

##### 1.4 Create `src/components/AudioAnalysisProvider.tsx`

New file. React Context + Provider.

```typescript
// src/components/AudioAnalysisProvider.tsx
"use client";

import { createContext, useContext, useRef, useState, useCallback } from "react";
import type { EmotionState, EmotionIntensity } from "@/lib/emotion-detector";

interface AudioAnalysisContextValue {
  analyserRef: React.RefObject<AnalyserNode | null>;
  volumeRef: React.RefObject<number>;
  isPlaying: boolean;
  emotionState: EmotionState;
  emotionIntensity: EmotionIntensity;
  playChords: (words: PlayableWord[], octaveShift: boolean, onWordStart?: (idx: number) => void) => Promise<void>;
  stopPlayback: () => void;
  setEmotionState: (state: EmotionState) => void;
  setEmotionIntensity: (intensity: EmotionIntensity) => void;
}
```

**Key implementation details:**
- Creates `AnalyserNode` once, connects to `ctx.destination`
- Passes analyser as `destination` to `playSequence`
- Runs a volume-tracking rAF loop that reads `getByteFrequencyData` and computes RMS, stored in `volumeRef`
- Volume rAF loop only runs while `isPlaying` is true
- Pauses on `visibilitychange` (tab backgrounded)
- `playChords` awaits `ctx.resume()` before scheduling

##### 1.5 Wire into `src/components/ChatInterface.tsx`

**Remove:** Local `analyser` state, local `playingMessageIdx` state management for audio, direct `playSequence` calls.

**Replace with:** `useAudioAnalysis()` hook from context. ChatInterface calls `playChords()` instead of `playSequence()` directly.

**Keep:** `playingMessageIdx` and `highlightedWordIdx` as local state (these are UI concerns, not audio concerns). Pass `isActive={playingMessageIdx === idx}` prop to avatars.

##### 1.6 Wrap chat view in `AudioAnalysisProvider`

In `src/app/page.tsx`, wrap the chat tab panel content:

```tsx
<AudioAnalysisProvider>
  <ChatInterface apiKey={apiKey} />
</AudioAnalysisProvider>
```

**Acceptance criteria for Phase 1:**
- [ ] `npm install framer-motion` succeeds
- [ ] `playSequence` accepts optional `destination` parameter
- [ ] `cancel()` actually stops audio (oscillators stop immediately)
- [ ] `AudioAnalysisProvider` creates shared AnalyserNode in the signal chain
- [ ] `volumeRef` updates with RMS volume during playback
- [ ] `emotionState` updates when Rocky responds (via `detectEmotion`)
- [ ] Existing chat functionality works exactly as before (no regressions)
- [ ] `visibilitychange` pauses volume tracking rAF
- [ ] TypeScript compiles clean

---

#### Phase 2: Pentagonal Chord Visualizer

**Goal:** Replace the broken WaveformVisualizer with a living pentagonal orbit visualization that makes Eridian chord structure visible.

**Files to create/modify:**

##### 2.1 Create `src/components/PentagonalChordViz.tsx`

New file. Canvas 2D component.

**Dual API:**
```typescript
interface PentagonalChordVizProps {
  mode: "live" | "static";
  // Live mode: reads from AudioAnalysisContext
  // Static mode: accepts tone data directly
  staticTones?: number[][];  // For future landing page use
  className?: string;
}
```

**Canvas patterns to follow** (from WaveformVisualizer):
- `containerRef` + `canvasRef` with ResizeObserver
- DPR scaling with `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` (fix the accumulation bug)
- Single `animFrameRef` for cleanup
- `reducedMotionRef` via `matchMedia` listener
- Trail effect: `ctx.fillStyle = "rgba(6, 10, 18, 0.3)"; ctx.fillRect(...)` instead of clearRect

**Drawing algorithm:**

*Idle state (no playback):*
- Draw 5 concentric pentagonal orbit paths in `rgba(245, 158, 11, 0.08)`
- Place 5 ghost particles (dim, `rgba(245, 158, 11, 0.15)`) at pentagonal vertices
- Slowly rotate the entire pentagon (1 revolution per ~8 seconds)
- Under reduced motion: static pentagon with dots, no rotation

*Active state (during playback):*
- Read frequency data from `analyserRef.current.getByteFrequencyData()`
- Map frequency bins to 5 orbital slots (biological max)
- Each active tone: bright particle (`#fbbf24`) orbiting at radius proportional to Hz
  - Lower tones (80-300 Hz): inner orbits, larger particles (4px), slower
  - Higher tones (300-1100 Hz): outer orbits, smaller particles (2px), faster
- Pentagonal path: 5 vertices per orbit, particles follow the edges
- Trail: each particle leaves a fading trail (5 previous positions, decreasing opacity)
- Consonant chords (from context `emotionState`): smooth orbits
- Dissonant chords: add random jitter (±2px per frame) to particle positions

**Color palette** (matching DESIGN.md tokens):
- Background: transparent (overlay on existing dark bg)
- Idle orbit paths: `rgba(245, 158, 11, 0.08)`
- Ghost particles: `rgba(245, 158, 11, 0.15)`
- Active particles: `#fbbf24` with `shadowBlur: 8, shadowColor: rgba(245, 158, 11, 0.40)`
- Active trails: `rgba(245, 158, 11, 0.25)` fading to 0

**Accessibility:**
```tsx
<canvas
  ref={canvasRef}
  role="img"
  aria-label={isPlaying ? `Playing chord: ${activeTones.join(", ")} Hz` : "Eridian chord visualizer — idle"}
/>
```

##### 2.2 Delete `src/components/WaveformVisualizer.tsx`

Remove the file entirely. Remove its import from `ChatInterface.tsx`.

##### 2.3 Wire PentagonalChordViz into ChatInterface

Replace the WaveformVisualizer section in the chat header with `<PentagonalChordViz mode="live" />`.

**Acceptance criteria for Phase 2:**
- [ ] Idle mode shows slowly rotating pentagonal ghost particles
- [ ] Active mode shows bright orbiting particles matching chord tones
- [ ] Particle radius/speed correlates with tone frequency
- [ ] Trail effect creates motion blur feel
- [ ] Reduced motion shows static dots
- [ ] `aria-label` updates with current chord tones
- [ ] WaveformVisualizer.tsx is deleted
- [ ] Canvas pauses on `visibilitychange`
- [ ] No janky resize behavior (ResizeObserver + DPR correct)

---

#### Phase 3: Reactive Rocky

**Goal:** Make Rocky a living character that responds emotionally to the conversation.

**Files to create/modify:**

##### 3.1 Create `src/components/RockyHeroSvg.tsx` — Inline SVG Component

Convert `/public/rocky-hero.svg` to an inline React component with **named, animatable groups:**

```tsx
// Named groups for Framer Motion targeting
<motion.g id="rocky-body">...</motion.g>
<motion.g id="rocky-leg-1">...</motion.g>
<motion.g id="rocky-leg-2">...</motion.g>
<motion.g id="rocky-leg-3">...</motion.g>
<motion.g id="rocky-leg-4">...</motion.g>
<motion.g id="rocky-leg-5">...</motion.g>
<motion.g id="rocky-waves-left">...</motion.g>
<motion.g id="rocky-waves-right">...</motion.g>
<motion.g id="rocky-waves-top">...</motion.g>
<motion.g id="rocky-core">...</motion.g>
```

Keep all existing gradients, clip paths, and styling. Just add ids and wrap in `motion.g`.

##### 3.2 Create `src/components/RockyAvatarSvg.tsx` — Inline SVG Component

Same treatment for `/public/rocky-avatar.svg`. Simpler structure:

```tsx
<motion.g id="av-body">...</motion.g>
<motion.g id="av-waves">...</motion.g>
<motion.g id="av-core">...</motion.g>
```

##### 3.3 Create `src/components/ReactiveRockyHero.tsx`

Framer Motion component. Reads `emotionState` and `isPlaying` from `AudioAnalysisContext`.

```typescript
interface ReactiveRockyHeroProps {
  className?: string;
}
```

**Emotion → Animation variant mapping:**

```typescript
const emotionVariants = {
  neutral: {
    // Gentle idle: slow wave opacity pulse, no body movement
    body: { scale: 1, y: 0 },
    waves: { opacity: [0.2, 0.4, 0.2], transition: { duration: 4, repeat: Infinity } },
    core: { opacity: [0.4, 0.6, 0.4], transition: { duration: 4, repeat: Infinity } },
  },
  joyful: {
    // Bouncy: body bobs up/down, waves bright and fast
    body: { scale: [1, 1.02, 1], y: [0, -2, 0], transition: { duration: 1.5, repeat: Infinity } },
    waves: { opacity: [0.5, 0.8, 0.5], transition: { duration: 1.5, repeat: Infinity } },
    core: { opacity: 0.8 },
  },
  distressed: {
    // Droopy: body sinks slightly, waves dim and slow
    body: { scale: 0.98, y: 2 },
    waves: { opacity: 0.15, transition: { duration: 2 } },
    core: { opacity: 0.3 },
  },
  curious: {
    // Tilted: body rotates slightly, waves pulse outward
    body: { rotate: 3, transition: { type: "spring", stiffness: 100 } },
    waves: { opacity: [0.3, 0.6, 0.3], transition: { duration: 2, repeat: Infinity } },
    core: { opacity: 0.6 },
  },
  thinking: {
    // Contemplative: slow pulse, minimal movement
    body: { scale: [1, 1.01, 1], transition: { duration: 3, repeat: Infinity } },
    waves: { opacity: [0.1, 0.3, 0.1], transition: { duration: 2, repeat: Infinity } },
    core: { opacity: [0.3, 0.5, 0.3], transition: { duration: 2, repeat: Infinity } },
  },
};
```

**Emphatic modifier:** When `emotionIntensity === "emphatic"`, multiply animation amplitudes by 1.5x (scale deltas, y deltas, opacity ranges).

**Reduced motion:** `useReducedMotion()` → if true, skip all Framer Motion variants, render static SVG with opacity matching the emotion (bright for joyful, dim for distressed).

**Placement:** Replaces the `◈~⊕~◈` glyph in the ChatInterface header. Sized ~80px.

##### 3.4 Create `src/components/ReactiveRockyAvatar.tsx`

Smaller, simpler Framer Motion component for per-message use.

```typescript
interface ReactiveRockyAvatarProps {
  isActive: boolean;     // true only when THIS message is playing
  emotion: EmotionState; // emotion for THIS specific message
  isThinking?: boolean;  // show thinking variant (loading state)
}
```

**Key constraint:** Only the `isActive` avatar does audio-reactive work. Non-active avatars render with a static emotion-appropriate opacity.

When `isThinking` is true, renders `rocky-thinking.svg` inline with its existing CSS sonar-ring animations.

When `isActive` is true:
- Sound wave arcs pulse with spring physics (Framer Motion `animate`)
- Core glow brightens
- Transition back to static on `isActive → false`

##### 3.5 Create `src/components/RockyThinkingSvg.tsx`

Inline version of `/public/rocky-thinking.svg` for the loading state. Keeps existing CSS animations (sonar rings). Used by `ReactiveRockyAvatar` when `isThinking={true}`.

##### 3.6 Update ChatInterface to use reactive components

**Replace:**
- Header `◈~⊕~◈` glyph → `<ReactiveRockyHero />`
- `<Image src="/rocky-avatar.svg" />` in message list → `<ReactiveRockyAvatar isActive={playingMessageIdx === idx} emotion={msg.emotion} />`
- `<Image src="/rocky-avatar.svg" />` in loading state → `<ReactiveRockyAvatar isThinking />`

**Store emotion per message:** Extend `ChatMessage` type with optional `emotion: EmotionState` field, set during response processing.

**Acceptance criteria for Phase 3:**
- [ ] Hero Rocky in header reacts to emotion state changes with spring physics
- [ ] Per-message avatar pulses sound waves when its message is playing
- [ ] Loading state shows rocky-thinking.svg with sonar rings
- [ ] Emotion transitions feel smooth (Framer Motion springs, not abrupt)
- [ ] `useReducedMotion()` checked in every Framer Motion component
- [ ] Static fallback for reduced motion (appropriate opacity per emotion)
- [ ] `aria-label` on hero updates: "Rocky sounds joyful", "Rocky is thinking", etc.
- [ ] SVG inline components maintain visual parity with original files
- [ ] No layout shift when hero Rocky changes emotion

---

#### Phase 4: Atmosphere — Polish & Optimization

**Goal:** Add the final layer of sci-fi immersion without overwhelming the chat content.

**Files to create/modify:**

##### 4.1 Create `src/components/AtmosphereLayer.tsx`

Canvas 2D background particle system.

```typescript
interface AtmosphereLayerProps {
  className?: string;
}
```

**Particle system:**
- Desktop: 12 particles. Mobile (< 768px): 6 particles.
- Each particle: `{ x, y, vx, vy, size, opacity }` — stored in a plain array (not React state)
- Base drift: very slow (0.1-0.3 px/frame), random direction
- Audio-reactive: multiply velocity by `1 + volumeRef.current * 2` during playback
- Color: `rgba(245, 158, 11, opacity)` where opacity is 0.03-0.08 (very subtle)
- Size: 1-3px circles with `shadowBlur: 4` for soft glow
- Wrapping: particles wrap around canvas edges

**Canvas patterns:** Same DPR/ResizeObserver/rAF patterns as PentagonalChordViz.

**Performance:**
- `visibilitychange` pauses rAF
- Reduced motion: no particles rendered (canvas is empty/transparent)
- Particle count is a constant, not dynamic

**Placement:** Behind the chat messages, lowest z-index. `position: fixed; inset: 0; pointer-events: none;`.

##### 4.2 Create `src/components/XenonitePanel.tsx`

CSS-only wrapper component.

```typescript
interface XenonitePanelProps {
  children: React.ReactNode;
  className?: string;
}
```

**Effect:** A `::before` pseudo-element with animated conic gradient creating a slow-moving prismatic shimmer along the border edge.

```css
.xenonite-panel {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.xenonite-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(
    from var(--xenonite-angle, 0deg),
    transparent 0%,
    rgba(245, 158, 11, 0.12) 10%,
    rgba(139, 92, 246, 0.08) 20%,
    transparent 30%,
    transparent 100%
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
```

Animation: CSS `@property --xenonite-angle` with `@keyframes xenonite-rotate { to { --xenonite-angle: 360deg } }` at 12s linear infinite.

Reduced motion: static gradient (no rotation).

**Placement:** Wrap the message area in ChatInterface.

##### 4.3 Connect scan-lines to audio volume

In `src/app/page.tsx` (chat view) or `ChatInterface.tsx`:
- Read `volumeRef` from context
- Set CSS custom property `--scan-opacity` on the scan-line overlay div
- Value: `0.06 + volumeRef.current * 0.04` (base 6% + up to 4% more during audio)
- Update via `useEffect` + rAF reading volumeRef, setting style directly (not React state)

##### 4.4 Add global `visibilitychange` handler

In `AudioAnalysisProvider`: listen for `visibilitychange`. When tab is hidden:
- Pause the volume-tracking rAF loop
- Set a `isPaused` ref that all canvas components check

All canvas components (`PentagonalChordViz`, `AtmosphereLayer`) check this ref at the top of their render loops and `return` early if paused.

**Acceptance criteria for Phase 4:**
- [ ] Background particles drift slowly, speed up during playback
- [ ] Xenonite panel shimmer is visible but subtle on chat panel border
- [ ] Scan-line opacity pulses faintly with audio volume
- [ ] All animations pause when tab is backgrounded
- [ ] No visible performance impact on scrolling or typing
- [ ] Reduced motion: no particles, static xenonite gradient, base scan-line opacity
- [ ] Desktop and mobile particle counts differ (12 vs 6)

---

## Alternative Approaches Considered

| Approach | Why Rejected |
|---|---|
| Three.js / WebGL | 150KB+ dependency for 5 particles and an SVG creature. Massive overkill. (see brainstorm) |
| Single unified canvas | More cohesive but harder to develop/test independently. Stretch goal. |
| Sonar rings visualization | Beautiful but less informative than pentagonal orbits about chord structure. |
| Frequency bars / spectrogram | Most informative but least flashy and doesn't evoke Eridian biology. |
| Sentiment analysis for emotion | Unreliable and adds AI dependency. Chord interval ratios are more thematically coherent. |

## System-Wide Impact

### Interaction Graph

1. User sends message → `ChatInterface.sendMessage()` → API call → `parseRockyResponse()` → `resolveChords()` → `detectEmotion()` → `setEmotionState()` → Hero Rocky re-renders with new emotion variant
2. User clicks play → `AudioAnalysisProvider.playChords()` → `playSequence(words, octave, onWordStart, analyser)` → oscillators connect to shared analyser → `PentagonalChordViz` reads analyser on rAF → `AtmosphereLayer` reads volumeRef on rAF → `ReactiveRockyAvatar` gets `isActive=true` prop
3. Playback ends → promise resolves → `setIsPlaying(false)` → all visual components return to idle state

### Error Propagation

- API error → `ERROR_RESPONSES` fallback → emotion detected as `distressed` (dissonant chords) → visual feedback matches error state
- AudioContext suspended (iOS) → `playChords` awaits `resume()` → if resume fails, error logged, playback skipped silently
- Cancel during playback → `osc.stop()` on all oscillators → promise resolves → idle state

### State Lifecycle Risks

- **Tab switch during playback:** Audio continues (Web Audio is not tied to visibility). Visual rAF loops pause. On tab return, visuals resume from current audio state — no desync because visuals read live analyser data, not stored state.
- **Rapid emotion changes:** Framer Motion handles interruption naturally — spring animations blend between states. No risk of stuck state.
- **Long conversations (40+ messages):** Only the active message's avatar subscribes to audio data. Others are static. No performance degradation from message count.

### API Surface Parity

- `playSequence` signature changes (new optional `destination` param) — backwards compatible, existing calls work unchanged
- `playWord` signature changes (same) — backwards compatible
- `ChatMessage` type extended with optional `emotion` field — backwards compatible
- `WaveformVisualizer` deleted — only consumer is `ChatInterface`, which is updated in the same phase

## Acceptance Criteria

### Functional Requirements

- [ ] Hero Rocky in header reacts visually to each response's emotional content
- [ ] Pentagonal orbit visualizer shows chord tones as orbiting particles during playback
- [ ] Per-message avatars pulse when their message is playing
- [ ] Background particles drift and respond to audio volume
- [ ] Xenonite shimmer border visible on chat panel
- [ ] Scan-lines modulate with audio output
- [ ] Loading state uses rocky-thinking.svg with sonar rings
- [ ] Cancel button actually stops audio immediately
- [ ] Emotion detection uses chord interval ratios as primary signal

### Non-Functional Requirements

- [ ] No frame drops during chord playback + visualization (60fps target)
- [ ] All animations pause on `visibilitychange` (battery preservation)
- [ ] Framer Motion bundle verified with `@next/bundle-analyzer`
- [ ] Canvas components handle resize without artifacts

### Accessibility

- [ ] Every Framer Motion component calls `useReducedMotion()` independently
- [ ] PentagonalChordViz shows static dots under reduced motion
- [ ] AtmosphereLayer renders nothing under reduced motion
- [ ] XenonitePanel shows static gradient under reduced motion
- [ ] `aria-label` on hero Rocky updates with emotion state
- [ ] `aria-label` on chord visualizer updates with current tones
- [ ] All existing keyboard navigation and screen reader support maintained

### Quality Gates

- [ ] TypeScript compiles clean (`npx tsc --noEmit`)
- [ ] No `transition: all` anywhere (DESIGN.md rule)
- [ ] Only `transform` and `opacity` animated (DESIGN.md rule)
- [ ] Focus styles on all new interactive elements (`focus-visible:ring-2 focus-visible:ring-rocky-warm/50`)

## Dependencies & Prerequisites

| Dependency | Type | Phase |
|---|---|---|
| `framer-motion` | npm package (~45-55KB gzipped) | Phase 1 |
| SVG layer audit/rebuild | Manual work (convert to inline React components) | Phase 3 |
| AudioAnalysisProvider | Must be complete before visual components | Phase 1 → 2,3,4 |
| `playSequence` destination param | Must be done before context wiring | Phase 1 |

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Framer Motion bundle too large | Low | Medium | Verify with analyzer; fall back to CSS keyframes if >60KB |
| SVG rebuild loses visual parity | Medium | High | Screenshot before/after comparison for each SVG |
| Canvas performance on low-end Android | Medium | Medium | Particle budget capped; rAF pausing on background; test on real device |
| iOS AudioContext suspended race | Medium | Low | `await resume()` before wiring analyser; graceful fallback |
| Emotion detection feels "wrong" | Medium | Medium | Interval ratio is data-driven; tune thresholds after testing |

## File Inventory

### New Files

| File | Phase | Purpose |
|---|---|---|
| `src/lib/emotion-detector.ts` | 1 | Pure emotion detection function |
| `src/components/AudioAnalysisProvider.tsx` | 1 | React Context provider for shared audio data |
| `src/components/PentagonalChordViz.tsx` | 2 | Canvas 2D pentagonal orbit visualizer |
| `src/components/RockyHeroSvg.tsx` | 3 | Inline SVG with named animatable groups |
| `src/components/RockyAvatarSvg.tsx` | 3 | Inline SVG with named animatable groups |
| `src/components/RockyThinkingSvg.tsx` | 3 | Inline SVG for loading state |
| `src/components/ReactiveRockyHero.tsx` | 3 | Framer Motion emotion-reactive header Rocky |
| `src/components/ReactiveRockyAvatar.tsx` | 3 | Framer Motion per-message avatar |
| `src/components/AtmosphereLayer.tsx` | 4 | Canvas 2D background particle system |
| `src/components/XenonitePanel.tsx` | 4 | CSS conic gradient shimmer border |

### Modified Files

| File | Phase | Changes |
|---|---|---|
| `src/lib/audio-engine.ts` | 1 | Add `destination` param, fix `cancel()`, track oscillators |
| `src/components/ChatInterface.tsx` | 1-4 | Use context, replace header/avatars, add atmosphere wrappers |
| `src/app/page.tsx` | 1 | Wrap chat in `AudioAnalysisProvider` |
| `src/app/globals.css` | 4 | Add `@keyframes xenonite-rotate`, `@property --xenonite-angle` |
| `src/lib/rocky-persona.ts` | 3 | Extend `ChatMessage` type with `emotion` field |

### Deleted Files

| File | Phase | Reason |
|---|---|---|
| `src/components/WaveformVisualizer.tsx` | 2 | Replaced by PentagonalChordViz |

## SpecFlow-Resolved Technical Questions

Answers to critical implementation questions surfaced during specification analysis:

| # | Question | Resolution |
|---|---|---|
| 1 | When is `AudioContext` created? | On first `playChords()` call (inside user gesture), NOT on provider mount. Avoids iOS autoplay policy issues. Provider holds `null` analyser until first play. |
| 2 | `playSequence` new signature? | Options object: `playSequence(words, options?: { octaveShift?, onWordStart?, destination? })`. Avoids positional param bloat. Existing callers updated. |
| 3 | When is `emotionState` computed? | Inline inside `sendMessage()`, after `resolveChords()`, before `setMessages()`. React 18 automatic batching merges both state updates into one render. No double-render flash. |
| 4 | `cancel()` behavior? | Fade out: `osc.stop(ctx.currentTime + 0.2)` (200ms release). Avoids jarring cutoff while stopping promptly. |
| 5 | `ChordCard` individual taps during sequence? | Remain independent — bypass the shared bus. Simpler, and the momentary inconsistency (viz doesn't react to card taps) is acceptable. |
| 6 | Shared vs separate avatar SVG? | Separate simplified component (`RockyAvatarSvg.tsx`). Avatar only needs sound-wave pulsing, not full body-language repertoire. Less duplication concern than over-abstracting. |
| 7 | `XenonitePanel` audio-reactive? | No. Pure CSS animation only. Scan-lines are the audio-reactive atmospheric element. |
| 8 | `AtmosphereLayer` placement? | Sibling of `ChatInterface` inside the provider wrapper, not a portal. Keeps context access simple. `position: fixed; z-index: 0; pointer-events: none;` for layering. |
| 9 | Frequency-to-radius mapping? | Logarithmic: `radius = minR + (maxR - minR) * Math.log(hz / 80) / Math.log(1100 / 80)`. More perceptually accurate than linear. |
| 10 | Emotion "majority" threshold? | Plurality (highest count wins). Ties broken by: consonant > open > dissonant (optimistic default). Single-chord responses use that chord's type. |
| 11 | `emphatic` state representation? | Modifier, not standalone: `{ state: EmotionState, intensity: 'normal' \| 'emphatic' }`. Framer Motion variants multiply amplitudes by 1.5x when emphatic. |
| 12 | `curious` override behavior? | Replaces base emotion. If response ends with question, state is `curious` regardless of chord ratios. |
| 13 | Unmount during playback? | `useEffect` cleanup in ChatInterface calls `stopPlayback()` from context. Prevents setState on unmounted component. |
| 14 | `playWord()` AnalyserNode leak? | Fix in Phase 1: `playWord()` accepts optional `destination` param. When none provided, creates temp analyser that is disconnected in the `endTime` callback. |
| 15 | SVG transform-origin for scaled render? | Use percentage-based origins (`50% 50%`) in inline JSX, not absolute SVG coordinates. Framer Motion handles this natively with `transformOrigin` style prop. |

## Explicitly Out of Scope

- Three.js / WebGL — decided against (see brainstorm)
- Landing page PentagonalChordViz integration — stretch goal for later
- "Fist my bump" special animation — easter egg, post-ship
- Shared canvas between PentagonalChordViz and AtmosphereLayer — stretch goal
- SVG filters for glow effects — too expensive, use CSS shadows

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-04-wow-factor-brainstorm.md](docs/brainstorms/2026-03-04-wow-factor-brainstorm.md) — Key decisions carried forward: pentagonal orbit metaphor, Framer Motion + Canvas 2D tech stack, shared AudioAnalysisContext with ref-based frequency data, chord interval ratio emotion detection, subtle atmosphere.

### Internal References

- Design system: `DESIGN.md` — animation rules (only transform/opacity, timing scale, reduced motion)
- Accessibility audit: `UI-REVIEW.md` — existing P0/P1 issues to maintain compliance
- Canvas patterns: `src/components/WaveformVisualizer.tsx` — DPR scaling, rAF loop, ResizeObserver
- Audio engine: `src/lib/audio-engine.ts` — scheduleChord already accepts destination param internally
- SVG assets: `/public/rocky-hero.svg`, `/public/rocky-avatar.svg`, `/public/rocky-thinking.svg`
