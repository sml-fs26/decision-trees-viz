# Context briefing — decision-trees-viz

You are building an interactive pedagogical website about **classification trees**, as taught in lecture 15 of the ETH Zurich course *Stochastics and Machine Learning* (Spring 2026). The target audience is 4th-semester mechanical engineering students. The pedagogical style is **Bruner's spiral curriculum**: introduce concepts one at a time, let the student feel each before the next arrives.

## Reference: the companion regression website

A companion website for linear regression is already live at:

- **Deployed**: https://carloscotrini.github.io/sml_lab_26/playground/
- **Source**: https://github.com/carloscotrini/sml_lab_26 (look in `site/playground/`)

Your new site should match the aesthetic, tech stack, and pedagogical approach of the regression site.

Representative pages to study:
- https://carloscotrini.github.io/sml_lab_26/playground/dgp-intro.html (Bruner-spiral introduction to a data-generating process)
- https://carloscotrini.github.io/sml_lab_26/playground/dgp-estimator.html (scaffolded introduction to OLS with a character named Dr. Gauss)
- https://carloscotrini.github.io/sml_lab_26/playground/hub.html (menu of pathologies)
- https://carloscotrini.github.io/sml_lab_26/playground/issues/ovb.html (focused issue page with interactive widgets)
- https://carloscotrini.github.io/sml_lab_26/playground/issues/misspecification.html (Dr. Bishop teaches polynomial regression)

Local copies of these files are in the `reference/` subdirectory of this bootstrap. Read them carefully — they are the template.

## Your mission

Build a similar website focused on **classification trees**. The pedagogical content is in `SLIDES_CONTENT.md`. The structure, style, and tech stack are in the accompanying files:

- `01_PLAN.md` — phased build plan
- `ARCHITECTURE.md` — directory layout and module conventions
- `STYLE_GUIDE.md` — colours, typography, interactive components
- `PEDAGOGY.md` — Bruner spiral, character-driven narrative, Setosa/Distill aesthetic
- `SLIDES_CONTENT.md` — what the lecture actually says about classification trees

## Tech stack (same as regression site)

- **Hosting**: GitHub Pages (the repo is already at `github.com/sml-fs26/decision-trees-viz` — set up a `.github/workflows/deploy.yml` that mirrors the one in the regression repo)
- **No framework**: vanilla HTML/CSS/ES modules
- **Visualization**: D3.js v7 via CDN
- **Math rendering**: KaTeX via CDN (NOT MathJax)
- **No build step**: everything served as-is

## Pedagogical philosophy (critical)

1. **Bruner's spiral**: one variable/concept at a time. Don't dump the full algorithm on the first page.
2. **Character-driven**: the regression site has Alice and Bob (students) and Dr. Gauss and Dr. Bishop (researchers). Your trees site should have its own cast — recurring named characters the student comes to know.
3. **Scrollytelling**: long-form scrolling pages with a sticky visualization on one side, narrative on the other. Reference: `reference/example_dgp-intro.html`.
4. **Interactive widgets**: sliders, knobs, toggles — the student *does* something, not just watches.
5. **Clean aesthetic**: Setosa/Distill minimalism. Off-white background. Serif for prose, sans for UI. Generous whitespace.
6. **Rigor alongside intuition**: every intuitive explanation should be paired with the formal math (KaTeX).

## Scope (from the slides)

- What a classification tree is (function t: ℝᵈ → labels)
- Tree as partition of ℝᵈ with labels attached
- Formal definition (disjoint subsets, labels in {1,…,M})
- Entropy H(D) = −Σⱼ pⱼ log₂ pⱼ as quality measure
- Entropy examples and axiomatic motivation
- Greedy training: find best (feature, threshold) split → recurse
- Split quality Q(D, f, t) = (|D_L|/|D|)·H(D_L) + (|D_R|/|D|)·H(D_R)
- Practical considerations (overfitting, interpretability) — extrapolate sensibly, the slides are sparse here

Full content in `SLIDES_CONTENT.md`.

## Start by

1. Read this whole bootstrap directory (all markdown files + glance through reference/).
2. Explore the live regression site (links above) to internalize the style.
3. Execute `01_PLAN.md` phase by phase.

## Large project — use parallel agents

This is a multi-week build. Launch subagents with the `Agent` tool for parallel work where possible. Phase 1 (foundation) should be serial; phases 2+ (pages, issues) can be parallelized heavily. See `01_PLAN.md` for explicit parallelization guidance.
