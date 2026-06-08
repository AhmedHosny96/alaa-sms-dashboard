import React, { useEffect, useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import { isValidIPv4ClassABC } from 'helpers/utils';
import IconButton from 'components/common/IconButton';
import { SMPP_BIND_MODE_OPTIONS, canonicalSmppBindMode } from 'constants/smppBindMode';

const ProviderFormModal = ({
  show,
  onClose,
  record,
  onSubmit,
  showConnectorField = false,
  modalTitle,
  closeOnSubmit = true
}) => {
  const initialProviderValues = useMemo(
    () => ({
      connectorId: record?.connectorId ?? '',
      providerName: record?.providerName ?? record?.name ?? '',
      email: record?.email ?? '',
      username: record?.username ?? '',
      password: record?.password ?? '',
      throughput: record?.throughput ?? '',
      ipAddresses: record?.ipAddresses ?? '',
      httpNumberField: record?.httpNumberField ?? '',
      httpCliField: record?.httpCliField ?? '',
      apiUrl: record?.apiUrl ?? '',
      messageField: record?.messageField ?? '',
      messageValue: record?.messageValue ?? '',
      uniqueIdField: record?.uniqueIdField ?? '',
      uniqueIdValue: record?.uniqueIdValue ?? '',
      returnValue: record?.returnValue ?? '',
      uuidValue: record?.uuidValue ?? '',
      ussdIpAddresses: record?.ussdIpAddresses ?? '',
      smppHost: record?.smppHost ?? '',
      smppPort: record?.smppPort ?? '',
      smppSystemId: record?.smppSystemId ?? '',
      smppPassword: record?.smppPassword ?? '',
      smppBindMode: canonicalSmppBindMode(record?.smppBindMode)
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialProviderValues);
  const [providerIpList, setProviderIpList] = useState([]);
  const [providerIpInput, setProviderIpInput] = useState('');
  const [providerIpError, setProviderIpError] = useState('');

  useEffect(() => {
    if (show) setValues(initialProviderValues);
  }, [show, initialProviderValues, setValues]);

  useEffect(() => {
    if (!show) return;
    const raw = record?.ipAddresses ?? '';
    const list = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setProviderIpList(list);
    setProviderIpInput('');
    setProviderIpError('');
  }, [show, record]);

  const addProviderIp = (e) => {
    e?.preventDefault?.();
    const trimmed = providerIpInput.trim();
    setProviderIpError('');
    if (!trimmed) return;
    if (!isValidIPv4ClassABC(trimmed)) {
      setProviderIpError('Enter a valid IPv4 address (Class A, B, or C), e.g. 192.168.1.1');
      return;
    }
    if (providerIpList.includes(trimmed)) return;
    setProviderIpList((prev) => [...prev, trimmed]);
    setProviderIpInput('');
  };

  const removeProviderIp = (ip) => {
    setProviderIpList((prev) => prev.filter((x) => x !== ip));
  };

  const handleProviderSubmit = () => {
    const payload = { ...values, ipAddresses: providerIpList.join('\n') };
    onSubmit?.(payload);
    if (closeOnSubmit) onClose?.();
  };

  const title = modalTitle ?? (record ? 'Edit Carrier' : 'Add New Carrier');

  return (
    <UseModal
      title={title}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      size="xl"
      footer={[
        <IconButton key="close" variant="falcon-default" size="sm" onClick={onClose}>
          Close
        </IconButton>,
        <IconButton key="submit" variant="primary" size="sm" type="submit" form="provider-form">
          {record ? 'Update' : 'Add'}
        </IconButton>
      ]}
    >
      <Forms id="provider-form" onFinish={handleProviderSubmit}>
        <h6 className="text-900 mb-2">Carrier details</h6>
        {showConnectorField && (
          <Row>
            <Col md={6}>
              <UseInput
                name="connectorId"
                label="MT connector id"
                value={values.connectorId}
                onChange={handleOnChange}
                placeholder="smppc id on Jasmin (e.g. mahdi)"
              />
              <div className="text-700 fs--2 mb-2">
                Must match the Jasmin smppc connector that receives MT for this link. Optional on create — a unique id
                is generated if empty.
              </div>
            </Col>
          </Row>
        )}
        <Row>
          <Col md={6}>
            <UseInput
              name="providerName"
              label="Carrier Name"
              value={values.providerName}
              onChange={handleOnChange}
              placeholder="Name"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="email"
              label="Email Address"
              type="email"
              value={values.email}
              onChange={handleOnChange}
              placeholder="abc@xyz.com"
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseInput
              name="username"
              label="Username"
              value={values.username}
              onChange={handleOnChange}
              placeholder="carrier_user"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={handleOnChange}
              placeholder="password"
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseInput
              name="throughput"
              label="Throughput"
              type="number"
              value={values.throughput}
              onChange={handleOnChange}
              placeholder="tps"
            />
          </Col>
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>IP Addresses</Form.Label>
              <div
                className="d-flex flex-wrap align-items-center gap-2 p-2 border rounded"
                style={{
                  backgroundColor: 'var(--bs-input-bg, var(--bs-body-bg))',
                  color: 'var(--bs-input-color, var(--bs-body-color))',
                  borderColor: 'var(--bs-border-color)'
                }}
              >
                {providerIpList.map((ip) => (
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
                      onClick={() => removeProviderIp(ip)}
                      aria-label={`Remove ${ip}`}
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  </span>
                ))}
                <Form.Control
                  size="sm"
                  value={providerIpInput}
                  onChange={(e) => {
                    setProviderIpInput(e.target.value);
                    setProviderIpError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && addProviderIp(e)}
                  placeholder="Add IP"
                  className="border-0 shadow-none flex-grow-1 rounded-0 p-0 bg-transparent"
                  style={{
                    minWidth: '100px',
                    color: 'inherit',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
              {providerIpError && <Form.Text className="text-danger">{providerIpError}</Form.Text>}
            </Form.Group>
          </Col>
        </Row>
        <h6 className="text-900 mb-2 mt-2">HTTP Bind</h6>
        <Row>
          <Col md={6}>
            <UseInput
              name="httpNumberField"
              label="Number/Destination Field"
              value={values.httpNumberField}
              onChange={handleOnChange}
              placeholder="number"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="httpCliField"
              label="CLI/From Field"
              value={values.httpCliField}
              onChange={handleOnChange}
              placeholder="cli"
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseInput
              name="apiUrl"
              label="API URL"
              value={values.apiUrl}
              onChange={handleOnChange}
              placeholder="https://api.provider.com/sms"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="messageField"
              label="Message Field"
              value={values.messageField}
              onChange={handleOnChange}
              placeholder="message"
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseInput
              name="uniqueIdField"
              label="Unique ID Field"
              value={values.uniqueIdField}
              onChange={handleOnChange}
              placeholder="unique"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="uniqueIdValue"
              label="Unique ID"
              value={values.uniqueIdValue}
              onChange={handleOnChange}
              placeholder="Unique"
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseInput
              name="returnValue"
              label="Return Value"
              value={values.returnValue}
              onChange={handleOnChange}
              placeholder="#true"
            />
            <Form.Text className="text-700">
              Dynamic values: #uuid (Return UUID), #true (Return True), #dt (Return Timestamp)
            </Form.Text>
          </Col>
          <Col md={6}>
            <UseInput
              name="uuidValue"
              label="UUID"
              value={values.uuidValue}
              onChange={handleOnChange}
              placeholder="#uuid"
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <UseInput
              name="messageValue"
              label="Message"
              as="textarea"
              rows={3}
              value={values.messageValue}
              onChange={handleOnChange}
              placeholder="Type default message or template"
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <UseInput
              name="ussdIpAddresses"
              label="USSD IP Addresses"
              as="textarea"
              rows={3}
              value={values.ussdIpAddresses}
              onChange={handleOnChange}
              placeholder="Enter IPs, one per line"
            />
          </Col>
        </Row>
        <h6 className="text-900 mb-2 mt-2">SMPP Bind</h6>
        <Row>
          <Col md={6}>
            <UseInput
              name="smppHost"
              label="SMPP Host"
              value={values.smppHost}
              onChange={handleOnChange}
              placeholder="gateway1.smpp.com"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="smppPort"
              label="SMPP Port"
              value={values.smppPort}
              onChange={handleOnChange}
              placeholder=""
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseInput
              name="smppSystemId"
              label="System ID/Username"
              value={values.smppSystemId}
              onChange={handleOnChange}
              placeholder="username"
            />
          </Col>
          <Col md={6}>
            <UseInput
              name="smppPassword"
              label="SMSC Password"
              type="password"
              value={values.smppPassword}
              onChange={handleOnChange}
              placeholder="password"
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <UseSelect
              name="smppBindMode"
              label="Bind Mode"
              value={values.smppBindMode}
              options={SMPP_BIND_MODE_OPTIONS}
              onChange={(v) => setValues((prev) => ({ ...prev, smppBindMode: v }))}
              placeholder="Please Select"
            />
          </Col>
        </Row>
      </Forms>
    </UseModal>
  );
};

export default ProviderFormModal;
