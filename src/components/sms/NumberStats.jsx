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
import { exportRowsByType } from 'utils/tableExport';
import ProfitPercentCell, { profitPercentText } from 'components/sms/ProfitPercentCell';

const formatPayout = (value) => {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toFixed(2);
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) => {
  const num = toNumber(value);
  if (num === 0) return '0';
  return num.toFixed(4).replace(/\.?0+$/, '');
};

const NUMBER_COLUMNS = [
  { accessorKey: 'number', header: 'Number', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'country', header: 'Country', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'smsReceived', header: 'SMS', meta: { headerProps: { className: 'text-900' } } },
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
  },
  { accessorKey: 'lastUsed', header: 'Last Used', meta: { headerProps: { className: 'text-900' } } }
];

// Dimensions for client-side re-aggregation. Number is the default row key;
// Country collapses all numbers in a country onto one row.
const GROUP_BY_OPTIONS = [
  { key: 'country', label: 'Country', accessor: 'country' },
  { key: 'number', label: 'Number', accessor: 'number' }
];

const NumberStats = () => {
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
  const [filterNumber, setFilterNumber] = useState('');
  const [groupByKey, setGroupByKey] = useState('');
  const [providerOptions, setProviderOptions] = useState([]);
  const [rangeOptions, setRangeOptions] = useState([]);
  const [numberOptions, setNumberOptions] = useState([]);

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
  const numberLabelByValue = useMemo(
    () => Object.fromEntries(numberOptions.map(opt => [String(opt.value), String(opt.label)])),
    [numberOptions]
  );

  const columns = useMemo(() => NUMBER_COLUMNS, []);

  const fetchOptions = useCallback(async () => {
    try {
      const loadAllNumbers = async () => {
        const acc = [];
        let page = 0;
        const size = 100;
        for (;;) {
          const res = await smsService
            .listNumbers({ page, size, ...scopedParams })
            .catch(() => ({ content: [] }));
          const chunk = Array.isArray(res?.content)
            ? res.content
            : Array.isArray(res)
              ? res
              : [];
          acc.push(...chunk);
          if (chunk.length < size) break;
          page += 1;
          if (page > 200) break;
        }
        return acc;
      };

      const [providersRes, rangesRes, numbers] = await Promise.all([
        smsService.listProviderOptions().catch(() => []),
        smsService.listRanges({ page: 0, size: 200 }).catch(() => ({ content: [] })),
        loadAllNumbers()
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

      setNumberOptions(
        numbers
          .map(item => item.number ?? item.msisdn ?? item.phoneNumber ?? item.numberValue)
          .filter(Boolean)
          .map(value => ({ value: String(value), label: String(value) }))
      );
    } catch {
      setProviderOptions([]);
      setRangeOptions([]);
      setNumberOptions([]);
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
      if (filterNumber) params.number = filterNumber;

      const res = await smsService.getNumberStats(params);
      const content = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      setData(content);
    } catch {
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [scopedParams, query, filterProvider, filterRange, filterNumber, isPlatformAdmin, dateRange]);

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
    if (filterNumber) {
      const numberLabel = numberLabelByValue[String(filterNumber)] || '';
      list = list.filter((row) =>
        String(row.number ?? '') === String(filterNumber) ||
        (numberLabel && String(row.number ?? '') === numberLabel)
      );
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.number, row.country, row.smsReceived, row.myPayout, row.agentPayout, row.lastUsed]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, filterNumber, query, isPlatformAdmin]);

  // Client-side re-aggregation by chosen dimension. Mirrors CdrReports pattern.
  const groupedData = useMemo(() => {
    if (!groupByKey) return [];
    const groupDef = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey);
    const accessor = groupDef?.accessor || groupByKey;
    const map = new Map();
    filteredData.forEach((row) => {
      const key = String(row?.[accessor] ?? '-');
      if (!map.has(key)) {
        map.set(key, {
          groupValue: key,
          smsReceived: 0,
          myPayout: 0,
          agentPayout: 0,
          _numberCount: 0
        });
      }
      const item = map.get(key);
      item.smsReceived += toNumber(row?.smsReceived);
      item.myPayout += toNumber(row?.myPayout);
      item.agentPayout += toNumber(row?.agentPayout);
      item._numberCount += 1;
    });
    return Array.from(map.values()).map((item) => ({
      ...item,
      myPayout: formatAmount(item.myPayout),
      agentPayout: formatAmount(item.agentPayout)
    }));
  }, [groupByKey, filteredData]);

  const groupedColumns = useMemo(() => {
    if (!groupByKey) return NUMBER_COLUMNS;
    const groupDef = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey);
    return [
      { accessorKey: 'groupValue', header: groupDef?.label || 'Group', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: '_numberCount', header: 'Numbers', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'smsReceived', header: 'SMS', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'myPayout', header: 'My Payout', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'agentPayout', header: 'Agent Payout', meta: { headerProps: { className: 'text-900' } } }
    ];
  }, [groupByKey]);

  const activeTableData = groupByKey ? groupedData : filteredData;
  const activeColumns = groupByKey ? groupedColumns : columns;
  const activeGroupLabel = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey)?.label || '';

  const summary = useMemo(() => {
    const totals = { smsReceived: 0, myPayout: 0, agentPayout: 0 };
    filteredData.forEach((row) => {
      totals.smsReceived += toNumber(row?.smsReceived);
      totals.myPayout += toNumber(row?.myPayout);
      totals.agentPayout += toNumber(row?.agentPayout);
    });
    return totals;
  }, [filteredData]);

  const table = useAdvanceTable({
    data: activeTableData,
    columns: activeColumns,
    selection: !groupByKey,
    sortable: true,
    pagination: true,
    perPage: 25,
    selectionColumnWidth: 30
  });

  const exportColumns = useMemo(
    () => groupByKey
      ? [activeGroupLabel || 'Group', 'Numbers', 'SMS', 'My Payout', 'Agent Payout']
      : ['Number', 'Country', 'SMS', 'My Payout', 'Agent Payout', 'Profit %', 'Last Used'],
    [groupByKey, activeGroupLabel]
  );

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        if (groupByKey) {
          return {
            [activeGroupLabel || 'Group']: row.groupValue ?? '-',
            Numbers: row._numberCount ?? '-',
            SMS: row.smsReceived ?? '-',
            'My Payout': row.myPayout ?? '-',
            'Agent Payout': row.agentPayout ?? '-'
          };
        }
        return {
          Number: row.number ?? row.msisdn ?? '-',
          Country: row.country ?? '-',
          SMS: row.smsReceived ?? '-',
          'My Payout': formatPayout(row.myPayout),
          'Agent Payout': formatPayout(row.agentPayout),
          'Profit %': profitPercentText(row.revenue, row.myPayout),
          'Last Used': row.lastUsed ?? '-'
        };
      }),
    [table, filteredData, groupByKey, activeGroupLabel]
  );

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">SMS Number Stats</h5>
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
                    {/* <TableSelectFilter
                      className="table-page-filter"
                      value={filterNumber}
                      placeholder="Filter Number"
                      onChange={(value) => setFilterNumber(value)}
                      options={numberOptions}
                    /> */}
                    <TableSelectFilter
                      className="table-page-filter"
                      value={groupByKey}
                      placeholder="Group by"
                      onChange={(value) => setGroupByKey(value || '')}
                      options={GROUP_BY_OPTIONS.map((g) => ({ value: g.key, label: g.label }))}
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
                          title: 'SMS Number Stats',
                          filenamePrefix: 'sms-number-stats',
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
          {groupByKey && (
            <div className="border-top bg-white px-3 py-3">
              <div
                className="d-grid gap-2 fs-10 align-items-start"
                style={{ gridTemplateColumns: '2fr 2fr 2fr' }}
              >
                <div className="text-center">
                  <div className="text-uppercase text-600 fw-bold mb-2">SMS</div>
                  <div className="fw-bold fs-9">{summary.smsReceived.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-uppercase text-600 fw-bold mb-2">My Payout</div>
                  <div className="fw-bold fs-9">{formatAmount(summary.myPayout)}</div>
                </div>
                <div className="text-center">
                  <div className="text-uppercase text-600 fw-bold mb-2">Agent Payout</div>
                  <div className="fw-bold fs-9">{formatAmount(summary.agentPayout)}</div>
                </div>
              </div>
            </div>
          )}
          <Card.Footer>
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>
    </>
  );
};

export default NumberStats;
