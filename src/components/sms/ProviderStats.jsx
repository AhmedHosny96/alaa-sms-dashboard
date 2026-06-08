import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useScopeStableEffect } from 'hooks/usePolling';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { getAuthUser } from 'components/authentication/authStorage';
import RateBadge from 'components/common/RateBadge';
import { exportRowsByType } from 'utils/tableExport';
import ProfitPercentCell, { profitPercentText } from 'components/sms/ProfitPercentCell';

const formatPayout = (value) => {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toFixed(2);
};

const PROVIDER_COLUMNS = [
  { accessorKey: 'provider', header: 'Provider', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'totalSms', header: 'Total SMS', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'delivered', header: 'Delivered', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'failed', header: 'Failed', meta: { headerProps: { className: 'text-900' } } },
  // {
  //   accessorKey: 'dlrRate',
  //   header: 'DLR Rate',
  //   meta: { headerProps: { className: 'text-900' } },
  //   cell: ({ getValue }) => <RateBadge value={getValue()} />
  // },
  //{ accessorKey: 'avgTps', header: 'Avg TPS', meta: { headerProps: { className: 'text-900' } } },
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

const ProviderStats = () => {
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
  const [filterProvider, setFilterProvider] = useState('');
  const [filterRange, setFilterRange] = useState('');
  const [providerOptions, setProviderOptions] = useState([]);
  const [rangeOptions, setRangeOptions] = useState([]);

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = roles.includes('COMPANY_ADMIN');
  const isClientRole = roles.some(r => ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE'].includes(r));
  const resourceId = user?.resourceId || null;
  const clientId = user?.clientId || null;

  const scopedParams = useMemo(() => {
    const params = {};
    if (isClientRole && (clientId || resourceId)) {
      params.clientId = clientId || resourceId;
    } else if (!isPlatformAdmin && resourceId) {
      params.companyId = resourceId;
    }
    return params;
  }, [isClientRole, clientId, resourceId, isPlatformAdmin]);

  const providerLabelByValue = useMemo(
    () => Object.fromEntries(providerOptions.map(opt => [String(opt.value), String(opt.label)])),
    [providerOptions]
  );
  const rangeLabelByValue = useMemo(
    () => Object.fromEntries(rangeOptions.map(opt => [String(opt.value), String(opt.label)])),
    [rangeOptions]
  );

  const columns = useMemo(() => PROVIDER_COLUMNS, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [providersRes, rangesRes] = await Promise.all([
        smsService.listProviderOptions().catch(() => []),
        smsService.listRanges({ page: 0, size: 200 }).catch(() => ({ content: [] }))
      ]);

      const providers = Array.isArray(providersRes)
        ? providersRes
        : Array.isArray(providersRes?.content)
          ? providersRes.content
          : [];

      const ranges = Array.isArray(rangesRes?.content)
        ? rangesRes.content
        : Array.isArray(rangesRes)
          ? rangesRes
          : [];

      setProviderOptions(
        providers.map(item => ({
          value: String(item.id ?? item.connectorId ?? item.name),
          label: item.name || item.connectorId || String(item.id)
        }))
      );

      setRangeOptions(
        ranges.map(item => ({
          value: String(item.id ?? item.rangeId ?? item.rangePrefix ?? item.rangeName),
          label: item.rangeName || item.name || item.rangePrefix || item.prefix || String(item.id ?? item.rangeId)
        }))
      );
    } catch {
      setProviderOptions([]);
      setRangeOptions([]);
    }
  }, [scopedParams]);

  useScopeStableEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rangeParams =
        Array.isArray(dateRange) && dateRange[0] && dateRange[1]
          ? { from: dateRange[0].toISOString(), to: dateRange[1].toISOString() }
          : {};
      const params = { page: 0, size: 500, ...scopedParams, ...rangeParams };
      if (query) params.search = query;
      if ((isPlatformAdmin || isCompanyAdmin) && filterProvider) params.providerId = filterProvider;
      if (filterRange) params.rangeId = filterRange;

      const res = await smsService.getProviderStats(params);
      const content = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      setData(content);
    } catch {
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [scopedParams, query, filterProvider, filterRange, isPlatformAdmin, dateRange]);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(true).finally(() => setRefreshing(false));
  };

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if ((isPlatformAdmin || isCompanyAdmin) && filterProvider) {
      const providerLabel = providerLabelByValue[String(filterProvider)] || '';
      list = list.filter((row) =>
        String(row.providerId ?? '') === String(filterProvider) ||
        String(row.provider ?? '') === String(filterProvider) ||
        (providerLabel && String(row.provider ?? '') === providerLabel)
      );
    }
    if (filterRange) {
      const rangeLabel = rangeLabelByValue[String(filterRange)] || '';
      list = list.filter((row) =>
        String(row.rangeId ?? '') === String(filterRange) ||
        String(row.range ?? '') === String(filterRange) ||
        (rangeLabel && String(row.range ?? '') === rangeLabel)
      );
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.provider, row.totalSms, row.delivered, row.failed, row.dlrRate, row.avgTps, row.cost]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, query, isPlatformAdmin]);

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
    () => ['Provider', 'Total SMS', 'Delivered', 'Failed', 'My Payout', 'Agent Payout', 'Profit %'],
    []
  );

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        return {
          Provider: row.provider ?? '-',
          'Total SMS': row.totalSms ?? '-',
          Delivered: row.delivered ?? '-',
          Failed: row.failed ?? '-',
         // 'DLR Rate': row.dlrRate ?? '-',
          //'Avg TPS': row.avgTps ?? '-',
          'My Payout': formatPayout(row.myPayout),
          'Agent Payout': formatPayout(row.agentPayout),
          'Profit %': profitPercentText(row.revenue, row.myPayout)
        };
      }),
    [table, filteredData]
  );

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Provider SMS Stats</h5>
                {loading && <Spinner animation="border" size="sm" className="ms-2" />}
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
                  <div
                    id="orders-actions"
                    className="table-page-header-actions d-flex align-items-center flex-nowrap gap-2 justify-content-start justify-content-xl-end"
                  >
                    <AdvanceTableDateRangeFilter
                      value={dateRange}
                      onChange={setDateRange}
                      className="table-page-filter"
                      placeholder="Date"
                    />
                    {(isPlatformAdmin || isCompanyAdmin) && (
                      <TableSelectFilter
                        className="table-page-filter"
                        value={filterProvider}
                        placeholder="Filter Provider"
                        onChange={(value) => setFilterProvider(value)}
                        options={providerOptions}
                      />
                    )}
                    <TableSelectFilter
                      className="table-page-filter"
                      value={filterRange}
                      placeholder="Filter Range"
                      onChange={(value) => setFilterRange(value)}
                      options={rangeOptions}
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
                          title: 'Provider SMS Stats',
                          filenamePrefix: 'provider-sms-stats',
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
              tableProps={{
                size: 'sm',
                striped: true,
                className: 'fs-10 mb-0 overflow-hidden'
              }}
            />
          </Card.Body>
          <Card.Footer>
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>
    </>
  );
};

export default ProviderStats;
