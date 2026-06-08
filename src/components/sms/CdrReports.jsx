import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useScopeStableEffect } from 'hooks/usePolling';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import { TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import smsService from 'services/smsService';
import clientService from 'services/clientService';
import { getAuthUser } from 'components/authentication/authStorage';
import { cdrStatusLabel, cdrStatusSolidBg } from 'constants/cdrStatus';
import { exportRowsByType } from 'utils/tableExport';
import SimplePager from 'components/common/SimplePager';
import { toast } from 'react-toastify';

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

const formatCdrDate = (raw) => {
  if (raw == null || raw === '') return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const causeLabel = (status) => {
  const u = String(status ?? '').toUpperCase();
  if (u === 'DELIVERED_HANDSET' || u === 'DELIVRD' || u === 'SUCCESS') return 'Success';
  if (u === 'DELIVERED_OPERATOR' || u === 'ACCEPTD') return 'At operator';
  if (u === 'SENT' || u === 'ESME_ROK') return 'Sent';
  if (u === 'SUBMITTED') return 'Submitted';
  if (u === 'PENDING') return 'Queued';
  if (u === 'FAILED' || u.startsWith('ESME_R') || ['UNDELIV', 'REJECTD', 'EXPIRED', 'DELETED', 'UNKNOWN'].includes(u)) {
    return 'Failed';
  }
  return cdrStatusLabel(status);
};

const plainCell = (value) => (value == null || value === '' ? '-' : String(value));

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) => {
  const num = toNumber(value);
  if (num === 0) return '0';
  return num.toFixed(4).replace(/\.?0+$/, '');
};

const buildDisplayRow = (row) => ({
  Date: formatCdrDate(row?.date),
  Provider: plainCell(row?.provider),
  Range: plainCell(row?.range),
  Type: plainCell(row?.type || 'General'),
  Number: plainCell(row?.number),
  CLI: plainCell(row?.cli),
  SMS: plainCell(row?.sms),
  Encoding: plainCell(row?.encoding),
  Segments: plainCell(row?.segments),
  Price: row?.price != null ? formatAmount(row.price) : '-',
  Agent: plainCell(row?.agent),
  Manager: plainCell(row?.manager),
  Currency: plainCell(row?.currency || '$'),
  'My Payout': plainCell(row?.myPayout),
  'Agent Payout': plainCell(row?.agentPayout),
  Cause: causeLabel(row?.status),
  IP: plainCell(row?.ip),
  Status: plainCell(cdrStatusLabel(row?.status))
});

const CDR_COLUMNS = [
  { accessorKey: 'date', header: 'Date', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Date },
  { accessorKey: 'provider', header: 'Provider', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Provider },
  { accessorKey: 'range', header: 'Range', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Range },
  { accessorKey: 'type', header: 'Type', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Type },
  { accessorKey: 'number', header: 'Number', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Number },
  { accessorKey: 'cli', header: 'CLI', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).CLI },
  {
    accessorKey: 'sms',
    header: 'SMS',
    meta: {
      headerProps: { className: 'text-900' },
      cellProps: { style: { minWidth: 360, maxWidth: 640, whiteSpace: 'normal', wordBreak: 'break-word' } }
    },
    cell: ({ row: { original } }) => buildDisplayRow(original).SMS
  },
  // Encoding & Segments are still computed and stored (and included in exports below),
  // but intentionally not displayed in the CDR dashboard table.
  { accessorKey: 'agent', header: 'Agent', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Agent },
  { accessorKey: 'manager', header: 'Manager', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Manager },
  { accessorKey: 'currency', header: 'Currency', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Currency },
  // Price is still computed/stored and kept in exports, but not shown in the CDR dashboard table.
  { accessorKey: 'myPayout', header: 'My Payout', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original)['My Payout'] },
  { accessorKey: 'agentPayout', header: 'Agent Payout', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original)['Agent Payout'] },
  { id: 'cause', accessorFn: (row) => row.status, header: 'Cause', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).Cause },
  { accessorKey: 'ip', header: 'IP', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => buildDisplayRow(original).IP },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => (
      <StatusTag tone={cdrStatusSolidBg(original?.status)}>
        {buildDisplayRow(original).Status}
      </StatusTag>
    )
  }
];

const EXPORT_COLUMNS = [
  'Date', 'Provider', 'Range', 'Type', 'Number', 'CLI', 'SMS', 'Encoding', 'Segments',
  'Agent', 'Manager', 'Currency', 'Price', 'My Payout', 'Agent Payout', 'Cause', 'IP', 'Status'
];
const PDF_COLUMNS = [
  'Date', 'Provider', 'Range', 'Type', 'Number', 'CLI', 'SMS', 'Encoding', 'Segments',
  'Agent', 'Manager', 'Currency', 'Price', 'My Payout', 'Agent Payout', 'Cause', 'IP', 'Status'
];

const DATE_FILTER_OPTIONS = [
  { value: 'LAST_15_MIN', label: 'Last 15 Min' },
  { value: 'LAST_30_MIN', label: 'Last 30 Min' },
  { value: 'LAST_1_HOUR', label: 'Last 1 Hour' },
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Day' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'LAST_MONTH', label: 'Last Month' }
];

const GROUP_BY_OPTIONS = [
  { key: 'date', label: 'Date', accessor: 'date' },
  { key: 'month', label: 'Month', accessor: 'date' },
  { key: 'provider', label: 'Provider', accessor: 'provider' },
  { key: 'range', label: 'Range', accessor: 'range' },
  { key: 'manager', label: 'Manager', accessor: 'manager' },
  { key: 'agent', label: 'Agent', accessor: 'agent' },
  { key: 'number', label: 'Number', accessor: 'number' },
  { key: 'cli', label: 'CLI', accessor: 'cli' }
];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getPresetDateRange = (preset) => {
  const now = new Date();
  switch (preset) {
    case 'LAST_1_MIN':
      return [new Date(now.getTime() - 60 * 1000), now];
    case 'LAST_15_MIN':
      return [new Date(now.getTime() - 15 * 60 * 1000), now];
    case 'LAST_30_MIN':
      return [new Date(now.getTime() - 30 * 60 * 1000), now];
    case 'LAST_1_HOUR':
      return [new Date(now.getTime() - 60 * 60 * 1000), now];
    case 'YESTERDAY': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return [startOfDay(yesterday), endOfDay(yesterday)];
    }
    case 'LAST_7_DAYS': {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return [startOfDay(start), endOfDay(now)];
    }
    case 'THIS_MONTH':
      return [new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0), endOfDay(now)];
    case 'LAST_MONTH':
      return [
        new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0),
        new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      ];
    case 'TODAY':
    default:
      return [startOfDay(now), endOfDay(now)];
  }
};

const CdrReports = () => {
  const [cdrData, setCdrData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [filterProvider, setFilterProvider] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterRange, setFilterRange] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchReport, setSearchReport] = useState('');
  const [selectedDatePreset, setSelectedDatePreset] = useState('TODAY');
  const [dateRange, setDateRange] = useState(() => getPresetDateRange('TODAY'));
  const [groupByKey, setGroupByKey] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [totalRows, setTotalRows] = useState(0);
  const [debouncedSearchReport, setDebouncedSearchReport] = useState('');

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isClientRole = roles.some((r) => ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE'].includes(r));
  const resourceId = user?.resourceId || null;
  const clientId = user?.clientId || null;

  const statusOptions = useMemo(
    () => [
      { value: 'SUBMITTED', label: 'Submitted' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'SENT', label: 'Sent' },
      { value: 'UNKNOWN', label: 'Unknown' },
     // { value: 'DELIVERED_OPERATOR', label: 'Delivered' },
      { value: 'DELIVERED_HANDSET', label: 'Delivered' }
    ],
    []
  );

  useScopeStableEffect(() => {
    const loadOptions = async () => {
      try {
        const [provRes, rangeRes] = await Promise.all([
          smsService.listProviderOptions().catch(() => null),
          smsService.listRangeOptions().catch(() => null)
        ]);
        const provList = provRes?.data || provRes || [];
        setProviders(Array.isArray(provList) ? provList.map((p) => ({ value: p.id, label: p.name })) : []);

        const rangeContent = rangeRes?.data?.content || rangeRes?.content || [];
        // Send the route UUID as the filter value (the backend matches it
        // against cdr.range_id, the FK persisted at ingestion). Show the
        // human-readable brand/name as the label — never the numeric prefix.
        const seen = new Set();
        const opts = [];
        for (const r of rangeContent) {
          const id = r.id || r.rangeId;
          const label = r.rangeName || r.name || r.brand;
          if (!id || !label || seen.has(id)) continue;
          seen.add(id);
          opts.push({ value: String(id), label: String(label) });
        }
        setRanges(opts);
      } catch {
        setProviders([]);
        setRanges([]);
      }

      try {
        if (resourceId) {
          const agRes = await clientService.list(resourceId, { size: 500 });
          const agList = agRes?.data?.content || agRes?.content || [];
          setAgents(agList.map((a) => ({ value: a.id, label: a.name })));
        }
      } catch {
        setAgents([]);
      }
    };
    loadOptions();
  }, [resourceId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchReport(String(searchReport || '').trim()), 350);
    return () => clearTimeout(t);
  }, [searchReport]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [
    filterProvider,
    filterAgent,
    filterRange,
    filterStatus,
    dateRange,
    debouncedSearchReport,
    groupByKey
  ]);

  const buildParams = useCallback(() => {
    const params = {};
    if (!groupByKey) {
      params.page = pagination.pageIndex;
      params.size = pagination.pageSize;
    } else {
      // Group-by is a client-side aggregation; fetch the full filtered set
      // so totals and per-group counts reflect every matching CDR. Use 5000
      // by default — safely below the Spring max-page-size config and
      // most JPA query result limits. Bump higher only if needed.
      params.page = 0;
      params.size = 5000;
    }
    if (debouncedSearchReport) params.search = debouncedSearchReport;
    if (isClientRole && clientId) params.clientId = clientId;
    else if (resourceId) params.companyId = resourceId;
    if (filterProvider) params.providerId = filterProvider;
    if (filterAgent && !isClientRole) params.clientId = filterAgent;
    if (filterRange) params.range = filterRange;
    if (filterStatus) params.status = filterStatus;
    const [start, end] = Array.isArray(dateRange) ? dateRange : [];
    if (start instanceof Date && !Number.isNaN(start.getTime())) params.from = start.toISOString();
    if (end instanceof Date && !Number.isNaN(end.getTime())) params.to = end.toISOString();
    return params;
  }, [
    groupByKey,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchReport,
    isClientRole,
    clientId,
    resourceId,
    filterProvider,
    filterAgent,
    filterRange,
    filterStatus,
    dateRange
  ]);

  const fetchCdrs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = { ...buildParams() };
      if (silent) params.live = true;
      const res = await smsService.getCdrReports(params);
      const payload = res?.data || res || {};
      const records = payload.records || payload;
      const content = records?.content ?? payload.content ?? [];
      const total =
        typeof records?.totalElements === 'number'
          ? records.totalElements
          : typeof payload.totalElements === 'number'
            ? payload.totalElements
            : Array.isArray(content)
              ? content.length
              : 0;
      setCdrData(Array.isArray(content) ? content : []);
      setTotalRows(total);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      if (!silent) {
        console.error('Failed to load CDR records', error);
        // Surface the actual error so transient backend issues are visible
        // (e.g., size cap, query timeout, validation). Previously we silently
        // cleared cdrData to [], which broke group-by aggregations that
        // depended on the existing rows.
        toast.error(error?.message || 'Failed to load CDR records');
      }
      // Don't wipe cdrData on error — keep the last good rows so the
      // already-rendered table and any client-side aggregation (group-by
      // totals / summary cards) keep showing real data instead of zeros.
    } finally {
      if (!silent) setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchCdrs(false);
  }, [fetchCdrs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCdrs(true).finally(() => setRefreshing(false));
  };

  const sortedData = useMemo(() => {
    let list = Array.isArray(cdrData) ? [...cdrData] : [];
    const activeGroup = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey);
    if (activeGroup) {
      list.sort((a, b) => {
        let aVal = a[activeGroup.accessor] ?? '';
        let bVal = b[activeGroup.accessor] ?? '';
        if (activeGroup.key === 'month' && aVal) aVal = String(aVal).slice(0, 7);
        if (activeGroup.key === 'month' && bVal) bVal = String(bVal).slice(0, 7);
        return String(aVal).localeCompare(String(bVal));
      });
    }
    return list;
  }, [cdrData, groupByKey]);

  const searchedData = useMemo(() => {
    if (!groupByKey) {
      return sortedData;
    }
    const query = String(searchReport || '').trim().toLowerCase();
    if (!query) return sortedData;
    return sortedData.filter((row) => {
      const searchableValues = [
        row?.date,
        row?.provider,
        row?.range,
        row?.type,
        row?.number,
        row?.cli,
        row?.sms,
        row?.encoding,
        row?.segments,
        row?.price,
        row?.agent,
        row?.manager,
        row?.currency,
        row?.myPayout,
        row?.agentPayout,
        row?.status,
        cdrStatusLabel(row?.status),
        causeLabel(row?.status),
        row?.ip
      ];
      return searchableValues
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [sortedData, searchReport, groupByKey]);

  const groupedSummary = useMemo(() => {
    const summary = {
      totalSms: 0,
      myPayout: { USD: 0, EUR: 0, GBP: 0 },
      agentPayout: { USD: 0, EUR: 0, GBP: 0 }
    };

    searchedData.forEach((row) => {
      summary.totalSms += 1;
      const currencyRaw = String(row?.currency || 'USD').toUpperCase();
      const currency = currencyRaw === '$' ? 'USD' : currencyRaw;
      if (!summary.myPayout[currency]) summary.myPayout[currency] = 0;
      if (!summary.agentPayout[currency]) summary.agentPayout[currency] = 0;
      summary.myPayout[currency] += toNumber(row?.myPayout);
      summary.agentPayout[currency] += toNumber(row?.agentPayout);
    });

    return summary;
  }, [searchedData]);

  const groupedData = useMemo(() => {
    if (!groupByKey) return [];

    const groupedMap = new Map();
    searchedData.forEach((row) => {
      let groupValue = '-';
      if (groupByKey === 'date') {
        groupValue = formatCdrDate(row?.date).split(' ')[0];
      } else if (groupByKey === 'month') {
        const d = new Date(row?.date);
        groupValue = Number.isNaN(d.getTime()) ? '-' : String(d.getMonth() + 1);
      } else {
        const groupDef = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey);
        groupValue = plainCell(row?.[groupDef?.accessor || groupByKey]);
      }

      const key = String(groupValue || '-');
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          groupValue: key,
          totalSms: 0,
          myPayout: 0,
          agentPayout: 0
        });
      }

      const item = groupedMap.get(key);
      item.totalSms += 1;
      item.myPayout += toNumber(row?.myPayout);
      item.agentPayout += toNumber(row?.agentPayout);
    });

    return Array.from(groupedMap.values()).map((item) => ({
      ...item,
      currency: '$',
      myPayout: formatAmount(item.myPayout),
      agentPayout: formatAmount(item.agentPayout)
    }));
  }, [groupByKey, searchedData]);

  const groupedColumns = useMemo(() => {
    if (!groupByKey) return CDR_COLUMNS;
    const activeGroup = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey);
    const groupedHeader = activeGroup?.label || 'Group';
    return [
      { accessorKey: 'groupValue', header: groupedHeader, meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'totalSms', header: 'Total SMS', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'currency', header: 'Currency', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'myPayout', header: 'My Payout', meta: { headerProps: { className: 'text-900' } } },
      { accessorKey: 'agentPayout', header: 'Agent Payout', meta: { headerProps: { className: 'text-900' } } }
    ];
  }, [groupByKey]);

  const activeTableData = groupByKey ? groupedData : searchedData;
  const activeColumns = groupByKey ? groupedColumns : CDR_COLUMNS;
  const activeGroupLabel = GROUP_BY_OPTIONS.find((g) => g.key === groupByKey)?.label || '';

  const serverPaged = !groupByKey;
  const manualPageCount =
    serverPaged && totalRows > 0
      ? Math.ceil(totalRows / Math.max(1, pagination.pageSize))
      : 0;

  const gridRows = useMemo(() => {
    const rows = Array.isArray(activeTableData) ? activeTableData : [];
    return rows.map((r) => {
      const d = buildDisplayRow(r);
      if (groupByKey) {
        return r;
      }
      return {
        _id: r?.id ?? r?.messageUid ?? r?.externalId ?? r?.vendorMessageId ?? `${d.Date}__${d.Number}__${d.CLI}`,
        ...d
      };
    });
  }, [activeTableData, groupByKey]);

  const table = useAdvanceTable({
    data: activeTableData,
    columns: activeColumns,
    sortable: true,
    pagination: false
  });

  const rowsForExport = useMemo(() => {
    if (groupByKey) {
      return groupedData.map((row) => ({
        Group: row.groupValue,
        'Total SMS': row.totalSms,
        Currency: row.currency,
        'My Payout': row.myPayout,
        'Agent Payout': row.agentPayout
      }));
    }
    return (Array.isArray(activeTableData) ? activeTableData : []).map((row) => buildDisplayRow(row));
  }, [activeTableData, groupedData, groupByKey]);

  const handleExport = useCallback((type) => {
    const exportColumns = groupByKey
      ? ['Group', 'Total SMS', 'Currency', 'My Payout', 'Agent Payout']
      : EXPORT_COLUMNS;
    const pdfOptions = groupByKey
      ? undefined
      : {
          format: 'a3',
          orientation: 'landscape',
          fontSize: 7,
          headerFontSize: 7,
          columns: PDF_COLUMNS,
          mapRow: (row) => ({
            ...row,
            SMS: String(row.SMS || '').length > 140 ? `${String(row.SMS).slice(0, 137)}...` : row.SMS
          }),
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 55 },
            2: { cellWidth: 70 },
            3: { cellWidth: 45 },
            4: { cellWidth: 90 },
            5: { cellWidth: 70 },
            6: { cellWidth: 220 },
            7: { cellWidth: 45 },
            8: { cellWidth: 40 },
            9: { cellWidth: 65 },
            10: { cellWidth: 65 },
            11: { cellWidth: 45 },
            12: { cellWidth: 50 },
            13: { cellWidth: 55 },
            14: { cellWidth: 60 },
            15: { cellWidth: 55 },
            16: { cellWidth: 50 },
            17: { cellWidth: 55 }
          }
        };
    exportRowsByType({
      type,
      title: 'CDR Records',
      filenamePrefix: 'cdr-records',
      columns: exportColumns,
      rows: rowsForExport,
      pdfOptions
    });
  }, [rowsForExport, groupByKey]);

  return (
      <Card className="mb-3">
        <Card.Header>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">CDR Records</h5>
              {loading && <Spinner animation="border" size="sm" className="ms-2" />}
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div
                id="cdr-actions"
                className="table-page-header-actions d-flex align-items-center flex-wrap gap-2 justify-content-start justify-content-xl-end"
              >
              <AdvanceTableDateRangeFilter
              value={dateRange}
              onChange={(val) => {
                setDateRange(val);
                setSelectedDatePreset('');
              }}
              className="table-page-filter"
              placeholder="Date"
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterProvider}
              placeholder="Select provider"
              onChange={(value) => setFilterProvider(value || '')}
              options={providers}
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterAgent}
              placeholder="Select agent"
              onChange={(value) => setFilterAgent(value || '')}
              options={agents}
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterRange}
              placeholder="Select range"
              onChange={(value) => setFilterRange(value || '')}
              options={ranges}
            />
            <TableSelectFilter
              className="table-page-filter"
              value={selectedDatePreset}
              placeholder="Date filter"
              onChange={(value) => {
                const nextPreset = value || 'TODAY';
                setSelectedDatePreset(nextPreset);
                setDateRange(getPresetDateRange(nextPreset));
              }}
              options={DATE_FILTER_OPTIONS}
            />

            <TableSelectFilter
              className="table-page-filter"
              value={filterStatus}
              placeholder="Status"
              onChange={(v) => setFilterStatus(v || '')}
              options={statusOptions}
            />
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
              label="Export"
              onExport={handleExport}
            />
                <TableSearchInput
                  className="table-page-filter"
                  value={searchReport}
                  onChange={setSearchReport}
                  placeholder="Search report"
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
          {groupByKey && (
            <div className="border-top bg-white px-3 py-3">
              <div
                className="d-grid gap-2 fs-10 align-items-start"
                style={{ gridTemplateColumns: '2fr 4fr 4fr' }}
              >
                <div className="text-center">
                  <div className="text-uppercase text-600 fw-bold mb-2">
                    {`Total SMS${activeGroupLabel ? ` (${activeGroupLabel})` : ''}`}
                  </div>
                  <div className="fw-bold fs-9">{groupedSummary.totalSms.toLocaleString()}</div>
                </div>

                <div className="text-center">
                  <div className="text-uppercase text-600 fw-bold mb-2">Manager Total</div>
                  <div className="d-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    <div className="text-600 fw-semibold">Total</div>
                    <div className="text-600 fw-semibold">USD</div>
                    <div className="text-600 fw-semibold">EUR</div>
                    <div className="text-600 fw-semibold">GBP</div>

                    <div className="fw-semibold">${formatAmount(groupedSummary.myPayout.USD)}</div>
                    <div className="fw-semibold">${formatAmount(groupedSummary.myPayout.USD)}</div>
                    <div className="fw-semibold text-success">{formatAmount(groupedSummary.myPayout.EUR)}</div>
                    <div className="fw-semibold text-warning">{formatAmount(groupedSummary.myPayout.GBP)}</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-uppercase text-600 fw-bold mb-2">Client Total</div>
                  <div className="d-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    <div className="text-600 fw-semibold">Total</div>
                    <div className="text-600 fw-semibold">USD</div>
                    <div className="text-600 fw-semibold">EUR</div>
                    <div className="text-600 fw-semibold">GBP</div>

                    <div className="fw-semibold">${formatAmount(groupedSummary.agentPayout.USD)}</div>
                    <div className="fw-semibold">${formatAmount(groupedSummary.agentPayout.USD)}</div>
                    <div className="fw-semibold text-success">{formatAmount(groupedSummary.agentPayout.EUR)}</div>
                    <div className="fw-semibold text-warning">{formatAmount(groupedSummary.agentPayout.GBP)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
        <Card.Footer>
          <SimplePager
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            totalRows={serverPaged ? totalRows : gridRows.length}
            onPageIndexChange={(next) => setPagination((p) => ({ ...p, pageIndex: Math.max(0, next) }))}
            onPageSizeChange={(nextSize) => setPagination((p) => ({ ...p, pageSize: Math.max(25, nextSize), pageIndex: 0 }))}
            pageSizeOptions={[25, 100, 500, 1000, 5000]}
          />
        </Card.Footer>
      </Card>
  );
};

export default CdrReports;
