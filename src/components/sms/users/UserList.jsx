import React, { useMemo, useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import UserFormModal from 'components/sms/forms/UserFormModal';

const USER_COLUMNS = (onEdit, onDelete) => [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'Type', dataIndex: 'role', key: 'role' },
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
  { title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin' },
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

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const roleOptions = [
    { value: 'Company Admin', label: 'Company Admin' },
    { value: 'Company Finance', label: 'Company Finance' },
    { value: 'Client User', label: 'Client User' },
    { value: 'Client Finance', label: 'Client Finance' }
  ];

  const columns = useMemo(
    () =>
      USER_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => setData((prev) => prev.filter((r) => (r.id ?? r.email) !== (record.id ?? record.email)))
      ),
    []
  );

  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (filterRole) list = list.filter((row) => String(row.role) === String(filterRole));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.name, row.email, row.phone, row.role, row.status, row.lastLogin]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterStatus, filterRole, query]);

  const handleAdd = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="Users"
        subtitle="Manage all users with role-based access."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add User
              </Button>
              <TableSelectFilter
                className="table-page-filter"
                value={filterRole}
                placeholder="User Type"
                onChange={(value) => setFilterRole(value)}
                options={roleOptions}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterStatus}
                placeholder="Status"
                onChange={(value) => setFilterStatus(value)}
                options={statusOptions}
              />
              <TableExportSelect
                onExport={(type) => {
                  if (type === 'print') window.print();
                }}
              />
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
        <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.email} />
      </TablePageLayout>

      <UserFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        roleLabel={recordForEdit?.role}
      />
    </>
  );
};

export default UserList;
