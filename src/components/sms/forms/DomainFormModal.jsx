import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const DomainFormModal = ({ show, onClose, onSubmit, record }) => {
  const companyOptions = [
    { id: 'Company A', name: 'Company A' },
    { id: 'Company B', name: 'Company B' }
  ];
  const typeOptions = [
    { id: 'Primary', name: 'Primary' },
    { id: 'Secondary', name: 'Secondary' }
  ];

  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const initialValues = useMemo(
    () => ({
      company: record?.company ?? '',
      domain: record?.domain ?? '',
      type: record?.type ?? 'Primary',
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
      title={record ? 'Edit Domain' : 'Add New Domain'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="domain-form">
          {record ? 'Update' : 'Add'}
        </Button>
      ]}
    >
      <Forms id="domain-form" onFinish={handleSubmit}>
        <UseSelect
          name="company"
          label="Company"
          value={values.company}
          options={companyOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, company: value }))}
          placeholder="Select company"
        />
        <UseInput
          name="domain"
          label="Domain Name"
          value={values.domain}
          onChange={handleOnChange}
          placeholder="example.com"
        />
        <UseSelect
          name="type"
          label="Domain Type"
          value={values.type}
          options={typeOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, type: value }))}
          placeholder="Select domain type"
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

export default DomainFormModal;
