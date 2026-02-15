import React, { useState, useEffect } from 'react';
import { Card, Col, Container, Row, Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, ConfirmDelete, UseModal, useForm, Forms, UseInput } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import { isValidIPv4ClassABC } from 'helpers/utils';

const API_KEYS_COLUMNS = (onEdit, onDelete) => [
  { title: 'Key Name', dataIndex: 'keyName', key: 'keyName' },
  { title: 'Key', dataIndex: 'key', key: 'key', render: (v) => (v ? `${v.slice(0, 8)}…` : '—') },
  { title: 'Created', dataIndex: 'created', key: 'created' },
  { title: 'Last Used', dataIndex: 'lastUsed', key: 'lastUsed' },
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

const ApiKeys = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = API_KEYS_COLUMNS(
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

  const initialKeyValues = { keyName: recordForEdit?.keyName ?? '' };
  const { values, setValues, handleOnChange } = useForm(initialKeyValues);
  const [ipList, setIpList] = useState([]);
  const [ipInput, setIpInput] = useState('');
  const [ipError, setIpError] = useState('');

  useEffect(() => {
    if (modalShow) setValues(initialKeyValues);
  }, [modalShow, recordForEdit]);

  const handleSaveKey = () => {
    handleCloseModal();
  };

  const handleAddIp = (e) => {
    e?.preventDefault?.();
    const trimmed = ipInput.trim();
    setIpError('');
    if (!trimmed) return;
    if (!isValidIPv4ClassABC(trimmed)) {
      setIpError('Enter a valid IPv4 address (Class A, B, or C), e.g. 192.168.1.1');
      return;
    }
    if (ipList.includes(trimmed)) return;
    setIpList((prev) => [...prev, trimmed]);
    setIpInput('');
  };

  const handleRemoveIp = (ip) => {
    setIpList((prev) => prev.filter((x) => x !== ip));
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) setData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <TablePageLayout
        title="API Keys"
        subtitle="Manage API keys and view API access logs."
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAdd}>
                <FontAwesomeIcon icon="plus" className="me-1" />
                Generate New Key
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
          rowKey={(r) => r.id ?? r.key}
        />
      </TablePageLayout>

      <Container fluid className="py-0">
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">IP Whitelist</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddIp} className="mb-3">
                  <Form.Label className="text-700">Add IP address</Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      value={ipInput}
                      onChange={(e) => {
                        setIpInput(e.target.value);
                        setIpError('');
                      }}
                      placeholder="192.168.1.1"
                      type="text"
                      aria-label="IP address"
                    />
                    <Button variant="primary" type="submit" disabled={!ipInput.trim()}>
                      Add
                    </Button>
                  </InputGroup>
                  {ipError && <Form.Text className="text-danger d-block mt-1">{ipError}</Form.Text>}
                </Form>
                {ipList.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {ipList.map((ip) => (
                      <span
                        key={ip}
                        className="d-inline-flex align-items-center gap-1 px-2 py-1 border rounded shadow-none fs--1"
                        style={{
                          backgroundColor: 'var(--bs-input-bg, var(--bs-body-bg))',
                          color: 'var(--bs-input-color, var(--bs-body-color))',
                          borderColor: 'var(--bs-border-color)'
                        }}
                      >
                        {ip}
                        <button
                          type="button"
                          className="btn btn-link p-0 ms-1 text-danger border-0"
                          style={{ fontSize: '0.85rem' }}
                          onClick={() => handleRemoveIp(ip)}
                          aria-label={`Remove ${ip}`}
                        >
                          <FontAwesomeIcon icon="times" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {ipList.length === 0 && (
                  <p className="text-700 fs--1 mb-0">No IPs added. Enter an address and click Add.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <UseModal
        title={recordForEdit ? 'Edit API Key' : 'Generate New Key'}
        isVisible={modalShow}
        setIsVisible={setModalShow}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" variant="secondary" size="sm" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" variant="primary" size="sm" type="submit" form="myform">
            {recordForEdit ? 'Update' : 'Generate'}
          </Button>
        ]}
      >
        <Forms id="myform" onFinish={handleSaveKey}>
          <UseInput
            name="keyName"
            label="Key Name"
            value={values.keyName}
            onChange={handleOnChange}
            placeholder="e.g. Production"
          />
        </Forms>
      </UseModal>

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete API Key"
        message="Are you sure you want to delete this API key? It will stop working immediately."
      />
    </>
  );
};

export default ApiKeys;
