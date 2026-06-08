import React, { useMemo, useEffect, useState } from 'react';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';
import countries from 'data/countries';
import paymentMethodService from 'services/paymentMethodService';
import { toast } from 'react-toastify';

const statusOptions = [
  { id: 'Active', name: 'Active' },
  { id: 'Suspended', name: 'Suspended' }
];

const ClientFormModal = ({
  show,
  onClose,
  onSubmit,
  record,
  companyId: _companyId,
  submitting = false
}) => {
  const countryOptions = countries.map((name) => ({ id: name, name }));
  const [paymentMethods, setPaymentMethods] = useState([]);

  const initialValues = useMemo(
    () => ({
      clientName: record?.clientName ?? record?.name ?? '',
      manager: record?.manager ?? '',
      username: record?.username ?? '',
      email: record?.email ?? '',
      country: record?.country ?? '',
      contactNo: record?.contactNo ?? record?.phone ?? '',
      deliveryUrl: record?.deliveryUrl ?? '',
      address: record?.address ?? '',
      status: record?.status ?? 'Active',
      // Password is not returned by the backend (hash only), so on edit we show a masked placeholder.
      password: record?.id ? '********' : '',
      paymentMethodId: record?.paymentMethodId ?? '',
      paymentAccount: record?.paymentAccount ?? ''
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    paymentMethodService
      .listOptions()
      .then((res) => {
        const methods = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
        if (!cancelled) setPaymentMethods(methods);
      })
      .catch(() => {
        if (!cancelled) setPaymentMethods([]);
      });

    return () => {
      cancelled = true;
    };
  }, [show]);

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((m) => String(m.id) === String(values.paymentMethodId)) || null,
    [paymentMethods, values.paymentMethodId]
  );

  const normalizeMethodType = (m) => {
    if (!m) return null;
    if (m.methodType) {
      const mt = String(m.methodType).toUpperCase();
      // Treat any legacy CARD rows still in the DB as CASH on the client side.
      return mt === 'CARD' ? 'CASH' : mt;
    }
    // Back-compat for older backend responses that returned only `label` (account labels).
    const lbl = String(m.label || '').trim().toLowerCase();
    if (lbl === 'usdt address' || lbl === 'usdt') return 'USDT';
    if (lbl === 'cash' || lbl === 'card number' || lbl === 'card') return 'CASH';
    if (lbl === 'account number' || lbl === 'bank') return 'BANK';
    if (lbl === 'email' || lbl === 'paypal email' || lbl === 'paypal') return 'PAYPAL';
    return null;
  };

  const selectedMethodType = useMemo(
    () => normalizeMethodType(selectedPaymentMethod),
    [selectedPaymentMethod]
  );

  // CASH has no associated account number/address, so the input is hidden.
  const requiresAccountField = selectedMethodType && selectedMethodType !== 'CASH';

  const accountLabel = useMemo(() => {
    const type = selectedMethodType;
    if (!type) return selectedPaymentMethod?.accountLabel ?? 'Account Number';
    if (type === 'USDT') return 'USDT Address';
    if (type === 'CASH') return '';
    if (type === 'BANK') return 'Account Number';
    if (type === 'PAYPAL') return 'Email';
    return selectedPaymentMethod?.accountLabel ?? 'Account Number';
  }, [selectedPaymentMethod, selectedMethodType]);

  const handleSubmit = () => {
    const rawPassword = values.password;
    const password =
      rawPassword && rawPassword !== '********' && rawPassword.trim() !== '' ? rawPassword : null;
    const email = values.email?.trim() || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isEdit && !emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password && !emailRegex.test(email)) {
      toast.error('Valid email is required when password is provided');
      return;
    }

    onSubmit?.({
      ...values,
      name: values.clientName || values.manager,
      clientName: values.clientName,
      manager: values.manager,
      phone: values.contactNo,
      email: email || null,
      paymentMethodId: values.paymentMethodId || null,
      paymentAccount: values.paymentAccount || null,
      username: values.username || null,
      password
    });
  };

  const isEdit = !!record?.id;

  return (
    <UseModal
      title={isEdit ? 'Edit Client' : 'Create Client'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      footer={[
        <IconButton key="cancel" variant="falcon-default" size="sm" onClick={onClose} disabled={submitting}>
          Cancel
        </IconButton>,
        <IconButton
          key="submit"
          variant="primary"
          size="sm"
          title={isEdit ? 'Update' : 'Add'}
          type="submit"
          form="client-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </IconButton>
      ]}
    >
      <Forms id="client-form" onFinish={handleSubmit}>
        <UseInput
          name="clientName"
          label="Client Name"
          value={values.clientName}
          onChange={handleOnChange}
          placeholder="Client / business name"
        />
        <UseInput
          name="manager"
          label="Manager"
          value={values.manager}
          onChange={handleOnChange}
          placeholder="Manager name"
        />

        <UseInput
          name="username"
          label="Username"
          value={values.username}
          onChange={handleOnChange}
          placeholder="Client login identifier"
        />
        <UseInput
          name="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={handleOnChange}
          placeholder={isEdit ? 'Leave blank to keep current' : 'Set client password'}
        />

        <UseInput
          name="email"
          label="Email"
          type="email"
          required={!isEdit}
          value={values.email}
          onChange={handleOnChange}
          placeholder="client@email.com"
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
          name="contactNo"
          label="Contact No"
          value={values.contactNo}
          onChange={handleOnChange}
          placeholder="+1 555 000 0000"
        />

        <UseSelect
          name="paymentMethodId"
          label="Payment Method"
          value={values.paymentMethodId}
          options={paymentMethods.map((m) => {
            const type = normalizeMethodType(m);
            return { id: m.id, name: type || m.methodType || m.label };
          })}
          onChange={(value) => {
            // Clear payment account when CASH is selected (no account needed)
            // or when no method is selected at all.
            const picked = paymentMethods.find((m) => String(m.id) === String(value));
            const pickedType = normalizeMethodType(picked);
            const keepAccount = value && pickedType && pickedType !== 'CASH';
            setValues((prev) => ({
              ...prev,
              paymentMethodId: value,
              paymentAccount: keepAccount ? prev.paymentAccount : ''
            }));
          }}
          placeholder="Select payment method"
          showSearch={true}
        />

        {requiresAccountField && (
          <UseInput
            name="paymentAccount"
            label={accountLabel}
            value={values.paymentAccount}
            onChange={handleOnChange}
            placeholder={accountLabel}
          />
        )}
        <UseInput
          name="deliveryUrl"
          label="Delivery URL"
          value={values.deliveryUrl}
          onChange={handleOnChange}
          placeholder="https://example.com/delivery"
        />
        <UseInput
          name="address"
          label="Address"
          value={values.address}
          onChange={handleOnChange}
          placeholder="Address"
        />
        {isEdit && (
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

export default ClientFormModal;
