import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const HttpConnectionFormModal = ({ show, onClose, onSubmit, record }) => {
  const authOptions = [
    { id: 'API Key', name: 'API Key' },
    { id: 'Bearer Token', name: 'Bearer Token' },
    { id: 'Basic Auth', name: 'Basic Auth' }
  ];

  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      endpoint: record?.endpoint ?? '',
      authType: record?.authType ?? 'API Key',
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
      title={record ? 'Edit HTTP Connection' : 'Add HTTP Connection'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="http-connection-form">
          {record ? 'Update' : 'Add'}
        </Button>
      ]}
    >
      <Forms id="http-connection-form" onFinish={handleSubmit}>
        <UseInput
          name="name"
          label="Connection Name"
          value={values.name}
          onChange={handleOnChange}
          placeholder="Connection name"
        />
        <UseInput
          name="endpoint"
          label="API Endpoint"
          type="url"
          value={values.endpoint}
          onChange={handleOnChange}
          placeholder="https://api.example.com"
        />
        <UseSelect
          name="authType"
          label="Authentication Type"
          value={values.authType}
          options={authOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, authType: value }))}
          placeholder="Select auth type"
        />
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

export default HttpConnectionFormModal;
