import React, { forwardRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const OssLeadColumnHeader = forwardRef(function OssLeadColumnHeader(props, ref) {
  void ref;
  const label = props.displayName ?? '';
  const showLabel = String(label).trim().length > 0;
  return (
    <div
      className={`d-flex align-items-center w-100 h-100 overflow-hidden${showLabel ? ' gap-2' : ''}${
        showLabel ? '' : ' justify-content-center'
      }`}
    >
      <span className="text-500 flex-shrink-0">
        <FontAwesomeIcon icon="bars" fixedWidth />
      </span>
      {showLabel ? <span className="text-truncate lh-sm">{label}</span> : null}
    </div>
  );
});

export function parsePctValue(pct, value) {
  if (value != null && Number.isFinite(Number(value))) {
    return Math.min(100, Math.max(0, Number(value)));
  }
  const s = String(pct ?? '').replace(/%/g, '').trim();
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

/** OSS MT unified % bands: ≥90 green, 50–89 yellow (middle tier), below 50 red */
export function ossPctTier(v) {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 90) return 'hi';
  if (n >= 50) return 'mid';
  return 'lo';
}

export function pctLabel(pct, v) {
  if (pct != null && pct !== '') {
    const s = String(pct);
    return s.includes('%') ? s : `${s}%`;
  }
  return `${v.toFixed(2)}%`;
}

export function fmtNum(v, digits = 2) {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

export function fmtInt(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return String(v);
  return Math.round(n).toLocaleString();
}

function resolveColField(params) {
  const cd = params?.colDef ?? params?.column?.getColDef?.();
  const fromDef = cd?.field ?? cd?.colId;
  if (fromDef) return fromDef;
  if (typeof params?.column?.getColId === 'function') {
    const id = params.column.getColId();
    if (id) return id;
  }
  return null;
}

export function SenderTrafficValueCell(props) {
  const d = props.data ?? {};
  const n = Number(props.value);
  if (d.rowKind === 'client') {
    return <span className="oss-mt-cell-plain fs-10 text-800">{fmtInt(props.value)}</span>;
  }
  const field = resolveColField(props);
  const trendKey = field ? `${field}Trend` : null;
  const trend = trendKey ? d[trendKey] : null;
  if (!Number.isFinite(n) || n === 0 || !trend) {
    return <span className="oss-mt-cell-plain fs-10 text-800">{fmtInt(props.value)}</span>;
  }
  return (
    <span className={`oss-trend-pill oss-trend-pill--${trend}`}>
      <FontAwesomeIcon icon={trend === 'up' ? 'caret-up' : 'caret-down'} className="oss-trend-pill__icon" />
      <span className="oss-trend-pill__label">{fmtInt(props.value)}</span>
    </span>
  );
}

export function OssPctTintCell(props) {
  const d = props.data ?? {};
  const field = resolveColField(props) || 'dlrPct';
  const pct = d[field];
  const v = parsePctValue(pct, d[`${field}Value`]);
  const label = pctLabel(pct, v);
  if (!Number.isFinite(v) || v <= 0) {
    return <span className="oss-mt-cell-plain fs-10 text-700">{label}</span>;
  }
  const tier = ossPctTier(v);
  const fillW = Math.min(100, Math.max(0, v));
  return (
    <div className="oss-pct-tint">
      <div
        className={`oss-pct-tint__bar oss-pct-tint__bar--${tier}`}
        style={{ width: `${fillW}%` }}
      />
      <span className="oss-pct-tint__label fs-10 fw-semibold">{label}</span>
    </div>
  );
}

export function SenderIdAgCell(props) {
  const ctx = props.context || {};
  const { toggleExpand, expandedSender, detailLoadingKey } = ctx;
  const d = props.data || {};
  if (d.rowKind === 'client') {
    const cn = d.clientName || '—';
    return (
      <span className="ps-4 fs-10 text-800 oss-sender-client-name text-truncate d-inline-block min-w-0 w-100" title={String(cn)}>
        {cn}
      </span>
    );
  }
  const sid = d.senderId != null ? String(d.senderId) : '';
  return (
    <div className="d-flex align-items-center gap-1 text-900 fs-10 min-w-0 w-100">
      <button
        type="button"
        className="btn btn-link btn-sm px-1 py-0 text-600 lh-1 oss-sender-expand flex-shrink-0"
        aria-label={expandedSender === d.senderId ? 'Collapse' : 'Expand'}
        title="Clients under this Sender ID"
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand?.(d.senderId);
        }}
      >
        <FontAwesomeIcon icon={expandedSender === d.senderId ? 'chevron-down' : 'chevron-right'} fixedWidth />
      </button>
      <span className="fw-medium text-truncate min-w-0" title={sid}>
        {d.senderId}
      </span>
      {expandedSender === d.senderId && detailLoadingKey === d.senderId ? (
        <Spinner animation="border" size="sm" variant="secondary" className="ms-1" />
      ) : null}
    </div>
  );
}
