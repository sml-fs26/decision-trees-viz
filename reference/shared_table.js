// table.js — render a regression coefficient table.
// createRegressionTable(container) -> { update(olsResult, opts?) }
// olsResult: the object returned by ols() in regression.js.
// opts: { varNames: [...] } — labels for each coefficient (intercept first).

export function createRegressionTable(container) {
  const root = document.createElement('div');
  root.className = 'pg-regtable';
  container.innerHTML = '';
  container.appendChild(root);

  function fmt(x, d = 3) {
    if (!isFinite(x)) return '—';
    return x.toFixed(d);
  }
  function fmtP(p) {
    if (!isFinite(p)) return '—';
    if (p < 0.001) return '<0.001';
    return p.toFixed(3);
  }

  function render(result, opts = {}) {
    if (!result) { root.innerHTML = '<p class="muted">No fit yet.</p>'; return; }
    const names = opts.varNames || result.coefficients.map((_, i) => i === 0 ? 'Intercept' : `x${i}`);
    const rows = result.coefficients.map((b, i) => {
      const se = result.se[i];
      const t = result.tStats[i];
      const p = result.pValues[i];
      const sig = isFinite(p) && p < 0.05 ? 'yes' : 'no';
      return `
        <tr>
          <td>${escape(names[i])}</td>
          <td class="num">${fmt(b)}</td>
          <td class="num">${fmt(se)}</td>
          <td class="num">${fmt(t, 2)}</td>
          <td class="num">${fmtP(p)}</td>
          <td class="sig ${sig === 'yes' ? 'sig-yes' : 'sig-no'}">${sig === 'yes' ? '✓' : ''}</td>
        </tr>`;
    }).join('');

    root.innerHTML = `
      <table class="pg-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th class="num">Coef</th>
            <th class="num">SE</th>
            <th class="num">t</th>
            <th class="num">p</th>
            <th>Sig (α=.05)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="pg-regsummary">
        <span><strong>R²</strong> ${fmt(result.r2)}</span>
        <span><strong>n</strong> ${result.n}</span>
        <span><strong>Residual SE</strong> ${fmt(result.residSE)}</span>
      </div>
    `;
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  render(null);
  return { update: render };
}
