import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const CURRENCY_COLUMNS = (onEdit, onDelete) => [
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', align: 'center' },
  { title: 'Rate', dataIndex: 'rate', key: 'rate', align: 'right' },
  { title: 'Status', dataIndex: 'status', key: 'status', align: 'center' },
  { title: 'Updated', dataIndex: 'updatedAt', key: 'updatedAt' },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <div className="d-flex justify-content-center gap-1">
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

const statusOptions = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' }
];

const PaymentCurrencies = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  const columns = useMemo(
    () =>
      CURRENCY_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        () => {}
      ),
    []
  );

  const { TableContainer } = UseTable(columns, data, loading);

  const initialValues = useMemo(
    () => ({
      code: recordForEdit?.code ?? '',
      name: recordForEdit?.name ?? '',
      symbol: recordForEdit?.symbol ?? '',
      rate: recordForEdit?.rate ?? '',
      status: recordForEdit?.status ?? 'active'
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
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="System Currencies"
        subtitle="Manage available currencies for payments."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAddCurrency}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Add Currency
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
          rowKey={(r) => r.id ?? r.code}
        />
      </TablePageLayout>

      <UseModal
        title={recordForEdit ? 'Edit Currency' : 'Add Currency'}
        isVisible={modalShow}
        setIsVisible={setModalShow}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" variant="secondary" size="sm" onClick={handleCloseModal}>
            Close
          </Button>,
          <Button key="submit" variant="primary" size="sm" type="submit" form="currency-form">
            {recordForEdit ? 'Update' : 'Create'}
          </Button>
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
                <Form.Check type="checkbox" name="isDefault" label="Set as default" />
              </Form.Group>
            </Col>
          </Row>
        </Forms>
      </UseModal>
    </>
  );
};

export default PaymentCurrencies;
