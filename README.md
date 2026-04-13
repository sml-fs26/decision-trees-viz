# decision-trees-viz

Interactive pedagogical website teaching **classification trees**, built for the ETH Zurich course *Stochastics and Machine Learning* (Spring 2026, lecture 15).

Companion to the regression site at https://carloscotrini.github.io/sml_lab_26/playground/.

## Live site

https://sml-fs26.github.io/decision-trees-viz/

## Local preview

ES modules require a real server:

```
python3 -m http.server 8000
# open http://localhost:8000/site/
```

## Layout

```
site/
├── index.html                      landing page (hero + 2 cards)
└── playground/
    ├── data-intro.html             Page 1 — meet the data (5-stage spiral)
    ├── tree-builder.html           Page 2 — Dr. Quinlan builds a tree (7 stages)
    └── shared/
        ├── dgp.js                  seeded PRNG + 2D classification generator
        ├── tree.js                 entropy, split search, greedy training
        ├── plot.js                 D3 helpers: scatter, decision regions, tree diagram
        └── style.css               design tokens + component styles
```

## Deploy

Pushed to `main` → GitHub Actions (`.github/workflows/deploy.yml`) publishes `site/` to GitHub Pages.

Bootstrap documents (planning, pedagogy, style, reference) live at the repo root for the agents working on the build.
