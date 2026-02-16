import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, ConfirmDelete } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import DomainFormModal from 'components/sms/forms/DomainFormModal';

const DOMAIN_COLUMNS = (onEdit, onDelete) => [
  { title: 'Company', dataIndex: 'company', key: 'company' },
  { title: 'Domain', dataIndex: 'domain', key: 'domain' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: 100,
    render: (_, record) => (
      <div className="d-flex justify-content-center gap-1">
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
      </div>
    )
  }
];

const DomainList = () => {
  const [data, setData] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = useMemo(
    () =>
      DOMAIN_COLUMNS(
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
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.company, row.domain, row.type, row.status, row.createdAt]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

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

  const handleSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="Domain Management"
        subtitle="Manage and verify platform domains."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add Domain
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
        <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.domain} />
      </TablePageLayout>

      <DomainFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Domain"
        message="Are you sure you want to delete this domain? This action cannot be undone."
      />
    </>
  );
};

export default DomainList;
