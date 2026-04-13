# 01 — Build plan for decision-trees-viz

**Scope decision (from the operator)**: no hub + issue pages. No ensembles. The site is a focused, fun, entertaining illustration of the concepts in `SLIDES_CONTENT.md` — nothing more, nothing less.

Two deliverables: Page 1 introduces the data/trees visually; Page 2 scaffolds the training algorithm with Dr. Quinlan.

---

## Phase 0: Repo setup (yourself, 30 min)

1. Verify you're on `main` in `/Users/carloscotrini/Documents/git_sml_lecture/decision-trees-viz/`.
2. Create the directory skeleton:
   ```
   site/
   ├── index.html                     (landing page)
   └── playground/
       ├── data-intro.html            (Page 1: meet the data)
       ├── tree-builder.html          (Page 2: Dr. Quinlan builds a tree)
       └── shared/
           ├── dgp.js                  (seeded PRNG + 2D classification generator)
           ├── tree.js                 (entropy, split search, greedy training, prediction)
           ├── plot.js                 (D3 helpers: scatter, decision regions, tree diagram)
           └── style.css               (design tokens + component styles)
   .github/workflows/deploy.yml        (copy from reference/deploy.yml)
   README.md
   .gitignore                          (node_modules, .DS_Store, etc.)
   ```
3. Copy `reference/deploy.yml` verbatim to `.github/workflows/deploy.yml`.
4. Enable GitHub Pages in the repo's settings → Pages → Source: **GitHub Actions**.
5. Settings → Actions → General → Workflow permissions → **Read and write**.
6. Push a placeholder `site/index.html` and verify the Action deploys successfully at https://sml-fs26.github.io/decision-trees-viz/.

Do not proceed to Phase 1 until the deploy works.

---

## Phase 1: Shared foundation (1 agent, ~2–3 hours)

Launch one careful agent. Phase 2 depends on everything here.

### Deliverables

**`site/playground/shared/dgp.js`** — the classification DGP
- `seededRandom(seed)` — mulberry32 PRNG (copy from `reference/shared_dgp.js`)
- `randn(rng)` — Box-Muller standard normal (copy)
- `generateData(n = 150, seed = 42)` → `{X1: number[], X2: number[], y: number[]}`
- Suggested DGP (see `PEDAGOGY.md` for rationale):
  - X1 ~ Uniform(0, 10)  (hours studied)
  - X2 ~ Uniform(0, 14)  (lectures attended)
  - **True boundary**: default `y = 1 if X1 + X2 > 12 else 0`. Add 5 % label noise (flip each y with probability 0.05) — makes the problem realistic, shows trees can't memorize noise forever.
  - Export `TRUE_BOUNDARY` (a function or threshold constant) so plotting code can overlay the truth.
- Alternative to expose as a slider: a parameter that switches between linear boundary (X1 + X2 > 12), circular boundary (X1² + X2² > R²), and disjunction ((X1 > 6) OR (X2 > 10)). Lets Page 2 show a staircase approximation.

**`site/playground/shared/tree.js`** — the tree classifier
- Tree is a discriminated union:
  - Leaf: `{ type: 'leaf', label, n, entropy, indices }`
  - Node: `{ type: 'node', feature, threshold, left, right, n, entropy }`
- `entropy(labels: number[])` — returns H(D) = −Σ pⱼ log₂ pⱼ
- `splitQuality(leftLabels, rightLabels)` — weighted-sum entropy Q(D, f, t)
- `bestSplit(X, y)` — iterates over each feature and each midpoint between sorted unique values, returns `{feature, threshold, quality, leftIdx, rightIdx}` or `null` if no split reduces entropy
- `train(X, y, {maxDepth = null, minLeafSize = 1} = {})` — recursive greedy builder
- `predict(tree, x)` — single sample
- `predictBatch(tree, X)` — batch
- `accuracy(tree, X, y)` — fraction correctly classified
- `treeDepth(tree)`, `treeLeaves(tree)` — utilities for the tree summary

Sanity-check in a throwaway page: train on `generateData(200, 42)` with `maxDepth = 3`, verify accuracy is around 85-92 %. If it's 100 %, your label noise isn't being generated.

**`site/playground/shared/plot.js`** — D3 helpers
- `PALETTE` — `{ classA, classB, split, pure, impure, truth }` with the colors from `STYLE_GUIDE.md`
- `createScatter2D(container, opts)` — returns a handle with `.update(data)`, `.setTree(tree)`, `.setBoundary(fn)`
- `drawDecisionRegions(svg, tree, xScale, yScale, width, height)` — paints colored rectangles (one per leaf) behind the points. Use a canvas-inside-svg if performance matters, else SVG `<rect>` per leaf
- `drawSplitLine(svg, feature, threshold, xScale, yScale)` — a red dashed line for a candidate or chosen split
- `drawTrueBoundary(svg, boundaryFn, xScale, yScale)` — gold dashed line or curve for the ground truth
- `drawTreeDiagram(container, tree, width, height)` — node-link diagram via `d3.hierarchy` + `d3.tree()`. Internal nodes labelled with "X_f < t", leaves colored by label

**`site/playground/shared/style.css`** — design tokens
- Copy structure from `reference/shared_style.css`.
- Swap the regression palette for the classification palette (see `STYLE_GUIDE.md`).
- Keep the toy-story / key-insight / warning / repair box classes.

**`site/index.html`** — landing page
- Hero with title "Classification Trees" + subtitle "An interactive visualization of lecture 15"
- Two big cards: "Meet the data →" (`playground/data-intro.html`) and "Build a tree →" (`playground/tree-builder.html`)
- Brief paragraph tying back to the course context
- Footer link to the companion regression site at `https://carloscotrini.github.io/sml_lab_26/`

### Verify Phase 1 before Phase 2

A minimal visual test: create `site/playground/_test.html` that calls `generateData(200, 42)`, trains a tree at depth 3, and renders both the decision regions and the tree diagram side by side. If both look reasonable, the foundation is solid. Delete `_test.html` before committing (or gitignore it).

---

## Phase 2: Two main pages (2 agents in parallel, ~4 hours each)

Everything below runs after Phase 1 is complete and committed.

### Agent A → `site/playground/data-intro.html`

Scrollytelling page introducing classification visually. Match the structure of `reference/example_dgp-intro.html`. Five stages:

1. **Two students** — Alice (hours = 3, lectures = 6) and Bob (hours = 7, lectures = 11) appear on a 2D plot. Same axes: X1 = hours, X2 = lectures.
2. **A label appears** — Alice passed, Bob failed (or vice versa). Colour each. Now the reader sees that classification means attaching a label to each point.
3. **The cohort arrives** — 150 students appear, coloured by their class. The 2D structure is visible but messy.
4. **The true boundary** — reveal the ground-truth rule as a gold dashed line (or curve). "Somewhere out there, a rule decides the label. Our job is to learn it from the data."
5. **The formal setup** — KaTeX block:
   - A **partition** of ℝᵈ is a tuple (S₁, …, S_K) with Sᵢ ∩ Sⱼ = ∅ and ⋃Sᵢ = ℝᵈ
   - A **classification tree** is (S₁, ℓ₁), …, (S_K, ℓ_K)
   - Induced function t: ℝᵈ → {1, …, M}
   - Tie to the slides verbatim so students can match notation when they revisit their notes.

Controls:
- Seed input + regenerate button
- "Show true boundary" toggle
- "Noise level" slider (0 to 0.2) — more noise means more mixed labels near the boundary

At the end, a teaser: "Now how do we *find* the partition from the data? Meet Dr. Quinlan →".

### Agent B → `site/playground/tree-builder.html`

The centerpiece. Scaffolded Bruner-spiral introduction to the training algorithm with Dr. Quinlan. Match the structure of `reference/example_dgp-estimator.html`. Seven stages:

1. **Meet Dr. Quinlan** — character intro (small SVG avatar, see `PEDAGOGY.md`). He inherits the cohort from Page 1 and says "let me classify these students. I'll start with one split."

2. **One hand-placed split** — Dr. Quinlan (the user) drags a **vertical line** across the plot. Counter: "Misclassified: X / 150". As the line moves, counter updates. Wrong-side dots flash red. This is pure *enactive* learning. After a beat, also allow horizontal splits (toggle "split on X₂ instead").

3. **Entropy as quality measure** — replace the misclassification counter with entropy. KaTeX:
   \[ H(D) = -\sum_{j} p_j \log_2 p_j \]
   Show the three examples from the slides interactively:
   - 50/50 (H = 1)
   - 75/25 (H ≈ 0.56)
   - pure (H = 0)
   Then compute H(D_L) and H(D_R) live as the user moves the split. Show the weighted quality:
   \[ Q(D, f, t) = \frac{|D_L|}{|D|} H(D_L) + \frac{|D_R|}{|D|} H(D_R) \]
   As a live line plot of Q vs threshold below the main scatter. The student watches the minimum form.

4. **Automated best split** — "Dr. Quinlan doesn't guess. He tries every threshold and picks the minimum." Show a 2-D heatmap of Q(f, t) over (feature, threshold). The minimum cell lights up. When the user clicks "apply best split", the split line snaps to the optimal position.

5. **Recursion** — "Now do the same on each side." Add a depth slider (0 to 6). As depth increases, new splits appear, partition refines, tree diagram on the right grows. Watch training accuracy climb. Two tied visualizations:
   - Left: scatter with decision regions painted behind points
   - Right: tree diagram (node-link), each node labelled "X_f < t", leaves coloured by majority class

6. **The algorithm in pseudocode** — the code box from slide 556:
   ```
   def train(D):
       if H(D) == 0:
           return leaf(y)
       else:
           (f, t) = argmin over (f, t) of Q(D, f, t)
           let D_L, D_R = split D by (f, t)
           return node(f, t, train(D_L), train(D_R))
   ```
   Briefly walk through the base case and the recursive case.

7. **What happens without a depth limit** — honest moment. Set max depth to ∞. Show training accuracy → 100 % but overlay a separate 200-sample test set. Test accuracy drops. Narrative: "Dr. Quinlan just memorized the noise. A small depth limit is a cheap but effective safeguard." Slider to scrub max depth from 1 to ∞ — students watch test accuracy peak and then fall. This is the single honest practical consideration from the learning objectives.

Use the 3D rotation / drag / IntersectionObserver patterns from the regression site where relevant. A `clearAll()` function at the top of every stage-render function is non-negotiable (see reference pages).

### Parallelism

Agents A and B write to different files with no cross-dependencies after Phase 1. Launch them in parallel.

---

## Phase 3: Polish (serial, ~3–4 hours)

After both pages are built and committed:

- **KaTeX pass** — scan every page for raw `\[`, `\(`, `$$` that didn't render. Fix delimiter configuration per `reference/KATEX_GOTCHAS.md`.
- **Scroll bug test** — scroll each scrollytelling page top → bottom → top → bottom. Any visual artifacts? Fix via idempotent `clearAll()`.
- **Mobile** — resize to 400px width. Does the layout stack? Are widgets usable with touch?
- **Accessibility** — keyboard nav (tab through controls), `prefers-reduced-motion`, ARIA labels on sliders.
- **Linking** — landing → Page 1 → Page 2 → back to landing. All navigation works.
- **Commit hygiene** — meaningful commit messages, no `.DS_Store` committed.

---

## Total estimate

| Phase | Agents | Serial/Parallel | Hours |
|-------|--------|-----------------|-------|
| 0 Repo setup | 0 (you) | Serial | 0.5 |
| 1 Foundation | 1 | Serial | 2–3 |
| 2 Pages | 2 | Parallel | 4 wall-clock |
| 3 Polish | 1 | Serial | 3–4 |

Wall-clock: ~10–12 hours. Plus your review time after each phase.

## What the finished site looks like

- Landing page with two cards
- **Page 1** (data-intro): 5-stage scrollytelling that ends with the formal partition definition
- **Page 2** (tree-builder): 7-stage scrollytelling that ends with the train/test overfit reveal
- Everything deployed at https://sml-fs26.github.io/decision-trees-viz/
- Every learning objective from the slides addressed
- No issue pages. No ensembles. No regression trees. Just a clean, fun, entertaining walkthrough of classification trees.
