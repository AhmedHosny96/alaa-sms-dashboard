import React from 'react';

// Profit margin = (profit / revenue) * 100, where profit = "My Payout" (revenue - cost).
// Returns null when there is no revenue to compute a meaningful percentage from.
const computeMargin = (revenue, profit) => {
  const r = Number(revenue);
  const p = Number(profit);
  if (!Number.isFinite(r) || r === 0 || !Number.isFinite(p)) return null;
  return (p / r) * 100;
};

// Plain-text variant for CSV/PDF/print exports.
export const profitPercentText = (revenue, profit) => {
  const pct = computeMargin(revenue, profit);
  if (pct == null) return '—';
  return `${pct.toFixed(2)}%`;
};

// Colored cell: green for profit (>= 0), red for loss (< 0), grey dash when no revenue.
const ProfitPercentCell = ({ revenue, profit }) => {
  const pct = computeMargin(revenue, profit);
  if (pct == null) return <span className="text-700">—</span>;
  const cls = pct < 0 ? 'text-danger' : 'text-success';
  return <span className={`${cls} fw-semibold`}>{pct.toFixed(2)}%</span>;
};

export default ProfitPercentCell;
