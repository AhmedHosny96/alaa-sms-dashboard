import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, TableToolbar, Search, TableExportSelect, ConfirmDelete, UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const USERS_COLUMNS = (onEdit, onDelete) => [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (v) => (
      <Badge bg={v === 'Active' ? 'success' : 'secondary'} className="text-uppercase">
        {v || '—'}
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
      <>
        <Button
          variant="link"
          size="sm"
          className="p-0 me-1 text-700"
          onClick={() => onEdit(record)}
          title="Edit"
        >
          <FontAwesomeIcon icon="edit" />
        </Button>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-danger"
          onClick={() => onDelete(record)}
          title="Delete"
        >
          <FontAwesomeIcon icon="trash-alt" />
        </Button>
      </>
    )
  }
];

const ViewUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = USERS_COLUMNS(
    (record) => {
      setRecordForEdit(record);
      setModalShow(true);
    },
    (record) => setDeleteTarget(record)
  );

  const { TableContainer } = UseTable(columns, data, loading);

  const handleAdd = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const initialUserValues = {
    name: recordForEdit?.name ?? '',
    email: recordForEdit?.email ?? '',
    role: recordForEdit?.role ?? ''
  };
  const { values, setValues, handleOnChange } = useForm(initialUserValues);

  useEffect(() => {
    if (modalShow) setValues(initialUserValues);
  }, [modalShow, recordForEdit]);

  const roleOptions = [
    { id: 'admin', name: 'Admin' },
    { id: 'user', name: 'User' }
  ];

  const handleSaveUser = () => {
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) setData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <TablePageLayout
        title="All Users"
        subtitle="List of all users. Add and edit from this page."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add User
              </Button>
              <TableExportSelect
                onExport={(type) => {
                  if (type === 'print') window.print();
                }}
              />
            </div>
            <Search
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search ..."
              className="table-page-search"
            />
          </>
        }
      >
        <TableContainer
          dataSource={data}
          loading={loading}
          rowKey={(r) => r.id ?? r.email}
        />
      </TablePageLayout>

      <UseModal
        title={recordForEdit ? 'Edit User' : 'Add User'}
        isVisible={modalShow}
        setIsVisible={setModalShow}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" variant="secondary" size="sm" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" variant="primary" size="sm" type="submit" form="myform">
            {recordForEdit ? 'Update' : 'Save'}
          </Button>
        ]}
      >
        <Forms id="myform" onFinish={handleSaveUser}>
          <UseInput
            name="name"
            label="Name"
            value={values.name}
            onChange={handleOnChange}
            placeholder="Full name"
          />
          <UseInput
            name="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleOnChange}
            placeholder="user@example.com"
          />
          <UseSelect
            name="role"
            label="Role"
            value={values.role}
            options={roleOptions}
            onChange={(v) => setValues((prev) => ({ ...prev, role: v }))}
            placeholder="Select role"
          />
        </Forms>
      </UseModal>

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </>
  );
};

export default ViewUsers;
