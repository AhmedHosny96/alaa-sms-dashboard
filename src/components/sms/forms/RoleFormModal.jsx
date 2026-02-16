import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const RoleFormModal = ({ show, onClose, onSubmit, record }) => {
  const scopeOptions = [
    { id: 'Platform Owner', name: 'Platform Owner' },
    { id: 'Company', name: 'Company' },
    { id: 'Client', name: 'Client' }
  ];

  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      description: record?.description ?? '',
      scope: record?.scope ?? 'Company',
      permissions: record?.permissions ?? '',
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
      title={record ? 'Edit Role' : 'Add Role'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="role-form">
          {record ? 'Update' : 'Save'}
        </Button>
      ]}
    >
      <Forms id="role-form" onFinish={handleSubmit}>
        <UseInput
          name="name"
          label="Role Name"
          value={values.name}
          onChange={handleOnChange}
          placeholder="Company Admin"
        />
        <UseInput
          name="description"
          label="Description"
          value={values.description}
          onChange={handleOnChange}
          placeholder="Full access to company resources"
          as="textarea"
          rows={3}
        />
        <UseSelect
          name="scope"
          label="Scope"
          value={values.scope}
          options={scopeOptions}
          onChange={(value) => setValues((prev) => ({ ...prev, scope: value }))}
          placeholder="Select scope"
        />
        <UseInput
          name="permissions"
          label="Permissions"
          value={values.permissions}
          onChange={handleOnChange}
          placeholder="users.read, users.write, billing.read"
          as="textarea"
          rows={3}
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

export default RoleFormModal;
