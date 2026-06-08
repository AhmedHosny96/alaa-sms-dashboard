import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Form } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import { isValidIPv4ClassABC } from 'helpers/utils';
import IconButton from 'components/common/IconButton';
import countries from 'data/countries';
import subscriptionService from 'services/subscriptionService';
import ipService from 'services/ipService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

const CompanyFormModal = ({ show, onClose, onSubmit, record, submitting = false }) => {
  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Suspended', name: 'Suspended' }
  ];

  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' },
    { id: 'GBP', name: 'GBP' }
  ];

  const countryOptions = countries.map((name) => ({ id: name, name }));

  const [planOptions, setPlanOptions] = useState([]);
  const [ipOptions, setIpOptions] = useState([]);
  const fetchPlans = useCallback(async () => {
    try {
      const result = await subscriptionService.listActive();
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setPlanOptions(list);
    } catch {
      setPlanOptions([]);
    }
  }, []);
  const fetchAvailableIps = useCallback(async () => {
    try {
      const result = await ipService.listAvailable();
      const list = Array.isArray(result) ? result : [];
      if (record?.smppIp && !list.some((ip) => ip.id === record.smppIp.id)) {
        list.unshift(record.smppIp);
      }
      setIpOptions(list);
    } catch {
      setIpOptions([]);
    }
  }, [record]);
  useEffect(() => {
    if (show) {
      fetchPlans();
      fetchAvailableIps();
    }
  }, [show, fetchPlans, fetchAvailableIps]);

  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      domain: record?.domain ?? '',
      contactEmail: record?.contactEmail ?? '',
      phoneNumber: record?.phoneNumber ?? '',
      country: record?.country ?? '',
      username: record?.username ?? '',
      password: record?.password ?? '',
      apiKey: record?.apiKey ?? '',
      logoUrl: record?.logoUrl ?? '',
      loginBackgroundUrl: record?.loginBackgroundUrl ?? '',
      loginFooter: record?.loginFooter ?? '',
      currency: record?.currency ?? 'USD',
      subscriptionPlanId: record?.subscriptionPlanId ?? null,
      subscriptionPlan: record?.subscriptionPlan ?? '',
      tpsLimit: record?.tpsLimit ?? '',
      ipWhitelist: record?.ipWhitelist ?? '',
      status: record?.status ?? 'Active',
      smppIpAddressId: record?.smppIp?.id ?? null
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);
  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.id === values.subscriptionPlanId) ?? null,
    [planOptions, values.subscriptionPlanId]
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

  const generateApiKey = () =>
    `api_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

  useEffect(() => {
    if (!show) return;
    if (!values.apiKey) {
      setValues((prev) => ({ ...prev, apiKey: generateApiKey() }));
    }
  }, [show, values.apiKey, setValues]);


  const handleSubmit = () => {
    const trimmed = {
      ...values,
      username: values.username?.slice(0, 16) ?? '',
      password: values.password?.slice(0, 8) ?? '',
      ipWhitelist: companyIpList.join('\n'),
      smppIpAddressId: values.smppIpAddressId || null
    };
    onSubmit?.(trimmed);
  };

  return (
    <UseModal
      title={record ? 'Edit Company' : 'Create Company'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={submitting ? undefined : onClose}
      size="lg"
      footer={[
        <IconButton key="cancel" variant="falcon-default" size="sm" onClick={onClose} disabled={submitting}>
          Cancel
        </IconButton>,
        <IconButton key="submit" variant="primary" size="sm" type="submit" form="company-form" disabled={submitting}>
          {submitting ? (
            <>
              <span className="me-2">Saving...</span>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </>
          ) : record ? 'Update' : 'Create'}
        </IconButton>
      ]}
    >
      {submitting && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.6)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="spinner-border text-primary" style={{ width: 48, height: 48 }} role="status" aria-hidden="true"></span>
        </div>
      )}
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
        <UseInput
          name="phoneNumber"
          label="Contact Phone"
          value={values.phoneNumber}
          onChange={handleOnChange}
          placeholder="+1 555 000 0000"
        />
        <UseSelect
          name="country"
          label="Country"
          value={values.country}
          options={countryOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, country: value }))}
          placeholder="Select country"
          showSearch={true}
        />
        <UseInput
          name="username"
          label="Username"
          value={values.username}
          onChange={handleOnChange}
          placeholder="Username"
          maxLength={16}
        />
        <UseInput
          name="password"
          label={record ? 'Password (leave blank to keep current)' : 'Password'}
          type="password"
          value={values.password}
          onChange={handleOnChange}
          placeholder="Password"
          maxLength={255}
          required={!record}
        />
        <UseInput
          name="apiKey"
          label="API Key"
          value={values.apiKey}
          onChange={handleOnChange}
          placeholder="API Key"
          readOnly
        />
        <Button
          variant="outline-primary"
          size="sm"
          className="mt-2"
          onClick={() => setValues((prev) => ({ ...prev, apiKey: generateApiKey() }))}
        >
          Generate API Key
        </Button>
        <UseInput
          name="logoUrl"
          label="Company Logo URL"
          value={values.logoUrl}
          onChange={handleOnChange}
          placeholder="https://company.com/logo.png"
        />
        <UseInput
          name="loginBackgroundUrl"
          label="Login Background Image URL"
          value={values.loginBackgroundUrl}
          onChange={handleOnChange}
          placeholder="https://company.com/login-bg.jpg"
        />
        {/* <UseInput
          name="loginFooter"
          label="Login Footer Text"
          value={values.loginFooter}
          onChange={handleOnChange}
          placeholder="Company © 2026. All rights reserved."
        /> */}
        <UseSelect
          name="currency"
          label="Billing Currency"
          value={values.currency}
          options={currencyOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, currency: value }))}
          placeholder="Select currency"
        />
        <UseSelect
          name="subscriptionPlanId"
          label="Subscription Plan"
          value={values.subscriptionPlanId}
          options={planOptions.map((plan) => ({
            id: plan.id,
            name: `${plan.name}${plan.tpsLimit != null ? ` (${plan.tpsLimit} TPS)` : ''}`
          }))}
          onChange={(value) =>
            setValues((prev) => ({
              ...prev,
              subscriptionPlanId: value || null,
              tpsLimit: planOptions.find((plan) => plan.id === value)?.tpsLimit ?? prev.tpsLimit
            }))
          }
          placeholder="Select plan"
        />
        <UseSelect
          name="smppIpAddressId"
          label="SMPP IP (optional)"
          value={values.smppIpAddressId}
          options={ipOptions.map((ip) => ({
            id: ip.id,
            name: ip.port != null ? `${ip.ipAddress}:${ip.port}` : ip.ipAddress
          }))}
          onChange={(value) => setValues((prev) => ({ ...prev, smppIpAddressId: value || null }))}
          placeholder="Select available IP"
          showSearch={true}
        />
        {/* <UseInput
          name="tpsLimit"
          label="TPS Limit"
          type="number"
          value={selectedPlan?.tpsLimit ?? values.tpsLimit}
          onChange={handleOnChange}
          placeholder="50"
          readOnly
        /> */}
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
