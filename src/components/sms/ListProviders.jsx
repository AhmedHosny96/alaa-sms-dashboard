import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TableExportSelect, ConfirmDelete } from 'components/common/UseTable';
import ProviderFormModal from 'components/sms/forms/ProviderFormModal';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import smsService from 'services/smsService';
import { exportTableData } from 'helpers/tableExport';
import { toast } from 'react-toastify';

function isEsmeConnected(s) {
  return Boolean(s?.connected);
}

function esmeStatusText(s) {
  return isEsmeConnected(s) ? 'Connected' : 'Disconnected';
}

function userConnectStatsTooltip(s) {
  if (!s) return '';
  const lines = [];
  if (s.lastActivityAt) lines.push(`Last activity: ${s.lastActivityAt}`);
  lines.push(
    `Bound: ${s.boundConnectionsCount ?? 0} (receiver ${s.bindReceiver ?? 0} / transmitter ${s.bindTransmitter ?? 0} / transceiver ${s.bindTransceiver ?? 0})`
  );
  if (s.bindCount != null) lines.push(`bind_count: ${s.bindCount}`);
  if (s.unbindCount != null) lines.push(`unbind_count: ${s.unbindCount}`);
  if (s.submitSmCount != null) lines.push(`submit_sm: ${s.submitSmCount}`);
  if (s.deliverSmCount != null) lines.push(`deliver_sm: ${s.deliverSmCount}`);
  if (s.elinkCount != null) lines.push(`elink: ${s.elinkCount}`);
  if (s.throttlingErrorCount != null) lines.push(`throttle errors: ${s.throttlingErrorCount}`);
  if (s.otherSubmitErrorCount != null) lines.push(`other submit errors: ${s.otherSubmitErrorCount}`);
  return lines.join('\n');
}

const PROVIDERS_COLUMNS = (
  onEdit,
  onDelete,
  onTogglePassword,
  showPasswords,
  onSmppClientAction,
  smppActionBusyId
) => [
  {
    accessorKey: 'connectorId',
    header: 'Connector',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.connectorId || '—'
  },
  // {
  //   accessorKey: 'providerName',
  //   header: 'Provider Name',
  //   meta: { headerProps: { className: 'text-900' } },
  //   cell: ({ row: { original } }) => original.providerName || original.name || '—'
  // },
  { accessorKey: 'email', header: 'Email', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'ipAddresses',
    header: 'IPs',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.smppHost || original.host || '—'
  },
  {
    accessorKey: 'smppPort',
    header: 'Port',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.port || original.smppPort || '—'
  },
  // {
  //   accessorKey: 'apiUrl',
  //   header: 'HTTP Bind',
  //   meta: { headerProps: { className: 'text-900' } },
  //   cell: ({ row: { original } }) => original.apiUrl || '—'
  // },
  {
    accessorKey: 'username',
    header: 'Username',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.username || '—'
  },
  {
    accessorKey: 'password',
    header: 'Password',
    meta: {
      headerProps: { className: 'text-900 text-center' },
      cellProps: { className: 'text-center' }
    },
    cell: ({ row: { original } }) => {
      const rowKey = String(original.id ?? original.connectorId ?? original.providerName ?? original.name ?? '');
      const visibilityKey = `${rowKey}-http-pass`;
      const canShow = Boolean(original.password);
      const isVisible = Boolean(showPasswords[visibilityKey]);
      return (
        <div className="d-flex align-items-center justify-content-center gap-1">
          <span>{canShow ? (isVisible ? original.password : '••••••') : '—'}</span>
          {canShow && (
            <Button
              variant="link"
              size="sm"
              className="p-0"
              onClick={() => onTogglePassword(original, 'http-pass')}
              title={isVisible ? 'Hide' : 'Show'}
            >
              <FontAwesomeIcon icon={isVisible ? 'eye-slash' : 'eye'} />
            </Button>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'smppBindMode',
    header: 'SMPP Bind',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => String(original.smppBindMode || '').toUpperCase() || '—'
  },
  {
    accessorKey: 'smppSystemId',
    header: 'ESME User',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.smppSystemId || original.username || '—'
  },
  {
    accessorKey: 'smppPassword',
    header: 'ESME Pass',
    meta: {
      headerProps: { className: 'text-900 text-center' },
      cellProps: { className: 'text-center' }
    },
    cell: ({ row: { original } }) => {
      const rowKey = String(original.id ?? original.connectorId ?? original.providerName ?? original.name ?? '');
      const visibilityKey = `${rowKey}-smpp-pass`;
      const canShow = Boolean(original.smppPassword);
      const isVisible = Boolean(showPasswords[visibilityKey]);
      return (
        <div className="d-flex align-items-center justify-content-center gap-1">
          <span>{canShow ? (isVisible ? original.smppPassword : '••••••') : '—'}</span>
          {canShow && (
            <Button
              variant="link"
              size="sm"
              className="p-0"
              onClick={() => onTogglePassword(original, 'smpp-pass')}
              title={isVisible ? 'Hide' : 'Show'}
            >
              <FontAwesomeIcon icon={isVisible ? 'eye-slash' : 'eye'} />
            </Button>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'userConnectStats',
    header: 'ESME Status',
    meta: {
      headerProps: { className: 'text-900 text-center' },
      cellProps: { className: 'text-center' }
    },
    cell: ({ row: { original } }) => {
      const s = original.userConnectStats;
      const connected = isEsmeConnected(s);
      const tip = userConnectStatsTooltip(s);
      const label = esmeStatusText(s);
      return (
        <span
          className="d-inline-flex align-items-center justify-content-center gap-2"
          title={tip || label}
        >
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: connected ? '#28a745' : '#dc3545',
              flexShrink: 0
            }}
          />
          <span className="fs-10">{label}</span>
        </span>
      );
    }
  },
  // {
  //   accessorKey: 'smppClientBound',
  //   header: 'SMSC session',
  //   meta: { headerProps: { className: 'text-900' } },
  //   cell: ({ row: { original } }) => {
  //     const v = original.smppClientBound;
  //     if (v == null) {
  //       return <span className="text-500">—</span>;
  //     }
  //     return (
  //       <span className="d-inline-flex align-items-center gap-2" title="Outbound SMPP client (smppcc) bound to provider SMSC">
  //         <span
  //           style={{
  //             display: 'inline-block',
  //             width: 10,
  //             height: 10,
  //             borderRadius: '50%',
  //             background: v ? '#28a745' : '#dc3545',
  //             marginRight: 6
  //           }}
  //         />
  //         {v ? 'bound' : 'unbound'}
  //       </span>
  //     );
  //   }
  // },
  {
    accessorKey: 'actions',
    header: 'Action',
    enableSorting: false,
    meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } },
    cell: ({ row: { original } }) => {
      const id = original.id;
      const canSmpp = Boolean(id && original.connectorId);
      const busy = smppActionBusyId && id && String(smppActionBusyId) === String(id);
      const smppBound = original.smppClientBound === true;
      return (
        <div className="d-inline-flex align-items-center flex-wrap justify-content-center gap-1">
          {/* {canSmpp && (
            <IconButton
              variant="falcon-default"
              size="sm"
              icon={smppBound ? 'stop' : 'play'}
              transform="shrink-3"
              className={smppBound ? 'text-warning shadow-none' : 'text-success shadow-none'}
              title={smppBound ? 'Stop SMPP client' : 'Start SMPP client'}
              disabled={busy}
              onClick={() => onSmppClientAction(original)}
            />
          )} */}
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="edit"
            transform="shrink-3"
            className="me-1 text-primary shadow-none"
            title="Edit"
            onClick={() => onEdit(original)}
          />
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="trash"
            transform="shrink-3"
            className="text-danger shadow-none"
            title="Delete"
            onClick={() => onDelete(original)}
          />
        </div>
      );
    }
  }
];

const PROVIDERS_EXPORT_COLUMNS = [
  { header: 'Connector', key: 'connectorId' },
  { header: 'Provider Name', getValue: (row) => row.providerName || row.name || '—' },
  { header: 'Email', key: 'email' },
  { header: 'IPs', getValue: (row) => row.smppHost || row.host || '—' },
  { header: 'Port', getValue: (row) => row.port || row.smppPort || '—' },
  { header: 'HTTP Bind', key: 'apiUrl' },
  { header: 'Username', key: 'username' },
  { header: 'Password', getValue: (row) => (row.password ? '••••••' : '—') },
  { header: 'SMPP Bind', getValue: (row) => String(row.smppBindMode || '').toUpperCase() || '—' },
  { header: 'ESME User', getValue: (row) => row.smppSystemId || row.username || '—' },
  { header: 'ESME Pass', getValue: (row) => (row.smppPassword ? '••••••' : '—') },
  { header: 'ESME Status', getValue: (row) => esmeStatusText(row.userConnectStats) },
  {
    header: 'SMSC session',
    getValue: (row) =>
      row.smppClientBound == null ? '—' : row.smppClientBound ? 'bound' : 'unbound'
  }
];

const ListProviders = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [smppActionBusyId, setSmppActionBusyId] = useState(null);

  const fetchProviders = useCallback(async (pageArg = page, pageSizeArg = pageSize, opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    try {
      const params = { page: pageArg - 1, size: pageSizeArg };
      const result = await smsService.listProviders(params);
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setData(list);
      setTotal(Number(result?.totalElements ?? list.length));
    } catch (e) {
      if (!silent) toast.error("Can't fetch records");
      setData([]);
      setTotal(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchProviders(page, pageSize);
  }, [fetchProviders, page, pageSize]);

  const handleSmppClientAction = useCallback(
    async (record) => {
      if (!record?.id) return;
      const smppBound = record.smppClientBound === true;
      setSmppActionBusyId(record.id);
      try {
        if (smppBound) {
          await smsService.stopProvider(record.id);
          toast.success('SMPP client stop requested');
        } else {
          await smsService.startProvider(record.id);
          toast.success('SMPP client start requested');
        }
        await fetchProviders(page, pageSize);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (smppBound ? 'Stop failed' : 'Start failed');
        toast.error(msg);
      } finally {
        setSmppActionBusyId(null);
      }
    },
    [fetchProviders, page, pageSize]
  );

  const columns = useMemo(
    () =>
      PROVIDERS_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => {
          if (!record?.id) return;
          setDeleteTarget(record);
        },
        (record, scope = 'smpp-pass') => {
          const rowKey = String(record.id ?? record.connectorId ?? record.providerName ?? record.name ?? '');
          const visibilityKey = `${rowKey}-${scope}`;
          setShowPasswords((prev) => ({
            ...prev,
            [visibilityKey]: !prev[visibilityKey]
          }));
        },
        showPasswords,
        handleSmppClientAction,
        smppActionBusyId
      ),
    [showPasswords, fetchProviders, handleSmppClientAction, smppActionBusyId]
  );

  const handleExport = async (type) => {
    try {
      await exportTableData({
        type,
        rows: filteredData,
        columns: PROVIDERS_EXPORT_COLUMNS,
        filename: 'carriers',
        title: 'Carriers'
      });
      if (type !== 'print') toast.success(`Exported ${type.toUpperCase()}`);
    } catch (e) {
      toast.error(e.message || `Failed to export ${type.toUpperCase()}`);
    }
  };

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [
          row.connectorId,
          row.providerName,
          row.name,
          row.email,
          row.host,
          row.smppHost,
          row.port,
          row.smppPort,
          row.apiUrl,
          row.smppBindMode,
          row.smppSystemId,
          row.ipAddresses,
          row.status,
          esmeStatusText(row.userConnectStats),
          row.username,
          row.smppClientBound == null ? '' : row.smppClientBound ? 'bound' : 'unbound'
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
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
    manualPagination: true,
    pageCount: total === 0 ? 0 : Math.ceil(total / Math.max(1, pageSize)),
    rowCount: total,
    controlledPagination: { pageIndex: page - 1, pageSize },
    onPaginationChange: (updater) => {
      const prev = { pageIndex: page - 1, pageSize };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.pageSize !== pageSize) setPageSize(next.pageSize);
      setPage((next.pageIndex ?? 0) + 1);
    },
    perPage: pageSize,
    perPageOptions: [25, 50, 100, 250, 500, 1000, 5000],
    selectionColumnWidth: 30
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await smsService.removeProvider(deleteTarget.id);
      toast.success('Carrier removed');
      fetchProviders(page, pageSize);
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleAdd = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleProviderSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const req = {
        providerName: payload.providerName || payload.name,
        email: payload.email,
        username: payload.username,
        password: payload.password,
        throughput: payload.throughput ? parseInt(payload.throughput, 10) : null,
        ipAddresses: payload.ipAddresses,
        httpNumberField: payload.httpNumberField,
        httpCliField: payload.httpCliField,
        apiUrl: payload.apiUrl,
        messageField: payload.messageField,
        messageValue: payload.messageValue,
        uniqueIdField: payload.uniqueIdField,
        uniqueIdValue: payload.uniqueIdValue,
        returnValue: payload.returnValue,
        uuidValue: payload.uuidValue,
        ussdIpAddresses: payload.ussdIpAddresses,
        smppHost: payload.smppHost,
        smppPort: payload.smppPort ? parseInt(payload.smppPort, 10) : null,
        smppSystemId: payload.smppSystemId,
        smppPassword: payload.smppPassword,
        smppBindMode: payload.smppBindMode
      };
      if (recordForEdit) {
        await smsService.updateProvider(recordForEdit.id, req);
        toast.success('Carrier updated');
      } else {
        await smsService.createProvider(req);
        toast.success('Carrier created');
      }
      fetchProviders(page, pageSize);
      handleCloseModal();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Carriers</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
                  <IconButton
                    variant="primary"
                    size="sm"
                    icon="plus"
                    transform="shrink-3"
                    title="New"
                    onClick={handleAdd}
                  >
                    <span className="d-none d-sm-inline-block ms-1">New</span>
                  </IconButton>
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    className="mx-2"
                    onExport={handleExport}
                  />
                  <IconButton
                    variant="falcon-default"
                    size="sm"
                    icon="sync"
                    transform="shrink-3"
                    className="border-300 me-2"
                    title="Refresh"
                    onClick={() => fetchProviders(page, pageSize)}
                  >
                    <span className="d-none d-sm-inline-block ms-1">Refresh</span>
                  </IconButton>
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
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading carriers...
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
          </Card.Body>
          <Card.Footer>
            <AdvanceTableFooter
              rowsPerPageSelection
              navButtons
              rowInfo
              rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]}
              totalRowCountOverride={total}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <ProviderFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleProviderSubmit}
      />

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Carrier"
        message={`Are you sure you want to delete carrier "${deleteTarget?.providerName || deleteTarget?.name || ''}"? This action cannot be undone.`}
        loading={deleting}
      />
    </>
  );
};

export default ListProviders;
