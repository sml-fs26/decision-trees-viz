# Lecture content — Classification Trees

Source: `smlLecture9.handout.pdf` from the ETH course "Stochastics and Machine Learning" (Spring 2026), chapter 15 (slides ~544–556 and a few further pages). This file is the **authoritative content** for the site — the visualization must cover all of this.

---

## Learning objectives (slide 545)

By the end of the lecture, students should be able to:
- Understand what a classification tree is and how it models input-output relationships
- Formally define a tree as a partition of ℝᵈ with associated labels
- Measure the quality of splits using entropy and information gain
- Explain and implement the greedy training algorithm for constructing decision trees
- Understand practical considerations such as overfitting and interpretability

---

## Why this matters (slide 546)

- **Interpretable Models**: Trees offer visual, rule-based structures that are easy to explain
- **Foundational Technique**: Basis for powerful ensemble methods (Random Forests, Gradient Boosted Trees)
- **Non-linear Decision Boundaries**: Unlike linear models, trees can model complex relationships
- **Low Preprocessing**: Handle both numerical and categorical features with minimal scaling
- **Real-world Applications**: Medical diagnosis, fraud detection, risk assessment, customer segmentation

*Key one-liner from the slide*: "Decision trees are a gateway into interpretable and powerful machine learning."

---

## Trees, informally (slides 547–549)

Three visualizations are shown:
1. A partition of ℝ² with axis-aligned splits (horizontal and vertical lines)
2. A more complex axis-aligned partition (more cuts, nested rectangles)
3. A partition with slanted / oblique splits (pink lines at angles)

**The key idea**: a tree is a function that induces a **partition** of the feature space.

A **classification tree** additionally assigns a **label** to each part of the partition. The labels come from a predefined set of classes.

Visually: red triangles (△) and blue inverted triangles (▽) are placed on the 2D grid. The tree draws pink lines that split the space into regions, and each region is associated with the majority class on that side.

Formally:
> A classification tree is a function t: ℝᵈ → labels.

---

## Formal definition (slide 550)

A **partition** of ℝᵈ is a tuple (S₁, …, S_K) of disjoint subsets whose union is ℝᵈ:
- Sᵢ ∩ Sⱼ = ∅ for i ≠ j
- S₁ ∪ ⋯ ∪ S_K = ℝᵈ

A **classification tree** is a sequence of pairs (S₁, ℓ₁), …, (S_K, ℓ_K), where each ℓᵢ ∈ {1, …, M}.

The induced function is t: ℝᵈ → {1, …, M}, where t(x) = ℓᵢ if x ∈ Sᵢ.

Given a dataset D = {(x₁, y₁), …, (xₙ, yₙ)} ⊂ ℝᵈ × {1, …, M}, the tree t induces a partition of D into D₁, …, D_K (where Dᵢ is the subset of D whose x's fall in Sᵢ).

---

## Loss function for training trees (slide 551)

> The quality of a tree t on a dataset D is measured by the randomness of the partitions D₁, …, D_K.

**Entropy** is used to measure this randomness. If pⱼ is the fraction of label j in D, then:

$$H(D) = -\sum_{j=1}^{M} p_j \log_2 p_j$$

Lower entropy = purer partition = higher tree quality.

---

## Examples of entropy (slide 552)

Three small 2D examples with red and blue triangles:

**Example 1**: balanced (half red, half blue)
$$p_1 = p_2 = \tfrac{1}{2} \Rightarrow H(D) = -\left(\tfrac{1}{2}\log_2 \tfrac{1}{2} + \tfrac{1}{2}\log_2 \tfrac{1}{2}\right) = 1$$

**Example 2**: 75% one class, 25% the other
$$p_1 = \tfrac{3}{4},\ p_2 = \tfrac{1}{4} \Rightarrow H(D) \approx 0.56$$

**Example 3**: pure
$$p_1 = 0,\ p_2 = 1 \Rightarrow H(D) = 0$$

Visualisation idea for the site: an entropy bar that lights up as the student hovers over different regions. Pure regions glow green (H=0); fully mixed regions glow gold (H=1 for binary).

---

## Entropy, axiomatically (slide 553)

Entropy is a measure of randomness in a random variable. It is the **unique** function (up to a scaling constant) satisfying:

1. H(X) ≥ 0
2. If X, Y are independent: H(X, Y) = H(X) + H(Y)
3. H(X) is maximised when X is uniform

The unique function is:
$$H(X) = -\sum_{x \in \mathcal{X}} \mathbb{P}(X = x) \log \mathbb{P}(X = x) \quad \text{(discrete)}$$
$$H(X) = -\int p(x) \log p(x)\, dx \quad \text{(continuous)}$$

Site suggestion: a small sidebar or optional deep-dive box covering this axiomatic derivation. Not every student needs it, but it answers "why this formula?" cleanly.

---

## Training algorithm — summary (slide 554)

Given a dataset D:
1. Find a **partitioning line** that best splits D
2. Let D_L and D_R be the two resulting subsets
3. Recursively apply the same procedure to D_L and D_R
4. The final result is a decision tree built according to the best partitions found at each step

---

## Training algorithm — definitions (slide 555)

A **partitioning line** is a pair (f, t):
- f is a feature (which axis to split on)
- t is a threshold (where along that axis)

Applying (f, t) to dataset D yields:
$$D_L = \{x \in D : x_f < t\}, \quad D_R = \{x \in D : x_f \geq t\}$$

The **quality of a split** is:
$$Q(D, f, t) = \frac{|D_L|}{|D|} H(D_L) + \frac{|D_R|}{|D|} H(D_R)$$

Goal: choose (f, t) that **minimizes** Q(D, f, t).

(Note: minimizing weighted entropy of children is equivalent to maximizing *information gain* = H(D) − Q(D, f, t). The slide uses the minimization form.)

---

## Training algorithm — implementation (slide 556)

Pseudocode:

```
def train(D):
    if H(D) == 0:
        return leaf(y)     where y is the only label appearing in D
    else:
        (f, t) = argmin over (f, t) of Q(D, f, t)
        let D_L, D_R be the parts resulting from (f, t)
        return node(
            condition: x_f >= t,
            left: train(D_L),    # the "No" branch (x_f < t)
            right: train(D_R)    # the "Yes" branch (x_f >= t)
        )
```

The diagram on the slide shows a decision node with "f ≥ t?" and two branches labelled "No" → train(D_L) and "Yes" → train(D_R).

---

## Practical considerations (explicitly listed in learning objectives; exact slides beyond 556 not fully visible but expected to cover)

The site should address (even if the slides only briefly mention):

- **Overfitting**: a deep tree fits training data perfectly but memorizes noise. Introduce via a train/test split — training accuracy → 100%, test accuracy crashes.
- **Depth limit as a regularizer**: a hyperparameter that caps how deep the tree can grow. Slider.
- **Minimum leaf size**: another regularizer — don't split nodes with < k samples.
- **Pruning** (post-hoc): grow full tree, then collapse branches that don't improve validation accuracy. (Optional — may be beyond scope.)
- **Interpretability**: read a trained tree as a series of nested `if-then-else` rules.
- **Imbalanced classes**: accuracy can be misleading. Brief mention of precision/recall.

---

## What's NOT in scope (per the slides)

- Regression trees (the slides only cover classification)
- Ensemble methods — Random Forests, Bagging, Boosting, Gradient Boosted Trees — these are in the "Why this matters" as motivation but are **not taught** in this lecture. A later lecture will cover them. Do not build interactives for these; at most, tease them as "next steps".
- Oblique (non-axis-aligned) splits. The slide briefly shows them on slide 547 as one of three examples, but the formal treatment is axis-aligned only.
- Specific impurity measures other than entropy (e.g., Gini, misclassification error). Stick to entropy.
- Cost-complexity pruning / CART's formal pruning. Keep it informal.

---

## How the site should map onto this content

| Slide(s) | Site manifestation |
|----------|-------------------|
| 545 Learning objectives | Hero / intro paragraph of Page 2 (tree-builder) |
| 546 Why this matters | Landing page one-liner + brief card captions |
| 547–549 Visual intuition | Page 1 (data-intro) stages 1–4: partitions appear, labels appear |
| 550 Formal definition | Page 1 stage 5 — KaTeX block with the formalism |
| 551 Loss function | Page 2 stage 3 — introduce entropy |
| 552 Examples of entropy | Page 2 stage 3 — interactive entropy calculator |
| 553 Axiomatic entropy | Optional collapsible sidebar on Page 2 |
| 554 Algorithm summary | Page 2 stage 4–5 — user sees the automation |
| 555 Algorithm definitions | Page 2 stages 2–3 — (f, t) pair, Q(D,f,t) |
| 556 Implementation pseudocode | Page 2 stage 6 — pseudocode callout |
| Practical: overfitting | Page 2 stage 7 — train/test split reveals the overfit tree |
