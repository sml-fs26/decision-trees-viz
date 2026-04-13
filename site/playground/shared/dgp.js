// dgp.js — Data-generating process for the classification scenario.
//
// Story: each student has X1 = hours studied/week (0..10) and
// X2 = lectures attended out of 14 (0..14). The true decision rule
// decides whether they pass the exam (y=1) or fail (y=0). We flip
// each label with probability `noise` to model randomness the tree
// cannot (and should not) memorize.

// Mulberry32 PRNG — tiny, fast, deterministic from a 32-bit seed.
// Returns a function rng() -> uniform in [0,1).
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller: sample one standard normal using two uniforms from rng.
export function randn(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Continuous score functions for the true decision rule.
// Sign convention: score(x) > 0 ⇒ class 1, score(x) ≤ 0 ⇒ class 0.
// Exposing the *score* (not just the thresholded label) lets the plot
// code draw a smooth iso-contour at level 0 via marching squares —
// otherwise the contour snaps to grid midpoints and looks dashed/jagged.
export const TRUE_BOUNDARY = {
  linear:      (x1, x2) => (x1 + x2) - 12,
  circular:    (x1, x2) => ((x1 - 5) * (x1 - 5) + (x2 - 7) * (x2 - 7)) - 14,
  // Smooth max approximates x1>6 OR x2>10: positive iff either margin is positive.
  disjunction: (x1, x2) => Math.max(x1 - 6, x2 - 10),
  // Tilted wavy band: combined effort (X1 + X2) must exceed a gently
  // oscillating threshold. Strictly monotone in both features (more
  // hours AND more lectures only ever helps), but non-linear and
  // non-axis-aligned, so a tree has to staircase-approximate it.
  // ∂score/∂x1 = 1 − 0.9·cos(0.9·x1) ≥ 0.1 > 0, and ∂score/∂x2 = 1.
  wavy:        (x1, x2) => (x1 + x2) - (10 + Math.sin(0.9 * x1))
};

// Generate n labelled 2D points. Returns parallel typed arrays.
// opts: { noise (flip probability, default 0.15), boundary in {'linear','circular','disjunction','wavy'} }.
export function generateData(n = 150, seed = 42, opts = {}) {
  const { noise = 0.15, boundary = 'wavy' } = opts;
  const score = TRUE_BOUNDARY[boundary];
  if (!score) throw new Error(`Unknown boundary: ${boundary}`);

  const rng = seededRandom(seed);
  const X1 = new Float64Array(n);
  const X2 = new Float64Array(n);
  const y  = new Int8Array(n);

  for (let i = 0; i < n; i++) {
    const x1 = rng() * 10;
    const x2 = rng() * 14;
    let label = score(x1, x2) > 0 ? 1 : 0;
    // Independent label flip with probability `noise`.
    if (rng() < noise) label = 1 - label;
    X1[i] = x1;
    X2[i] = x2;
    y[i]  = label;
  }

  return { X1, X2, y };
}
