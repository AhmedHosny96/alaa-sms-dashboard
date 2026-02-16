import React, { useMemo, useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import SubscriptionFormModal from 'components/sms/forms/SubscriptionFormModal';

const SUBSCRIPTION_COLUMNS = (onEdit) => [
  { title: 'Plan Name', dataIndex: 'name', key: 'name' },
  { title: 'Monthly Price', dataIndex: 'price', key: 'price', render: (v) => `$${v}/month` },
  { title: 'TPS Limit', dataIndex: 'tps', key: 'tps' },
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
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    width: 90,
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
      </div>
    )
  }
];

const Subscriptions = () => {
  const [data] = useState([
    { id: 1, name: 'Starter', price: 200, tps: 20,  createdAt: '2026-02-01',status: 'Active' },
    { id: 2, name: 'Growth', price: 300, tps: 30, createdAt: '2026-02-05', status: 'Active' },
    { id: 3, name: 'Enterprise', price: 500, tps: 100, createdAt: '2026-02-10', status: 'Active' }
  ]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  const columns = useMemo(
    () =>
      SUBSCRIPTION_COLUMNS((record) => {
        setRecordForEdit(record);
        setModalShow(true);
      }),
    []
  );

  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.name, row.price, row.tps, row.status, row.createdAt]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
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

  const handleSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="Subscriptions"
        subtitle="Create and manage subscription plans and TPS limits."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Create Subscription
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
              placeholder="Search ..."
              className="table-page-search"
            />
          </>
        }
      >
        <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.name} />
      </TablePageLayout>

      <SubscriptionFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default Subscriptions;
