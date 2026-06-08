import React from 'react';
import { Badge } from 'react-bootstrap';

function toPercentNumber(value) {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value).trim();
  if (!s) return null;
  const n = Number.parseFloat(s.replace('%', ''));
  return Number.isFinite(n) ? n : null;
}

export default function RateBadge({ value }) {
  const pct = toPercentNumber(value);
  if (pct == null) return value ?? '—';

  const bucket = pct > 90 ? 'good' : pct > 50 ? 'warn' : 'bad';
  const className =
    bucket === 'good'
      ? 'text-success'
      : bucket === 'warn'
        ? 'text-primary'
        : 'text-danger';

  return (
    <span className={`badge fs-10 ${className}`} style={{ backgroundColor: 'transparent' }}>
      {pct.toFixed(2)}%
    </span>
  );
}

