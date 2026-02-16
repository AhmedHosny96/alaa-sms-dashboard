import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, ConfirmDelete, UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import { isValidIPv4ClassABC } from 'helpers/utils';

const API_KEYS_COLUMNS = (onEdit, onDelete) => [
  { title: 'Company', dataIndex: 'company', key: 'company' },
  { title: 'TPS Limit', dataIndex: 'tpsLimit', key: 'tpsLimit', align: 'right' },
  { title: 'Key Name', dataIndex: 'keyName', key: 'keyName' },
  { title: 'Key', dataIndex: 'key', key: 'key', render: (v) => (v ? `${v.slice(0, 8)}…` : '—') },
  { title: 'Status', dataIndex: 'status', key: 'status' },
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

  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const companyOptions = [
    { id: 'Company A', name: 'Company A' },
    { id: 'Company B', name: 'Company B' }
  ];

  const companyTpsMap = {
    'Company A': 20,
    'Company B': 30
  };

  const initialKeyValues = useMemo(
    () => ({
      company: recordForEdit?.company ?? 'Company A',
      keyName: recordForEdit?.keyName ?? '',
      status: recordForEdit?.status ?? 'Active'
    }),
    [recordForEdit]
  );
  const { values, setValues, handleOnChange } = useForm(initialKeyValues);
  const currentTpsLimit = companyTpsMap[values.company] ?? 0;
  const [ipList, setIpList] = useState([]);
  const [ipInput, setIpInput] = useState('');
  const [ipError, setIpError] = useState('');

  useEffect(() => {
    if (!modalShow) return;
    setValues(initialKeyValues);
    const raw = recordForEdit?.ipWhitelist ?? '';
    const list = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setIpList(list);
    setIpInput('');
    setIpError('');
  }, [modalShow, recordForEdit, initialKeyValues, setValues]);

  const handleSaveKey = () => {
    const payload = { ...values, ipWhitelist: ipList.join('\n') };
    void payload;
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
        subtitle="Manage company API keys and access settings."
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
          <UseSelect
            name="company"
            label="Company"
            value={values.company}
            options={companyOptions}
            onChange={(value) => setValues((prev) => ({ ...prev, company: value }))}
            placeholder="Select company"
          />
          <UseInput
            name="tpsLimit"
            label="TPS Limit"
            value={currentTpsLimit}
            onChange={() => {}}
            readOnly
          />
          <UseInput
            name="keyName"
            label="Key Name"
            value={values.keyName}
            onChange={handleOnChange}
            placeholder="e.g. Production"
          />
          {recordForEdit && (
            <UseSelect
              name="status"
              label="Status"
              value={values.status}
              options={statusOptions}
              onChange={(value) => setValues((prev) => ({ ...prev, status: value }))}
              placeholder="Select status"
            />
          )}
          <Form.Group className="mb-2">
            <Form.Label>IP Whitelist</Form.Label>
            <div
              className="d-flex flex-wrap align-items-center gap-2 p-2 border rounded"
              style={{
                backgroundColor: 'var(--bs-input-bg, var(--bs-body-bg))',
                color: 'var(--bs-input-color, var(--bs-body-color))',
                borderColor: 'var(--bs-border-color)'
              }}
            >
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
              <Form.Control
                size="sm"
                value={ipInput}
                onChange={(e) => {
                  setIpInput(e.target.value);
                  setIpError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIp(e)}
                placeholder="Add IP"
                className="border-0 shadow-none flex-grow-1 rounded-0 p-0 bg-transparent"
                style={{
                  minWidth: '100px',
                  color: 'inherit',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
            {ipError && <Form.Text className="text-danger">{ipError}</Form.Text>}
          </Form.Group>
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
