# UI Review: Talk to Rocky — Vercel Web Interface Guidelines Audit

Reviewed against the [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
and WCAG 2.1 AA best practices.

---

## What's Already Good

- [x] `<html lang="en">` is set (`layout.tsx:16`)
- [x] API key input has a proper `<label htmlFor="api-key">` with matching `id` (`page.tsx:32-39`)
- [x] API key input uses `type="password"` for sensitive data (`page.tsx:38`)
- [x] API key input supports `onKeyDown` Enter to submit (`page.tsx:45-49`)
- [x] Chat form uses a proper `<form>` element with `onSubmit` (`ChatInterface.tsx:267-269`)
- [x] Buttons use native `<button>` elements, not `<div onClick>` throughout
- [x] Disabled states use `disabled` attribute + visual styling (`page.tsx:59-60`, `ChatInterface.tsx:283`)
- [x] Loading state shows visual feedback ("Rocky is thinking...") (`ChatInterface.tsx:250-261`)
- [x] Color tokens are centralized in Tailwind config (`tailwind.config.js:8-21`)
- [x] `font-mono` and `antialiased` applied globally (`layout.tsx:17`)
- [x] Tab buttons have hover states (`page.tsx:87, 97`)
- [x] ChordCard play buttons have `title` attributes (`ChordCard.tsx:88`)
- [x] Play button in chat has `title` attribute (`ChatInterface.tsx:214`)
- [x] Conversation starters provide good empty-state UX (`ChatInterface.tsx:157-180`)

---

## Issues Found — Grouped by Category

### 1. Keyboard Navigation & Focus Management

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| HIGH | `outline-none` used on inputs without `:focus-visible` ring replacement. Only `focus:border-rocky-warm/50` is applied, which is insufficient contrast and not a proper focus ring. | `page.tsx:43`, `ChatInterface.tsx:279` | Never use `outline-none` without providing a `:focus-visible` replacement ring |
| HIGH | No skip-link to main content. Keyboard users must tab through all elements. | `layout.tsx` (missing) | Include skip-link for main content navigation |
| HIGH | Tab bar (`page.tsx:81-102`) lacks `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls` attributes. Not navigable via arrow keys. | `page.tsx:81-102` | Use semantic ARIA roles for tab interfaces |
| HIGH | ChordCard expanded variant uses `<div onClick>` instead of `<button>` or interactive element with keyboard support. Not reachable via keyboard. | `ChordCard.tsx:59-64` | Use `<button>` for actions, not `<div onClick>` |
| MEDIUM | Cluster tabs in LexiconExplorer also lack `role="tablist"`/`role="tab"` semantics. | `LexiconExplorer.tsx:23-37` | Tab-like UI needs ARIA tab roles |
| MEDIUM | Octave shift toggle button lacks `aria-pressed` state for screen readers. | `ChatInterface.tsx:131-141` | Toggle buttons need `aria-pressed` |
| MEDIUM | No visible focus indicator on chord cards (compact mode). The `.chord-card` class has no focus styles. | `globals.css:12-13` | All interactive elements need visible focus indicators |

### 2. ARIA Labels & Screen Reader Support

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| HIGH | Play button SVG icons lack `aria-hidden="true"` and the buttons lack `aria-label`. Only `title` is used, which is not reliably announced by all screen readers. | `ChatInterface.tsx:216-222`, `ChordCard.tsx:91-98` | Icon-only buttons require `aria-label`; decorative icons need `aria-hidden="true"` |
| HIGH | Loading indicator ("Rocky is thinking...") not announced to screen readers. Needs `aria-live="polite"` region. | `ChatInterface.tsx:250-261` | Async updates should use `aria-live="polite"` |
| HIGH | Chat message list has no `role="log"` or `aria-live` region. New messages are invisible to assistive tech. | `ChatInterface.tsx:153-262` | Dynamic content areas need ARIA live regions |
| MEDIUM | WaveformVisualizer `<canvas>` has no accessible alternative — no `aria-label`, no `role`, no fallback text. | `WaveformVisualizer.tsx:94-100` | Canvas elements need accessible labels or be marked decorative |
| MEDIUM | FidelityTag has no `title` or `aria-label` explaining what the fidelity levels mean. Abbreviations like "CANON" or "AI-EXTENDED" may be opaque. | `FidelityTag.tsx:12-14` | Provide accessible descriptions for domain-specific labels |
| LOW | Decorative glyphs (`◈~⊕~◈`, `◉ ◉ ◉`) are not marked `aria-hidden="true"`. Screen readers will attempt to read them. | `page.tsx:19`, `ChatInterface.tsx:126, 254` | Decorative content needs `aria-hidden="true"` |

### 3. Color Contrast

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| HIGH | `rocky-muted` (#94a3b8) on `rocky-bg` (#0f172a) = ~5.5:1 ratio (passes AA for normal text). However, `rocky-muted/50` and `rocky-muted/70` used for placeholder and footnote text will fail. | `page.tsx:51,66`, `ChatInterface.tsx:279` | Placeholder and small text must meet 4.5:1 contrast minimum |
| MEDIUM | `fan-extended` (#64748b) on `rocky-surface` (#1e293b) background with 20% opacity. The effective contrast of this fidelity tag is borderline. | `globals.css:29-30`, `tailwind.config.js:12` | Text must meet WCAG AA contrast ratios |
| MEDIUM | Focus border `border-rocky-warm/50` (50% opacity amber on dark) may not meet 3:1 contrast ratio for non-text UI components. | `page.tsx:43`, `ChatInterface.tsx:279` | Focus indicators must have 3:1 contrast against adjacent colors |

### 4. Touch Targets & Mobile

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| HIGH | Compact ChordCards are only `px-2 py-1` — likely under 44x44px minimum touch target. | `ChordCard.tsx:47` | Touch targets should be minimum 44x44px |
| HIGH | No `touch-action: manipulation` applied to prevent 300ms tap delay. | `globals.css` (missing) | Apply `touch-action: manipulation` to interactive elements |
| MEDIUM | Fidelity tags are very small (`text-[10px]`, `px-2 py-0.5`) but not interactive, so this is acceptable unless they become tappable. | `globals.css:17` | Monitor if these become interactive |
| MEDIUM | No `overscroll-behavior: contain` on the chat scroll area. On mobile, overscrolling will bounce the whole page. | `ChatInterface.tsx:153-155` | Use `overscroll-behavior: contain` in scrollable regions |
| LOW | Missing `-webkit-tap-highlight-color` customization. Default blue highlight flash on iOS. | `globals.css` (missing) | Set `-webkit-tap-highlight-color` intentionally |

### 5. Animations & Motion

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| HIGH | `animate-pulse` used on loading indicator and playing state with no `prefers-reduced-motion` alternative. | `ChatInterface.tsx:210,254`, `ChordCard.tsx:91` | Honor `prefers-reduced-motion` |
| HIGH | `transition-all` implied by Tailwind `transition-colors` is fine, but `.chord-card` uses `transition-all` which is an anti-pattern. | `globals.css:13` | Never use `transition: all` — explicitly list properties |
| HIGH | WaveformVisualizer canvas animation runs without checking `prefers-reduced-motion`. Should show static visualization or be paused. | `WaveformVisualizer.tsx:17-66` | Animations must respect reduced-motion preferences |
| MEDIUM | Smooth scroll behavior (`behavior: "smooth"`) should respect `prefers-reduced-motion`. | `ChatInterface.tsx:34-37` | Scroll behavior should check motion preferences |

### 6. Semantic HTML & Structure

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| HIGH | No heading hierarchy on the chat page. After entering the API key, the main chat view has no `<h1>`. The "Talk to Rocky" text is a `<span>`. | `ChatInterface.tsx:128` | Maintain hierarchical heading structure |
| MEDIUM | Chat input lacks `aria-label` or visible label. The placeholder "Talk to Rocky..." is not a substitute for a label. | `ChatInterface.tsx:273-279` | All form controls need `<label>` or `aria-label` |
| MEDIUM | Message list uses `<div>` with array index as `key`. Should use stable IDs and semantic structure. | `ChatInterface.tsx:183-186` | Use stable keys; consider `<ol>` for ordered message list |
| LOW | Footer text in page.tsx uses `<p>` with `<span>` and `<br>`. Consider `<footer>` for semantic clarity. | `page.tsx:66-72` | Use semantic HTML elements |

### 7. Responsive Design & Layout

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| MEDIUM | WaveformVisualizer has hardcoded `width={400} height={64}` canvas dimensions. Does not respond to container width. | `WaveformVisualizer.tsx:95-96` | Canvas should respond to container size or use explicit width/height to prevent CLS |
| MEDIUM | No `env(safe-area-inset-*)` handling for notched devices. The bottom input area will be obscured on iPhones. | `ChatInterface.tsx:265` | Full-bleed layouts must account for device notches |
| LOW | The tab bar and chat interface assume full-viewport height (`h-screen`). May cause issues with mobile browser chrome. | `page.tsx:79` | Consider `dvh` units for mobile viewports |

### 8. Performance

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| MEDIUM | Chat messages rendered with `.map()` without virtualization. For long conversations, this will degrade. | `ChatInterface.tsx:183-248` | Virtualize large lists (>50 items) |
| MEDIUM | Chat input is a controlled component (`value={input}`). Fine for now, but should ensure render performance. | `ChatInterface.tsx:273-275` | Controlled inputs must be performant per keystroke |
| LOW | `new AudioContext()` created in `playResponse` and immediately closed — wasteful pattern. | `ChatInterface.tsx:104-108` | Avoid unnecessary resource creation |

### 9. Dark Mode & Theming

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| MEDIUM | Missing `color-scheme: dark` on `<html>`. Native scrollbars, selects, and inputs won't match the dark theme on some browsers. | `layout.tsx:16` | Set `color-scheme: dark` for dark themes |
| MEDIUM | No `<meta name="theme-color">` tag to match the dark background. Browser chrome will default to white/system. | `layout.tsx` (missing) | Match `<meta name="theme-color">` to page background |

### 10. Typography & Content

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| LOW | Loading text "Rocky is thinking..." uses three dots instead of proper ellipsis character `…`. | `ChatInterface.tsx:257` | Use ellipsis `…` instead of three periods |
| LOW | Placeholder "sk-ant-..." uses three dots instead of ellipsis. | `page.tsx:42` | Use ellipsis `…` instead of three periods |
| LOW | Placeholder "Talk to Rocky..." same issue. | `ChatInterface.tsx:277` | Use ellipsis `…` instead of three periods |
| LOW | Hz values in ChordCard ("440 Hz") should use non-breaking space (`440\u00a0Hz`). | `ChordCard.tsx:71` | Use non-breaking spaces in measurements |

### 11. State & URL Synchronization

| Priority | Issue | File:Line | Guideline |
|----------|-------|-----------|-----------|
| LOW | Active tab state (`chat`/`lexicon`) is not reflected in URL. Refreshing loses the tab selection. | `page.tsx:12` | URLs should reflect application state |
| LOW | Active lexicon cluster is not in URL params. | `LexiconExplorer.tsx:9` | Deep-link stateful UI via query params |

---

## Priority Improvements for Redesign

### P0 — Must Fix (Accessibility Blockers)

1. **Add `aria-label` to all icon-only buttons** and `aria-hidden="true"` to SVG icons
2. **Replace `outline-none` with `focus-visible:ring-2 focus-visible:ring-rocky-warm`** on all inputs and buttons
3. **Add `aria-live="polite"` to the chat message region** and loading indicator
4. **Convert ChordCard expanded variant from `<div onClick>` to `<button>`** or add `role="button"` + `tabIndex={0}` + `onKeyDown`
5. **Add proper ARIA tab roles** to the Chat/Lexicon tab bar (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`)
6. **Add skip-link** to bypass navigation and jump to main content
7. **Add `prefers-reduced-motion` media query** to disable `animate-pulse` and canvas animations

### P1 — Should Fix (UX Quality)

8. **Add `color-scheme: dark`** to `<html>` element
9. **Add `<meta name="theme-color" content="#0f172a">`** to layout metadata
10. **Add `touch-action: manipulation`** globally to prevent tap delay
11. **Add `overscroll-behavior: contain`** to the chat scroll container
12. **Increase compact ChordCard touch targets** to minimum 44x44px
13. **Add `aria-pressed` to octave shift toggle**
14. **Replace `transition-all` with explicit properties** in `.chord-card`
15. **Add accessible label to WaveformVisualizer canvas** (`aria-label="Audio waveform visualization"`)
16. **Add `aria-hidden="true"` to decorative glyphs** (`◈~⊕~◈`)

### P2 — Nice to Have (Polish)

17. **Use proper ellipsis character** (`…`) in all loading/placeholder text
18. **Use non-breaking spaces** in measurement values (`Hz`)
19. **Sync tab state to URL** using `nuqs` or `useSearchParams`
20. **Make WaveformVisualizer responsive** using `ResizeObserver` for canvas dimensions
21. **Add `env(safe-area-inset-bottom)`** padding to the chat input area
22. **Consider `100dvh`** instead of `h-screen` for mobile viewport handling
23. **Add heading hierarchy** to the chat view (`<h1>` for "Talk to Rocky")

---

*Generated from codebase review on 2026-03-04.*
