import React, { useEffect, useMemo } from 'react';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';

const statusOptions = [
  { id: 'PENDING_DNS', name: 'Pending DNS' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'DISABLED', name: 'Disabled' }
];

const DomainFormModal = ({ show, onClose, onSubmit, record, submitting = false, companyId, companyName, companies = [] }) => {
  const initialValues = useMemo(
    () => ({
      domain: record?.domain ?? '',
      status: record?.status ?? 'PENDING_DNS',
      companyId: companyId || ''
    }),
    [record, companyId]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const handleSubmit = () => {
    onSubmit?.(values);
  };

  const isEdit = !!record?.id;

  return (
    <UseModal
      title={isEdit ? 'Edit Domain' : 'Add Domain'}
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
          title={isEdit ? 'Update' : 'Add'}
          type="submit"
          form="domain-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </IconButton>
      ]}
    >
      <Forms id="domain-form" onFinish={handleSubmit}>
        {!isEdit && (
          <UseSelect
            name="companyId"
            label="Company"
            value={values.companyId}
            options={companies.map((c) => ({ id: c.id, name: c.name }))}
            onChange={(value) => setValues((prev) => ({ ...prev, companyId: value }))}
            placeholder="Select company"
            className="table-select-filter"
          />
        )}
        <UseInput
          name="domain"
          label="Domain Name"
          value={values.domain}
          onChange={handleOnChange}
          placeholder="example.com"
          size="small"
          className="shadow-none border-300"
          readOnly={isEdit}
        />
        {isEdit && (
          <UseSelect
            name="status"
            label="Status"
            value={values.status}
            options={statusOptions}
            onChange={(value) => setValues((prev) => ({ ...prev, status: value }))}
            placeholder="Select status"
            className="table-select-filter"
          />
        )}
      </Forms>
    </UseModal>
  );
};

export default DomainFormModal;
