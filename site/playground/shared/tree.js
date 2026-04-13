// tree.js — binary classification tree (entropy splits, greedy training).
//
// Tree data structure (discriminated union):
//   Leaf: { type:'leaf', label, n, entropy, indices }
//   Node: { type:'node', feature, threshold, left, right, n, entropy }
//
// X is passed as [X1Array, X2Array] (two parallel typed arrays of equal length).
// y is a (typed) int array of 0/1 labels.

// Entropy H(D) = -Σ p_j log2 p_j, with 0·log 0 := 0.
export function entropy(labels) {
  const n = labels.length;
  if (n === 0) return 0;
  let c0 = 0, c1 = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] === 0) c0++; else c1++;
  }
  let h = 0;
  if (c0 > 0) { const p = c0 / n; h -= p * Math.log2(p); }
  if (c1 > 0) { const p = c1 / n; h -= p * Math.log2(p); }
  return h;
}

// Weighted entropy Q(D,f,t). Denominator is |D_L|+|D_R|.
export function splitQuality(leftLabels, rightLabels) {
  const nL = leftLabels.length, nR = rightLabels.length;
  const tot = nL + nR;
  if (tot === 0) return 0;
  return (nL / tot) * entropy(leftLabels) + (nR / tot) * entropy(rightLabels);
}

// Gather labels at the given indices into a plain Array.
function gather(y, indices) {
  const out = new Array(indices.length);
  for (let i = 0; i < indices.length; i++) out[i] = y[indices[i]];
  return out;
}

// Best split over features and midpoints of sorted unique values within `indices`.
// Returns {feature, threshold, quality, leftIdx, rightIdx} or null if no split
// strictly reduces weighted entropy below the parent entropy.
export function bestSplit(X, y, indices) {
  const n = (indices === undefined) ? X[0].length : indices.length;
  if (indices === undefined) {
    indices = new Array(n);
    for (let i = 0; i < n; i++) indices[i] = i;
  }
  if (n < 2) return null;

  const parentLabels = gather(y, indices);
  const parentH = entropy(parentLabels);
  if (parentH === 0) return null;

  let best = null;

  for (let f = 0; f < X.length; f++) {
    const col = X[f];
    // Sort indices by feature value.
    const sorted = indices.slice().sort((a, b) => col[a] - col[b]);
    // Iterate midpoints between consecutive distinct feature values.
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = col[sorted[i]], b = col[sorted[i + 1]];
      if (a === b) continue;
      const t = 0.5 * (a + b);
      const leftIdx = [], rightIdx = [];
      const leftLab = [], rightLab = [];
      for (let k = 0; k < indices.length; k++) {
        const idx = indices[k];
        if (col[idx] < t) { leftIdx.push(idx); leftLab.push(y[idx]); }
        else              { rightIdx.push(idx); rightLab.push(y[idx]); }
      }
      if (leftIdx.length === 0 || rightIdx.length === 0) continue;
      const q = splitQuality(leftLab, rightLab);
      if (best === null || q < best.quality) {
        best = { feature: f, threshold: t, quality: q, leftIdx, rightIdx };
      }
    }
  }

  if (best === null) return null;
  // Require strict improvement over the parent's entropy.
  if (!(best.quality < parentH)) return null;
  return best;
}

// Majority label of a label array; ties break to 1 (arbitrary but stable).
function majority(labels) {
  let c0 = 0, c1 = 0;
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] === 0) c0++; else c1++;
  }
  return c1 >= c0 ? 1 : 0;
}

// Recursive greedy builder.
export function train(X, y, opts = {}) {
  const { maxDepth = null, minLeafSize = 1 } = opts;
  const n = X[0].length;
  const allIdx = new Array(n);
  for (let i = 0; i < n; i++) allIdx[i] = i;

  function build(indices, depth) {
    const labels = gather(y, indices);
    const h = entropy(labels);
    const makeLeaf = () => ({
      type: 'leaf',
      label: majority(labels),
      n: indices.length,
      entropy: h,
      indices: indices.slice()
    });

    if (h === 0) return makeLeaf();
    if (indices.length < Math.max(2, minLeafSize * 2)) return makeLeaf();
    if (maxDepth !== null && depth >= maxDepth) return makeLeaf();

    const split = bestSplit(X, y, indices);
    if (split === null) return makeLeaf();
    if (split.leftIdx.length < minLeafSize || split.rightIdx.length < minLeafSize) {
      return makeLeaf();
    }

    return {
      type: 'node',
      feature: split.feature,
      threshold: split.threshold,
      left:  build(split.leftIdx,  depth + 1),
      right: build(split.rightIdx, depth + 1),
      n: indices.length,
      entropy: h
    };
  }

  return build(allIdx, 0);
}

// Predict for a single sample x = [x1, x2].
export function predict(tree, x) {
  let node = tree;
  while (node.type === 'node') {
    node = x[node.feature] < node.threshold ? node.left : node.right;
  }
  return node.label;
}

// Batch predict. X = [X1Array, X2Array]. Returns Int8Array of labels.
export function predictBatch(tree, X) {
  const n = X[0].length;
  const out = new Int8Array(n);
  const x = [0, 0];
  for (let i = 0; i < n; i++) {
    x[0] = X[0][i]; x[1] = X[1][i];
    out[i] = predict(tree, x);
  }
  return out;
}

export function accuracy(tree, X, y) {
  const n = X[0].length;
  const preds = predictBatch(tree, X);
  let hits = 0;
  for (let i = 0; i < n; i++) if (preds[i] === y[i]) hits++;
  return hits / n;
}

export function treeDepth(tree) {
  if (tree.type === 'leaf') return 0;
  return 1 + Math.max(treeDepth(tree.left), treeDepth(tree.right));
}

export function treeLeaves(tree) {
  if (tree.type === 'leaf') return 1;
  return treeLeaves(tree.left) + treeLeaves(tree.right);
}
