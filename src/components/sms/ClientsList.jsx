import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableSearchInput from 'components/common/TableSearchInput';
import { ConfirmDelete, TableExportSelect } from 'components/common/UseTable';
import ClientFormModal from './forms/ClientFormModal';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import clientService from 'services/clientService';
import paymentMethodService from 'services/paymentMethodService';
import { getAuthUser, getUserResourceId } from 'components/authentication/authStorage';
import { exportTableData } from 'helpers/tableExport';
import { toast } from 'react-toastify';

// Display label for a payment-method option (mirrors the client form's normalizeMethodType).
const methodDisplayName = (m) => {
  if (!m) return '';
  if (m.methodType) {
    const mt = String(m.methodType).toUpperCase();
    return mt === 'CARD' ? 'CASH' : mt;
  }
  return m.label || m.name || '';
};

const CLIENT_COLUMNS = [
  { accessorKey: 'clientName', header: 'Client Name', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.clientName || original.name || '—' },
    { accessorKey: 'manager', header: 'Manager', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.manager || '—' },
  { accessorKey: 'companyName', header: 'Company', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.companyName || '—' },
  { accessorKey: 'email', header: 'Email', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.email || '—' },
  { accessorKey: 'phone', header: 'Phone', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.phone || '—' },
  { accessorKey: 'paymentMethod', header: 'Payment Method', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.paymentMethod || '—' },
  { accessorKey: 'country', header: 'Country', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.country || '—' },
  //{ accessorKey: 'username', header: 'Username', meta: { headerProps: { className: 'text-900' } }, cell: ({ row: { original } }) => original.username || '—' },
  // {
  //   accessorKey: 'password',
  //   header: 'Password',
  //   meta: { headerProps: { className: 'text-900' } },
  //   cell: ({ row: { original } }) => (original.email ? '••••••••' : '—')
  // },
  
  {
    accessorKey: 'createdAt',
    header: 'Created',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.createdAt ? new Date(original.createdAt).toLocaleString() : '—'
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Login',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.lastLoginAt ? new Date(original.lastLoginAt).toLocaleString() : '—'
  },
  // {
  //   accessorKey: 'loginStatus',
  //   header: 'Login Status',
  //   meta: { headerProps: { className: 'text-900' } },
  //   cell: ({ row: { original } }) => {
  //     const raw = String(original.loginStatus || '').toUpperCase();
  //     return <Badge bg={raw === 'ACTIVE' ? 'success' : 'secondary'}>{raw || '—'}</Badge>;
  //   }
  // },
  {
    accessorKey: 'loginStatus',
    header: 'Login Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const isOnline = Boolean(original.online);
      return <StatusTag tone={isOnline ? 'success' : 'secondary'}>{isOnline ? 'Online' : 'Offline'}</StatusTag>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const status = String(original.status || '').trim().toUpperCase() || 'INACTIVE';
      return <StatusTag tone={status === 'ACTIVE' ? 'success' : 'secondary'}>{toTitleCase(status)}</StatusTag>;
    }
  }
  
];

const CLIENT_EXPORT_COLUMNS = [
  { header: 'Client Name', getValue: (row) => row.clientName || row.name || '—' },
  { header: 'Manager', getValue: (row) => row.manager || '—' },
  { header: 'Company', getValue: (row) => row.companyName || '—' },
  { header: 'Email', getValue: (row) => row.email || '—' },
  { header: 'Phone', getValue: (row) => row.phone || '—' },
  { header: 'Payment Method', getValue: (row) => row.paymentMethod || '—' },
  { header: 'Country', getValue: (row) => row.country || '—' },
  {
    header: 'Created',
    getValue: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : '—')
  },
  { header: 'Status', getValue: (row) => String(row.status || '').toUpperCase() || 'INACTIVE' }
];

const normalizeRoleName = (role) => String(role || '')
  .trim()
  .toUpperCase()
  .replace(/^ROLE_/, '');

const toTitleCase = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '—';
  const lowered = raw.toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
};

const STATUS_TAG_STYLES = {
  success: { color: '#00f382', borderColor: '#00f382', backgroundColor: '#FFFFFF' },
  secondary: { color: '#6c757d', borderColor: '#6c757d', backgroundColor: '#FFFFFF' }
};

const StatusTag = ({ tone = 'secondary', children }) => {
  const palette = STATUS_TAG_STYLES[tone] || STATUS_TAG_STYLES.secondary;
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
        fontWeight: 'bold',
        lineHeight: 1.25
      }}
    >
      {children}
    </span>
  );
};

const ClientsList = () => {
  const authUser = getAuthUser();
  const normalizedRoles = Array.isArray(authUser?.roles) ? authUser.roles.map(normalizeRoleName) : [];
  const isPlatformAdmin = normalizedRoles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = normalizedRoles.includes('COMPANY_ADMIN');
  const resourceId = getUserResourceId();
  const companyId = resourceId;
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [paymentMethodMap, setPaymentMethodMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    paymentMethodService
      .listOptions()
      .then((res) => {
        const methods = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
        if (cancelled) return;
        const map = {};
        methods.forEach((m) => { map[String(m.id)] = methodDisplayName(m); });
        setPaymentMethodMap(map);
      })
      .catch(() => { if (!cancelled) setPaymentMethodMap({}); });
    return () => { cancelled = true; };
  }, []);

  const fetchClients = useCallback(async (silent = false) => {
    if (!companyId) return setData([]);
    if (!silent) setLoading(true);
    try {
      const params = { page: pagination.pageIndex, size: Math.max(1, pagination.pageSize) };
      const result = await clientService.list(companyId, params);
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setData(list);
      setTotal(Number(result?.totalElements ?? list.length));
    } catch (e) {
      if (!silent) toast.error(e.message || 'Failed to load clients');
      setData([]);
      setTotal(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [companyId, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchClients(false);
  }, [fetchClients]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClients(true).finally(() => setRefreshing(false));
  };

  const columns = useMemo(() => CLIENT_COLUMNS, []);
  const canManage = isPlatformAdmin || isCompanyAdmin;
  const columnsWithActions = useMemo(() => {
    if (!canManage) return columns;
    return [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerProps: { className: 'text-900 text-end' },
          cellProps: { className: 'text-end' }
        },
        cell: ({ row: { original } }) => {
          const isActive = String(original.status || '').toUpperCase() === 'ACTIVE';
          return (
            <div className="d-flex justify-content-end gap-1">
              <IconButton
                variant="falcon-default"
                size="sm"
                icon="edit"
                transform="shrink-3"
                className="text-primary shadow-none"
                title="Edit"
                onClick={() => {
                  setRecordForEdit(original);
                  setModalShow(true);
                }}
              />
              <IconButton
                variant="falcon-default"
                size="sm"
                icon="unlock-alt"
                transform="shrink-3"
                className="text-info shadow-none"
                title="Reset Password"
                disabled={resettingId === original.id}
                onClick={async () => {
                  try {
                    setResettingId(original.id);
                    await clientService.resetPassword(companyId, original.id);
                    toast.success('Password reset email sent');
                  } catch (e) {
                    toast.error(e.message || 'Failed to reset password');
                  } finally {
                    setResettingId(null);
                  }
                }}
              />
              <IconButton
                variant="falcon-default"
                size="sm"
                icon={isActive ? 'user-slash' : 'user-check'}
                transform="shrink-3"
                className="text-warning shadow-none"
                title={isActive ? 'Deactivate' : 'Activate'}
                disabled={togglingId === original.id}
                onClick={async () => {
                  try {
                    setTogglingId(original.id);
                    const nextActive = !isActive;
                    await clientService.setActive(companyId, original.id, nextActive);
                    await fetchClients(false);
                    toast.success(`Client ${nextActive ? 'activated' : 'deactivated'}`);
                  } catch (e) {
                    toast.error(e.message || 'Failed to update status');
                  } finally {
                    setTogglingId(null);
                  }
                }}
              />
              <IconButton
                variant="falcon-default"
                size="sm"
                icon="trash"
                transform="shrink-3"
                className="text-danger shadow-none"
                title="Delete"
                onClick={() => setDeleteTarget(original)}
              />
            </div>
          );
        }
      }
    ];
  }, [columns, canManage, togglingId, resettingId, companyId, fetchClients]);

  const handleExport = async (type) => {
    try {
      await exportTableData({
        type,
        rows: filteredData,
        columns: CLIENT_EXPORT_COLUMNS,
        filename: 'clients',
        title: 'Clients'
      });
      if (type !== 'print') toast.success(`Exported ${type.toUpperCase()}`);
    } catch (e) {
      toast.error(e.message || `Failed to export ${type.toUpperCase()}`);
    }
  };

  const filteredData = useMemo(() => {
    let list = Array.isArray(data)
      ? data.map((row) => ({
          ...row,
          paymentMethod: row.paymentMethod || paymentMethodMap[String(row.paymentMethodId)] || ''
        }))
      : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (row) =>
          [row.name, row.email, row.phone, row.country, row.manager, row.username, row.companyName, row.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const manualPageCount =
    total === 0 ? 0 : Math.ceil(total / Math.max(1, pagination.pageSize));

  const table = useAdvanceTable({
    data: filteredData,
    columns: columnsWithActions,
    selection: true,
    sortable: true,
    pagination: true,
    manualPagination: true,
    pageCount: manualPageCount,
    onPaginationChange: setPagination,
    controlledPagination: pagination,
    rowCount: total,
    perPage: pagination.pageSize,
    perPageOptions: [25, 50, 100, 250, 500, 1000],
    selectionColumnWidth: 30
  });

  const handleAdd = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmit = async (payload) => {
    if (!companyId) {
      toast.error('Company context is missing');
      return;
    }
    setSubmitting(true);
    try {
      if (recordForEdit && recordForEdit.id) {
        await clientService.update(companyId, recordForEdit.id, {
          name: payload.name ?? payload.clientName ?? payload.manager,
          clientName: payload.clientName ?? recordForEdit.clientName ?? null,
          email: payload.email ?? recordForEdit.email ?? null,
          phone: payload.phone ?? payload.contactNo ?? recordForEdit.phone ?? null,
          country: payload.country ?? recordForEdit.country ?? null,
          manager: payload.manager ?? recordForEdit.manager ?? null,
          username: payload.username ?? recordForEdit.username ?? null,
          password: payload.password ?? null,
          paymentMethodId: payload.paymentMethodId ?? recordForEdit.paymentMethodId ?? null,
          paymentAccount: payload.paymentAccount ?? recordForEdit.paymentAccount ?? null,
          status: payload.status ?? recordForEdit.status
        });
        toast.success('Client updated');
      } else {
        await clientService.create(companyId, {
          name: payload.name ?? payload.clientName ?? payload.manager,
          clientName: payload.clientName || null,
          email: payload.email || null,
          phone: (payload.phone ?? payload.contactNo) || null,
          country: payload.country || null,
          manager: payload.manager || null,
          username: payload.username || null,
          password: payload.password || null,
          paymentMethodId: payload.paymentMethodId || null,
          paymentAccount: payload.paymentAccount || null
        });
        toast.success('Client added');
      }
      handleCloseModal();
      fetchClients(false);
    } catch (e) {
      toast.error(e.message || 'Failed to save client');
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
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Clients Management</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="clients-actions" className="d-flex align-items-center flex-nowrap gap-2">
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
                    className="mx-2"
                    onExport={handleExport}
                  />
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
                Loading clients...
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
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo rowsPerPageOptions={[25, 50, 100, 250, 500, 1000]} totalRowCountOverride={total} />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <ClientFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        companyId={companyId}
        submitting={submitting}
      />

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        loading={deleting}
        title="Delete Client"
        message={`Are you sure you want to delete "${deleteTarget?.clientName || deleteTarget?.name || ''}"? This will also remove its login user accounts and related references.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await clientService.delete(companyId, deleteTarget.id);
            await fetchClients(false);
            toast.success('Client deleted');
            setDeleteTarget(null);
          } catch (e) {
            toast.error(e.message || 'Failed to delete client');
          } finally {
            setDeleting(false);
          }
        }}
      />
    </>
  );
};

export default ClientsList;
