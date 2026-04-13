# START HERE — Claude Code briefing for decision-trees-viz

Welcome. You are the new Claude Code instance assigned to build the classification-trees interactive website. Read this file first.

## What you're building

A pedagogical interactive website teaching **classification trees**, targeted at 4th-semester mechanical engineering students at ETH Zurich. Deployed via GitHub Pages from the repo at https://github.com/sml-fs26/decision-trees-viz.

## The reference: the regression companion site

A sibling website for linear regression is already live. You are building the decision-trees counterpart in the same style:

- Live demo: https://carloscotrini.github.io/sml_lab_26/playground/dgp-intro.html
- Source: https://github.com/carloscotrini/sml_lab_26 (look in `site/playground/`)

**Browse the live site for 15 minutes before you write a line of code.** Especially note:
- The Bruner-spiral DGP intro (scrollytelling, one variable at a time)
- Dr. Gauss's OLS introduction (manual fit → loss → closed form → CI)
- The issues hub with 7 cards
- The OVB issue page (detection methods + Monte Carlo histogram)
- The Simpson's paradox page (Nursing DGP, dramatic sign flip)

## Reading order in this bootstrap

1. **`START_HERE.md`** (this file) — overview + workflow
2. **`00_CONTEXT.md`** — detailed briefing and mission statement
3. **`SLIDES_CONTENT.md`** — the authoritative lecture content to cover
4. **`PEDAGOGY.md`** — Bruner spiral, character conventions, DGP suggestion
5. **`STYLE_GUIDE.md`** — colors, typography, visual components
6. **`ARCHITECTURE.md`** — directory layout, module patterns, build/deploy
7. **`01_PLAN.md`** — phased build plan with agent-dispatch strategy
8. **`reference/README.md`** — how to use the example files
9. **`reference/KATEX_GOTCHAS.md`** — pitfalls to avoid

## Scope (narrowed by the operator)

**Do only these two pages.** No hub. No issue pages. No ensembles. Just a focused, fun, entertaining illustration of the concepts in the lecture slides.

- Page 1: `data-intro.html` — introduce classification visually (5-stage scrollytelling)
- Page 2: `tree-builder.html` — Dr. Quinlan builds a tree, end with train/test overfit reveal (7-stage scrollytelling)

## Workflow

1. **Phase 0** (yourself, 30 min): set up the repo skeleton, deploy.yml, empty `site/index.html`. Verify GitHub Pages deploys.
2. **Phase 1** (one careful agent, 2-3 hours): build `shared/dgp.js`, `shared/tree.js`, `shared/plot.js`, `shared/style.css`.
3. **Phase 2** (two agents in parallel, 4 hours each): `data-intro.html` + `tree-builder.html`.
4. **Phase 3** (serial, 3-4 hours): polish — KaTeX rendering scan, scroll-bug test, mobile responsiveness, accessibility, cross-page navigation.

Details in `01_PLAN.md`. **Don't skip phase 0** — verify deployment before building any content.

## Agent dispatch tips

- Always spawn subagents for work that can parallelize.
- Pass each subagent **the relevant reference files paths** and **the relevant bootstrap file sections** in the prompt.
- After any subagent finishes, pull their commit, run `node -e "..."` to check JS parses, and test mentally that the new page fits the story.
- When an agent produces JS that uses D3 or KaTeX, always verify with `node --check` on an extracted script block.
- Preserve idempotency in stage renderers — see the `clearAll()` pattern in `reference/example_dgp-estimator.html`. Scrolling up-down-up should not accumulate artifacts.

## If you need to consult

These decisions the operator may want input on:

- **Character names**: `PEDAGOGY.md` suggests Dr. Quinlan. If the operator prefers different names, ask.
- **True decision boundary for the DGP**: linear, curved, or disjunction? Each teaches a different insight. Default to `y = 1 if X₁ + X₂ > 12`; ask if uncertain.
- **Ensemble methods**: the slides tease Random Forests / GBT but don't teach them. **Operator decision: do NOT include**. The site scope is classification trees only.

## What makes a finished site

The site is done when:
- Landing page + Page 1 + Page 2 are built and deployed at https://sml-fs26.github.io/decision-trees-viz/
- Every page has at least one interactive widget tied to the lecture content
- KaTeX math renders correctly across all pages (no raw `\[` leaking through)
- Scrolling up and down through the spiral pages doesn't break rendering
- Mobile responsive (viz stacks on narrow screens)
- The student can get from `index.html` to Page 2 in ≤ 2 clicks
- Every lecture learning objective from `SLIDES_CONTENT.md` is addressed

## What does NOT need to be in this site

- Regression trees (only classification)
- Random Forests, Bagging, Boosting
- Gini impurity (stick to entropy per the lecture)
- Oblique / non-axis-aligned splits
- Pre-trained datasets (everything is generated via seeded PRNG)

## Good luck

When in doubt, imitate the regression site. It has been through 30+ rounds of student feedback; its patterns work.

Start by reading the live regression site, then this bootstrap directory in order, then begin Phase 0.
