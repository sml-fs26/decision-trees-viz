# Style guide — decision-trees-viz

## Aesthetic

Setosa/Distill-inspired minimalism. Off-white background, generous whitespace, clean typography. The feel should match https://carloscotrini.github.io/sml_lab_26/playground/.

## Color palette

Base (copy from regression site):
- `--c-bg: #fbf8f3`            (off-white background)
- `--c-ink: #2a2a2a`            (primary text)
- `--c-ink-muted: #6a6a6a`      (secondary text)
- `--c-border: #e4dfd5`         (subtle borders)

Classification-specific:
- `--c-class-a: #B83280`        (class A — pink, matches the lecture slides)
- `--c-class-b: #3182CE`        (class B — blue, matches the slides' inverted triangles)
- `--c-split: #E53E3E`          (split line red)
- `--c-pure: #27AE60`           (fully pure leaf — green)
- `--c-impure: #D4A017`         (impure — gold, entropy > 0)
- `--c-truth: #D4A017`          (gold dashed line for the true boundary)

Character accents (for character cards):
- `--c-quinlan: #2E5EA8`        (Dr. Quinlan — blue)
- `--c-breiman: #805AD5`        (Dr. Breiman, if you introduce him — purple)

## Typography

- Headings: `'Fraunces', Georgia, serif` — readable at multiple weights
- Body: `'Inter', -apple-system, sans-serif`
- Math: KaTeX default (Latin Modern)
- Code / algorithm: `'JetBrains Mono', SFMono-Regular, monospace`

Sizes:
- h1 / hero: 40-48px
- h2 / stage title: 28-32px
- Body: 16-17px
- Small / meta: 13-14px

Base line-height: 1.55 for prose, 1.3 for headings.

## Layout patterns

### Scrollytelling page (for data-intro.html and tree-builder.html)
- Two-column layout on desktop: narrative left (50%), sticky visualization right (50%)
- On mobile (< 860px): single column, viz sticks to top
- Persistent top bar with:
  - Progress indicator (Stage N / total)
  - Formula tracker (equations introduced so far, rendered via KaTeX)
  - (Optional) character avatar widget

### Hub page
- Centered title + subtitle hero
- 3-column card grid (2 cols on tablet, 1 col on mobile)
- Each card: icon + title + hook + CTA button
- Subtle hover lift (translateY(-3px) + soft shadow)

### Issue page (single-scroll narrative)
- Single-column narrative with inline or below-text visualizations
- Use the same boxes / CSS classes as scrollytelling pages
- End with a "back to hub" link

## Colored boxes (reuse regression site CSS classes)

- `.toystory`  gold, for intuitive stories
- `.keyinsight` blue, for key takeaways
- `.warningbox` red, for warnings or traps
- `.repairbox` green, for solutions
- `.numermark` blue (lighter), for numerical examples
- `.vizspec`   green (lighter), for visualization descriptions

## Interactive widgets

### Slider
- Horizontal bar, gradient under the thumb (green → red if it represents a "danger" axis)
- Label above, live readout to the right
- Discrete step snapping where it makes pedagogical sense (e.g., polynomial degree)

### Button (primary)
```
background: var(--c-ink);
color: var(--c-bg);
padding: 10px 16px;
border: none;
border-radius: 3px;
font: 600 14px var(--sans);
cursor: pointer;
```

### Toggle / Checkbox
Simple, clean — the regression site uses native `<input type="checkbox">` with custom label styling.

## SVG + D3 conventions

- Margins: `{top: 30, right: 30, bottom: 50, left: 60}`
- ViewBox for responsiveness: `viewBox="0 0 600 500"` with `preserveAspectRatio="xMidYMid meet"`
- Always add a clipPath to the plot area so lines/shapes don't bleed outside axes
- Use `d3.scaleLinear()` with explicit domains; don't rely on auto-scale from data (prevents jumps when data changes)
- Layer order (z-index): background grid → decision regions → data points → reference lines → labels

## Animation

- Prefer `d3.transition().duration(300)` with ease `d3.easeCubic` for most property changes
- Match the reduced-motion preference: wrap transitions in `!prefersReducedMotion` checks
- Use the Stage 6 bloom pattern from the regression site as a template for "reveal" moments

## KaTeX setup

Every page that uses math must include this in `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}]});"></script>
```

**Critical gotcha**: in HTML attributes, `\\[` is the RIGHT escaping (two backslashes in source → one at runtime). Using `\\\\[` (four backslashes) will silently break rendering. See `reference/KATEX_GOTCHAS.md`.

For dynamically-inserted math (after `innerHTML` updates), re-invoke `renderMathInElement(node, {...})` on the new element.

## Don't

- Don't use a framework (no React, no Vue, no Svelte).
- Don't use a build step. Everything served raw from `site/`.
- Don't fetch() data from external files — generate everything client-side with the seeded PRNG for reproducibility.
- Don't use MathJax. KaTeX only (faster, simpler).
- Don't use inline styles for layout (inline styles OK for per-element colour/font-size; not for positioning).
