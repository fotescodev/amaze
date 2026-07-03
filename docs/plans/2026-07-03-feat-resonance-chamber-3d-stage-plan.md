---
title: "feat: Resonance Chamber — a 3D stage where every chord moves Rocky's claws"
type: feat
status: draft
date: 2026-07-03
origin: experimental / ambition test — not committed to product roadmap
---

# feat: Resonance Chamber — 3D stage

## Overview

Move the Rocky experience onto a real-time 3D stage. Rocky becomes a procedurally
built, five-fold-symmetric Eridian body (pentagonal carapace, five articulated
claw-tipped arms) rendered with Three.js via `@react-three/fiber`. Every sound the
app makes is expressed as 3D claw movement: each tone in a chord is assigned to one
of the five claws, and the claw performs a deterministic reach/strike gesture whose
height, reach, and tempo derive from the tone's frequency and the reply's emotion.
Audio is spatialized so each tone is heard *from* the claw that plays it.

The 2D experience (`PentagonalChordViz`, `ReactiveRockyHero`) remains the fallback
and the accessibility baseline. The 3D stage is additive and toggleable.

This is explicitly an **experimental feature** — the goal is to prove the factory
can deliver an ambitious, multi-unit, graphics-heavy feature with measurable
verification at every step.

## Problem Statement

The current experience is flat: audio is rich (1–5 simultaneous sine tones per
chord, ADSR envelopes, word cadence) but the visual layer is a 2D canvas and SVG.
In the fiction, Rocky *speaks with his body* — chords are produced by claws and
resonating carapace. Nothing in the app today expresses the physicality of Eridian
speech, and no part of the stack exercises 3D rendering, so we don't know whether
the codebase's seams (shared analyser, `onWordStart`, pure-TS engine) can drive a
real-time 3D scene.

## Proposed Solution

Seven units, each independently verifiable by `npm test` plus explicit
per-unit browser checks where jsdom cannot see:

1. **U1 — 3D seam:** deps + SSR-safe `ResonanceStage` shell + WebGL detection + 2D fallback
2. **U2 — Choreography core:** pure-TS tone→claw-gesture mapping (no three.js imports)
3. **U3 — Procedural Rocky body:** pentagonal carapace + five articulated arms, idle animation
4. **U4 — Live binding:** audio playback drives claw choreography in real time
5. **U5 — Spatial audio:** per-tone HRTF panning from each claw's 3D position
6. **U6 — Scene integration:** chat states (idle/thinking/speaking) become camera + stage states
7. **U7 — Performance tiers:** fps budget, DPR clamp, degrade ladder, regression guard

## Technical Approach

### Architecture

```
src/lib/claw-choreography.ts        ← PURE TS. No three.js, no React. Fully unit-tested.
│   assignTonesToClaws(tones)       ← rank tones by Hz, round-robin onto claws 0..4
│   choreographWord(word, emotion)  ← ClawTimeline: per-claw keyframes, times derived
│                                      from audio-engine constants (CHORD_DURATION, gaps)
│   clawRestPose / hzToElevation    ← log-scale Hz→pose mapping (mirrors 2D viz)
│
src/lib/spatial-audio.ts            ← PannerNode wrapper; clawPosition(i) on unit circle
│                                      at angle -90° + i·72° (matches pentagon layout)
│
src/components/stage/
│   ResonanceStage.tsx              ← next/dynamic (ssr:false), WebGL detect, fallback
│   RockyBody.tsx                   ← procedural geometry: carapace + 5× ClawArm
│   ClawArm.tsx                     ← 3-segment IK-lite arm, pose driven by timeline
│   StageDirector.tsx               ← camera + lighting state machine (idle/thinking/speaking)
│
AudioAnalysisProvider               ← unchanged API; stage consumes analyserRef/volumeRef
audio-engine.playSequence           ← gains optional per-tone spatial destinations (U5),
                                       backward compatible (default unchanged)
```

**The testability rule that makes this factory-safe:** jsdom cannot run WebGL.
Therefore *all* decision logic (tone assignment, keyframe generation, pose math,
state transitions, quality-tier selection) lives in pure TS modules with zero
three.js imports, tested exhaustively in vitest. The r3f components are thin
"pose appliers" verified by a mount smoke test (mocked canvas) plus a scripted
browser check per unit. This mirrors how the audio engine is already structured.

### Choreography model (U2, the heart of the feature)

- `ClawPose = { reach: 0..1, elevation: -1..1, curl: 0..1, strike: 0|1 }`
- Tone assignment: sort a chord's tones ascending by Hz; tone rank *r* goes to claw
  `(r * 2) % 5` (star-polygon order — visually distributes motion around the body).
- `hzToElevation`: log-scale map of 80–1100 Hz → elevation, same constants as the
  2D visualizer (`MIN_HZ`/`MAX_HZ`) so 2D and 3D agree.
- Keyframe times are *derived*, not invented: attack = claw raise, sustain = hold
  with micro-tremor amplitude from `volumeRef`, release = return. Word/syllable
  gaps come from `audio-engine` exports.
- Emotion (`EmotionState`) modulates tempo multiplier and curl bias; intensity
  scales gesture amplitude. Deterministic: same input → same timeline (testable).

### Measurable budgets

- **Geometry:** ≤ 15k triangles total; arms are 3 segments each, no skinned meshes.
- **Frame:** 60 fps target desktop, 30 fps floor; `choreographWord` for a 5-word
  reply must compute in < 5 ms (unit-test-guarded).
- **DPR clamp:** ≤ 1.5; tier ladder (full → calm → static) in U7.
- **Accessibility:** the stage canvas is labeled or decorative; 2D fallback always
  available; `prefers-reduced-motion` = static pose + no autoplay choreography;
  zero new axe violations (existing jest-axe seam).

## Unit Breakdown & Dependencies

```
U1 (seam) ──────┬──► U3 (body) ──┐
                │                 ├──► U4 (live binding) ──► U6 (integration) ──► U7 (perf tiers)
U2 (core, no deps) ─┴────────────┘
U2 ──► U5 (spatial audio) ────────────────────────────────► U6
```

U1 and U2 can run in parallel. U5 is independent of U3/U4 and can run in parallel
with them.

## Testing Decisions

- Pure-core rule above: vitest covers all logic; r3f layer gets mount smoke tests
  with a mocked `@react-three/fiber` canvas.
- Each unit's DoD names its exact assertions (see tickets).
- Honest fidelity limits: real GPU rendering, fps, HRTF audibility, and visual
  quality are verified by a scripted one-time browser check per unit, recorded in
  the PR description. jsdom guards logic; the browser check guards pixels.

## Out of Scope

- External 3D model assets / glTF pipelines — geometry is procedural only.
- Physics engines, post-processing stacks (bloom etc.), XR/VR.
- Replacing the 2D experience — 3D is an additive, toggleable mode.
- Mobile-specific tuning beyond the tier ladder.

## Further Notes

- Recommended first slices for the factory: U1 + U2 in parallel (U2 is the N=1
  candidate — pure TS, exhaustively testable, zero rendering risk).
- Library choice: `three` + `@react-three/fiber` + `@react-three/drei`, pinned
  exact versions in U1. r3f chosen over raw three.js because the app is React and
  the shared-context (analyser refs) integration is idiomatic.
