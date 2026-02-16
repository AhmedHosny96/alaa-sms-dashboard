import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const SubscriptionFormModal = ({ show, onClose, onSubmit, record }) => {
  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      price: record?.price ?? '',
      tps: record?.tps ?? '',
      status: record?.status ?? 'Active'
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
      title={record ? 'Edit Subscription' : 'Create Subscription'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="subscription-form">
          {record ? 'Update' : 'Create'}
        </Button>
      ]}
    >
      <Forms id="subscription-form" onFinish={handleSubmit}>
        <UseInput
          name="name"
          label="Plan Name"
          value={values.name}
          onChange={handleOnChange}
          placeholder="Starter"
        />
        <UseInput
          name="price"
          label="Monthly Price (USD)"
          type="number"
          value={values.price}
          onChange={handleOnChange}
          placeholder="200"
        />
        <UseInput
          name="tps"
          label="TPS Limit"
          type="number"
          value={values.tps}
          onChange={handleOnChange}
          placeholder="20"
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
