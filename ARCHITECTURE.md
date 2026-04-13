# Architecture — decision-trees-viz

## Directory structure

```
decision-trees-viz/
├── README.md
├── LICENSE
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Pages deploy, push to main
└── site/                              # Everything under here is served via Pages
    ├── index.html                     # Landing page (hero + 2 cards)
    └── playground/
        ├── data-intro.html            # Page 1: meet the data (5-stage Bruner spiral)
        ├── tree-builder.html          # Page 2: Dr. Quinlan builds a tree (7 stages)
        └── shared/
            ├── dgp.js                 # Seeded PRNG + 2D classification data generator
            ├── tree.js                # Entropy, split search, greedy training, prediction
            ├── plot.js                # D3 helpers: scatter, decision regions, tree diagram
            └── style.css              # Design tokens + component styles
```

Scope is deliberately small: two main pages plus a landing. No hub. No issue pages. No ensembles. See `01_PLAN.md` for the reasoning.

## Module conventions

All JS is written as **ES modules**. Every HTML page that needs JS loads it with `<script type="module">`.

### `shared/dgp.js` — data generator

```js
// Exports:
export function seededRandom(seed) { /* mulberry32 */ }
export function randn(rng) { /* Box-Muller */ }

export function generateData(n = 150, seed = 42) {
  // Returns: { X1: number[], X2: number[], y: number[] }
  // X1, X2 in some visible 2D range
  // y in {0, 1}
  // Includes label noise so the problem isn't trivial
}

export const TRUE_PARAMS = {
  // Whatever specifies the true DGP — e.g., the true decision boundary function
  // Used by plotting code to overlay the truth
};
```

### `shared/tree.js` — classification tree

```js
// Tree data structure (discriminated union):
//   Leaf: { type: 'leaf', label: number, n: number, entropy: number }
//   Node: { type: 'node', feature: 0|1, threshold: number, left: Tree, right: Tree, n: number, entropy: number }

export function entropy(labels) { /* H(D) */ }
export function splitQuality(leftLabels, rightLabels) { /* Q(D,f,t) */ }
export function bestSplit(X, y) {
  // X: n × d matrix (array of arrays)
  // y: n-vector
  // Returns: { feature: int, threshold: number, quality: number, leftIdx: number[], rightIdx: number[] }
  // Or null if no split reduces entropy
}
export function train(X, y, { maxDepth = null, minLeafSize = 1 } = {}) { /* returns Tree */ }
export function predict(tree, x) { /* single prediction */ }
export function predictBatch(tree, X) { /* batch */ }
export function accuracy(tree, X, y) { /* classification accuracy */ }
export function treeDepth(tree) { /* max depth */ }
export function treeLeaves(tree) { /* count of leaves */ }
```

### `shared/plot.js` — D3 helpers

```js
export const PALETTE = { classA: '#B83280', classB: '#3182CE', split: '#E53E3E', ... };

export function createScatter2D(container, opts) {
  // Returns a handle with .update(newData), .setTree(tree), .setBoundary(fn), etc.
}

export function drawDecisionBoundary(svg, tree, xScale, yScale) {
  // Paint the tree's partition as coloured rectangles behind points
}

export function drawSplitLine(svg, feature, threshold, xScale, yScale) {
  // Dashed vertical or horizontal line across the plot
}

export function drawTree(container, tree) {
  // Node-link diagram via d3.hierarchy + d3.tree layout
}
```

## Page template

Every page in `site/playground/` should follow this skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>… — decision-trees-viz</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <link rel="stylesheet" href="./shared/style.css" />
  <script defer src="https://d3js.org/d3.v7.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}]});"></script>
</head>
<body>
  <!-- Content -->

  <script type="module">
    import { generateData, seededRandom } from './shared/dgp.js';
    import { train, predict, accuracy } from './shared/tree.js';
    import { PALETTE, createScatter2D, drawDecisionBoundary, drawTree } from './shared/plot.js';
    // Page-specific logic here
  </script>
</body>
</html>
```

## GitHub Pages deploy

`.github/workflows/deploy.yml` — copy verbatim from `reference/deploy.yml`. Trigger: push to `main`. Output: publish `site/` directory to GitHub Pages.

Required repo settings:
- Settings → Pages → Source: **GitHub Actions**
- Settings → Actions → General → Workflow permissions: **Read and write permissions**

## State management across stages

For multi-stage scrollytelling pages, centralize state in a `state` object:

```js
const state = {
  activeStage: 1,
  seed: 42,
  n: 150,
  treeDepth: 3,
  sample: null,
  currentTree: null,
  // ...
};

function regenerate() { state.sample = generateData(state.n, state.seed); /* ... */ }
function renderStage(n) { state.activeStage = n; /* dispatch */ }
```

Use an IntersectionObserver with fine threshold steps to detect the dominant visible stage, picking the one with the highest visible ratio (avoids race conditions — see the regression site's implementation).

## Testing without a dev server

- For local preview, run `python3 -m http.server 8000` in the repo root and open `http://localhost:8000/site/playground/`. ES modules need a server (won't work via `file://`).
- For JS syntax checking, use `node --check` on extracted script blocks, or `new Function(code)` on the inline module body (minus the `import` lines).

## Don't

- Don't commit `.DS_Store` or editor files. Use a `.gitignore` with standard macOS/IDE entries.
- Don't embed large datasets in JS files; generate via PRNG.
- Don't break the studying-DGP-like determinism: same seed → same data, always.
