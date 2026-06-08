import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import smsService from 'services/smsService';

// In the Recent Test SMS view, CLIs are masked: show the first 2 chars,
// then replace the remaining characters with 'X' (preserving the original length).
// Example: "Google" -> "GoXXXX", "Facebook" -> "FaXXXXXX".
const maskCli = (cli) => {
  if (cli == null || cli === '') return '-';
  const s = String(cli).trim();
  if (!s) return '-';
  if (s.length <= 2) return s;
  return s.slice(0, 2) + 'X'.repeat(s.length - 2);
};

// Always render the message body as a 10-character mask. We don't expose
// the actual content in the test panel.
const MESSAGE_MASK = 'x'.repeat(10);

// Render an ISO/timestamp value like "2026-05-05T08:58:06.024262Z" as
// "2026-05-05 08:58:06" in the user's local timezone.
const formatTimestamp = (raw) => {
  if (raw == null || raw === '') return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const TEST_CDR_COLUMNS = [
  {
    accessorKey: 'date',
    header: 'Date',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => formatTimestamp(original.date)
  },
  {
    accessorKey: 'range',
    header: 'Range',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.range || '-'
  },
  {
    accessorKey: 'number',
    header: 'Number',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.number || original.msisdn || '-'
  },
  {
    accessorKey: 'cli',
    header: 'CLI',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => maskCli(original.cli || original.sender)
  },
  {
    accessorKey: 'sms',
    header: 'SMS',
    enableSorting: false,
    meta: {
      headerProps: { className: 'text-900' },
      cellProps: { className: 'font-monospace' }
    },
    cell: ({ row: { original } }) => (original.sms ? MESSAGE_MASK : '-')
  }
];

const TestCdrs = () => {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [dateRange, setDateRange] = useState([null, null]);

  const columns = useMemo(() => TEST_CDR_COLUMNS, []);

  const fetchCdrs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = { page, size: pageSize };
      const [start, end] = Array.isArray(dateRange) ? dateRange : [];
      if (start instanceof Date && !Number.isNaN(start.getTime())) params.from = start.toISOString();
      if (end instanceof Date && !Number.isNaN(end.getTime())) params.to = end.toISOString();
      const res = await smsService.getTestCdrs(params);
      const content = res?.content || [];
      setData(content);
      setTotalRows(Number(res?.totalElements ?? content.length));
    } catch (e) {
      if (e?.name === 'AbortError') return;
      if (!silent) console.error('Failed to load test CDRs', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, pageSize, dateRange]);

  useEffect(() => {
    setPage(0);
  }, [dateRange]);

  useEffect(() => {
    fetchCdrs(false);
  }, [fetchCdrs]);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        Object.values(row).filter((v) => v != null).some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: pageSize,
    perPageOptions: [25, 50, 100, 250, 500],
    selectionColumnWidth: 30,
    totalCount: totalRows,
    page: page + 1,
    setPage: (next) => {
      const idx = typeof next === 'function' ? next(page + 1) - 1 : Number(next) - 1;
      setPage(Math.max(0, idx));
    },
    setPageSize: (next) => {
      setPageSize(Number(next) || 25);
      setPage(0);
    }
  });

  return (
    <AdvanceTableProvider {...table}>
      <Card className="mb-3">
        <Card.Header>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Recent Test SMS</h5>
              {loading && <Spinner animation="border" size="sm" className="ms-2" />}
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <AdvanceTableDateRangeFilter
                  value={dateRange}
                  onChange={(val) => setDateRange(val)}
                  className="table-page-filter"
                  placeholder="Date"
                />
                <Button
                  variant="falcon-default"
                  size="sm"
                  onClick={() => fetchCdrs(false)}
                  disabled={loading}
                  className="d-flex align-items-center gap-1 text-nowrap flex-shrink-0"
                >
                  <FontAwesomeIcon icon="sync-alt" className={loading ? 'fa-spin' : ''} />
                  Refresh
                </Button>
                <TableSearchInput
                  className="table-page-filter"
                  value={query}
                  onChange={setQuery}
                  placeholder="search ..."
                />
              </div>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <AdvanceTable
            headerClassName="bg-200 text-nowrap align-middle"
            rowClassName="align-middle white-space-nowrap"
            tableProps={{ size: 'sm', striped: true, className: 'fs-10 mb-0 overflow-hidden' }}
          />
        </Card.Body>
        <Card.Footer>
          <AdvanceTableFooter
            rowsPerPageSelection
            navButtons
            rowInfo
            rowsPerPageOptions={[25, 50, 100, 250, 500]}
            totalCount={totalRows}
            page={page + 1}
            setPage={(next) => {
              const idx = typeof next === 'function' ? next(page + 1) - 1 : Number(next) - 1;
              setPage(Math.max(0, idx));
            }}
            pageSize={pageSize}
            setPageSize={(next) => {
              setPageSize(Number(next) || 25);
              setPage(0);
            }}
          />
        </Card.Footer>
      </Card>
    </AdvanceTableProvider>
  );
};

export default TestCdrs;
