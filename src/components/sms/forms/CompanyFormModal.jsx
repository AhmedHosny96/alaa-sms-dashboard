import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import { isValidIPv4ClassABC } from 'helpers/utils';

const CompanyFormModal = ({ show, onClose, onSubmit, record }) => {
  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Suspended', name: 'Suspended' }
  ];

  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' },
    { id: 'GBP', name: 'GBP' }
  ];

  const planOptions = [
    { id: 'Starter', name: 'Starter', tps: 20 },
    { id: 'Growth', name: 'Growth', tps: 30 },
    { id: 'Enterprise', name: 'Enterprise', tps: 100 }
  ];

  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      domain: record?.domain ?? '',
      contactEmail: record?.contactEmail ?? '',
      currency: record?.currency ?? 'USD',
      subscriptionPlan: record?.subscriptionPlan ?? 'Starter',
      tpsLimit: record?.tpsLimit ?? '',
      ipWhitelist: record?.ipWhitelist ?? '',
      status: record?.status ?? 'Active'
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);
  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.id === values.subscriptionPlan) ?? planOptions[0],
    [planOptions, values.subscriptionPlan]
  );
  const [companyIpList, setCompanyIpList] = useState([]);
  const [companyIpInput, setCompanyIpInput] = useState('');
  const [companyIpError, setCompanyIpError] = useState('');

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  useEffect(() => {
    if (!show) return;
    const raw = record?.ipWhitelist ?? '';
    const list = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setCompanyIpList(list);
    setCompanyIpInput('');
    setCompanyIpError('');
  }, [show, record]);

  const addCompanyIp = (e) => {
    e?.preventDefault?.();
    const trimmed = companyIpInput.trim();
    setCompanyIpError('');
    if (!trimmed) return;
    if (!isValidIPv4ClassABC(trimmed)) {
      setCompanyIpError('Enter a valid IPv4 address (Class A, B, or C), e.g. 192.168.1.1');
      return;
    }
    if (companyIpList.includes(trimmed)) return;
    setCompanyIpList((prev) => [...prev, trimmed]);
    setCompanyIpInput('');
  };

  const removeCompanyIp = (ip) => {
    setCompanyIpList((prev) => prev.filter((x) => x !== ip));
  };

  const handleSubmit = () => {
    const payload = { ...values, ipWhitelist: companyIpList.join('\n') };
    onSubmit?.(payload);
    onClose?.();
  };

  return (
    <UseModal
      title={record ? 'Edit Company' : 'Create Company'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      size="lg"
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="company-form">
          {record ? 'Update' : 'Create'}
        </Button>
      ]}
    >
      <Forms id="company-form" onFinish={handleSubmit}>
        <UseInput
          name="name"
          label="Company Name"
          value={values.name}
          onChange={handleOnChange}
          placeholder="Acme Telecom"
        />
        <UseInput
          name="domain"
          label="Domain / Subdomain"
          value={values.domain}
          onChange={handleOnChange}
          placeholder="sms.acme.com"
        />
        <UseInput
          name="contactEmail"
          label="Contact Email"
          type="email"
          value={values.contactEmail}
          onChange={handleOnChange}
          placeholder="admin@acme.com"
        />
        <UseSelect
          name="currency"
          label="Billing Currency"
          value={values.currency}
          options={currencyOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, currency: value }))}
          placeholder="Select currency"
        />
        <UseSelect
          name="subscriptionPlan"
          label="Subscription Plan"
          value={values.subscriptionPlan}
          options={planOptions.map((plan) => ({ id: plan.id, name: `${plan.name} (${plan.tps} TPS)` }))}
          onChange={(value) =>
            setValues((prev) => ({
              ...prev,
              subscriptionPlan: value,
              tpsLimit: planOptions.find((plan) => plan.id === value)?.tps ?? prev.tpsLimit
            }))
          }
          placeholder="Select plan"
        />
        <UseInput
          name="tpsLimit"
          label="TPS Limit"
          type="number"
          value={selectedPlan?.tps ?? values.tpsLimit}
          onChange={handleOnChange}
          placeholder="50"
          readOnly
        />
        <Form.Group className="mb-2">
          <Form.Label>Dedicated IPs</Form.Label>
          <div
            className="d-flex flex-wrap align-items-center gap-2 p-2 border rounded"
            style={{
              backgroundColor: 'var(--bs-input-bg, var(--bs-body-bg))',
              color: 'var(--bs-input-color, var(--bs-body-color))',
              borderColor: 'var(--bs-border-color)'
            }}
          >
            {companyIpList.map((ip) => (
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
                  onClick={() => removeCompanyIp(ip)}
                  aria-label={`Remove ${ip}`}
                >
                  <FontAwesomeIcon icon="times" />
                </button>
              </span>
            ))}
            <Form.Control
              size="sm"
              value={companyIpInput}
              onChange={(e) => {
                setCompanyIpInput(e.target.value);
                setCompanyIpError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && addCompanyIp(e)}
              placeholder="Add IP"
              className="border-0 shadow-none flex-grow-1 rounded-0 p-0 bg-transparent"
              style={{
                minWidth: '100px',
                color: 'inherit',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          {companyIpError && <Form.Text className="text-danger">{companyIpError}</Form.Text>}
        </Form.Group>
        {record && (
          <UseSelect
            name="status"
            label="Status"
            value={values.status}
            options={statusOptions}
            onChange={(value) => setValues((prev) => ({ ...prev, status: value }))}
            placeholder="Select status"
          />
        )}
      </Forms>
    </UseModal>
  );
};

export default CompanyFormModal;
