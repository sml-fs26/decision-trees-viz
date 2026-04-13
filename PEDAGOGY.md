# Pedagogy — decision-trees-viz

## The Bruner spiral

Jerome Bruner's thesis: any subject can be taught to any learner at any age, provided you build the conceptual scaffolding one level at a time and revisit each concept at increasing depth. Applied here:

1. **Enactive** — first encounter with classification is through dragging a split line manually (acting on the data). The student physically "builds" the first tree.
2. **Iconic** — then we show the split as an image: coloured regions on a 2D plot. The student sees what their action did.
3. **Symbolic** — only then do we write the formal math: entropy, Q(D,f,t), the recursive algorithm.

This order is **non-negotiable**. Don't dump H(D) = −Σⱼ pⱼ log₂ pⱼ on the first page. Let the student want to know what formalises what they just did.

## Character-driven narrative

The regression site has:
- **Alice and Bob**: two students with the same observable characteristics but different outcomes. They carry the narrative.
- **Charlie, David, Evelyn**: a new cohort who need predictions.
- **Dr. Gauss**: a researcher who introduces OLS.
- **Dr. Bishop**: a researcher who introduces polynomial regression.

Named characters stick. They humanize abstractions. They let the teacher call back ("remember Alice?") across many sections.

### Suggested character cast for trees

- **Students**: keep Alice and Bob if you want continuity with the regression site. They now have a class label ("passed the exam" / "failed") instead of a score. Or introduce new students — e.g., **Priya** and **Marcus** — as the cohort for trees-specific work.
- **Researcher 1 — Dr. Quinlan**: the main character who builds the first tree. Named for Ross Quinlan (inventor of ID3, C4.5, C5.0 — the foundational tree algorithms). Curious, methodical, starts simple.
- **Researcher 2 — Dr. Breiman** (optional, if you cover bagging / random forests elsewhere): named for Leo Breiman (CART, random forests). Can appear in a "beyond a single tree" extension page.
- **Dr. Gauss** (cameo): if you want a throughline between the two sites, Dr. Gauss can appear at the start saying "my linear model couldn't capture this non-linear boundary. You'll need a new tool."

## Suggested DGP

Simple and visualizable:
- X₁ = hours studied per week (0 to 10)
- X₂ = lectures attended out of 14 (0 to 14)
- y = 1 if the student passed the exam, 0 if they failed

**True decision rule** (DGP): a student passes if their composite effort exceeds a threshold. Options:
- Linear boundary: `y = 1 if X₁ + X₂ > 12 else 0` — lets trees show staircase approximation of a diagonal
- Curved boundary: `y = 1 if X₁² + 0.3·X₂² > 40 else 0` — more interesting
- Disjunction: `y = 1 if (X₁ > 6) OR (X₂ > 10) else 0` — tree should handle this exactly with a couple of splits

Add **label noise**: flip each label with probability `noise_rate` (default 0.05). This makes the problem realistic — no tree can achieve 100% accuracy, and overfit trees memorize the noise.

## Scaffolding order (for the tree-builder page)

1. **One hand-placed split** (enactive). The student drags a vertical line; misclassified dots flash red as they drag. The student feels the problem.
2. **Show the misclassification count** as a live number. That's the first "loss".
3. **Introduce entropy** as a smoother measure than counting. Why? Because you can take a derivative. But more importantly: it captures *how mixed* a region is, not just how many are wrong.
4. **Automate the search**: "what if we tried every possible threshold?" Show the Q(D,f,t) curve over thresholds. The minimum is the best split.
5. **Apply to both features**: "we should also try horizontal splits." Now the Q is a 2D heatmap over (feature, threshold). The global minimum is where we should split.
6. **Recurse**: now do the same on each side. Suddenly the student sees a tree forming.
7. **Formal algorithm** (symbolic): the pseudocode from slide 556.

## What each interactive should do

| Interactive | Mechanism | Takeaway |
|-------------|-----------|----------|
| Drag a split line | Slider on threshold | The split splits the space |
| See misclassification count | Live number | Not all splits are equal |
| See Q(D,f,t) curve | Line plot below the scatter | Entropy is smooth, has a minimum |
| See Q(D,f,t) heatmap | 2D heatmap of (feature, threshold) | Best split found automatically |
| Depth limit slider | Slider 0..10 | Deeper trees fit training better but may overfit |
| Train/test split toggle | Button "show test data" | Overfitting is visible on held-out data |

## Key insights students should walk away with

1. A tree partitions the feature space into axis-aligned rectangles and assigns a label to each.
2. Entropy quantifies impurity; a pure region has entropy 0, uniform binary has entropy 1.
3. The greedy algorithm picks the single best split at each step.
4. Deeper trees fit training data better but can overfit — students see this live on the last stage of Page 2 (the train/test reveal).
5. Trees are naturally interpretable as "if-then-else" rules — this falls out of the node-link diagram on Page 2.

Everything else (greedy blunder, staircase approximation, class imbalance, interpretability as rules, categorical features) is beyond the scope of this site. The operator explicitly scoped it to the slides.

## Voice

Second person, conversational, but precise. Short sentences. Questions to the reader. Italics for emphasis. Mirror the tone of the regression site — if in doubt, read `reference/example_dgp-intro.html` and match its voice.

### Good

> Watch what happens when Dr. Quinlan moves the split line to the right. More dots land on the "passed" side — but some of them shouldn't be there. Those are his mistakes. The number in the corner counts them.

### Bad

> The threshold parameter determines the partition boundary. As the threshold increases, the cardinality of the right subset grows, and the misclassification count changes accordingly.

(Same information; second version sounds like a thesis.)

## Don't

- Don't teach Gini impurity unless you also teach why it's an alternative to entropy. The lecture uses entropy — stick to it.
- Don't introduce random forests or boosting on the main pages. They belong in an extension or a separate site — your scope is classification trees.
- Don't assume students remember anything from the regression site. Every concept used here (PRNG, DGP, resampling, accuracy) should be briefly re-introduced.
