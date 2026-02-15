import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import NumberFormModal from 'components/sms/forms/NumberFormModal';
import TablePageLayout from 'components/common/TablePageLayout';

const NUMBER_COLUMNS = (onEdit, onDelete) => [
  { title: 'Provider', dataIndex: 'provider', key: 'provider' },
  { title: 'Range', dataIndex: 'range', key: 'range' },
  { title: 'Category', dataIndex: 'category', key: 'category' },
  { title: 'Prefix', dataIndex: 'prefix', key: 'prefix' },
  { title: 'Number', dataIndex: 'number', key: 'number' },
  {
    title: 'My Payout',
    dataIndex: 'myPayout',
    key: 'myPayout',
    render: (value) => (
      <div className="d-flex flex-column">
        <span className="text-700 fs--2">{value?.label ?? 'Weekly'}</span>
        <span className="fw-semibold">{value?.amount ?? value}</span>
      </div>
    )
  },
  {
    title: 'Agent',
    dataIndex: 'agent',
    key: 'agent',
    render: (value) => (
      <div className="d-flex align-items-center gap-1">
        <span>{value?.id ?? value}</span>
        {value?.removable && <FontAwesomeIcon icon="times" className="text-700 fs--2" />}
      </div>
    )
  },
  {
    title: 'Payout',
    dataIndex: 'payout',
    key: 'payout',
    render: (value) => (
      <div className="d-flex flex-column">
        <span className="text-700 fs--2">{value?.label ?? 'Weekly'}</span>
        <span className="fw-semibold">{value?.amount ?? value}</span>
      </div>
    )
  },
  { title: 'Limits', dataIndex: 'limits', key: 'limits' },
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

const MyNumbers = () => {
  const [data] = useState([
    {
      id: 1,
      provider: 'BulkTele',
      range: 'UKBK',
      category: 'General',
      prefix: '4474065',
      number: '447406524375',
      myPayout: { label: 'Weekly', amount: '$ 0.0085' },
      agent: { id: '369874', removable: true },
      payout: { label: 'Weekly', amount: '$ 0.004' },
      limits: 'SD: 0 | SW: 0',
      status: 'active',
      type: 'mobile'
    },
    {
      id: 2,
      provider: 'BulkTele',
      range: 'UKBK',
      category: 'General',
      prefix: '4474065',
      number: '447406520233',
      myPayout: { label: 'Weekly', amount: '$ 0.0085' },
      agent: { id: '369874', removable: true },
      payout: { label: 'Weekly', amount: '$ 0.004' },
      limits: 'SD: 0 | SW: 0',
      status: 'active',
      type: 'mobile'
    }
  ]);
  const [loading] = useState(false);
  const [filterProvider, setFilterProvider] = useState('');
  const [filterRange, setFilterRange] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterScope, setFilterScope] = useState('all');
  const [filterType, setFilterType] = useState('');
  const [filterNumber, setFilterNumber] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  const columns = useMemo(
    () =>
      NUMBER_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        () => {}
      ),
    []
  );

  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (filterAgent) list = list.filter((row) => String(row.agent?.id ?? '') === String(filterAgent));
    if (filterScope !== 'all') list = list.filter((row) => String(row.status) === String(filterScope));
    if (filterType) list = list.filter((row) => String(row.type) === String(filterType));
    if (filterNumber) {
      const q = filterNumber.toLowerCase();
      list = list.filter((row) => String(row.number ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [data, filterProvider, filterRange, filterAgent, filterScope, filterType, filterNumber]);

  const handleAddNumber = () => {
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
        title="Manage SMS Numbers"
        subtitle="Manage SMS numbers, allocations, and payouts."
        toolbar={
          <>
            <div className="sms-numbers-toolbar-compact d-flex flex-wrap gap-2 align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAddNumber}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add New Number
              </Button>
              <TableSelectFilter
                className="table-page-filter"
                value={filterProvider}
                placeholder="Select Provider"
                onChange={(value) => setFilterProvider(value)}
                options={[
                  { value: 'BulkTele', label: 'BulkTele' }
                ]}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterRange}
                placeholder="Select Range"
                onChange={(value) => setFilterRange(value)}
                options={[
                  { value: 'UKBK', label: 'UKBK' },
                  { value: 'UKBX', label: 'UKBX' }
                ]}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterAgent}
                placeholder="Select Agent"
                onChange={(value) => setFilterAgent(value)}
                options={[
                  { value: '369874', label: '369874' },
                  { value: '369875', label: '369875' }
                ]}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterScope}
                placeholder="All Numbers"
                onChange={(value) => setFilterScope(value || 'all')}
                options={[
                  { value: 'all', label: 'All Numbers' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterType}
                placeholder="Number Type"
                onChange={(value) => setFilterType(value)}
                options={[
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'landline', label: 'Landline' }
                ]}
              />
              <TableExportSelect
                onExport={(type) => {
                  if (type === 'print') window.print();
                }}
              />
            </div>
            <Search
              value={filterNumber}
              onChange={(e) => setFilterNumber(e.target.value)}
              placeholder="Search Number"
              className="table-page-search"
            />
          </>
        }
      >
        <TableContainer
          dataSource={filteredData}
          loading={loading}
          rowKey={(r) => r.id ?? r.number}
        />
      </TablePageLayout>

      <NumberFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default MyNumbers;
