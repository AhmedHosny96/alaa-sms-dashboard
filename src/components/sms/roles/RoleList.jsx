import React, { useMemo, useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  UseTable,
  Search,
  TableExportSelect,
  TableSelectFilter,
  ConfirmDelete
} from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import RoleFormModal from 'components/sms/forms/RoleFormModal';

const ROLE_COLUMNS = (onEdit, onDelete) => [
  { title: 'Role', dataIndex: 'name', key: 'name' },
  { title: 'Scope', dataIndex: 'scope', key: 'scope' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value) => (
      <Badge bg={value === 'Active' ? 'success' : 'secondary'} className="text-uppercase">
        {value || '—'}
      </Badge>
    )
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: 100,
    render: (_, record) => (
      <div className="d-flex justify-content-center gap-1">
        <Button
          variant="warning"
          size="sm"
          className="px-2 py-0"
          onClick={() => onEdit(record)}
          title="Edit"
        >
          <FontAwesomeIcon icon="edit" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="px-2 py-0"
          onClick={() => onDelete(record)}
          title="Delete"
        >
          <FontAwesomeIcon icon="trash-alt" />
        </Button>
      </div>
    )
  }
];

const RoleList = () => {
  const [data, setData] = useState([]);
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
    { value: 'Platform Owner', label: 'Platform Owner' },
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

  const { TableContainer } = UseTable(columns, data, loading);

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

  return (
    <>
      <TablePageLayout
        title="Roles"
        subtitle="Create and manage role permissions and access levels."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add Role
              </Button>
              {/* <TableSelectFilter
                className="table-page-filter"
                value={filterScope}
                placeholder="Scope"
                onChange={(value) => setFilterScope(value)}
                options={scopeOptions}
              /> */}
              <TableSelectFilter
                className="table-page-filter"
                value={filterStatus}
                placeholder="Status"
                onChange={(value) => setFilterStatus(value)}
                options={statusOptions}
              />
              {/* <TableExportSelect
                onExport={(type) => {
                  if (type === 'print') window.print();
                }}
              /> */}
            </div>
            <Search
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ..."
              className="table-page-search"
            />
          </>
        }
      >
        <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.name} />
      </TablePageLayout>

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
