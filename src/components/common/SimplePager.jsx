import React, { useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';

export default function SimplePager({
  pageIndex,
  pageSize,
  totalRows,
  onPageIndexChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 250],
  className
}) {
  const safePageSize = Math.max(1, Number(pageSize) || 25);
  const safePageIndex = Math.max(0, Number(pageIndex) || 0);
  const total = Math.max(0, Number(totalRows) || 0);
  const pageCount = safePageSize > 0 ? Math.max(1, Math.ceil(total / safePageSize)) : 1;

  const fromRow = total === 0 ? 0 : Math.min(total, safePageIndex * safePageSize + 1);
  const toRow = total === 0 ? 0 : Math.min(total, safePageIndex * safePageSize + safePageSize);

  const canPrev = safePageIndex > 0;
  const canNext = safePageIndex + 1 < pageCount;

  const effectiveOptions = useMemo(() => {
    const uniq = Array.from(new Set(pageSizeOptions.map((n) => Math.max(1, Number(n) || 0)).filter(Boolean)));
    uniq.sort((a, b) => a - b);
    return uniq;
  }, [pageSizeOptions]);

  return (
    <div className={`d-flex align-items-center justify-content-between ${className || ''}`}>
      <div className="fs-10">
        <span className="me-2">
          <span className="d-none d-sm-inline">Showing </span>
          <span className="fw-semibold">{fromRow}–{toRow}</span>
          <span className="d-none d-sm-inline"> of </span>
          <span className="d-inline d-sm-none"> / </span>
          <span className="fw-semibold">{total}</span>
          <span className="d-none d-sm-inline"> entries</span>
        </span>
        <span className="ms-2">Rows per page:</span>
        <Form.Select
          size="sm"
          className="w-auto d-inline-block ms-2"
          value={safePageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value) || 25)}
        >
          {effectiveOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Form.Select>
      </div>

      <div className="d-flex gap-2">
        <Button
          size="sm"
          variant={canPrev ? 'primary' : 'tertiary'}
          disabled={!canPrev}
          onClick={() => onPageIndexChange?.(safePageIndex - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant={canNext ? 'primary' : 'tertiary'}
          disabled={!canNext}
          onClick={() => onPageIndexChange?.(safePageIndex + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

