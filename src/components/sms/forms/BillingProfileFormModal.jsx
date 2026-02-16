import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const BillingProfileFormModal = ({ show, onClose, onSubmit, record }) => {
  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' },
    { id: 'GBP', name: 'GBP' }
  ];

  const paymentOptions = [
    { id: 'Bank Transfer', name: 'Bank Transfer' },
    { id: 'Card', name: 'Card' },
    { id: 'Wallet', name: 'Wallet' }
  ];

  const initialValues = useMemo(
    () => ({
      billingName: record?.billingName ?? '',
      billingEmail: record?.billingEmail ?? '',
      billingAddress: record?.billingAddress ?? '',
      currency: record?.currency ?? 'USD',
      taxId: record?.taxId ?? '',
      paymentMethod: record?.paymentMethod ?? 'Bank Transfer'
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const handleSubmit = () => {
    onSubmit?.(values);
    onClose?.();
  };

  return (
    <UseModal
      title="Billing Profile"
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      size="lg"
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="billing-profile-form">
          Save
        </Button>
      ]}
    >
      <Forms id="billing-profile-form" onFinish={handleSubmit}>
        <UseInput
          name="billingName"
          label="Billing Name"
          value={values.billingName}
          onChange={handleOnChange}
          placeholder="Client Billing Name"
        />
        <UseInput
          name="billingEmail"
          label="Billing Email"
          type="email"
          value={values.billingEmail}
          onChange={handleOnChange}
          placeholder="billing@client.com"
        />
        <UseInput
          name="billingAddress"
          label="Billing Address"
          value={values.billingAddress}
          onChange={handleOnChange}
          placeholder="Street, City, Country"
        />
        <UseSelect
          name="currency"
          label="Billing Currency"
          value={values.currency}
          options={currencyOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, currency: value }))}
          placeholder="Select currency"
        />
        <UseInput
          name="taxId"
          label="Tax/VAT ID"
          value={values.taxId}
          onChange={handleOnChange}
          placeholder="VAT/TAX ID"
        />
        <UseSelect
          name="paymentMethod"
          label="Default Payment Method"
          value={values.paymentMethod}
          options={paymentOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, paymentMethod: value }))}
          placeholder="Select method"
        />
      </Forms>
    </UseModal>
  );
};

export default BillingProfileFormModal;
