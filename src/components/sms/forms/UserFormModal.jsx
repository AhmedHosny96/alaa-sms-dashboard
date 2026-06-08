import React, { useEffect, useMemo } from 'react';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';

// PLATFORM_ADMIN is an internal role, not assignable from this form.
const roleOptions = [
  { id: 'Company Admin', name: 'Company Admin' },
  { id: 'Company Finance', name: 'Company Finance' },
  { id: 'Client User', name: 'Client User' },
  { id: 'Client Finance', name: 'Client Finance' }
];
const statusOptions = [
  { id: 'Active', name: 'Active' },
  { id: 'Inactive', name: 'Inactive' }
];

const UserFormModal = ({ show, onClose, onSubmit, record, roleLabel, title, companies = [], submitting = false }) => {
  const initialValues = useMemo(
    () => ({
      name: record?.name ?? '',
      email: record?.email ?? '',
      phone: record?.phone ?? '',
      password: '',
      status: record?.status ?? 'Active',
      role: record?.roles?.[0] ?? roleLabel ?? 'Company Admin',
      companyId: record?.companyId ?? ''
    }),
    [record, roleLabel]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const handleSubmit = () => {
    onSubmit?.({ ...values });
  };

  const isPlatform = values.role === 'PLATFORM_ADMIN';
  const isCreate = !record?.id;
  const companyOptions = useMemo(
    () => (companies || []).map((c) => ({ id: c.id, name: c.name })),
    [companies]
  );

  return (
    <UseModal
      title={title || (record ? `Edit ${roleLabel || 'User'}` : 'Add User')}
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
          title={record ? 'Update' : 'Save'}
          type="submit"
          form="user-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : record ? 'Update' : 'Save'}
        </IconButton>
      ]}
    >
      <Forms id="user-form" onFinish={handleSubmit}>
        {!isPlatform && (
          <UseSelect
            name="companyId"
            label="Company"
            value={values.companyId}
            options={companyOptions}
            onChange={(v) => setValues((prev) => ({ ...prev, companyId: v }))}
            placeholder="Select company"
          />
        )}
        {(!isPlatform || record) && (
          <UseInput
            name="name"
            label="Full Name"
            value={values.name}
            onChange={handleOnChange}
            placeholder="John Doe"
          />
        )}
        <UseInput
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleOnChange}
          placeholder="user@example.com"
        />
        {!isPlatform && (
          <UseInput
            name="phone"
            label="Phone"
            value={values.phone}
            onChange={handleOnChange}
            placeholder="+1 555 000 000"
          />
        )}
        {isCreate && (
          <UseInput
            name="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={handleOnChange}
            placeholder={isPlatform ? 'Required' : 'Optional'}
          />
        )}
        <UseSelect
          name="role"
          label="User Type"
          value={values.role}
          options={roleOptions}
          onChange={(v) => setValues((prev) => ({ ...prev, role: v }))}
          placeholder="Select user type"
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

export default UserFormModal;
