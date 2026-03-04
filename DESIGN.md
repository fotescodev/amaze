# Design System: Talk to Rocky — Eridian Communication Interface

> A futuristic alien communication terminal. Warm but alien. Like the bridge of the *Hail Mary* spacecraft — functional engineering meets wonder. Not cold/clinical, not overwhelming with effects. **Sci-fi warmth.**

---

## 1. Visual Theme & Atmosphere

**Core concept: The Hail Mary Engineering Terminal**

The interface should feel like a purpose-built communication console aboard an interstellar spacecraft. It is the tool that lets a lone human astronaut talk to his alien friend — who speaks in musical chords. Every element should reinforce this fiction.

**Mood keywords:** Deep space, warm engineering, alien wonder, functional beauty, quiet confidence.

**Inspiration blend:**
- **LCARS (Star Trek)** — Bold functional panels on black backgrounds. Rounded container edges. Information-dense but scannable. Colored text/sections on dark canvas. Minimalist by philosophy ("the technology is much more advanced").
- **Arrival (2016)** — Circular alien language rendered as luminous forms against dark/foggy backgrounds. Glass partition metaphor. Extreme minimalism. Sensorial experience over decoration. Dark, earth-toned palette with moments of ethereal glow.
- **Interstellar mission control** — Data-rich readouts that remain readable. Monospaced type for technical data. Status indicators and labeled systems.
- **Prometheus holographics** — Translucent layers, subtle glow halos, depth through opacity rather than drop shadows.
- **Modern glass-morphism** — Frosted glass panels with subtle backdrop blur. Semi-transparent surfaces that reveal depth. Thin luminous borders.

**What to avoid:**
- Generic dark mode (just gray cards on gray backgrounds)
- Overwhelming neon cyberpunk (too many glows, too saturated)
- Clinical/sterile (no warmth, no personality)
- Skeuomorphic panels or heavy 3D effects
- Gratuitous particle effects or animations

**The feeling:** You are aboard the *Hail Mary*, floating in the void between stars. Your engineering terminal hums softly. You type a message to Rocky. His response arrives as a cascade of chords — warm, alien, beautiful. The interface glows with amber light, like sunlight through Astrophage. It is quiet. It is functional. It fills you with wonder.

---

## 2. Color Palette & Roles

### Deep Space Backgrounds

| Token               | Hex       | Role                                           |
|---------------------|-----------|-------------------------------------------------|
| `--bg-primary`      | `#0a0e1a` | Page/body background. Near-black with blue tint |
| `--bg-secondary`    | `#111827` | Card/panel surface background                   |
| `--bg-elevated`     | `#1a2235` | Elevated surfaces (modals, dropdowns, hover)    |
| `--bg-inset`        | `#060a12` | Inset regions (input fields, code blocks)       |

### Warm Amber / Eridian Glow (Primary Accent)

| Token               | Hex       | Role                                                |
|---------------------|-----------|-----------------------------------------------------|
| `--amber-500`       | `#f59e0b` | Primary interactive (buttons, active tab, links)     |
| `--amber-400`       | `#fbbf24` | Hover states, bright emphasis                        |
| `--amber-300`       | `#fcd34d` | Glow source, highlighted chord cards                 |
| `--amber-600`       | `#d97706` | Pressed/active states                                |
| `--amber-900/20`    | `rgba(120, 53, 15, 0.20)` | Subtle warm tint for user message bubbles |
| `--amber-glow`      | `rgba(245, 158, 11, 0.15)` | Box-shadow glow on interactive elements  |
| `--amber-glow-strong` | `rgba(245, 158, 11, 0.30)` | Intensified glow for active playback   |

Amber represents Rocky's warmth, Eridian chord resonance, and Astrophage (which glows with absorbed starlight). It is the soul color of the interface.

### Cool Blue (Human / Interface)

| Token               | Hex       | Role                                               |
|---------------------|-----------|-----------------------------------------------------|
| `--blue-400`        | `#60a5fa` | Secondary accent (links, human-side indicators)      |
| `--blue-500`        | `#3b82f6` | Active human-side elements                           |
| `--blue-900/10`     | `rgba(30, 58, 138, 0.10)` | Subtle cool tint for interface chrome   |

Blue is used sparingly for human-side interface elements — navigation chrome, scrollbar accents, secondary actions. It provides cool contrast to Rocky's warm amber.

### Fidelity Label Colors

| Fidelity           | Fill                       | Text        | Glow                            |
|--------------------|----------------------------|-------------|----------------------------------|
| CANON              | `rgba(217, 119, 6, 0.15)`  | `#f59e0b`   | `rgba(245, 158, 11, 0.20)`      |
| AUDIOBOOK-DERIVED  | `rgba(13, 148, 136, 0.15)` | `#14b8a6`   | `rgba(20, 184, 166, 0.20)`      |
| FAN-EXTENDED       | `rgba(100, 116, 139, 0.15)`| `#94a3b8`   | `rgba(148, 163, 184, 0.15)`     |
| AI-EXTENDED        | `rgba(139, 92, 246, 0.15)` | `#a78bfa`   | `rgba(167, 139, 250, 0.20)`     |

Each fidelity level has its own color identity. Canon (amber) is warmest and most prominent. AI-Extended (purple) is most synthetic. Fan-Extended (slate) is most neutral. The glow colors match but at lower opacity for subtle luminous halos.

### Border & Divider

| Token               | Hex                          | Role                              |
|---------------------|------------------------------|-----------------------------------|
| `--border-default`  | `rgba(55, 65, 81, 0.50)`    | Standard panel/card borders       |
| `--border-subtle`   | `rgba(55, 65, 81, 0.30)`    | Lighter dividers, section breaks  |
| `--border-warm`     | `rgba(245, 158, 11, 0.25)`  | Focus rings, active card borders  |
| `--border-warm-strong` | `rgba(245, 158, 11, 0.50)` | Highlighted / playing state      |

### Text Hierarchy

| Token               | Hex       | Role                                     |
|---------------------|-----------|-------------------------------------------|
| `--text-primary`    | `#e2e8f0` | Body text, primary content                |
| `--text-secondary`  | `#94a3b8` | Muted labels, descriptions, metadata      |
| `--text-tertiary`   | `#64748b` | Timestamps, footnotes, disabled           |
| `--text-warm`       | `#f59e0b` | Eridian glyphs, Rocky indicators, accents |
| `--text-inverse`    | `#0a0e1a` | Text on amber buttons                     |

---

## 3. Typography Rules

**Primary typeface:** `JetBrains Mono` (monospace)

Monospace reinforces the engineering terminal aesthetic. Every character occupies the same width, which gives chord notations and frequency readouts a natural grid alignment — like reading instrument panels.

**Fallback stack:** `"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace`

### Scale

| Level          | Size    | Weight | Letter-spacing | Use                                |
|----------------|---------|--------|----------------|------------------------------------|
| Display        | 2.5rem  | 700    | -0.02em        | Landing page title                 |
| Heading 1      | 1.5rem  | 700    | -0.01em        | Section headers                    |
| Heading 2      | 1.125rem| 600    | 0              | Panel titles, tab labels           |
| Body           | 0.875rem| 400    | 0.01em         | Chat messages, descriptions        |
| Body Small     | 0.8125rem| 400   | 0.01em         | Chord details, rationale text      |
| Caption        | 0.6875rem| 600   | 0.06em         | Fidelity tags (uppercase), labels  |
| Micro          | 0.625rem| 500    | 0.08em         | Frequency readouts (e.g., "440 Hz")|

### Rules

- **Fidelity tags** and system labels: always `uppercase` with wide tracking (0.06em+)
- **Chord glyphs** (Unicode symbols like `◈~⊕~◈`): always in `--text-warm` color, monospace
- **Frequency values**: use `font-variant-numeric: tabular-nums` for aligned columns
- **Loading ellipsis**: use proper `...` character
- **Chat messages**: `leading-relaxed` (1.625) for comfortable reading
- **No decorative fonts** — monospace everywhere maintains the terminal aesthetic

---

## 4. Component Stylings

### 4.1 Landing Page Card

The entry point. A single glass-morphism panel floating in deep space.

```
Container:
  background: rgba(17, 24, 39, 0.60)
  backdrop-filter: blur(24px) saturate(1.2)
  border: 1px solid var(--border-default)
  border-radius: 16px
  padding: 32px
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.05),    /* inner warm halo */
    0 25px 50px -12px rgba(0, 0, 0, 0.50)   /* depth shadow */

Eridian glyph header (◈~⊕~◈):
  color: var(--amber-500)
  font-size: 3rem
  text-shadow: 0 0 30px rgba(245, 158, 11, 0.30)
  animation: gentle-pulse 4s ease-in-out infinite

Title ("Talk to Rocky"):
  color: var(--text-primary)
  font-size: display scale
  font-weight: 700

Subtitle:
  color: var(--text-secondary)
  font-size: body scale
```

### 4.2 Chat Bubbles

**User messages (right-aligned):**
```
background: rgba(245, 158, 11, 0.08)
border: 1px solid rgba(245, 158, 11, 0.15)
border-radius: 16px 16px 4px 16px
padding: 12px 16px
color: var(--text-primary)
```

**Rocky messages (left-aligned):**
```
background: rgba(17, 24, 39, 0.70)
backdrop-filter: blur(12px)
border: 1px solid var(--border-default)
border-radius: 16px 16px 16px 4px
padding: 12px 16px
color: var(--text-primary)

/* Subtle warm inner glow on the left edge (Rocky's presence) */
box-shadow: inset 3px 0 0 0 rgba(245, 158, 11, 0.15)
```

The left-edge warm inset shadow subtly marks Rocky's messages as coming from the alien — warm, present, distinct.

### 4.3 Chord Cards

**Compact (inline, within chat):**
```
background: rgba(17, 24, 39, 0.50)
border: 1px solid var(--border-subtle)
border-radius: 8px
padding: 4px 10px
font-size: body-small
cursor: pointer
transition: all 200ms ease

Hover:
  border-color: var(--border-warm)
  box-shadow: 0 0 12px var(--amber-glow)

Playing/Highlighted:
  border-color: var(--amber-500)
  box-shadow: 0 0 20px var(--amber-glow-strong)
  background: rgba(245, 158, 11, 0.08)
```

**Expanded (in Lexicon Explorer):**
```
background: var(--bg-secondary)
border: 1px solid var(--border-default)
border-radius: 12px
padding: 16px
transition: all 200ms ease

Hover:
  border-color: var(--border-warm)
  box-shadow: 0 0 16px var(--amber-glow)
  transform: translateY(-1px)

Expanded state (details visible):
  border-color: var(--border-warm-strong)
  box-shadow: 0 0 24px var(--amber-glow)
```

Chord glyph always rendered in `--text-warm` with a subtle text-shadow glow.

### 4.4 Waveform Visualizer

```
Container:
  background: var(--bg-inset)
  border: 1px solid var(--border-subtle)
  border-radius: 12px
  padding: 8px 16px
  height: 72px
  overflow: hidden

Idle state (no audio playing):
  Draw a gentle sine wave animation (not a flat line)
  Stroke color: rgba(245, 158, 11, 0.20)
  Stroke width: 1.5px
  Animation: slow sine drift, 3s period, subtle amplitude
  This gives the visualizer a "breathing" quality — the system is alive, waiting

Active playback state:
  Stroke color: var(--amber-400)
  Stroke width: 2px
  Shadow: 0 0 8px rgba(245, 158, 11, 0.40) (canvas glow effect)
  Actual waveform data drives the visualization
  Background: subtle trail effect via semi-transparent fill-rect per frame
```

The idle sine wave is critical — a flat line feels dead. The *Hail Mary* terminal is always humming.

### 4.5 Fidelity Tags

```
Common:
  display: inline-flex
  align-items: center
  border-radius: 9999px (full pill)
  padding: 2px 8px
  font-size: caption (0.6875rem)
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.06em
  border: 1px solid transparent

Per-fidelity:
  CANON:
    background: rgba(217, 119, 6, 0.15)
    color: #f59e0b
    border-color: rgba(245, 158, 11, 0.20)
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.10)

  AUDIOBOOK-DERIVED:
    background: rgba(13, 148, 136, 0.15)
    color: #14b8a6
    border-color: rgba(20, 184, 166, 0.15)

  FAN-EXTENDED:
    background: rgba(100, 116, 139, 0.12)
    color: #94a3b8
    border-color: rgba(148, 163, 184, 0.10)

  AI-EXTENDED:
    background: rgba(139, 92, 246, 0.15)
    color: #a78bfa
    border-color: rgba(167, 139, 250, 0.15)
```

Canon tags have a subtle glow to reinforce their authoritative status. Others are progressively more muted.

### 4.6 Tab Navigation

```
Container:
  background: var(--bg-primary)
  border-bottom: 1px solid var(--border-subtle)

Tab button (inactive):
  color: var(--text-secondary)
  padding: 12px 20px
  font-size: body
  font-weight: 500
  border-bottom: 2px solid transparent
  transition: color 200ms ease, border-color 200ms ease

Tab button (hover):
  color: var(--text-primary)

Tab button (active):
  color: var(--amber-500)
  border-bottom: 2px solid var(--amber-500)
  font-weight: 600
  text-shadow: 0 0 12px rgba(245, 158, 11, 0.20)
```

### 4.7 Buttons

**Primary (amber):**
```
background: var(--amber-500)
color: var(--text-inverse)
font-weight: 600
border-radius: 10px
padding: 10px 20px
border: none
transition: all 200ms ease
box-shadow: 0 0 0 0 rgba(245, 158, 11, 0)

Hover:
  background: var(--amber-400)
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.25)

Active:
  background: var(--amber-600)
  transform: scale(0.98)

Disabled:
  opacity: 0.4
  cursor: not-allowed
```

**Secondary (outlined):**
```
background: transparent
color: var(--text-secondary)
border: 1px solid var(--border-default)
border-radius: 10px
padding: 10px 20px
transition: all 200ms ease

Hover:
  color: var(--text-primary)
  border-color: var(--border-warm)
  box-shadow: 0 0 12px var(--amber-glow)
```

**Icon button (play, mode toggle):**
```
background: var(--bg-inset)
color: var(--amber-500)
border-radius: 9999px
padding: 8px
border: 1px solid var(--border-subtle)
transition: all 200ms ease

Hover:
  background: rgba(245, 158, 11, 0.10)
  border-color: var(--border-warm)

Active/Playing:
  background: var(--amber-500)
  color: var(--text-inverse)
  box-shadow: 0 0 16px var(--amber-glow)
  animation: pulse-glow 1.5s ease-in-out infinite
```

### 4.8 Input Fields

```
background: var(--bg-inset)
border: 1px solid var(--border-default)
border-radius: 10px
padding: 10px 16px
color: var(--text-primary)
font-family: monospace
font-size: body
transition: border-color 200ms ease, box-shadow 200ms ease

Placeholder:
  color: var(--text-tertiary)

Focus:
  border-color: var(--border-warm)
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.10)
  outline: none

Disabled:
  opacity: 0.5
  cursor: not-allowed
```

### 4.9 Loading State (Rocky Thinking)

```
Container:
  Same as Rocky message bubble

Inner:
  Display three Eridian glyphs: ◉ ◉ ◉
  color: var(--amber-500)
  Each glyph animates with staggered opacity pulse:
    glyph 1: animation-delay: 0ms
    glyph 2: animation-delay: 200ms
    glyph 3: animation-delay: 400ms
  Animation: fade between opacity 0.3 and 1.0, 1.2s ease-in-out infinite

  Label "Rocky is thinking..." in --text-secondary
```

### 4.10 Conversation Starters

```
Container (empty state):
  Centered vertically in chat area
  Large Eridian glyph with gentle pulse animation
  Heading + subtitle

Starter buttons:
  background: var(--bg-secondary)
  border: 1px solid var(--border-default)
  border-radius: 10px
  padding: 12px 16px
  text-align: left
  color: var(--text-primary)
  font-size: body
  transition: all 200ms ease

  Hover:
    border-color: var(--border-warm)
    background: rgba(245, 158, 11, 0.04)
    box-shadow: 0 0 12px var(--amber-glow)
```

### 4.11 Scrollbar

```
width: 6px

Track:
  background: transparent

Thumb:
  background: rgba(148, 163, 184, 0.20)
  border-radius: 3px

Thumb:hover:
  background: rgba(148, 163, 184, 0.40)
```

---

## 5. Animation & Motion Principles

### Core Rules

1. **Honor `prefers-reduced-motion`** — All animations must have reduced-motion variants (static or minimal). This is non-negotiable per Vercel Web Interface Guidelines.
2. **Animate only `transform` and `opacity`** — These are GPU-composited. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, or `border-width`.
3. **Never use `transition: all`** — Explicitly list properties: `transition: opacity 200ms ease, transform 200ms ease, border-color 200ms ease`.
4. **Animations must be interruptible** — If a user clicks during a transition, the new state should take over immediately.

### Timing

| Type               | Duration | Easing                | Use                                    |
|--------------------|----------|-----------------------|----------------------------------------|
| Micro-interaction  | 150ms    | `ease-out`            | Button press, toggle                   |
| Standard           | 200ms    | `ease`                | Hover states, focus rings              |
| Entrance           | 300ms    | `cubic-bezier(0.16, 1, 0.3, 1)` | New messages, panel reveals |
| Ambient            | 3-5s     | `ease-in-out`         | Glow pulses, idle waveform             |

### Specific Animations

**Ambient glow pulse (`gentle-pulse`):**
```css
@keyframes gentle-pulse {
  0%, 100% { opacity: 0.7; text-shadow: 0 0 20px rgba(245, 158, 11, 0.20); }
  50% { opacity: 1; text-shadow: 0 0 30px rgba(245, 158, 11, 0.40); }
}
```
Used on: Landing page glyph, waveform idle hint. Duration: 4s. Subtle — the glow should barely register consciously but make the interface feel alive.

**Chord card highlight sync:**
When audio plays a sequence of chords, each card lights up in sync:
```
Transition into highlight: border-color and box-shadow, 150ms ease-out
Transition out of highlight: border-color and box-shadow, 300ms ease (slower fade-out feels musical)
```

**Waveform idle sine wave:**
A gentle sine wave oscillates in the visualizer when no audio is playing. Amplitude: ~4px. Period: ~3s. This communicates "the system is alive and listening." Not a flat dead line.

**New message entry:**
```css
@keyframes message-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Duration: 300ms, easing: cubic-bezier(0.16, 1, 0.3, 1) */
```

**Button glow pulse (active/playing state):**
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 12px rgba(245, 158, 11, 0.20); }
  50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.40); }
}
```

**Rocky thinking (staggered dots):**
Three glyphs pulse at staggered 200ms intervals. Each fades between `opacity: 0.3` and `1.0` over 1.2s. The stagger creates a wave-like "thinking" rhythm.

**Optional: Scan-line overlay**
A very subtle horizontal line that slowly drifts down the screen at ~10% opacity. Reinforces the CRT/terminal aesthetic. Should be implemented as a CSS pseudo-element or overlay div with `pointer-events: none`. **Only enable if it does not impact performance or readability.** Skip on mobile.

---

## 6. Layout Principles

### Page Structure

```
Mobile (< 640px):     Single column, full-width panels
Tablet (640-1024px):  Single column, centered with max-width
Desktop (> 1024px):   Centered container, max-width: 768px for chat
                      Lexicon can use wider layout (max-width: 960px)
```

### Spacing Scale

Use a 4px base grid. Common spacing values:

| Token  | Value | Use                                   |
|--------|-------|---------------------------------------|
| `xs`   | 4px   | Inline gaps, tight spacing            |
| `sm`   | 8px   | Between related elements              |
| `md`   | 16px  | Standard padding, card gaps           |
| `lg`   | 24px  | Section spacing                       |
| `xl`   | 32px  | Panel padding, major section breaks   |
| `2xl`  | 48px  | Page margins on desktop               |

### Chat Layout

- Messages area: flex-1 with overflow-y-auto, generous padding (16px mobile, 24px desktop)
- Input area: fixed at bottom, separated by border, padding 12px 16px
- Waveform: sits between header and messages, always visible (not scrolled away)
- Messages auto-scroll to bottom on new message (smooth behavior)

### Lexicon Layout

- Cluster tabs: horizontal scroll on mobile, wrapping flex on desktop
- Word cards: single-column grid on mobile, can be 2-column on wider screens
- Each card has consistent internal padding and spacing

### Responsive Rules

- Touch targets: minimum 44x44px on mobile (per Apple HIG / WCAG)
- Chord cards in chat: horizontal scroll if they overflow (not wrapping to many rows on mobile)
- Landing page: vertically centered, card fills width on mobile with 16px margin
- Tab bar: equal-width tabs, text truncation not needed (short labels)

---

## 7. Accessibility Notes

### From Vercel Web Interface Guidelines

1. **Semantic HTML** — Use `<button>` for interactive elements (not `<div onClick>`). Use `<label>` for form inputs. Use heading hierarchy (`h1` > `h2` > `h3`).

2. **Visible focus indicators** — All interactive elements must show `focus-visible` rings. Use warm amber ring: `focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[--bg-primary]`.

3. **Keyboard navigation** — Tab through all interactive elements. Enter/Space activates buttons. Chord cards must be keyboard-playable. Input fields support Enter to submit.

4. **Icon-only buttons need `aria-label`** — Play buttons, mode toggle, close buttons must have descriptive labels (e.g., `aria-label="Play full response as Eridian chords"`).

5. **Honor `prefers-reduced-motion`** — Wrap all animations in `@media (prefers-reduced-motion: no-preference)`. Provide static alternatives. The idle waveform animation, glow pulses, and message entry animations must all respect this.

6. **Color is not the only indicator** — Fidelity tags use color AND text labels. Interactive states use border/shadow changes alongside color. Error states use icons + text, not just red color.

7. **Contrast ratios** — Text on dark backgrounds must meet WCAG AA (4.5:1 for body text, 3:1 for large text). Our palette is designed for this:
   - `#e2e8f0` on `#0a0e1a` = 15.4:1 (passes AAA)
   - `#94a3b8` on `#0a0e1a` = 7.3:1 (passes AA)
   - `#f59e0b` on `#0a0e1a` = 9.6:1 (passes AAA)

8. **Loading states** — Use `aria-live="polite"` on the message container so screen readers announce new messages. Rocky's "thinking" state should be announced.

9. **Autocomplete on inputs** — API key input should not use autocomplete (sensitive). Chat input can use `autocomplete="off"` as it is conversational.

10. **Form submission** — Submit button stays enabled until the request starts (don't pre-disable). Inline error messages with focus on first error.

### Color Blindness

The fidelity color scheme was chosen to be distinguishable across common color vision deficiencies:
- Canon (amber/orange) vs Audiobook (teal/green) — distinct in both protanopia and deuteranopia
- Fan (neutral gray) — achromatic, always distinguishable
- AI (purple/violet) — distinct from amber and teal in all common CVD types
- All tags include text labels, so color is never the sole differentiator

---

## Appendix: CSS Custom Properties Summary

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-elevated: #1a2235;
  --bg-inset: #060a12;

  /* Amber (Eridian warmth) */
  --amber-300: #fcd34d;
  --amber-400: #fbbf24;
  --amber-500: #f59e0b;
  --amber-600: #d97706;
  --amber-glow: rgba(245, 158, 11, 0.15);
  --amber-glow-strong: rgba(245, 158, 11, 0.30);

  /* Blue (Human interface) */
  --blue-400: #60a5fa;
  --blue-500: #3b82f6;

  /* Fidelity */
  --fidelity-canon: #f59e0b;
  --fidelity-audiobook: #14b8a6;
  --fidelity-fan: #94a3b8;
  --fidelity-ai: #a78bfa;

  /* Borders */
  --border-default: rgba(55, 65, 81, 0.50);
  --border-subtle: rgba(55, 65, 81, 0.30);
  --border-warm: rgba(245, 158, 11, 0.25);
  --border-warm-strong: rgba(245, 158, 11, 0.50);

  /* Text */
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-warm: #f59e0b;
  --text-inverse: #0a0e1a;
}
```

---

## Appendix: Tailwind Config Color Mapping

```js
colors: {
  rocky: {
    bg: '#0a0e1a',
    surface: '#111827',
    elevated: '#1a2235',
    inset: '#060a12',
    border: 'rgba(55, 65, 81, 0.50)',
    'border-subtle': 'rgba(55, 65, 81, 0.30)',
    warm: '#f59e0b',
    'warm-hover': '#fbbf24',
    'warm-glow': 'rgba(245, 158, 11, 0.15)',
    text: '#e2e8f0',
    muted: '#94a3b8',
    dim: '#64748b',
  },
  canon: '#f59e0b',
  'audiobook-derived': '#14b8a6',
  'fan-extended': '#94a3b8',
  'ai-extended': '#a78bfa',
}
```
