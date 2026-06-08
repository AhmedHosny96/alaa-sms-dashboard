import React, { useMemo, useState } from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { TableSelectFilter, ConfirmDelete, TableExportSelect } from 'components/common/UseTable';
import RoleFormModal from 'components/sms/forms/RoleFormModal';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';

const ROLE_COLUMNS = (onEdit, onDelete) => [
  { accessorKey: 'name', header: 'Role', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'scope', header: 'Scope', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'description', header: 'Description', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => (
      <Badge
        bg={original.status === 'Active' ? 'success' : 'secondary'}
        className="text-uppercase"
      >
        {original.status || '—'}
      </Badge>
    )
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } },
    cell: ({ row: { original } }) => (
      <div className="d-inline-flex align-items-center">
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="edit"
          transform="shrink-3"
          className="me-2 text-primary shadow-none"
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
    )
  }
];

const DEFAULT_ROLES = [
  {
    id: 'company-admin',
    name: 'Company Admin',
    scope: 'Company',
    description: 'Manage clients, pricing, routes, providers.',
    status: 'Active'
  },
  {
    id: 'company-finance',
    name: 'Company Finance',
    scope: 'Company',
    description: 'View company invoices and revenue.',
    status: 'Active'
  },
  {
    id: 'client-user',
    name: 'Client User',
    scope: 'Client',
    description: 'View messages and reports.',
    status: 'Active'
  },
  {
    id: 'client-finance',
    name: 'Client Finance',
    scope: 'Client',
    description: 'View invoices only.',
    status: 'Active'
  }
];

const RoleList = () => {
  const [data, setData] = useState(DEFAULT_ROLES);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterScope, setFilterScope] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const scopeOptions = [
    { value: 'Company', label: 'Company' },
    { value: 'Client', label: 'Client' }
  ];

  const columns = useMemo(
    () =>
      ROLE_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => setDeleteTarget(record)
      ),
    []
  );

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (filterScope) list = list.filter((row) => String(row.scope) === String(filterScope));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.name, row.scope, row.description, row.status]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterStatus, filterScope, query]);

  const handleAdd = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setData((prev) => prev.filter((r) => (r.id ?? r.name) !== (deleteTarget.id ?? deleteTarget.name)));
    }
    setDeleteTarget(null);
  };

  const handleSubmit = () => {
    handleCloseModal();
  };

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 25,
    selectionColumnWidth: 30
  });

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Roles</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="roles-actions" className="d-flex align-items-center flex-nowrap gap-2">
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
                      value={filterScope}
                      placeholder="Filter Scope"
                      onChange={(value) => setFilterScope(value)}
                      options={scopeOptions}
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
                      onExport={(type) => {
                        if (type === 'print') window.print();
                      }}
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
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]} />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <RoleFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
      />
    </>
  );
};

export default RoleList;
