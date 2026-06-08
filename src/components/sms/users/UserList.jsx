import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Badge, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { TableSelectFilter, TableExportSelect } from 'components/common/UseTable';
import UserFormModal from 'components/sms/forms/UserFormModal';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import userService from 'services/userService';
import companyService from 'services/companyService';
import { getAuthUser } from 'components/authentication/authStorage';
import { exportTableData } from 'helpers/tableExport';
import { toast } from 'react-toastify';

const ROLE_LABELS = {
  PLATFORM_ADMIN: 'Platform Admin',
  COMPANY_ADMIN: 'Company Admin',
  COMPANY_FINANCE: 'Company Finance',
  CLIENT_USER: 'Client User',
  CLIENT_FINANCE: 'Client Finance',
  CLIENT_ADMIN: 'Client Admin'
};

const roleDisplay = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return '—';
  const r = roles[0];
  return ROLE_LABELS[r] || r?.replace(/_/g, ' ') || '—';
};

const USER_COLUMNS = [
  { accessorKey: 'name', header: 'Name', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'email', header: 'Email', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'phone', header: 'Phone', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'client',
    header: 'Client',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => original.client?.name ?? '—'
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => roleDisplay(original.roles)
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const status = String(original.status || 'Inactive').toUpperCase();
      return <Badge bg={status === 'ACTIVE' ? 'success' : 'secondary'}>{status}</Badge>;
    }
  }
];

const USER_EXPORT_COLUMNS = [
  { header: 'Name', key: 'name' },
  { header: 'Email', key: 'email' },
  { header: 'Phone', key: 'phone' },
  { header: 'Client', getValue: (row) => row.client?.name ?? '—' },
  { header: 'Role', getValue: (row) => roleDisplay(row.roles) },
  { header: 'Status', getValue: (row) => String(row.status || 'Inactive').toUpperCase() }
];

const UserList = () => {
  const authUser = getAuthUser();
  const isCompanyAdmin = authUser?.roles?.includes('COMPANY_ADMIN');
  const companyId = authUser?.resourceId;
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const fetchRoles = useCallback(async () => {
    if (isCompanyAdmin) {
      setRoleOptions([
        { value: 'COMPANY_ADMIN', label: 'Company Admin' },
        { value: 'COMPANY_FINANCE', label: 'Company Finance' },
        { value: 'CLIENT_USER', label: 'Client User' },
        { value: 'CLIENT_FINANCE', label: 'Client Finance' }
      ]);
      return;
    }
    try {
      const list = await userService.listRoles();
      // PLATFORM_ADMIN is an internal role; never list it in user-facing pickers.
      const opts = (list || [])
        .filter((r) => String(r.value || r.label || '').toUpperCase() !== 'PLATFORM_ADMIN')
        .map((r) => ({
          value: r.value || r.label,
          label: (r.label || r.value || '').replace(/_/g, ' ')
        }));
      setRoleOptions(opts);
    } catch {
      setRoleOptions([
        { value: 'Company Admin', label: 'Company Admin' },
        { value: 'Company Finance', label: 'Company Finance' },
        { value: 'Client User', label: 'Client User' },
        { value: 'Client Finance', label: 'Client Finance' }
      ]);
    }
  }, [isCompanyAdmin]);

  const fetchCompanies = useCallback(async () => {
    if (isCompanyAdmin) {
      setCompanies([]);
      return;
    }
    try {
      const list = await companyService.list();
      setCompanies(Array.isArray(list) ? list : []);
    } catch {
      setCompanies([]);
    }
  }, [isCompanyAdmin]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Platform-admin accounts are internal and must never appear in the
      // user list. Filter them out client-side regardless of which API path
      // returned the results.
      const hidePlatformAdmins = (list) =>
        (Array.isArray(list) ? list : []).filter(
          (u) => !(u?.roles || []).map((r) => String(r).toUpperCase()).includes('PLATFORM_ADMIN')
        );

      if (isCompanyAdmin && companyId) {
        const res = await userService.listByCompany(companyId);
        let users = hidePlatformAdmins(Array.isArray(res) ? res : (res?.content || []));
        if (query) {
          const q = query.toLowerCase();
          users = users.filter((u) =>
            [u.name, u.email, u.phone, u.companyName, (u.roles || []).join(','), u.status]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(q))
          );
        }
        if (filterRole) {
          users = users.filter((u) => (u.roles || []).includes(filterRole));
        }
        if (filterStatus) {
          users = users.filter((u) => String(u.status || '') === String(filterStatus));
        }
        setData(users);
      } else {
        const list = await userService.list({
          search: query || undefined,
          status: filterStatus || undefined,
          role: filterRole || undefined,
          page: 0,
          size: 500
        });
        setData(hidePlatformAdmins(list));
      }
    } catch (e) {
      toast.error(e.message || 'Failed to load users');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [query, filterStatus, filterRole, isCompanyAdmin, companyId]);

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
  }, [fetchRoles, fetchCompanies]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = useMemo(() => USER_COLUMNS, []);

  const handleExport = async (type) => {
    try {
      await exportTableData({
        type,
        rows: data,
        columns: USER_EXPORT_COLUMNS,
        filename: 'users',
        title: 'Users'
      });
      if (type !== 'print') toast.success(`Exported ${type.toUpperCase()}`);
    } catch (e) {
      toast.error(e.message || `Failed to export ${type.toUpperCase()}`);
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

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (recordForEdit?.id) {
        const isPlatform = recordForEdit.roles?.includes('PLATFORM_ADMIN');
        if (isPlatform) {
          await userService.updatePlatformAdmin(recordForEdit.id, payload.status === 'Active');
          toast.success('User updated');
        } else {
          const companyId = recordForEdit.companyId;
          if (!companyId) {
            toast.error('Cannot update: user has no company');
            return;
          }
          await userService.updateUser(companyId, recordForEdit.id, {
            name: payload.name,
            email: payload.email,
            phone: payload.phone || null,
            role: payload.role,
            status: payload.status
          });
          toast.success('User updated');
        }
      } else {
        const isPlatform = payload.role === 'PLATFORM_ADMIN';
        if (isPlatform) {
          await userService.createPlatformAdmin({ email: payload.email, password: payload.password });
          toast.success('Platform admin created');
        } else {
          const companyId = payload.companyId;
          if (!companyId) {
            toast.error('Select a company for this user');
            return;
          }
          await userService.createForCompany(companyId, {
            name: payload.name,
            email: payload.email,
            phone: payload.phone || null,
            password: payload.password || null,
            role: payload.role,
            status: payload.status || 'Active'
          });
          toast.success('User created');
        }
      }
      handleCloseModal();
      fetchUsers();
    } catch (e) {
      toast.error(e.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const table = useAdvanceTable({
    data: data,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 25,
    selectionColumnWidth: 30
  });

  const roleLabel = recordForEdit?.roles ? roleDisplay(recordForEdit.roles) : undefined;

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Users</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="users-actions" className="d-flex align-items-center flex-nowrap gap-2">
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
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterRole}
                    placeholder="Filter Role"
                    onChange={(value) => setFilterRole(value)}
                    options={roleOptions}
                  />
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterStatus}
                    placeholder="Filter Status"
                    onChange={(value) => setFilterStatus(value)}
                    options={statusOptions}
                  />
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
                Loading users...
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
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]} />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <UserFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        roleLabel={roleLabel}
        companies={companies}
        submitting={submitting}
      />
    </>
  );
};

export default UserList;
