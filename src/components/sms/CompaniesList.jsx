import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TableExportSelect, ConfirmDelete } from 'components/common/UseTable';
import CompanyFormModal from 'components/sms/forms/CompanyFormModal';
import CompanyProvidersModal from 'components/sms/CompanyProvidersModal';
import { saveCompaniesToStorage } from 'helpers/companyTheme';
import { addAuthUser, getAuthUser } from 'components/authentication/authStorage';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import companyService from 'services/companyService';
import { exportTableData } from 'helpers/tableExport';
import { toast } from 'react-toastify';

const COMPANY_COLUMNS = (
  onEdit,
  onDelete,
  onTogglePassword,
  showPasswords,
  isPlatformAdmin,
  isCompanyAdmin,
  onProviders
) => [
  {
    accessorKey: 'name',
    header: 'Company',
    meta: { headerProps: { className: 'text-900' } }
  },
  {
    accessorKey: 'subscriptionPlan',
    header: 'Plan',
    meta: { headerProps: { className: 'text-900' } }
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    meta: { headerProps: { className: 'text-900' } }
  },
  {
    accessorKey: 'tpsLimit',
    header: 'TPS Limit',
    meta: { headerProps: { className: 'text-900' } }
  },
  {
    accessorKey: 'username',
    header: 'Username',
    meta: { headerProps: { className: 'text-900' } }
  },
  {
    accessorKey: 'password',
    header: 'Password',
    meta: {
      headerProps: { className: 'text-900 text-center' },
      cellProps: { className: 'text-center' }
    },
    cell: ({ row: { original } }) => {
      const rowKey = String(original.id ?? original.username ?? original.name ?? '');
      const canShow = Boolean(original.password);
      const isVisible = Boolean(showPasswords[rowKey]);
      return (
        <div className="d-flex align-items-center justify-content-center gap-1">
          <span>{canShow ? (isVisible ? original.password : '••••••') : '—'}</span>
          {canShow && (
            <Button
              variant="link"
              size="sm"
              className="p-0"
              onClick={() => onTogglePassword(original)}
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
    accessorKey: 'connectionStatus',
    header: 'Connection Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const connected = original.smppConnectionStatus?.connected;
      const label = connected ? 'Bind' : 'Unbind';
      return (
        <span className="d-inline-flex align-items-center">
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: connected ? '#28a745' : '#dc3545',
              marginRight: 6
            }}
          />
          {label}
        </span>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const rawStatus = String(original.status || '').toUpperCase();
      const isActive = rawStatus === 'ACTIVE';
      return <Badge bg={isActive ? 'success' : 'secondary'}>{rawStatus || 'INACTIVE'}</Badge>;
    }
  },
  ...(isPlatformAdmin || isCompanyAdmin
    ? [
        {
          id: 'actions',
          header: 'Actions',
          meta: {
            headerProps: { className: 'text-900 text-end' },
            cellProps: { className: 'text-end' }
          },
          cell: ({ row: { original } }) => (
            <div className="d-flex justify-content-end gap-1">
              <IconButton
                variant="falcon-default"
                size="sm"
                icon="link"
                transform="shrink-3"
                className="text-primary shadow-none"
                title="SMS providers"
                onClick={() => onProviders(original)}
              />
              {(isPlatformAdmin || isCompanyAdmin) && (
                <>
                  <IconButton
                    variant="falcon-default"
                    size="sm"
                    icon="edit"
                    transform="shrink-3"
                    className="text-primary shadow-none"
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
                </>
              )}
            </div>
          )
        }
      ]
    : [])
];

const COMPANY_EXPORT_COLUMNS = [
  { header: 'Company', key: 'name' },
  { header: 'Plan', key: 'subscriptionPlan' },
  { header: 'Currency', key: 'currency' },
  { header: 'TPS Limit', key: 'tpsLimit' },
  { header: 'Username', key: 'username' },
  { header: 'Password', getValue: (row) => (row.password ? '••••••' : '—') },
  {
    header: 'Connection Status',
    getValue: (row) => (row.smppConnectionStatus?.connected ? 'Bind' : 'Unbind')
  },
  { header: 'Status', getValue: (row) => String(row.status || '').toUpperCase() || 'INACTIVE' }
];


const CompaniesList = () => {
  const user = getAuthUser();
  const isCompanyAdmin = user?.roles?.includes('COMPANY_ADMIN');
  const isPlatformAdmin = user?.roles?.includes('PLATFORM_ADMIN');
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
  const [providersCompany, setProvidersCompany] = useState(null);
  const [providersModalOpen, setProvidersModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const fetchCompanies = useCallback(async (pageArg = page, pageSizeArg = pageSize) => {
    setLoading(true);
    try {
      const params = { page: pageArg - 1, size: pageSizeArg };
      const resp = await companyService.list(params);
      let companies = Array.isArray(resp?.content) ? resp.content : [];
      if (isCompanyAdmin) {
        // Only show the company matching user's resourceId
        companies = companies.filter(c => String(c.id) === String(user?.resourceId));
      }
      setData(companies);
      setTotal(companies.length);
      saveCompaniesToStorage(companies);
    } catch (e) {
      toast.error("Can't fetch records");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isCompanyAdmin, user]);

  useEffect(() => {
    fetchCompanies(page, pageSize);
  }, [page, pageSize]);

  const onEdit = useCallback((record) => {
    setRecordForEdit(record);
    setModalShow(true);
  }, []);

  const onDelete = useCallback((record) => {
    setDeleteTarget(record);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await companyService.remove(deleteTarget.id);
      setData((prev) => {
        const next = prev.filter((company) => String(company.id) !== String(deleteTarget.id));
        saveCompaniesToStorage(next);
        return next;
      });
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success(`Company "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchCompanies();
    } catch (e) {
      toast.error(e.message || 'Failed to delete company');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchCompanies]);

  const openProviders = useCallback((company) => {
    setProvidersCompany(company);
    setProvidersModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      COMPANY_COLUMNS(
        onEdit,
        onDelete,
        (record) => {
          const rowKey = String(record.id ?? record.username ?? record.name ?? '');
          setShowPasswords((prev) => ({
            ...prev,
            [rowKey]: !prev[rowKey]
          }));
        },
        showPasswords,
        isPlatformAdmin,
        isCompanyAdmin,
        openProviders
      ),
    [showPasswords, onEdit, onDelete, isPlatformAdmin, isCompanyAdmin, openProviders]
  );

  const handleExport = async (type) => {
    try {
      await exportTableData({
        type,
        rows: filteredData,
        columns: COMPANY_EXPORT_COLUMNS,
        filename: 'companies',
        title: 'Companies'
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
        [row.name, row.subscriptionPlan, row.currency, row.tpsLimit, row.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const handleAdd = () => {
    // Company admin cannot create company
    if (isCompanyAdmin) return;
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmit = async (payload) => {
    if (isCompanyAdmin) return;
    setSubmitting(true);
    try {
      const data = {
        name: payload.name,
        domain: payload.domain || payload.name?.toLowerCase().replace(/\s+/g, '') + '.com',
        contactEmail: payload.contactEmail,
        phoneNumber: payload.phoneNumber || '',
        country: payload.country || null,
        username: payload.username,
        password: recordForEdit?.id ? (payload.password?.trim() || null) : payload.password?.trim(),
        apiKey: payload.apiKey || null,
        logoUrl: payload.logoUrl || null,
        loginBackgroundUrl: payload.loginBackgroundUrl || null,
        loginFooter: payload.loginFooter || null,
        currency: payload.currency || 'USD',
        subscriptionPlan: payload.subscriptionPlan || null,
        subscriptionPlanId: payload.subscriptionPlanId || null,
        tpsLimit: payload.tpsLimit ? Number(payload.tpsLimit) : null,
        ipWhitelist: Array.isArray(payload.companyIpList)
          ? payload.companyIpList.join('\n')
          : (payload.ipWhitelist || null),
        status: payload.status || 'ACTIVE',
        smppIpAddressId: payload.smppIpAddressId || null
      };
      if (recordForEdit?.id) {
        await companyService.update(recordForEdit.id, data);
        toast.success('Company updated');
      } else {
        const created = await companyService.create(data);
        toast.success('Company created');
        if (payload.username && payload.password && created?.id) {
          addAuthUser({
            username: payload.username,
            password: payload.password,
            companyId: created.id
          });
        }
      }
      handleCloseModal();
      fetchCompanies();
    } catch (e) {
      toast.error(e.message || 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };


  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: pageSize,
    perPageOptions: [25, 50, 100, 250, 500, 1000, 5000],
    selectionColumnWidth: 30,
    totalCount: total,
    page,
    setPage,
    setPageSize
  });

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">
                  {isCompanyAdmin ? 'My Company' : 'Companies'}
                </h5>
                {isCompanyAdmin && (
                  <span className="ms-2 text-muted small">My Company</span>
                )}
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                {isCompanyAdmin && data[0] && (
                  <IconButton
                    variant="falcon-default"
                    size="sm"
                    icon="link"
                    className="me-2"
                    title="SMS providers"
                    onClick={() => openProviders(data[0])}
                  >
                    <span className="d-none d-sm-inline-block ms-1">SMS providers</span>
                  </IconButton>
                )}
                {!isCompanyAdmin && (
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
                      className="border-300 me-2"
                      title="Refresh"
                      onClick={() => fetchCompanies(page, pageSize)}
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
                )}
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading companies...
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
              totalCount={total}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <CompanyFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete company "${deleteTarget?.name || ''}"? This will remove all associated users, clients, providers, and API keys. This action cannot be undone.`}
        loading={deleting}
      />

      <CompanyProvidersModal
        company={providersCompany}
        show={providersModalOpen}
        onClose={() => {
          setProvidersModalOpen(false);
          setProvidersCompany(null);
        }}
      />
    </>
  );
};

export default CompaniesList;
