import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableSearchInput from 'components/common/TableSearchInput';
import TableSelectFilter from 'components/common/TableSelectFilter';
import { TableExportSelect } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { exportRowsByType } from 'utils/tableExport';
import SimplePager from 'components/common/SimplePager';
import './RateCardNumbers.scss';

// Same payout plan tiers as the Rate Card so the Test Numbers table reads as a ratecard.
const PAYOUT_TIERS = ['1/1', '7/1', '7/7', '15/15', '15/30', '30/15', '30/30', '30/45', '30/60'];

const tierKey = (tier) => `payout_${tier.replace('/', '_')}`;

const formatPayout = (val) => {
  if (val == null || val === '') return '—';
  const num = Number(val);
  if (Number.isNaN(num)) return '—';
  return num.toFixed(3);
};

const toRow = (dto) => {
  // Per-tier payouts saved during number registration.
  const tierPayouts = dto.tierPayouts || {};
  // Back-compat: numbers saved with a single payment term + payout.
  const singlePayout = dto.myPayout ?? dto.agentPayout;
  const row = {
    id: dto.id,
    range: dto.rangeName,
    prefix: dto.rangePrefix,
    testNumber: dto.msisdn,
    currency: 'USD'
  };
  PAYOUT_TIERS.forEach((tier) => {
    let val = tierPayouts[tier];
    if (val == null && (dto.paymentTerm || '').trim() === tier) {
      val = singlePayout;
    }
    row[tierKey(tier)] = val ?? null;
  });
  return row;
};

function sortRows(rows, sort) {
  if (!sort?.key) return rows;
  const mult = sort.dir === 'desc' ? -1 : 1;
  const key = sort.key;
  return [...rows].sort((a, b) => {
    let va = a[key];
    let vb = b[key];
    if (key.startsWith('payout_')) {
      va = va == null ? -1 : Number(va);
      vb = vb == null ? -1 : Number(vb);
      if (va === -1 && vb === -1) return 0;
      if (va === -1) return 1;
      if (vb === -1) return -1;
      return mult * (va - vb);
    }
    va = va == null ? '' : String(va).toLowerCase();
    vb = vb == null ? '' : String(vb).toLowerCase();
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  });
}

const TestListNumbers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [rangeFilter, setRangeFilter] = useState('');
  const [sort, setSort] = useState({ key: 'range', dir: 'asc' });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const fetchNumbers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await smsService.getTestNumbers({ page: 0, size: 5000 });
      const content = res?.content || res?.data?.content || [];
      setData(Array.isArray(content) ? content.map(toRow) : []);
    } catch (e) {
      if (!silent) console.error('Failed to load test numbers', e);
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNumbers(false); }, [fetchNumbers]);

  const rangeOptions = useMemo(() => {
    const names = [...new Set(data.map((r) => r.range).filter(Boolean))].sort();
    return names.map((name) => ({ value: name, label: name }));
  }, [data]);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (rangeFilter) {
      list = list.filter((row) => row.range === rangeFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((row) =>
        ['range', 'prefix', 'testNumber', 'currency'].some((k) => {
          const v = row[k];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }
    return sortRows(list, sort);
  }, [data, query, rangeFilter, sort]);

  // Reset to the first page whenever the filtered result set changes.
  useEffect(() => { setPageIndex(0); }, [query, rangeFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / Math.max(1, pageSize)));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = useMemo(
    () => filteredData.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [filteredData, safePageIndex, pageSize]
  );

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' };
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  const SortLabel = ({ colKey, children }) => (
    <button
      type="button"
      className="btn btn-link btn-sm text-nowrap p-0 text-decoration-none text-900 fw-semibold shadow-none align-baseline"
      onClick={() => toggleSort(colKey)}
    >
      {children}
    </button>
  );

  const exportRows = useMemo(() => {
    return filteredData.map((r) => {
      const o = {
        Range: r.range ?? '',
        Prefix: r.prefix ?? '',
        'Test Number': r.testNumber ?? '',
        Currency: r.currency ?? ''
      };
      PAYOUT_TIERS.forEach((t) => {
        o[`Payout ${t}`] = formatPayout(r[tierKey(t)]);
      });
      return o;
    });
  }, [filteredData]);

  return (
    <div className="rate-card-numbers">
      <Card className="mb-3 border-300 shadow-sm">
        <Card.Header className="bg-white py-3 border-300">
          <Row className="flex-between-center">
            <Col xs={12} md="auto" className="mb-2 mb-md-0 d-flex align-items-center">
              <h5 className="fs-8 mb-0 fw-semibold text-900">SMS Test Numbers</h5>
              {loading && <Spinner animation="border" size="sm" className="text-secondary ms-2" />}
            </Col>
            <Col xs={12} md="auto" className="d-flex align-items-center flex-wrap gap-2 justify-content-md-end">
              <TableSelectFilter
                className="table-page-filter"
                value={rangeFilter}
                placeholder="Select range"
                onChange={(value) => setRangeFilter(value || '')}
                options={rangeOptions}
              />
              <Button
                variant="falcon-default"
                size="sm"
                onClick={() => fetchNumbers(false)}
                disabled={loading}
                className="d-flex align-items-center gap-1"
              >
                <FontAwesomeIcon icon="sync-alt" className={loading ? 'fa-spin' : ''} />
                Refresh
              </Button>
              <TableExportSelect
                icon="external-link-alt"
                variant="falcon-default"
                onExport={(type) =>
                  exportRowsByType({
                    type,
                    title: 'SMS Test Numbers',
                    filenamePrefix: 'sms-test-numbers',
                    columns: ['Range', 'Prefix', 'Test Number', 'Currency', ...PAYOUT_TIERS.map((t) => `Payout ${t}`)],
                    rows: exportRows
                  })
                }
              />
              <TableSearchInput
                className="table-page-filter"
                value={query}
                onChange={setQuery}
                placeholder="search numbers"
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive scrollbar">
            <Table borderless striped={false} hover={false} className="mb-0 rate-card-numbers__table">
              <thead>
                <tr>
                  <th rowSpan={2} className="ps-3 py-2 text-center">
                    <SortLabel colKey="range">Range</SortLabel>
                  </th>
                  <th rowSpan={2} className="py-2 text-center">
                    <SortLabel colKey="prefix">Prefix</SortLabel>
                  </th>
                  <th rowSpan={2} className="py-2 text-center">
                    <SortLabel colKey="testNumber">Test Number</SortLabel>
                  </th>
                  <th rowSpan={2} className="py-2 text-center">
                    <SortLabel colKey="currency">Currency</SortLabel>
                  </th>
                  <th
                    colSpan={PAYOUT_TIERS.length}
                    className="text-center py-2 rate-card-numbers__payouts-head bg-100"
                  >
                    Payouts
                  </th>
                </tr>
                <tr>
                  {PAYOUT_TIERS.map((tier) => (
                    <th key={tier} className="text-center py-2 small rate-card-numbers__payout-cell">
                      <SortLabel colKey={tierKey(tier)}>{tier}</SortLabel>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4 + PAYOUT_TIERS.length} className="text-center text-700 py-5">
                      {loading ? 'Loading…' : 'No test numbers in this workspace.'}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id || `${row.range}-${row.prefix}-${row.testNumber}`}>
                      <td className="ps-3 text-center text-900">{row.range ?? '—'}</td>
                      <td className="text-center text-900">{row.prefix ?? '—'}</td>
                      <td className="text-center text-900">{row.testNumber ?? '—'}</td>
                      <td className="text-center text-900">{row.currency ?? '—'}</td>
                      {PAYOUT_TIERS.map((tier) => (
                        <td key={tier} className="text-center text-900 tabular-nums">
                          {formatPayout(row[tierKey(tier)])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-300">
          <SimplePager
            pageIndex={safePageIndex}
            pageSize={pageSize}
            totalRows={filteredData.length}
            onPageIndexChange={setPageIndex}
            onPageSizeChange={(n) => { setPageSize(n); setPageIndex(0); }}
            pageSizeOptions={[25, 50, 100, 250, 500]}
          />
        </Card.Footer>
      </Card>
    </div>
  );
};

export default TestListNumbers;
