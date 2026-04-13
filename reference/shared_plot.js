// plot.js — D3-based scatter plotting helpers for the playground.
// Assumes d3 v7 is loaded globally as `d3`.

const PALETTE = {
  olsblue: '#2E5EA8',
  truthgold: '#D4A017',
  biasred: '#C0392B',
  repairgreen: '#27AE60',
  neutral: '#7F8C8D'
};

// Create a scatter plot inside `container`. `data` is an object with parallel
// arrays keyed by variable name, e.g. { X1: [...], Y: [...], U: [...] }.
// Options: { xVar, yVar, colorVar, width, height, xLabel, yLabel }.
// Returns a handle: { update(newData, opts?), svg, xScale, yScale }.
export function createScatterPlot(container, data, opts = {}) {
  const {
    xVar = 'X1', yVar = 'Y', colorVar = 'U',
    width = 440, height = 320,
    xLabel, yLabel
  } = opts;

  const margin = { top: 16, right: 16, bottom: 42, left: 52 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const root = d3.select(container).html('')
    .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'pg-scatter')
      .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = root.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().range([0, innerW]);
  const yScale = d3.scaleLinear().range([innerH, 0]);
  const colorScale = d3.scaleLinear()
    .range([PALETTE.olsblue, PALETTE.truthgold]);

  const xAxisG = g.append('g').attr('transform', `translate(0,${innerH})`).attr('class', 'axis');
  const yAxisG = g.append('g').attr('class', 'axis');

  g.append('text').attr('class', 'axis-label')
    .attr('x', innerW / 2).attr('y', innerH + 34).attr('text-anchor', 'middle')
    .text(xLabel || xVar);
  g.append('text').attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2).attr('y', -38).attr('text-anchor', 'middle')
    .text(yLabel || yVar);

  const pointsG = g.append('g').attr('class', 'points');
  const overlayG = g.append('g').attr('class', 'overlays');

  let current = { xVar, yVar, colorVar };

  function render(d, o = {}) {
    Object.assign(current, o);
    const xs = d[current.xVar], ys = d[current.yVar], cs = d[current.colorVar];
    const xExt = d3.extent(xs), yExt = d3.extent(ys);
    // pad extents a little for breathing room
    const xPad = (xExt[1] - xExt[0]) * 0.05 || 1;
    const yPad = (yExt[1] - yExt[0]) * 0.05 || 1;
    xScale.domain([xExt[0] - xPad, xExt[1] + xPad]);
    yScale.domain([yExt[0] - yPad, yExt[1] + yPad]);
    if (cs) colorScale.domain(d3.extent(cs));

    xAxisG.call(d3.axisBottom(xScale).ticks(6));
    yAxisG.call(d3.axisLeft(yScale).ticks(6));

    const pts = pointsG.selectAll('circle').data(Array.from(xs), (_, i) => i);
    pts.enter().append('circle')
        .attr('r', 3)
        .attr('opacity', 0.7)
      .merge(pts)
        .attr('cx', (_, i) => xScale(xs[i]))
        .attr('cy', (_, i) => yScale(ys[i]))
        .attr('fill', (_, i) => cs ? colorScale(cs[i]) : PALETTE.olsblue);
    pts.exit().remove();

    // Clear any overlays — caller redraws with drawFittedLine / drawTrueCurve.
    overlayG.selectAll('*').remove();
  }

  render(data);

  return {
    svg: root,
    overlayG,
    xScale, yScale, colorScale,
    getCurrentVars: () => ({ ...current }),
    update(newData, o = {}) { render(newData, o); }
  };
}

// Draw fitted line on SVG overlay using coefficients [b0, b1] (simple regression
// of y on x). For multiple regression, pass an xRange and a coefficient-applying
// function via drawFittedCurve instead.
export function drawFittedLine(handle, b0, b1, xRange) {
  const { xScale, yScale, overlayG } = handle;
  const [x0, x1] = xRange;
  overlayG.append('line')
    .attr('class', 'fitted-line')
    .attr('x1', xScale(x0)).attr('y1', yScale(b0 + b1 * x0))
    .attr('x2', xScale(x1)).attr('y2', yScale(b0 + b1 * x1))
    .attr('stroke', '#111')
    .attr('stroke-width', 1.75);
}

// Draw an arbitrary curve (the "true" DGP curve) via a function x -> y.
// Gold, dashed.
export function drawTrueCurve(handle, curveFn, xRange, steps = 80) {
  const { xScale, yScale, overlayG } = handle;
  const [x0, x1] = xRange;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + (x1 - x0) * (i / steps);
    pts.push([x, curveFn(x)]);
  }
  const line = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1]));
  overlayG.append('path')
    .attr('class', 'true-curve')
    .attr('d', line(pts))
    .attr('fill', 'none')
    .attr('stroke', PALETTE.truthgold)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6 4');
}

export { PALETTE };
