// regression.js — OLS with classical and HC1 robust standard errors.
// Pure-JS implementation using the normal equations (X'X)^{-1} X'y.
// Suitable for small-to-moderate p (a handful of regressors).
//
// Input convention: X is an array of rows. Each row is an array of regressor
// values WITHOUT the intercept. This module prepends the intercept column.
// y is a 1-D array.

// ---------- tiny matrix helpers ----------

function matMulT(A, B) {
  // returns A^T * B, where A is (n x p) and B is (n x q) given as row arrays.
  const n = A.length;
  const p = A[0].length;
  const q = B[0].length;
  const out = Array.from({ length: p }, () => new Array(q).fill(0));
  for (let i = 0; i < n; i++) {
    const ai = A[i], bi = B[i];
    for (let r = 0; r < p; r++) {
      const air = ai[r];
      for (let c = 0; c < q; c++) out[r][c] += air * bi[c];
    }
  }
  return out;
}

function matVecT(A, y) {
  // returns A^T * y
  const n = A.length;
  const p = A[0].length;
  const out = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    const ai = A[i], yi = y[i];
    for (let r = 0; r < p; r++) out[r] += ai[r] * yi;
  }
  return out;
}

function invertSymmetric(M) {
  // Gauss-Jordan with partial pivoting. M is p x p.
  const p = M.length;
  const A = M.map(row => row.slice());
  const I = Array.from({ length: p }, (_, i) => {
    const r = new Array(p).fill(0); r[i] = 1; return r;
  });
  for (let col = 0; col < p; col++) {
    // pivot
    let piv = col;
    let maxAbs = Math.abs(A[col][col]);
    for (let r = col + 1; r < p; r++) {
      if (Math.abs(A[r][col]) > maxAbs) { maxAbs = Math.abs(A[r][col]); piv = r; }
    }
    if (maxAbs < 1e-12) throw new Error('Singular matrix in OLS (regressors collinear?)');
    if (piv !== col) { [A[col], A[piv]] = [A[piv], A[col]]; [I[col], I[piv]] = [I[piv], I[col]]; }
    const d = A[col][col];
    for (let c = 0; c < p; c++) { A[col][c] /= d; I[col][c] /= d; }
    for (let r = 0; r < p; r++) {
      if (r === col) continue;
      const f = A[r][col];
      if (f === 0) continue;
      for (let c = 0; c < p; c++) { A[r][c] -= f * A[col][c]; I[r][c] -= f * I[col][c]; }
    }
  }
  return I;
}

// Prepend a 1 column to each row of X.
function withIntercept(X) {
  return X.map(row => [1, ...row]);
}

// Student-t two-sided p-value (Hill 1970 approximation, good enough for display).
function tPValue(t, df) {
  const x = df / (df + t * t);
  // regularized incomplete beta (df/2, 1/2) at x via continued fraction
  const p = betaIncReg(df / 2, 0.5, x);
  return Math.max(0, Math.min(1, p));
}

// Regularized incomplete beta I_x(a,b) via continued fraction (Numerical Recipes style).
function betaIncReg(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  // Lentz's method
  const MAX = 200, EPS = 1e-12;
  let c = 1, d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; h *= d * c;
    aa = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return front * h;
}

// Lanczos log-Gamma.
function lgamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// ---------- public API ----------

// Ordinary least squares. y is length-n array. X is n-by-p (array of rows),
// WITHOUT intercept — an intercept column of 1s is added automatically.
export function ols(y, X) {
  const n = y.length;
  if (X.length !== n) throw new Error('X and y have mismatched length');
  const Xi = withIntercept(X);
  const p = Xi[0].length;

  const XtX = matMulT(Xi, Xi);
  const Xty = matVecT(Xi, y);
  const XtXinv = invertSymmetric(XtX);

  // beta = XtXinv * Xty
  const coefficients = new Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    let s = 0;
    for (let j = 0; j < p; j++) s += XtXinv[i][j] * Xty[j];
    coefficients[i] = s;
  }

  // fitted, residuals
  const fittedValues = new Array(n);
  const residuals = new Array(n);
  let rss = 0;
  for (let i = 0; i < n; i++) {
    let yhat = 0;
    const row = Xi[i];
    for (let j = 0; j < p; j++) yhat += row[j] * coefficients[j];
    fittedValues[i] = yhat;
    const r = y[i] - yhat;
    residuals[i] = r;
    rss += r * r;
  }

  // total SS
  let ybar = 0; for (let i = 0; i < n; i++) ybar += y[i]; ybar /= n;
  let tss = 0; for (let i = 0; i < n; i++) { const d = y[i] - ybar; tss += d * d; }
  const r2 = tss > 0 ? 1 - rss / tss : 0;

  // classical SE: sigma^2 * (X'X)^{-1}
  const df = Math.max(1, n - p);
  const sigma2 = rss / df;
  const residSE = Math.sqrt(sigma2);

  const se = new Array(p);
  for (let i = 0; i < p; i++) se[i] = Math.sqrt(Math.max(0, sigma2 * XtXinv[i][i]));
  const tStats = coefficients.map((b, i) => (se[i] > 0 ? b / se[i] : NaN));
  const pValues = tStats.map(t => (isFinite(t) ? tPValue(t, df) : NaN));

  return {
    coefficients, se, tStats, pValues, r2, residuals, fittedValues,
    n, p, df, residSE, XtXinv, designMatrix: Xi
  };
}

// HC1 sandwich robust SE. Returns a length-p array of robust standard errors.
// Inputs mirror ols() inputs; `coefficients` and `residuals` come from the ols result.
export function robustSE(y, X, coefficients, residuals) {
  const Xi = withIntercept(X);
  const n = Xi.length;
  const p = Xi[0].length;
  const XtX = matMulT(Xi, Xi);
  const XtXinv = invertSymmetric(XtX);

  // meat = sum_i (e_i^2) x_i x_i'
  const meat = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < n; i++) {
    const e2 = residuals[i] * residuals[i];
    const xi = Xi[i];
    for (let r = 0; r < p; r++) {
      const xr = xi[r] * e2;
      for (let c = 0; c < p; c++) meat[r][c] += xr * xi[c];
    }
  }

  // sandwich = XtXinv * meat * XtXinv
  const tmp = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < p; i++)
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let k = 0; k < p; k++) s += XtXinv[i][k] * meat[k][j];
      tmp[i][j] = s;
    }
  const sandwich = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < p; i++)
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let k = 0; k < p; k++) s += tmp[i][k] * XtXinv[k][j];
      sandwich[i][j] = s;
    }

  // HC1 scales by n/(n-p)
  const scale = n / Math.max(1, n - p);
  const se = new Array(p);
  for (let i = 0; i < p; i++) se[i] = Math.sqrt(Math.max(0, scale * sandwich[i][i]));
  return se;
}

// OLS + normal-approx confidence intervals at level 1 - alpha.
export function olsWithCI(y, X, alpha = 0.05) {
  const result = ols(y, X);
  // z-approx; fine for display in the playground.
  const z = 1.959963984540054; // for alpha = 0.05
  const zVal = alpha === 0.05 ? z : normalQuantile(1 - alpha / 2);
  const ciLower = result.coefficients.map((b, i) => b - zVal * result.se[i]);
  const ciUpper = result.coefficients.map((b, i) => b + zVal * result.se[i]);
  return { ...result, ciLower, ciUpper, alpha };
}

// Inverse standard normal CDF (Acklam's approximation).
function normalQuantile(p) {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
             1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
             6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
             3.754408661907416e+00];
  const plow = 0.02425, phigh = 1 - plow;
  let q, r;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  if (p <= phigh) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
          ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
}
