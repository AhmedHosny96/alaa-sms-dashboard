import './ossMtBssAg/ossMtBssAgSetup';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import TablePageLayout from 'components/common/TablePageLayout';
import { TableExportSelect } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { getAuthUser } from 'components/authentication/authStorage';
import { exportRowsByType } from 'utils/tableExport';
import OssMtBssAgSection from './ossMtBssAg/OssMtBssAgSection';
import {
  fmtInt,
  fmtNum,
  OssLeadColumnHeader,
  OssPctTintCell,
  SenderIdAgCell,
  SenderTrafficValueCell
} from './ossMtBssAg/ossMtBssAgCells';

function coerceTrafficRows(v) {
  return Array.isArray(v) ? v : [];
}

function unwrapMtBssPayload(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { senderTraffic: [], detailedTraffic: [] };
  }

  let o = raw;

  const hasTrafficKeys = (obj) =>
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    (Array.isArray(obj.senderTraffic) ||
      Array.isArray(obj.sender_traffic) ||
      Array.isArray(obj.detailedTraffic) ||
      Array.isArray(obj.detailed_traffic));

  if (!hasTrafficKeys(o) && raw.data != null && typeof raw.data === 'object') {
    o = raw.data;
    if (!hasTrafficKeys(o) && o.data != null && typeof o.data === 'object') {
      o = o.data;
    }
  }

  return {
    senderTraffic: coerceTrafficRows(o.senderTraffic ?? o.sender_traffic),
    detailedTraffic: coerceTrafficRows(o.detailedTraffic ?? o.detailed_traffic)
  };
}

function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Called on every fetch so rolling ranges always use current time as `to`.
function computeRangeParams(key) {
  const now = new Date();
  switch (key) {
    case '1m':  return { from: new Date(now - 60_000).toISOString(),              to: now.toISOString() };
    case '5m':  return { from: new Date(now - 5 * 60_000).toISOString(),           to: now.toISOString() };
    case '15m': return { from: new Date(now - 15 * 60_000).toISOString(),          to: now.toISOString() };
    case '60m': return { from: new Date(now - 60 * 60_000).toISOString(),          to: now.toISOString() };
    case '24h': return { from: new Date(now - 24 * 60 * 60_000).toISOString(),     to: now.toISOString() };
    case '48h': return { from: new Date(now - 48 * 60 * 60_000).toISOString(),     to: now.toISOString() };
    case 'today': return { from: startOfLocalDay(now).toISOString(),               to: now.toISOString() };
    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: startOfLocalDay(y).toISOString(), to: endOfLocalDay(y).toISOString() };
    }
    case 'month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { from: s.toISOString(), to: now.toISOString() };
    }
    default: return { from: new Date(now - 24 * 60 * 60_000).toISOString(), to: now.toISOString() };
  }
}

function median(nums) {
  const arr = nums.filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (arr.length === 0) return 0;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

const QUICK_RANGE_OPTIONS = [
  { value: '1m', label: 'Last 1 Minute' },
  { value: '5m', label: 'Last 5 Minutes' },
  { value: '15m', label: 'Last 15 Minutes' },
  { value: '60m', label: 'Last 60 Minutes' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '48h', label: 'Last 48 Hours' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'month', label: 'This Month' }
];

function OssMtBssTotalsBar({ rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const sum = (k) => rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const submitted = sum('submitted');
  const successful = sum('successful');
  const failed = sum('failed');
  const delivered = sum('delivered');
  const billC = sum('billableClient');
  const billV = sum('billableVendor');
  const revenue = sum('revenue');
  const cost = sum('cost');
  const dlrPct = submitted > 0 ? ((delivered / submitted) * 100).toFixed(2) : '0.00';

  const item = (label, value) => (
    <span key={label} className="text-nowrap me-3 mb-1 d-inline-flex align-items-baseline gap-1">
      <span className="text-600 fs--2">{label}</span>
      <span className="fw-semibold text-900 fs--2">{value}</span>
    </span>
  );

  return (
    <div className="d-flex flex-wrap align-items-center oss-mt-bss-totals-bar">
      {item('Total Submitted', fmtInt(submitted))}
      {item('Successful', fmtInt(successful))}
      {item('Failed', fmtInt(failed))}
      {item(`DLR%`, `${dlrPct}%`)}
      {item('Delivered', fmtInt(delivered))}
      {item('Billable (C)', fmtInt(billC))}
      {item('Billable (V)', fmtInt(billV))}
      {item('Avg. Rate (C)', submitted > 0 ? fmtNum(revenue / submitted, 5) : fmtNum(0, 5))}
      {item('Avg. Rate (V)', submitted > 0 ? fmtNum(cost / submitted, 5) : fmtNum(0, 5))}
    </div>
  );
}

function useStatsScopeParams() {
  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isClientRole = roles.some((r) => ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE'].includes(r));
  const resourceId = user?.resourceId || null;
  const explicitClientId = user?.clientId || null;

  const buildScopedParams = useCallback(() => {
    const params = {};
    if (isClientRole && (explicitClientId || resourceId)) {
      params.clientId = explicitClientId || resourceId;
    } else if (!isPlatformAdmin && resourceId) {
      params.companyId = resourceId;
    }
    return params;
  }, [explicitClientId, isClientRole, isPlatformAdmin, resourceId]);

  return { buildScopedParams, isPlatformAdmin };
}

function MtBss() {
  const { buildScopedParams, isPlatformAdmin } = useStatsScopeParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [querySender, setQuerySender] = useState('');
  const [queryDetailed, setQueryDetailed] = useState('');
  const [senderTraffic, setSenderTraffic] = useState([]);
  const [detailedTraffic, setDetailedTraffic] = useState([]);
  const [expandedSender, setExpandedSender] = useState(null);
  const [senderDetailRows, setSenderDetailRows] = useState({});
  const [detailLoadingKey, setDetailLoadingKey] = useState(null);
  const [compactGrids, setCompactGrids] = useState(false);

  const [rangeKey, setRangeKey] = useState('24h');

  const applyQuickRange = useCallback((key) => {
    setRangeKey(key);
  }, []);

  const companyIdFromUrl = searchParams.get('companyId') || '';
  const clientIdFromUrl = searchParams.get('clientId') || '';

  const scopeParams = useMemo(() => {
    const params = { ...buildScopedParams() };
    if (isPlatformAdmin && companyIdFromUrl.trim()) {
      params.companyId = companyIdFromUrl.trim();
    }
    if (isPlatformAdmin && clientIdFromUrl.trim()) {
      params.clientId = clientIdFromUrl.trim();
    }
    return params;
  }, [buildScopedParams, isPlatformAdmin, companyIdFromUrl, clientIdFromUrl]);

  const loadSnapshot = useCallback(
    async (silent) => {
      if (!silent) setLoading(true);
      try {
        const raw = await smsService.getOssMtBss({ ...scopeParams, ...computeRangeParams(rangeKey) });
        const data = unwrapMtBssPayload(raw);
        setLoadError(null);
        setSenderTraffic(data.senderTraffic);
        setDetailedTraffic(data.detailedTraffic);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e || 'OSS MT BSS request failed');
        if (silent) return;
        console.error('OSS MT BSS load failed', e);
        setLoadError(msg);
        toast.error(msg);
        setSenderTraffic([]);
        setDetailedTraffic([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [scopeParams, rangeKey]
  );

  const loadSenderDetail = useCallback(
    async (brandNorm, silent) => {
      if (!brandNorm) return;
      try {
        if (!silent) setDetailLoadingKey(brandNorm);
        const raw = await smsService.getOssMtBssSenderDetail({
          ...scopeParams, ...computeRangeParams(rangeKey), brandNorm
        });
        const rows = Array.isArray(raw) ? raw : raw?.data != null && Array.isArray(raw.data) ? raw.data : [];
        setSenderDetailRows((prev) => ({ ...prev, [brandNorm]: rows }));
      } catch (e) {
        console.error('Sender detail failed', e);
      } finally {
        if (!silent) setDetailLoadingKey(null);
      }
    },
    [scopeParams, rangeKey]
  );

  useEffect(() => {
    loadSnapshot(false);
  }, [loadSnapshot]);

  const toggleExpand = useCallback(
    async (senderId) => {
      if (!senderId) return;
      if (expandedSender === senderId) {
        setExpandedSender(null);
        return;
      }
      setExpandedSender(senderId);
      if (!senderDetailRows[senderId]) {
        await loadSenderDetail(senderId, false);
      }
    },
    [expandedSender, loadSenderDetail, senderDetailRows]
  );

  const filteredSenderCombined = useMemo(() => {
    const q = querySender.trim().toLowerCase();
    const agg = senderTraffic.filter(
      (r) =>
        !q ||
        String(r.senderId || '')
          .toLowerCase()
          .includes(q) ||
        String(r.clientName || '')
          .toLowerCase()
          .includes(q)
    );

    const submittedMedian = median(agg.map((r) => Number(r.submitted) || 0));
    const deliveredMedian = median(agg.map((r) => Number(r.delivered) || 0));

    const out = [];
    for (const r of agg) {
      const submittedN = Number(r.submitted) || 0;
      const deliveredN = Number(r.delivered) || 0;
      out.push({
        id: `agg-${r.senderId}`,
        rowKind: 'agg',
        senderId: r.senderId,
        submitted: r.submitted,
        failed: r.failed,
        delivered: r.delivered,
        dlrPct: r.dlrPct,
        crPct: r.crPct,
        dlrPctValue: r.dlrPctValue,
        crPctValue: r.crPctValue,
        submittedTrend: submittedN > 0 ? (submittedN >= submittedMedian ? 'up' : 'down') : null,
        deliveredTrend: deliveredN > 0 ? (deliveredN >= deliveredMedian ? 'up' : 'down') : null,
        title: r.senderId
      });
      if (expandedSender === r.senderId && senderDetailRows[r.senderId]) {
        const children = senderDetailRows[r.senderId];
        children.forEach((c, idx) => {
          out.push({
            id: `cl-${r.senderId}-${c.clientId || idx}`,
            rowKind: 'client',
            senderId: c.senderId ?? r.senderId,
            clientName: c.clientName,
            clientId: c.clientId,
            submitted: c.submitted,
            failed: c.failed,
            delivered: c.delivered,
            dlrPct: c.dlrPct,
            crPct: c.crPct,
            dlrPctValue: c.dlrPctValue,
            crPctValue: c.crPctValue,
            title: c.clientName
          });
        });
      }
    }
    return out;
  }, [senderTraffic, expandedSender, senderDetailRows, querySender]);

  const filteredDetailed = useMemo(() => {
    const q = queryDetailed.trim().toLowerCase();
    if (!q) return detailedTraffic;
    return detailedTraffic.filter((r) =>
      ['range', 'msisdn', 'country', 'submitted', 'delivered', 'failed'].some((k) =>
        String(r[k] ?? '').toLowerCase().includes(q)
      )
    );
  }, [detailedTraffic, queryDetailed]);

  const detailedRowData = useMemo(
    () =>
      filteredDetailed.map((r, i) => {
        const label = r.range ?? r.msisdn ?? r.country ?? '-';
        return {
          ...r,
          range: label,
          id: r.id ?? `dst-${String(label)}-${i}`
        };
      }),
    [filteredDetailed]
  );

  const senderContext = useMemo(
    () => ({ toggleExpand, expandedSender, detailLoadingKey }),
    [toggleExpand, expandedSender, detailLoadingKey]
  );

  const senderColDefs = useMemo(
    () => [
      {
        colId: 'senderId',
        field: 'senderId',
        headerName: 'Sender ID',
        headerComponent: OssLeadColumnHeader,
        flex: 1.4,
        minWidth: 220,
        cellRenderer: SenderIdAgCell,
        headerClass: 'oss-ag-header-left',
        cellClass: 'oss-ag-sender',
        suppressHeaderMenuButton: false,
        sortable: false
      },
      {
        field: 'submitted',
        headerName: 'Submitted',
        flex: 0.9,
        minWidth: 110,
        headerClass: 'oss-ag-header-center',
        cellClass: 'oss-ag-trend',
        cellRenderer: SenderTrafficValueCell,
        enableCellChangeFlash: true,
        initialSort: 'desc',
        initialSortIndex: 0
      },
      {
        field: 'failed',
        headerName: 'Failed',
        flex: 0.7,
        minWidth: 90,
        headerClass: 'oss-ag-header-center',
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        valueFormatter: (p) => fmtInt(p.value),
        enableCellChangeFlash: true
      },
      {
        field: 'delivered',
        headerName: 'Delivered',
        flex: 0.9,
        minWidth: 100,
        headerClass: 'oss-ag-header-center',
        cellClass: 'oss-ag-trend',
        cellRenderer: SenderTrafficValueCell,
        enableCellChangeFlash: true
      },
      {
        colId: 'dlrPct',
        field: 'dlrPct',
        headerName: 'DLR%',
        flex: 0.9,
        minWidth: 100,
        cellRenderer: OssPctTintCell,
        sortable: false,
        cellClass: 'oss-ag-pct',
        headerClass: 'oss-ag-header-center'
      },
      {
        colId: 'crPct',
        field: 'crPct',
        headerName: 'CR%',
        flex: 0.8,
        minWidth: 90,
        cellRenderer: OssPctTintCell,
        sortable: false,
        cellClass: 'oss-ag-pct',
        headerClass: 'oss-ag-header-center'
      }
    ],
    []
  );

  const detailedColDefs = useMemo(
    () => [
      {
        field: 'range',
        colId: 'destination',
        headerName: 'Destination',
        headerTooltip: 'Destination range (matched route brand)',
        headerComponent: OssLeadColumnHeader,
        minWidth: 130,
        flex: 1.4,
        headerClass: 'oss-ag-header-left',
        cellClass: 'text-start',
        valueGetter: (p) => {
          const raw = p.data?.range ?? p.data?.msisdn ?? p.data?.country;
          if (raw == null || raw === '-') return '-';
          return String(raw);
        }
      },
      {
        field: 'submitted',
        headerName: 'Submitted',
        minWidth: 90,
        flex: 0.85,
        headerClass: 'oss-ag-header-center',
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        valueFormatter: (p) => fmtInt(p.value),
        initialSort: 'desc',
        initialSortIndex: 0
      },
      {
        field: 'successful',
        headerName: 'Successful',
        minWidth: 90,
        flex: 0.85,
        headerClass: 'oss-ag-header-center',
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        valueFormatter: (p) => fmtInt(p.value)
      },
      {
        field: 'failed',
        headerName: 'Failed',
        minWidth: 70,
        flex: 0.7,
        headerClass: 'oss-ag-header-center',
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        valueFormatter: (p) => fmtInt(p.value)
      },
      {
        field: 'dlrPct',
        headerName: 'DLR%',
        minWidth: 80,
        flex: 0.85,
        cellRenderer: OssPctTintCell,
        sortable: false,
        cellClass: 'oss-ag-pct',
        headerClass: 'oss-ag-header-center'
      },
      {
        field: 'crPct',
        headerName: 'CR%',
        minWidth: 70,
        flex: 0.7,
        cellRenderer: OssPctTintCell,
        sortable: false,
        cellClass: 'oss-ag-pct',
        headerClass: 'oss-ag-header-center'
      },
      {
        field: 'delivered',
        headerName: 'Delivered',
        minWidth: 85,
        flex: 0.85,
        headerClass: 'oss-ag-header-center',
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        valueFormatter: (p) => fmtInt(p.value)
      },
      {
        field: 'billableClient',
        headerName: 'Billable (C)',
        minWidth: 85,
        flex: 0.85,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtInt(p.value)
      },
      {
        field: 'billableVendor',
        headerName: 'Billable (V)',
        minWidth: 85,
        flex: 0.85,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtInt(p.value)
      },
      {
        field: 'avgRateClient',
        headerName: 'Avg. Rate (C)',
        minWidth: 95,
        flex: 0.95,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtNum(p.value, 5)
      },
      {
        field: 'avgRateVendor',
        headerName: 'Avg. Rate (V)',
        minWidth: 95,
        flex: 0.95,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtNum(p.value, 5)
      },
      {
        field: 'avgDelaySeconds',
        headerName: 'Avg. Delay',
        minWidth: 80,
        flex: 0.75,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtInt(p.value)
      },
      {
        field: 'revenue',
        headerName: 'Revenue',
        minWidth: 80,
        flex: 0.8,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtNum(p.value, 3)
      },
      {
        field: 'cost',
        headerName: 'Cost',
        minWidth: 75,
        flex: 0.75,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtNum(p.value, 4)
      },
      {
        field: 'margin',
        headerName: 'Margin',
        minWidth: 80,
        flex: 0.8,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtNum(p.value, 4)
      },
      {
        field: 'marginPct',
        headerName: 'Margin %',
        minWidth: 85,
        flex: 0.85,
        cellRenderer: OssPctTintCell,
        sortable: false,
        cellClass: 'oss-ag-pct',
        headerClass: 'oss-ag-header-center'
      },
      {
        field: 'hlrChecks',
        headerName: 'HLR Checks',
        minWidth: 85,
        flex: 0.8,
        cellClass: ['oss-ag-cell-plain', 'oss-ag-cell-plain-center'],
        headerClass: 'oss-ag-header-center',
        valueFormatter: (p) => fmtInt(p.value)
      }
    ],
    []
  );

  const senderRowStyle = useCallback((params) => {
    if (params.data?.rowKind === 'client') {
      return { background: '#f4f8fc' };
    }
    return undefined;
  }, []);

  const gridHeightSender = compactGrids ? 360 : 480;

  const toolbarToggles = (
    <>
      <Form.Check
        type="switch"
        id="oss-mt-bss-compact"
        label=""
        title="Dense layout"
        className="m-0"
        checked={compactGrids}
        onChange={(e) => setCompactGrids(e.target.checked)}
      />
      <span className="text-600 fs--2 fw-medium">Dense</span>
    </>
  );

  const filterMenuItems = useMemo(
    () =>
      QUICK_RANGE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
        active: rangeKey === opt.value
      })),
    [rangeKey]
  );

  const detailedFooter = useMemo(() => <OssMtBssTotalsBar rows={filteredDetailed} />, [filteredDetailed]);

  return (
    <TablePageLayout
      title="OSS MT BSS"
      className="px-0 py-0"
      toolbar={
        loading ? (
          <div className="spinner-border spinner-border-sm text-secondary ms-2" role="status">
            <span className="visually-hidden">Loading</span>
          </div>
        ) : null
      }
    >
      <div className="p-0">
        {loadError ? (
          <Alert variant="danger" className="mb-3" dismissible onClose={() => setLoadError(null)}>
            {loadError}
          </Alert>
        ) : null}

        <OssMtBssAgSection
          title="OSS MT BSS — Traffic overview"
          titleIcon="chart-line"
          showSubtitle
          dashboardPanel
          rowData={detailedRowData}
          columnDefs={detailedColDefs}
          footerSummary={detailedFooter}
          height={compactGrids ? 400 : 520}
          sizeColumnsToFitOnReady
          overlayNoRowsMessage="No traffic rows for this range"
          searchValue={queryDetailed}
          onSearchChange={setQueryDetailed}
          onRefresh={() => loadSnapshot(false)}
          loadingRefresh={loading}
          headerTools={toolbarToggles}
          filterMenuItems={filterMenuItems}
          onFilterMenuSelect={applyQuickRange}
          exportMenu={
            <TableExportSelect
              icon="external-link-alt"
              variant="falcon-default"
              onExport={(type) =>
                exportRowsByType({
                  type,
                  title: 'OSS MT BSS Traffic overview',
                  filenamePrefix: 'oss-mt-bss-overview',
                  columns: detailedColDefs.map((c) => String(c.headerName)),
                  rows: filteredDetailed.map((r) => {
                    const rn = { ...r, range: r.range ?? r.msisdn ?? r.country ?? '-' };
                    return detailedColDefs.reduce((acc, col) => {
                      const k = col.field;
                      if (k) acc[String(col.headerName)] = rn[k];
                      return acc;
                    }, {});
                  })
                })}
            />
          }
        />

        <OssMtBssAgSection
          title="Sender Traffic Report"
          titleIcon="paper-plane"
          showSubtitle={expandedSender != null}
          subtitle={
            <span className="text-700 fs--2">Expand a sender for per-client breakout (Customer Company).</span>
          }
          dashboardPanel
          enableSingleRowSelection
          rowData={filteredSenderCombined}
          columnDefs={senderColDefs}
          context={senderContext}
          getRowStyle={senderRowStyle}
          height={gridHeightSender}
          sizeColumnsToFitOnReady
          overlayNoRowsMessage="No sender traffic rows for this range"
          searchValue={querySender}
          onSearchChange={setQuerySender}
          onRefresh={() => loadSnapshot(false)}
          loadingRefresh={loading}
          filterMenuItems={filterMenuItems}
          onFilterMenuSelect={applyQuickRange}
          exportMenu={
            <TableExportSelect
              icon="external-link-alt"
              variant="falcon-default"
              onExport={(type) =>
                exportRowsByType({
                  type,
                  title: 'Sender Traffic',
                  filenamePrefix: 'sender-traffic',
                  columns: ['Sender ID', 'Submitted', 'Failed', 'Delivered', 'DLR%', 'CR%'],
                  rows: filteredSenderCombined
                    .filter((r) => r.rowKind === 'agg')
                    .map((r) => ({
                      'Sender ID': r.senderId,
                      Submitted: r.submitted,
                      Failed: r.failed,
                      Delivered: r.delivered,
                      'DLR%': r.dlrPct,
                      'CR%': r.crPct
                    }))
                })}
            />
          }
        />
      </div>
    </TablePageLayout>
  );
}

export default MtBss;
