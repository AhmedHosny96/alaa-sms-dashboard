import React, { useEffect, useMemo } from 'react';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';

const normalizeStatus = (status) => {
  const raw = String(status || '').trim().toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'inactive') return 'Inactive';
  return 'Active';
};

const SubscriptionFormModal = ({ show, onClose, onSubmit, record, submitting = false }) => {
  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const billingCycleOptions = [
    { id: 'MONTHLY', name: 'Monthly' },
    { id: 'YEARLY', name: 'Yearly' }
  ];

  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' },
    { id: 'GBP', name: 'GBP' }
  ];

  const initialValues = useMemo(
    () => ({
      code: record?.code ?? '',
      name: record?.name ?? '',
      description: record?.description ?? '',
      priceMonthly: record?.priceMonthly ?? '',
      tpsLimit: record?.tpsLimit ?? '',
      currency: record?.currency ?? 'USD',
      billingCycle: record?.billingCycle ?? 'MONTHLY',
      status: normalizeStatus(record?.status)
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const handleSubmit = () => {
    onSubmit?.(values);
  };

  return (
    <UseModal
      title={record ? 'Edit Subscription' : 'Create Subscription'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <IconButton key="cancel" variant="falcon-default" size="sm" onClick={onClose}>
          Cancel
        </IconButton>,
        <IconButton
          key="submit"
          variant="primary"
          size="sm"
          type="submit"
          form="subscription-form"
          disabled={submitting}
        >
          {record ? 'Update' : 'Create'}
        </IconButton>
      ]}
    >
      <Forms id="subscription-form" onFinish={handleSubmit}>
        <UseInput
          name="code"
          label="Code"
          value={values.code}
          onChange={handleOnChange}
          placeholder="STARTER"
          disabled={!!record?.id}
        />
        <UseInput
          name="name"
          label="Plan Name"
          value={values.name}
          onChange={handleOnChange}
          placeholder="Starter"
        />
        <UseInput
          name="description"
          label="Description"
          value={values.description}
          onChange={handleOnChange}
          placeholder="Entry tier"
        />
        <UseInput
          name="priceMonthly"
          label="Monthly Price"
          type="number"
          step="0.01"
          value={values.priceMonthly}
          onChange={handleOnChange}
          placeholder="200"
        />
        <UseInput
          name="tpsLimit"
          label="TPS Limit"
          type="number"
          value={values.tpsLimit}
          onChange={handleOnChange}
          placeholder="20"
        />
        <UseSelect
          name="currency"
          label="Currency"
          value={values.currency}
          options={currencyOptions}
          onChange={(v) => setValues((prev) => ({ ...prev, currency: v }))}
          placeholder="Select currency"
        />
        <UseSelect
          name="billingCycle"
          label="Billing Cycle"
          value={values.billingCycle}
          options={billingCycleOptions}
          onChange={(v) => setValues((prev) => ({ ...prev, billingCycle: v }))}
          placeholder="Select cycle"
        />
        {record && (
          <UseSelect
            name="status"
            label="Status"
            value={values.status}
            options={statusOptions}
            onChange={(v) => setValues((prev) => ({ ...prev, status: v }))}
            placeholder="Select status"
          />
        )}
      </Forms>
    </UseModal>
  );
};

export default SubscriptionFormModal;
