import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const UserFormModal = ({ show, onClose, onSubmit, record, roleLabel, title }) => {
  const statusOptions = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      email: record?.email ?? '',
      phone: record?.phone ?? '',
      status: record?.status ?? 'Active',
      role: roleLabel ?? record?.role ?? ''
    }),
    [record, roleLabel]
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
      title={title || (record ? `Edit ${roleLabel}` : `Add ${roleLabel}`)}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <Button key="cancel" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="user-form">
          {record ? 'Update' : 'Save'}
        </Button>
      ]}
    >
      <Forms id="user-form" onFinish={handleSubmit}>
        <UseInput
          name="name"
          label="Full Name"
          value={values.name}
          onChange={handleOnChange}
          placeholder="John Doe"
        />
        <UseInput
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleOnChange}
          placeholder="user@example.com"
        />
        <UseInput
          name="phone"
          label="Phone"
          value={values.phone}
          onChange={handleOnChange}
          placeholder="+1 555 000 000"
        />
        <UseInput
          name="role"
          label="Role"
          value={values.role}
          onChange={handleOnChange}
          disabled
        />
        <UseSelect
          name="status"
          label="Status"
          value={values.status}
          options={statusOptions}
          onChange={(v) => setValues((prev) => ({ ...prev, status: v }))}
          placeholder="Select status"
        />
      </Forms>
    </UseModal>
  );
};

export default UserFormModal;
