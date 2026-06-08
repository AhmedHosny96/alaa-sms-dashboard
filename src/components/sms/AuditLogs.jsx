import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import { TableSelectFilter } from 'components/common/UseTable';
import smsService from 'services/smsService';

const formatTimestamp = (raw) => {
  if (raw == null || raw === '') return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const plainCell = (value) => (value == null || value === '' ? '-' : String(value));

const AUDIT_COLUMNS = [
  {
    accessorKey: 'createdAt',
    header: 'Timestamp',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => formatTimestamp(original?.createdAt)
  },
  {
    accessorKey: 'userName',
    header: 'User',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => plainCell(original?.userName || original?.userEmail)
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => plainCell(original?.role)
  },
  {
    accessorKey: 'httpMethod',
    header: 'Method',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => plainCell(original?.httpMethod)
  },
  {
    accessorKey: 'path',
    header: 'Path',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => plainCell(original?.path)
  },
  {
    accessorKey: 'statusCode',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => plainCell(original?.statusCode)
  },
  {
    accessorKey: 'ip',
    header: 'IP',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => plainCell(original?.ip)
  }
];

const ROLE_OPTIONS = [
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
  { value: 'COMPANY_FINANCE', label: 'Company Finance' },
  { value: 'CLIENT_ADMIN', label: 'Client Admin' },
  { value: 'CLIENT_USER', label: 'Client User' },
  { value: 'CLIENT_FINANCE', label: 'Client Finance' }
];

const METHOD_OPTIONS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' }
];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const AuditLogs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [dateRange, setDateRange] = useState(() => [startOfToday(), endOfToday()]);
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    setPage(0);
  }, [dateRange, filterRole, filterAction, pageSize]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize
      };
      const [start, end] = Array.isArray(dateRange) ? dateRange : [];
      if (start instanceof Date && !Number.isNaN(start.getTime())) params.from = start.toISOString();
      if (end instanceof Date && !Number.isNaN(end.getTime())) params.to = end.toISOString();
      if (filterRole) params.role = filterRole;
      if (filterAction) params.method = filterAction;

      const res = await smsService.getAuditLogs(params);
      const payload = res?.data || res || {};
      const content = Array.isArray(payload.content) ? payload.content : [];
      const total = typeof payload.totalElements === 'number'
        ? payload.totalElements
        : content.length;
      setData(content);
      setTotalRows(total);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      console.error('Failed to load audit logs', error);
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dateRange, filterRole, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = useMemo(() => AUDIT_COLUMNS, []);

  const manualPageCount = totalRows > 0 ? Math.ceil(totalRows / Math.max(1, pageSize)) : 0;

  const handlePaginationChange = useCallback(
    (updaterOrValue) => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue({ pageIndex: page, pageSize })
        : updaterOrValue;
      if (!next) return;
      const nextSize = Math.max(1, Number(next.pageSize) || pageSize);
      if (nextSize !== pageSize) {
        setPageSize(nextSize);
        setPage(0);
        return;
      }
      setPage(Math.max(0, Number(next.pageIndex) || 0));
    },
    [page, pageSize]
  );

  const table = useAdvanceTable({
    data,
    columns,
    sortable: true,
    pagination: true,
    perPage: pageSize,
    manualPagination: true,
    pageCount: manualPageCount,
    rowCount: totalRows,
    controlledPagination: { pageIndex: page, pageSize },
    onPaginationChange: handlePaginationChange
  });

  return (
    <Card className="mb-3">
      <Card.Header>
        <Row className="flex-between-center">
          <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
            <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Audit Logs</h5>
            {loading && <Spinner animation="border" size="sm" className="ms-2" />}
          </Col>
          <Col xs={12} sm="auto" className="ps-0">
            <div
              className="d-flex align-items-center flex-nowrap gap-2"
              style={{ overflowX: 'auto', overflowY: 'visible' }}
            >
              <AdvanceTableDateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                className="table-page-filter"
                placeholder="Date"
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterRole}
                placeholder="Role"
                onChange={(value) => setFilterRole(value || '')}
                options={ROLE_OPTIONS}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterAction}
                placeholder="Action"
                onChange={(value) => setFilterAction(value || '')}
                options={METHOD_OPTIONS}
              />
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <AdvanceTableProvider {...table}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading audit logs...
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
          <div className="mt-3 px-3 pb-3">
            <AdvanceTableFooter
              rowInfo
              navButtons
              rowsPerPageSelection
              rowsPerPageOptions={[25, 50, 100, 250]}
              totalRowCountOverride={totalRows}
            />
          </div>
        </AdvanceTableProvider>
      </Card.Body>
    </Card>
  );
};

export default AuditLogs;
