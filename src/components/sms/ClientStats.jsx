import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { getAuthUser } from 'components/authentication/authStorage';
import { exportRowsByType } from 'utils/tableExport';
import ProfitPercentCell, { profitPercentText } from 'components/sms/ProfitPercentCell';

const formatPayout = (value) => {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toFixed(2);
};

const CLIENT_COLUMNS = [
  { accessorKey: 'client', header: 'Client Name', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'totalSms', header: 'Total SMS', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'delivered', header: 'Delivered', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'failed', header: 'Failed', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'myPayout',
    header: 'My Payout',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => formatPayout(original.myPayout)
  },
  {
    accessorKey: 'agentPayout',
    header: 'Agent Payout',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => formatPayout(original.agentPayout)
  },
  {
    accessorKey: 'profitPercent',
    header: 'Profit %',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => (
      <ProfitPercentCell revenue={original.revenue} profit={original.myPayout} />
    )
  }
];

const ClientStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    return [start, end];
  });

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isClientRole = roles.some((r) => ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE'].includes(r));
  const resourceId = user?.resourceId || null;
  const clientId = user?.clientId || null;

  const columns = useMemo(() => CLIENT_COLUMNS, []);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rangeParams =
        Array.isArray(dateRange) && dateRange[0] && dateRange[1]
          ? { from: dateRange[0].toISOString(), to: dateRange[1].toISOString() }
          : {};
      const params = { page: 0, size: 500, ...rangeParams };
      if (isClientRole && (clientId || resourceId)) params.clientId = clientId || resourceId;
      else if (!isPlatformAdmin && resourceId) params.companyId = resourceId;
      const res = await smsService.getClientStats(params);
      const content = res?.content || [];
      setData(content);
    } catch (e) {
      if (!silent) console.error('Failed to load client stats', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isPlatformAdmin, isClientRole, clientId, resourceId, dateRange]);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(true).finally(() => setRefreshing(false));
  };

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
    perPage: 25,
    selectionColumnWidth: 30
  });

  const exportColumns = useMemo(
    () => ['Client Name', 'Total SMS', 'Delivered', 'Failed', 'My Payout', 'Agent Payout', 'Profit %'],
    []
  );

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        return {
          'Client Name': row.client ?? '-',
          'Total SMS': row.totalSms ?? '-',
          Delivered: row.delivered ?? '-',
          Failed: row.failed ?? '-',
          'My Payout': formatPayout(row.myPayout),
          'Agent Payout': formatPayout(row.agentPayout),
          'Profit %': profitPercentText(row.revenue, row.myPayout)
        };
      }),
    [table, filteredData]
  );

  return (
    <AdvanceTableProvider {...table}>
      <Card className="mb-3">
        <Card.Header>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Client SMS Stats</h5>
              {loading && <Spinner animation="border" size="sm" className="ms-2" />}
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
                <div className="table-page-header-actions d-flex align-items-center flex-nowrap gap-2 justify-content-start justify-content-xl-end">
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
                    onExport={(type) =>
                      exportRowsByType({
                        type,
                        title: 'Client SMS Stats',
                        filenamePrefix: 'client-sms-stats',
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
          <AdvanceTable
            headerClassName="bg-200 text-nowrap align-middle"
            rowClassName="align-middle white-space-nowrap"
            tableProps={{ size: 'sm', striped: true, className: 'fs-10 mb-0 overflow-hidden' }}
          />
        </Card.Body>
        <Card.Footer>
          <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo />
        </Card.Footer>
      </Card>
    </AdvanceTableProvider>
  );
};

export default ClientStats;
