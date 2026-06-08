import React, { useEffect, useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { UseTable, UseModal, useForm, Forms, UseInput, UseSelect, TableExportSelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import IconButton from 'components/common/IconButton';

const INITIAL_CURRENCIES = [
  {
    id: 1,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1,
    status: 'active',
    isDefault: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.92,
    status: 'active',
    isDefault: false,
    updatedAt: new Date().toISOString()
  }
];

const CURRENCY_COLUMNS = (onEdit, onDelete) => [
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', align: 'center' },
  { title: 'Rate', dataIndex: 'rate', key: 'rate', align: 'right' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (_, record) => String(record.status || '').toUpperCase()
  },
  {
    title: 'Default',
    key: 'isDefault',
    align: 'center',
    render: (_, record) => (record.isDefault ? 'Yes' : 'No')
  },
  {
    title: 'Updated',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (_, record) =>
      record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '—'
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <div className="d-inline-flex align-items-center">
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="edit"
          transform="shrink-3"
          className="me-2 text-primary shadow-none"
          title="Edit"
          onClick={() => onEdit(record)}
        />
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="trash"
          transform="shrink-3"
          className="text-danger shadow-none"
          title="Delete"
          onClick={() => onDelete(record)}
        />
      </div>
    )
  }
];

const statusOptions = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' }
];

const PaymentCurrencies = () => {
  const [data, setData] = useState(INITIAL_CURRENCIES);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  const filteredData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((row) =>
      [row.code, row.name, row.symbol, row.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, query]);

  const columns = useMemo(
    () =>
      CURRENCY_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => {
          setData((prev) => prev.filter((item) => item.id !== record.id));
        }
      ),
    [setData]
  );

  const { TableContainer } = UseTable(columns, filteredData, loading);

  const initialValues = useMemo(
    () => ({
      code: recordForEdit?.code ?? '',
      name: recordForEdit?.name ?? '',
      symbol: recordForEdit?.symbol ?? '',
      rate: recordForEdit?.rate ?? '',
      status: recordForEdit?.status ?? 'active',
      isDefault: Boolean(recordForEdit?.isDefault)
    }),
    [recordForEdit]
  );

  const { values, setValues, handleOnChange, reset } = useForm(initialValues);

  useEffect(() => {
    if (modalShow) setValues(initialValues);
  }, [modalShow, initialValues, setValues]);

  const handleSelectChange = (name) => (value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setValues((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddCurrency = () => {
    setRecordForEdit(null);
    reset();
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmit = () => {
    const payload = {
      id: recordForEdit?.id ?? Date.now(),
      code: String(values.code || '').trim().toUpperCase(),
      name: String(values.name || '').trim(),
      symbol: String(values.symbol || '').trim(),
      rate: Number(values.rate || 0),
      status: values.status || 'active',
      isDefault: Boolean(values.isDefault),
      updatedAt: new Date().toISOString()
    };

    if (!payload.code || !payload.name) return;

    setData((prev) => {
      let next = Array.isArray(prev) ? [...prev] : [];
      if (payload.isDefault) {
        next = next.map((item) => ({ ...item, isDefault: false }));
      }

      const editIndex = next.findIndex((item) => item.id === payload.id);
      if (editIndex >= 0) {
        next[editIndex] = payload;
      } else {
        next.unshift(payload);
      }

      return next;
    });

    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="System Currencies"
       // subtitle="Manage available currencies for payments."
        toolbar={
          <>
            <IconButton
              variant="primary"
              size="sm"
              icon="plus"
              transform="shrink-3"
              title="New"
              onClick={handleAddCurrency}
            >
              <span className="d-none d-sm-inline-block ms-1">New</span>
            </IconButton>
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
          </>
        }
      >
        <TableContainer
          dataSource={filteredData}
          loading={loading}
          rowKey={(r) => r.id ?? r.code}
          className="table-sm fs-10 mb-0 overflow-hidden"
        />
      </TablePageLayout>

      <UseModal
        title={recordForEdit ? 'Edit Currency' : 'Add Currency'}
        isVisible={modalShow}
        setIsVisible={setModalShow}
        onCancel={handleCloseModal}
        footer={[
          <IconButton key="close" variant="falcon-default" size="sm" onClick={handleCloseModal}>
            Close
          </IconButton>,
          <IconButton key="submit" variant="primary" size="sm" type="submit" form="currency-form">
            {recordForEdit ? 'Update' : 'Create'}
          </IconButton>
        ]}
      >
        <Forms id="currency-form" onFinish={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <UseInput
                name="code"
                label="Currency Code"
                value={values.code}
                onChange={handleOnChange}
                placeholder="USD"
              />
            </Col>
            <Col md={6}>
              <UseInput
                name="name"
                label="Currency Name"
                value={values.name}
                onChange={handleOnChange}
                placeholder="US Dollar"
              />
            </Col>
            <Col md={6}>
              <UseInput
                name="symbol"
                label="Symbol"
                value={values.symbol}
                onChange={handleOnChange}
                placeholder="$"
              />
            </Col>
            <Col md={6}>
              <UseInput
                name="rate"
                label="Rate"
                type="number"
                value={values.rate}
                onChange={handleOnChange}
                placeholder="1.00"
              />
            </Col>
            <Col md={6}>
              <UseSelect
                name="status"
                label="Status"
                options={statusOptions}
                value={values.status}
                onChange={handleSelectChange('status')}
                allowClear={false}
              />
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Default</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="isDefault"
                  label="Set as default"
                  checked={Boolean(values.isDefault)}
                  onChange={handleCheckboxChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Forms>
      </UseModal>
    </>
  );
};

export default PaymentCurrencies;
