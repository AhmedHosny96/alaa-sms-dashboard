import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Col, Dropdown, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ossMtBssAg.scss';

const FS_BODY_CLASS = 'oss-mt-bss-fs-active';
const FS_COUNTER_KEY = '__ossMtBssFsCount';

function activateFsBodyClass() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const next = (window[FS_COUNTER_KEY] || 0) + 1;
  window[FS_COUNTER_KEY] = next;
  document.body.classList.add(FS_BODY_CLASS);
}

function deactivateFsBodyClass() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const next = Math.max(0, (window[FS_COUNTER_KEY] || 0) - 1);
  window[FS_COUNTER_KEY] = next;
  if (next === 0) {
    document.body.classList.remove(FS_BODY_CLASS);
  }
}

const ossGridTheme = themeQuartz.withParams({
  accentColor: '#2563eb',
  backgroundColor: '#ffffff',
  borderColor: '#e3e7ec',
  borderRadius: 4,
  browserColorScheme: 'light',
  cellHorizontalPadding: 10,
  chromeBackgroundColor: '#f4f6f9',
  fontFamily: { googleFont: 'Inter' },
  fontSize: 12,
  foregroundColor: '#1a1d21',
  headerBackgroundColor: '#f2f4f7',
  headerFontSize: 12,
  headerFontWeight: 600,
  headerHeight: 38,
  headerTextColor: '#1a1d21',
  headerVerticalPaddingScale: 1,
  iconSize: 12,
  oddRowBackgroundColor: '#ffffff',
  rowBorder: { style: 'solid', width: 1, color: '#eef0f3' },
  rowHeight: 36,
  rowHoverColor: '#f7f8fa',
  selectedRowBackgroundColor: 'rgba(37, 99, 235, 0.10)',
  wrapperBorder: { style: 'solid', width: 1, color: '#dfe3e8' },
  wrapperBorderRadius: 6,
  cellFlashColor: 'rgba(255, 215, 0, 0.55)',
  cellFlashDuration: 400,
  cellFadeDuration: 1400
});

export default function OssMtBssAgSection({
  title,
  titleIcon,
  showSubtitle,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  exportMenu,
  onRefresh,
  loadingRefresh,
  rowData,
  columnDefs,
  context,
  getRowStyle,
  paginationPageSizes = [25, 50, 100],
  pageSize = 50,
  height = 440,
  headerTools,
  sizeColumnsToFitOnReady = false,
  overlayNoRowsMessage = 'No rows for this range',
  dashboardPanel = false,
  enableSingleRowSelection = false,
  footerSummary = null,
  presetSlot = null,
  filterMenuItems = null,
  onFilterMenuSelect,
  filterMenuLabel = 'Time period'
}) {
  const searchInputRef = useRef(null);
  const gridWrapRef = useRef(null);
  const gridApiRef = useRef(null);
  const resizeRafRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    }),
    []
  );

  const rowSelectionOptions = useMemo(
    () =>
      enableSingleRowSelection
        ? { mode: 'singleRow', checkboxes: false, headerCheckbox: false, enableClickSelection: true }
        : undefined,
    [enableSingleRowSelection]
  );

  const syncGridLayout = useCallback(() => {
    const api = gridApiRef.current;
    if (!api || collapsed) return;
    if (resizeRafRef.current != null) {
      window.cancelAnimationFrame(resizeRafRef.current);
    }
    resizeRafRef.current = window.requestAnimationFrame(() => {
      try {
        api.doLayout();
        if (sizeColumnsToFitOnReady) {
          api.sizeColumnsToFit();
        }
      } catch {
        /* ignore layout errors in transient states */
      }
      resizeRafRef.current = null;
    });
  }, [collapsed, sizeColumnsToFitOnReady]);

  useEffect(() => {
    if (!fullScreen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setFullScreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullScreen]);

  useEffect(() => {
    if (!fullScreen) return undefined;
    activateFsBodyClass();
    return () => deactivateFsBodyClass();
  }, [fullScreen]);

  useEffect(
    () => () => {
      if (resizeRafRef.current != null) {
        window.cancelAnimationFrame(resizeRafRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (collapsed) return undefined;
    syncGridLayout();
    const onResize = () => syncGridLayout();
    window.addEventListener('resize', onResize);
    let observer;
    if (typeof ResizeObserver !== 'undefined' && gridWrapRef.current) {
      observer = new ResizeObserver(() => syncGridLayout());
      observer.observe(gridWrapRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (observer) observer.disconnect();
    };
  }, [collapsed, fullScreen, syncGridLayout]);

  const onGridReady = useCallback(
    (e) => {
      gridApiRef.current = e.api;
      if (!sizeColumnsToFitOnReady) return;
      requestAnimationFrame(() => {
        try {
          e.api.sizeColumnsToFit();
        } catch {
          /* narrow viewports */
        }
      });
    },
    [sizeColumnsToFitOnReady]
  );

  const onGridSizeChanged = useCallback(() => {
    syncGridLayout();
  }, [syncGridLayout]);

  const dashboardFilterBtn = dashboardPanel
    ? Array.isArray(filterMenuItems) && filterMenuItems.length > 0 ? (
      <Dropdown align="end" className="oss-mt-panel-tools flex-shrink-0">
        <Dropdown.Toggle
          as={Button}
          size="sm"
          variant="link"
          className="oss-mt-panel-tools-btn oss-mt-filter-toggle p-1 border-300 rounded-1 lh-1"
          title={filterMenuLabel}
          type="button"
        >
          <FontAwesomeIcon icon="filter" className="fs--2 text-700" />
        </Dropdown.Toggle>
        <Dropdown.Menu className="oss-mt-filter-menu py-1">
          {filterMenuItems.map((opt) => (
            <Dropdown.Item
              key={opt.value}
              active={opt.active === true}
              onClick={() => onFilterMenuSelect?.(opt.value)}
            >
              {opt.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    ) : (
      <Button
        size="sm"
        variant="link"
        className="oss-mt-panel-tools p-1 border-300 rounded-1 lh-1 flex-shrink-0"
        title="Filter table (opens search)"
        type="button"
        onClick={() => searchInputRef.current?.focus?.()}
      >
        <FontAwesomeIcon icon="filter" className="fs--2 text-700" />
      </Button>
    )
    : null;

  const dashboardFsCollapse = dashboardPanel ? (
    <div className="oss-mt-panel-tools d-inline-flex align-items-center gap-0 flex-shrink-0">
      <Button
        size="sm"
        variant="link"
        className="p-1 rounded-1 lh-1 text-700"
        title={fullScreen ? 'Exit full screen' : 'Expand to full screen'}
        type="button"
        onClick={() => setFullScreen((x) => !x)}
      >
        <FontAwesomeIcon icon={fullScreen ? 'times' : 'expand-arrows-alt'} className="fs--1" fixedWidth />
      </Button>
      <Button
        size="sm"
        variant="link"
        className="p-1 rounded-1 lh-1 text-700"
        title={collapsed ? 'Expand panel' : 'Collapse panel'}
        type="button"
        onClick={() => setCollapsed((x) => !x)}
      >
        <FontAwesomeIcon icon={collapsed ? 'chevron-down' : 'chevron-up'} className="fs--1" fixedWidth />
      </Button>
    </div>
  ) : null;

  const resolvedHeight =
    collapsed ? 0 : fullScreen ? Math.max(520, typeof window !== 'undefined' ? window.innerHeight - 140 : height) : height;

  const cardClass = ['mb-3', 'shadow-sm', 'border-300', fullScreen ? 'oss-mt-bss-panel-fs oss-mt-bss-panel-card rounded-0' : ''].join(
    ' '
  ).trim();

  return (
    <Card ref={gridWrapRef} className={`oss-mt-bss-panel-card ${cardClass}`}>
      <Card.Header className="py-2 bg-white border-bottom border-300 rounded-top">
        <Row className="flex-between-center align-items-start g-2 flex-wrap">
          <Col xs={12} lg="auto" className="min-w-0">
            <div className="d-flex align-items-center gap-2 text-nowrap oss-mt-bss-report-title">
              {titleIcon ? (
                <span className="oss-mt-bss-title-icon lh-1">
                  <FontAwesomeIcon icon={titleIcon} fixedWidth />
                </span>
              ) : null}
              <h6 className="fs-9 mb-0 text-nowrap fw-semibold text-900">{title}</h6>
            </div>
            {showSubtitle && subtitle ? (
              <div className="text-600 fs--2 mt-1">{subtitle}</div>
            ) : null}
          </Col>
          <Col
            xs={12}
            lg
            className="d-flex gap-2 flex-wrap justify-content-lg-end align-items-center flex-shrink-0"
          >
            {presetSlot}
            {headerTools}
            {dashboardFilterBtn}
            {typeof onRefresh === 'function' ? (
              <Button
                size="sm"
                variant="falcon-default"
                className="border-300 flex-shrink-0"
                title="Refresh"
                type="button"
                onClick={onRefresh}
                disabled={loadingRefresh}
              >
                {loadingRefresh ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon="sync-alt" className="fs--1" />}
              </Button>
            ) : null}
            {dashboardFsCollapse}
            {exportMenu}
            <TableSearchInput
              className="table-page-filter oss-ag-search flex-shrink-0"
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </Col>
        </Row>
      </Card.Header>
      {!collapsed ? (
        <Card.Body className="p-0">
          <div className="oss-mt-bss-grid" style={{ width: '100%', height: resolvedHeight }}>
            <AgGridReact
              theme={ossGridTheme}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination
              paginationPageSize={pageSize}
              paginationPageSizeSelector={paginationPageSizes}
              animateRows={false}
              rowHeight={36}
              headerHeight={38}
              {...(rowSelectionOptions != null ? { rowSelection: rowSelectionOptions } : {})}
              getRowId={(p) => {
                const d = p.data ?? {};
                if (d.id != null && d.id !== '') return String(d.id);
                const key =
                  d.senderId != null
                    ? `s:${String(d.senderId)}:${String(d.rowKind ?? '')}:${String(d.clientId ?? '')}`
                  : d.msisdn != null || d.country != null
                    ? `c:${String(d.msisdn ?? d.country)}:${String(d.submitted ?? '')}`
                      : d.clientId != null
                        ? `m:${String(d.clientId)}`
                        : 'row:unknown';
                return key;
              }}
              context={context}
              getRowStyle={getRowStyle}
              onGridReady={onGridReady}
              onGridSizeChanged={onGridSizeChanged}
              suppressDragLeaveHidesColumns
              suppressCellFocus={false}
              overlayNoRowsTemplate={`<span style="padding:16px;display:inline-block;">${overlayNoRowsMessage}</span>`}
            />
          </div>
          {footerSummary ? (
            <div className="border-top border-300 bg-light px-2 py-2 oss-mt-bss-footer-summary">{footerSummary}</div>
          ) : null}
        </Card.Body>
      ) : null}
    </Card>
  );
}
