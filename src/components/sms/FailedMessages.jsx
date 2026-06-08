import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import { TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { cdrStatusLabel, cdrStatusSolidBg } from 'constants/cdrStatus';
import { cdrErrorCodeLabel } from 'constants/cdrErrorCode';
import { exportRowsByType } from 'utils/tableExport';
import SimplePager from 'components/common/SimplePager';

const STATUS_TONE = {
  success: { color: '#00f382', borderColor: '#00f382', backgroundColor: '#FFFFFF' },
  primary: { color: '#0d6efd', borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.06)' },
  secondary: { color: '#6c757d', borderColor: '#6c757d', backgroundColor: '#FFFFFF' },
  danger: { color: '#dc3545', borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.06)' },
  info: { color: '#0dcaf0', borderColor: '#0dcaf0', backgroundColor: 'rgba(13, 202, 240, 0.08)' },
  warning: { color: '#b58105', borderColor: '#b58105', backgroundColor: 'rgba(245, 194, 12, 0.10)' }
};

const StatusTag = ({ tone = 'secondary', children }) => {
  const palette = STATUS_TONE[tone] || STATUS_TONE.secondary;
  return (
    <span
      className="fw-semibold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1px 9px',
        borderRadius: 6,
        border: `1px solid ${palette.borderColor}`,
        color: palette.color,
        backgroundColor: palette.backgroundColor,
        fontSize: '0.82rem',
        fontWeight: 600,
        lineHeight: 1.25
      }}
    >
      {children}
    </span>
  );
};

const failedCli = (row) => {
  const v = row?.cli;
  if (v != null && String(v).trim() !== '') return String(v).trim();
  return '—';
};

const cellOrDash = (row, key) => {
  const v = row?.[key];
  if (v != null && String(v).trim() !== '') return String(v).trim();
  return '—';
};

const failedErrorCode = (row) => cdrErrorCodeLabel(row?.errorCode);

const failedTimestampRaw = (row) =>
  row?.date ?? row?.submitTime ?? row?.createdAt ?? row?.submit_time ?? row?.created_at ?? null;

const formatFailedSmsTimestamp = (raw) => {
  if (raw == null || String(raw).trim() === '') return '—';
  const d = new Date(String(raw).trim());
  if (Number.isNaN(d.getTime())) return String(raw).trim();
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
};

const FAILED_COLUMNS = [
  {
    accessorKey: 'date',
    header: 'Timestamp',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => formatFailedSmsTimestamp(failedTimestampRaw(original))
  },
  {
    accessorKey: 'number',
    header: 'Number',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => cellOrDash(original, 'number')
  },
  {
    accessorKey: 'cli',
    header: 'CLI',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => failedCli(original)
  },
  {
    accessorKey: 'sms',
    header: 'Message',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => cellOrDash(original, 'sms')
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => cellOrDash(original, 'provider')
  },
  {
    accessorKey: 'errorCode',
    header: 'Error Code',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => failedErrorCode(original)
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => (
      <StatusTag tone={cdrStatusSolidBg(original.status)}>
        {cdrStatusLabel(original.status)}
      </StatusTag>
    )
  }
];

const FailedMessages = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [totalRows, setTotalRows] = useState(0);
  const [filterProvider, setFilterProvider] = useState('');
  const [providerOptions, setProviderOptions] = useState([]);
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return [start, end];
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await smsService.listProviderOptions();
        if (cancelled) return;
        const list = Array.isArray(res) ? res : Array.isArray(res?.content) ? res.content : [];
        setProviderOptions(
          list.map((p) => ({
            value: String(p.id ?? p.providerId ?? p.connectorId ?? p.name ?? ''),
            label: p.name || p.providerName || p.connectorId || String(p.id ?? '')
          }))
        );
      } catch {
        if (!cancelled) setProviderOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo(() => FAILED_COLUMNS, []);

  const rangeStart = dateRange?.[0];
  const rangeEnd = dateRange?.[1];

  const fetchFailed = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const params = {
          page: pagination.pageIndex,
          size: pagination.pageSize,
          from: rangeStart ? rangeStart.toISOString() : undefined,
          to: rangeEnd ? rangeEnd.toISOString() : undefined
        };
        if (silent) params.live = true;
        const res = await smsService.getFailedMessages(params);
        const content = res?.content || res?.data?.content || [];
        setData(content);
        setTotalRows(
          typeof res?.totalElements === 'number'
            ? res.totalElements
            : content.length
        );
      } catch (e) {
        if (e?.name === 'AbortError') return;
        if (!silent) console.error('Failed to load failed messages', e);
        setData([]);
        setTotalRows(0);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      pagination.pageIndex,
      pagination.pageSize,
      rangeStart,
      rangeEnd
    ]
  );

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    fetchFailed(false);
  }, [fetchFailed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFailed(true).finally(() => setRefreshing(false));
  };

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) {
      const target = String(filterProvider).toLowerCase();
      list = list.filter((row) => {
        const candidates = [row.providerId, row.provider, row.connectorId, row.providerName]
          .filter((v) => v != null)
          .map((v) => String(v).toLowerCase());
        return candidates.some((c) => c === target || c.includes(target));
      });
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) => {
        const base = Object.values(row)
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q));
        const label = String(cdrErrorCodeLabel(row?.errorCode)).toLowerCase();
        return base || label.includes(q);
      });
    }
    return list;
  }, [data, query, filterProvider]);

  const exportColumns = useMemo(
    () => ['Timestamp', 'Number', 'CLI', 'Message', 'Provider', 'Error Code', 'Status'],
    []
  );

  const exportRows = useMemo(
    () =>
      filteredData.map((row) => ({
        Timestamp: formatFailedSmsTimestamp(failedTimestampRaw(row)),
        Number: row.number ?? '-',
        CLI: failedCli(row),
        Message: cellOrDash(row, 'sms'),
        Provider: cellOrDash(row, 'provider'),
        'Error Code': failedErrorCode(row),
        Status: cdrStatusLabel(row.status)
      })),
    [filteredData]
  );

  const manualPageCount =
    totalRows === 0 ? 0 : Math.ceil(totalRows / Math.max(1, pagination.pageSize));

  const tableFooterTotalRows = useMemo(() => {
    if (!Array.isArray(data)) return totalRows;
    if (filteredData.length !== data.length) {
      return filteredData.length;
    }
    return totalRows;
  }, [data, filteredData, totalRows]);

  const table = useAdvanceTable({
    data: filteredData,
    columns: FAILED_COLUMNS,
    sortable: true,
    pagination: false
  });

  return (
      <Card className="mb-3">
        <Card.Header>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center flex-wrap pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Failed SMS</h5>
              {loading && <Spinner animation="border" size="sm" className="ms-2" />}
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
                <div className="table-page-header-actions d-flex align-items-center flex-nowrap gap-2 justify-content-start justify-content-xl-end">
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterProvider}
                    placeholder="Select Provider"
                    onChange={(value) => setFilterProvider(value || '')}
                    options={providerOptions}
                  />
                  <AdvanceTableDateRangeFilter
                    value={dateRange}
                    onChange={setDateRange}
                    className="table-page-filter"
                    placeholder="Date"
                  />
                  <Button
                    variant="falcon-default"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="d-flex align-items-center gap-1 text-nowrap flex-shrink-0"
                  >
                    <FontAwesomeIcon icon="sync-alt" className={refreshing ? 'fa-spin' : ''} />
                    Refresh
                  </Button>
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    className="mx-0 mx-sm-2"
                    onExport={(type) => exportRowsByType({
                      type,
                      title: 'Failed SMS',
                      filenamePrefix: 'failed-sms',
                      columns: exportColumns,
                      rows: exportRows
                    })}
                  />
                  <TableSearchInput
                    className="table-page-filter"
                    value={query}
                    onChange={setQuery}
                    placeholder="Search ..."
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <AdvanceTableProvider {...table}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading records...
              </div>
            ) : (
              <AdvanceTable
                headerClassName="bg-200 text-nowrap align-middle"
                rowClassName="align-middle white-space-nowrap"
                tableProps={{
                  size: 'sm',
                  striped: true,
                  className: 'fs-10 mb-0 overflow-hidden'
                }}
              />
            )}
          </AdvanceTableProvider>
        </Card.Body>
        <Card.Footer>
          <SimplePager
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            totalRows={tableFooterTotalRows}
            onPageIndexChange={(next) => setPagination((p) => ({ ...p, pageIndex: Math.max(0, next) }))}
            onPageSizeChange={(nextSize) => setPagination((p) => ({ ...p, pageSize: Math.max(25, nextSize), pageIndex: 0 }))}
            pageSizeOptions={[25, 50, 100, 250]}
          />
        </Card.Footer>
      </Card>
  );
};

export default FailedMessages;
