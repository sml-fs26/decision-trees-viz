# decision-trees-viz — bootstrap

This directory contains bootstrap instructions and reference files for building an interactive website about **classification trees** in the style of the existing regression playground at https://github.com/carloscotrini/sml_lab_26.

## For the human operator

1. Clone the target repo: `git clone git@github.com:sml-fs26/decision-trees-viz.git`
2. Copy the CONTENTS of this bootstrap directory into the repo (or put them in a sibling `bootstrap/` folder at the repo root).
3. Open a new Claude Code session in the repo root.
4. Instruct Claude Code to read `00_CONTEXT.md` first, then follow the phased plan.

## Files in this bootstrap

```
00_CONTEXT.md        – initial briefing for the new Claude instance (read first)
01_PLAN.md           – multi-phase build plan (foundation → pages → issues)
STYLE_GUIDE.md       – visual design conventions (palette, typography, boxes)
ARCHITECTURE.md      – folder structure and module patterns
SLIDES_CONTENT.md    – extracted lecture content (transcribed from the slides)
PEDAGOGY.md          – the Bruner-spiral philosophy + character conventions
reference/           – actual files from the regression playground to study
├── README.md        – what each reference file demonstrates
├── shared_*.js      – shared JS modules (PRNG, regression, plotting)
├── shared_style.css – CSS tokens and component styles
├── example_*.html   – exemplary pages at different levels of complexity
```

## Scope note

This is a substantial project (weeks of work). Launch multiple agents in parallel where possible — see `01_PLAN.md` for the breakdown.
