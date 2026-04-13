# Reference files from the regression playground

These are verbatim copies from https://github.com/carloscotrini/sml_lab_26 (`site/playground/...`). Study them to understand the patterns you should follow. Don't copy them into the new repo as-is — they're for study.

## Shared modules (study these first)

- **`shared_dgp.js`** — the data generator. Notice the seeded `mulberry32` PRNG, `randn` (Box-Muller), and how `generateData` returns arrays. Pattern to match in your `tree.js` + `dgp.js`.
- **`shared_regression.js`** — the OLS module. You'll replace this with a `tree.js` module for classification tree training / prediction / entropy. Same modular export pattern.
- **`shared_plot.js`** — D3 helpers for scatter plots, fitted lines, the palette constants. Your version will need decision-region painting and tree-diagram drawing in addition.
- **`shared_style.css`** — CSS tokens (colours, typography, box styles). Use as a template; swap the regression-specific palette for the classification palette in `STYLE_GUIDE.md`.
- **`shared_table.js`** — regression output table. You may not need this for trees; replace with something like a "tree summary" component (depth, leaves, training accuracy).

## Exemplary pages (study their structure)

### Main narrative pages

- **`example_dgp-intro.html`** — Bruner-spiral introduction to the DGP. This is the blueprint for your Page 1 (`data-intro.html`). Notice:
  - 6-stage scrollytelling layout (narrative left, sticky viz right)
  - Persistent top bar with formula tracker + character widget
  - IntersectionObserver picks the dominant stage by highest visible ratio
  - KaTeX delimiters configured in the `onload` handler
  - Each stage has its own `render` function, state object centralises parameters

- **`example_dgp-estimator.html`** — scaffolded introduction to OLS with Dr. Gauss. This is the blueprint for your Page 2 (`tree-builder.html`). Notice:
  - Dr. Gauss character with avatar in a "gauss-card"
  - Stage 2: "fit by hand" with draggable sliders for intercept/slope, live SSR counter, residual sticks
  - Stage 3: reveal the loss function, show closed-form OLS
  - Stage 4: multivariate extension (3D plane)
  - Stage 5: uncertainty — resampling, histogram, SE/CI/p-value
  - Stage 6: "what a stat package would show" — R-style regression output table

### One more pedagogical example

- **`example_issues_misspecification.html`** — the Dr. Bishop polynomial regression page. Good example of:
  - Introducing a new character mid-site (useful inspiration for Dr. Quinlan's avatar + card)
  - Small dataset (10 points) for clarity
  - Degree slider showing underfit / good fit / overfit
  - Reference to Bishop's PRML figure 1.4 style
  - Universal approximator narrative
  - Study especially how the character is introduced visually and how the slider drives the main plot.

## Infrastructure

- **`deploy.yml`** — the GitHub Pages deploy workflow. Copy this verbatim into `.github/workflows/deploy.yml` in the new repo. Adjusts path: the workflow uploads the `site/` directory.

## What to take away

When you read these files, notice in particular:
1. **The scroll bug fix**: IntersectionObserver with 21 fine threshold steps + highest-ratio dispatch. Naive thresholds cause stages to flicker.
2. **The clipPath pattern**: fitted lines and residuals have a clip-path so they don't overshoot the plot area when slopes are extreme.
3. **The `clearAll()` idempotency**: every stage-render function starts with `clearAll()` so scrolling up and down doesn't accumulate artifacts.
4. **The character cards**: small SVG avatars, consistent accent colour per character.
5. **KaTeX delimiters in HTML attributes**: `\\[` in the HTML source (two backslashes) is correct. `\\\\[` (four) silently breaks.
