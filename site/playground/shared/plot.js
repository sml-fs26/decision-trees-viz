// plot.js — D3-based visualization helpers for classification trees.
// Assumes d3 v7 is loaded globally as `window.d3`.

export const PALETTE = {
  classA:   '#B83280',
  classB:   '#3182CE',
  split:    '#E53E3E',
  pure:     '#27AE60',
  impure:   '#D4A017',
  truth:    '#D4A017',
  ink:      '#2a2a2a',
  inkMuted: '#6a6a6a',
  border:   '#e4dfd5',
  bg:       '#fbf8f3'
};

const d3 = () => window.d3;

// ------------------------------------------------------------
// Scatter plot with tree / boundary / split overlays.
// ------------------------------------------------------------
//
// opts: {
//   width, height, margin,
//   xDomain, yDomain,          // explicit so regenerates don't rescale
//   xLabel, yLabel,
//   data: { X1, X2, y }        // optional initial data
// }
//
// Handle: { svg, xScale, yScale, update, setTree, setBoundary, setSplit,
//           highlightIndices }
export function createScatter2D(container, opts = {}) {
  const D3 = d3();
  const {
    width   = 520,
    height  = 420,
    margin  = { top: 20, right: 20, bottom: 44, left: 52 },
    xDomain = [0, 10],
    yDomain = [0, 14],
    xLabel  = 'X₁ (hours studied)',
    yLabel  = 'X₂ (lectures attended)',
    data    = null
  } = opts;

  const innerW = width  - margin.left - margin.right;
  const innerH = height - margin.top  - margin.bottom;

  const root = D3.select(container).html('')
    .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'pg-scatter')
      .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = root.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = D3.scaleLinear().domain(xDomain).range([0, innerW]);
  const yScale = D3.scaleLinear().domain(yDomain).range([innerH, 0]);

  // Layer order: decision regions → true boundary → split line → points → axes
  const regionsG  = g.append('g').attr('class', 'regions');
  const boundaryG = g.append('g').attr('class', 'boundary');
  const splitG    = g.append('g').attr('class', 'splitline');
  const pointsG   = g.append('g').attr('class', 'points');

  const xAxisG = g.append('g').attr('class', 'axis').attr('transform', `translate(0,${innerH})`);
  const yAxisG = g.append('g').attr('class', 'axis');
  xAxisG.call(D3.axisBottom(xScale).ticks(6));
  yAxisG.call(D3.axisLeft(yScale).ticks(6));

  g.append('text').attr('class', 'axis-label')
    .attr('x', innerW / 2).attr('y', innerH + 36).attr('text-anchor', 'middle')
    .text(xLabel);
  g.append('text').attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2).attr('y', -38).attr('text-anchor', 'middle')
    .text(yLabel);

  let current = { X1: null, X2: null, y: null };
  let highlighted = null; // Set of point indices to flash red.

  function renderPoints() {
    if (!current.X1) return;
    const { X1, X2, y } = current;
    const arr = Array.from(X1, (_, i) => i);
    const pts = pointsG.selectAll('circle').data(arr, i => i);
    pts.enter().append('circle')
        .attr('r', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.75)
      .merge(pts)
        .attr('cx', i => xScale(X1[i]))
        .attr('cy', i => yScale(X2[i]))
        .attr('fill', i => (highlighted && highlighted.has(i))
          ? PALETTE.split
          : (y[i] === 1 ? PALETTE.classA : PALETTE.classB))
        .attr('opacity', i => (highlighted && highlighted.has(i)) ? 1 : 0.85);
    pts.exit().remove();
  }

  function update(data) {
    current = {
      X1: data.X1, X2: data.X2, y: data.y
    };
    renderPoints();
  }

  function setTree(tree) {
    regionsG.selectAll('*').remove();
    if (!tree) return;
    drawDecisionRegions(regionsG, tree, xScale, yScale, xDomain, yDomain);
  }

  function setBoundary(fn) {
    boundaryG.selectAll('*').remove();
    if (!fn) return;
    drawTrueBoundary(boundaryG, fn, xScale, yScale, xDomain, yDomain);
  }

  function setSplit(split) {
    splitG.selectAll('*').remove();
    if (!split) return;
    drawSplitLine(splitG, split.feature, split.threshold, xScale, yScale, innerW, innerH, xDomain, yDomain);
  }

  function highlightIndices(set) {
    highlighted = set && set.size > 0 ? set : null;
    renderPoints();
  }

  if (data) update(data);

  return {
    svg: root,
    xScale, yScale,
    update, setTree, setBoundary, setSplit, highlightIndices
  };
}

// ------------------------------------------------------------
// Decision regions: one rect per leaf, coloured by majority label.
// Walks the tree collecting axis-aligned bounding boxes.
// ------------------------------------------------------------
export function drawDecisionRegions(layer, tree, xScale, yScale, xDomain, yDomain) {
  const D3 = d3();
  const leaves = [];
  function walk(node, xmin, xmax, ymin, ymax) {
    if (node.type === 'leaf') {
      leaves.push({ xmin, xmax, ymin, ymax, label: node.label });
      return;
    }
    if (node.feature === 0) {
      walk(node.left,  xmin, Math.min(xmax, node.threshold), ymin, ymax);
      walk(node.right, Math.max(xmin, node.threshold), xmax, ymin, ymax);
    } else {
      walk(node.left,  xmin, xmax, ymin, Math.min(ymax, node.threshold));
      walk(node.right, xmin, xmax, Math.max(ymin, node.threshold), ymax);
    }
  }
  walk(tree, xDomain[0], xDomain[1], yDomain[0], yDomain[1]);

  D3.select(layer.node()).selectAll('rect.leaf')
    .data(leaves).enter().append('rect')
      .attr('class', 'leaf')
      .attr('x',  d => xScale(d.xmin))
      .attr('y',  d => yScale(d.ymax))
      .attr('width',  d => Math.max(0, xScale(d.xmax) - xScale(d.xmin)))
      .attr('height', d => Math.max(0, yScale(d.ymin) - yScale(d.ymax)))
      .attr('fill', d => d.label === 1 ? PALETTE.classA : PALETTE.classB)
      .attr('opacity', 0.18);
}

// Dashed red line for a candidate / chosen split.
export function drawSplitLine(layer, feature, threshold, xScale, yScale, innerW, innerH) {
  if (feature === 0) {
    const x = xScale(threshold);
    layer.append('line')
      .attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', innerH)
      .attr('stroke', PALETTE.split).attr('stroke-width', 2)
      .attr('stroke-dasharray', '6 4');
  } else {
    const y = yScale(threshold);
    layer.append('line')
      .attr('x1', 0).attr('x2', innerW).attr('y1', y).attr('y2', y)
      .attr('stroke', PALETTE.split).attr('stroke-width', 2)
      .attr('stroke-dasharray', '6 4');
  }
}

// ------------------------------------------------------------
// True boundary: marching-squares iso-contour at f = 0.5
// over a 60×60 grid. Draws gold dashed line segments.
// ------------------------------------------------------------
export function drawTrueBoundary(layer, boundaryFn, xScale, yScale, xDomain, yDomain) {
  const N = 60;
  const [x0, x1] = xDomain, [y0, y1] = yDomain;
  const dx = (x1 - x0) / N, dy = (y1 - y0) / N;
  const segs = [];

  function interp(a, b, fa, fb) {
    // a, b are [x,y]; fa, fb in {0,1}. Place on the midpoint (0.5 level).
    // Since fa != fb, use 0.5 as the crossing value.
    const t = (0.5 - fa) / (fb - fa);
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  }

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const xa = x0 + i * dx, xb = xa + dx;
      const ya = y0 + j * dy, yb = ya + dy;
      const v00 = boundaryFn(xa, ya);
      const v10 = boundaryFn(xb, ya);
      const v01 = boundaryFn(xa, yb);
      const v11 = boundaryFn(xb, yb);
      const idx = (v00 ? 1 : 0) | (v10 ? 2 : 0) | (v11 ? 4 : 0) | (v01 ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      const edges = [];
      // bottom edge (v00 - v10)
      if (v00 !== v10) edges.push(interp([xa,ya],[xb,ya], v00, v10));
      // right edge (v10 - v11)
      if (v10 !== v11) edges.push(interp([xb,ya],[xb,yb], v10, v11));
      // top edge (v01 - v11)
      if (v01 !== v11) edges.push(interp([xa,yb],[xb,yb], v01, v11));
      // left edge (v00 - v01)
      if (v00 !== v01) edges.push(interp([xa,ya],[xa,yb], v00, v01));
      // Usually 2 edges — connect them.
      for (let k = 0; k + 1 < edges.length; k += 2) {
        segs.push([edges[k], edges[k + 1]]);
      }
    }
  }

  for (const [p, q] of segs) {
    layer.append('line')
      .attr('x1', xScale(p[0])).attr('y1', yScale(p[1]))
      .attr('x2', xScale(q[0])).attr('y2', yScale(q[1]))
      .attr('stroke', PALETTE.truth).attr('stroke-width', 1.75)
      .attr('stroke-dasharray', '5 4')
      .attr('opacity', 0.9);
  }
}

// ------------------------------------------------------------
// Tree diagram via d3.hierarchy + d3.tree().
// ------------------------------------------------------------
export function drawTreeDiagram(container, tree, opts = {}) {
  const D3 = d3();
  const {
    width = 560,
    height = 380,
    margin = { top: 26, right: 20, bottom: 20, left: 20 }
  } = opts;

  const innerW = width  - margin.left - margin.right;
  const innerH = height - margin.top  - margin.bottom;

  D3.select(container).html('');
  const svg = D3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('class', 'pg-tree')
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Convert our tree into a d3-friendly structure.
  function toNode(n) {
    if (n.type === 'leaf') {
      return { kind: 'leaf', label: n.label, n: n.n, entropy: n.entropy };
    }
    return {
      kind: 'node',
      feature: n.feature,
      threshold: n.threshold,
      n: n.n,
      entropy: n.entropy,
      children: [toNode(n.left), toNode(n.right)]
    };
  }

  const root = D3.hierarchy(toNode(tree));
  const layout = D3.tree().size([innerW, innerH]);
  layout(root);

  // Links
  g.append('g').attr('class', 'links')
    .selectAll('path').data(root.links()).enter().append('path')
      .attr('d', D3.linkVertical().x(d => d.x).y(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', PALETTE.border)
      .attr('stroke-width', 1.5);

  const node = g.append('g').attr('class', 'nodes')
    .selectAll('g').data(root.descendants()).enter().append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

  node.append('circle')
    .attr('r', d => d.data.kind === 'leaf' ? 10 : 6)
    .attr('fill', d => {
      if (d.data.kind === 'leaf') {
        return d.data.label === 1 ? PALETTE.classA : PALETTE.classB;
      }
      return '#fff';
    })
    .attr('stroke', PALETTE.ink)
    .attr('stroke-width', 1.2);

  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', d => d.data.kind === 'leaf' ? 22 : -10)
    .attr('font-size', 11)
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', PALETTE.ink)
    .text(d => {
      if (d.data.kind === 'leaf') return `n=${d.data.n}`;
      const name = d.data.feature === 0 ? 'X₁' : 'X₂';
      return `${name} < ${d.data.threshold.toFixed(2)}`;
    });

  return { svg };
}
