// dgp.js — Data-generating process for the exam-score scenario.
// The analyst observes X1 (hours studied), X2 (lectures attended), X3 (self-
// assessed performance). U (self-discipline) is unobserved. Y is exam score.
//
// DGP:
//   U  ~ N(0,1)
//   X1 = 2 + 0.5*U + eta1,    eta1 ~ N(0, sd=sqrt(0.5))
//   X2 = 10 + 1.5*U + eta2,   eta2 ~ N(0, sd=sqrt(2))
//   eps ~ N(0, variance = 2*|X1|)      -> heteroscedastic
//   Y  = 50 + 8*log(X1) + 3*X2 + 6*U + eps
//   X3 = 0.9*Y + eta3,        eta3 ~ N(0, sd=2)   (a collider / post-outcome variable)
//
// Notes:
//  - gamma_2 = 1.5 (U -> X2) and beta_U = 6 (U -> Y) are set deliberately
//    large so omitted-variable bias is dramatic when U is ignored. With
//    these values, the plim of the short regression Y ~ X2 alone lands
//    near ~5 while the true beta_2 = 3 — an unmissable ~70% overstatement.
//  - Variances in the spec are interpreted literally — e.g. eta1 has
//    variance 0.5 (sd = sqrt(0.5)); eps has variance 2*|X1|.

export const TRUE_BETAS = {
  intercept: 50,
  beta1: 8,   // coefficient on log(X1)
  beta2: 3,   // coefficient on X2
  betaU: 6    // coefficient on U (direct effect of self-discipline on Y)
};

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

// Generate n observations from the exam DGP. Returns parallel arrays.
export function generateData(n, seed) {
  const rng = seededRandom(seed);
  const U = new Float64Array(n);
  const X1 = new Float64Array(n);
  const X2 = new Float64Array(n);
  const X3 = new Float64Array(n);
  const Y = new Float64Array(n);

  const sdEta1 = Math.sqrt(0.5);
  const sdEta2 = Math.sqrt(2.0);
  const sdEta3 = 2.0;

  for (let i = 0; i < n; i++) {
    const u = randn(rng);
    const eta1 = randn(rng) * sdEta1;
    const eta2 = randn(rng) * sdEta2;
    const eta3 = randn(rng) * sdEta3;

    let x1 = 2 + 0.5 * u + eta1;
    // Guard against non-positive X1 so log(X1) stays defined.
    if (x1 <= 0.05) x1 = 0.05;
    const x2 = 10 + 1.5 * u + eta2;

    const epsSd = Math.sqrt(2.0 * Math.abs(x1));
    const eps = randn(rng) * epsSd;

    const y = 50 + 8 * Math.log(x1) + 3 * x2 + 6 * u + eps;
    const x3 = 0.9 * y + eta3;

    U[i] = u; X1[i] = x1; X2[i] = x2; X3[i] = x3; Y[i] = y;
  }

  return { U, X1, X2, X3, Y };
}

// Convenience: compute mean of an array-like.
export function mean(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}
