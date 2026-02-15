import React, { useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import RangeFormModal from 'components/sms/forms/RangeFormModal';

const RANGE_COLUMNS = (onView, onEdit, onDelete) => [
  {
    title: '',
    key: 'select',
    width: 42,
    headerClassName: 'text-center',
    align: 'center',
    render: () => <Form.Check />
  },
  { title: 'Provider', dataIndex: 'provider', key: 'provider' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Prefix', dataIndex: 'prefix', key: 'prefix' },
  { title: 'Active', dataIndex: 'active', key: 'active', align: 'center' },
  { title: 'Currency', dataIndex: 'currency', key: 'currency' },
  { title: 'Payment', dataIndex: 'payment', key: 'payment' },
  { title: 'Payout', dataIndex: 'payout', key: 'payout' },
  { title: 'CLLList', dataIndex: 'cliList', key: 'cliList' },
  { title: 'Qty', dataIndex: 'qty', key: 'qty', align: 'right' },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    width: 130,
    render: (_, record) => (
      <div className="d-flex justify-content-center gap-1">
        <Button
          variant="primary"
          size="sm"
          className="p-0 px-2"
          onClick={() => onView(record)}
          title="View"
        >
          <FontAwesomeIcon icon="eye" />
        </Button>
        <Button
          variant="warning"
          size="sm"
          className="p-0 px-2"
          onClick={() => onEdit(record)}
          title="Edit"
        >
          <FontAwesomeIcon icon="edit" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="p-0 px-2"
          onClick={() => onDelete(record)}
          title="Delete"
        >
          <FontAwesomeIcon icon="trash-alt" />
        </Button>
      </div>
    )
  }
];

const CreateRanges = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  const columns = useMemo(
    () =>
      RANGE_COLUMNS(
        () => {},
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
    if (filterProvider) {
      list = list.filter((row) => String(row.provider ?? '') === String(filterProvider));
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.provider, row.name, row.prefix, row.currency, row.payment]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, query]);

  const handleAddRange = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmitRange = () => {
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="Manage SMS Ranges"
        subtitle="Configure ranges, payouts, and limits for SMS numbers."
        toolbar={
          <>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAddRange}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add New Range
              </Button>
              <div className="d-flex gap-2 align-items-center">
                <TableSelectFilter
                  className="table-page-filter"
                  value={filterProvider}
                  placeholder="Select Provider"
                  onChange={(value) => setFilterProvider(value)}
                  options={[
                    { value: 'provider-1', label: 'Provider 1' },
                    { value: 'provider-2', label: 'Provider 2' }
                  ]}
                />
              </div>
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
          dataSource={filteredData}
          loading={loading}
          rowKey={(r) => r.id ?? r.prefix}
        />
      </TablePageLayout>

      <RangeFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRange}
      />
    </>
  );
};

export default CreateRanges;
