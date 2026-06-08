import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { TableExportSelect } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { exportRowsByType } from 'utils/tableExport';
import './RateCardNumbers.scss';

const PAYOUT_TIERS = ['1/1', '7/1', '7/7', '15/15', '15/30', '30/15', '30/30', '30/45', '30/60'];

const tierKey = (tier) => `payout_${tier.replace('/', '_')}`;

const formatPayout = (val) => {
  if (val == null || val === '') return '—';
  const num = Number(val);
  if (Number.isNaN(num)) return '—';
  return `$ ${num.toFixed(3)}`;
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

const RateCardNumbers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'range', dir: 'asc' });

  const fetchRateCard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await smsService.getRateCard({ page: 0, size: 5000 });
      const content = res?.data?.content || res?.content || [];
      setData(Array.isArray(content) ? content : []);
    } catch (e) {
      if (!silent) console.error('Failed to load rate card', e);
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRateCard(false);
  }, [fetchRateCard]);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
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
  }, [data, query, sort]);

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
      <span className="sort-cue text-600" aria-hidden>
        ↕
      </span>
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
            <Col xs={12} md="auto" className="mb-2 mb-md-0">
              <h5 className="fs-8 mb-0 fw-semibold text-900">Rate Card</h5>
              <p className="text-600 fs--2 mb-0 mt-1">Client payout rates per assigned range · USD or route currency shown</p>
            </Col>
            <Col xs={12} md="auto" className="d-flex align-items-center flex-wrap gap-2 justify-content-md-end">
              {loading && <Spinner animation="border" size="sm" className="text-secondary" />}
              <TableExportSelect
                icon="external-link-alt"
                variant="falcon-default"
                onExport={(type) =>
                  exportRowsByType({
                    type,
                    title: 'Rate Card',
                    filenamePrefix: 'rate-card',
                    columns: ['Range', 'Prefix', 'Test Number', 'Currency', ...PAYOUT_TIERS.map((t) => `Payout ${t}`)],
                    rows: exportRows
                  })
                }
              />
              <TableSearchInput
                className="table-page-filter"
                value={query}
                onChange={setQuery}
                placeholder="Search range, prefix..."
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive scrollbar">
            <Table borderless striped={false} hover={false} className="mb-0 rate-card-numbers__table">
              <thead>
                <tr>
                  <th rowSpan={2} className="ps-3 py-2">
                    <SortLabel colKey="range">Range</SortLabel>
                  </th>
                  <th rowSpan={2} className="py-2">
                    <SortLabel colKey="prefix">Prefix</SortLabel>
                  </th>
                  <th rowSpan={2} className="py-2">
                    <SortLabel colKey="testNumber">Test Number</SortLabel>
                  </th>
                  <th rowSpan={2} className="py-2">
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
                      {loading ? 'Loading…' : 'No rate rows for your assigned numbers in this workspace.'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id || `${row.range}-${row.prefix}-${row.testNumber}`}>
                      <td className="ps-3 text-start text-900">{row.range ?? '—'}</td>
                      <td className="text-start text-900">{row.prefix ?? '—'}</td>
                      <td className="text-start text-900">{row.testNumber ?? '—'}</td>
                      <td className="text-start text-900">{row.currency ?? '—'}</td>
                      {PAYOUT_TIERS.map((tier) => (
                        <td key={tier} className="text-start text-900 tabular-nums">
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
      </Card>
    </div>
  );
};

export default RateCardNumbers;
