import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, ConfirmDelete } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import ProviderFormModal from 'components/sms/forms/ProviderFormModal';

const PROVIDERS_COLUMNS = (onEdit, onDelete) => [
  { title: 'Carrier Name', dataIndex: 'name', key: 'name' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Host', dataIndex: 'host', key: 'host' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Throughput', dataIndex: 'throughput', key: 'throughput' },
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

const ListProviders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = PROVIDERS_COLUMNS(
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

  const handleConfirmDelete = () => {
    if (deleteTarget) setData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleProviderSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
    <TablePageLayout
      title="Carriers"
      subtitle="View and manage all configured carriers. Add and edit from this page."
      toolbar={
        <>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
              <FontAwesomeIcon icon="plus" className="me-1" />
              Add Carrier
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
        rowKey={(r) => r.id ?? r.name}
      />
    </TablePageLayout>

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
        title="Delete Provider"
        message="Are you sure you want to delete this provider? This action cannot be undone."
      />
    </>
  );
};

export default ListProviders;
