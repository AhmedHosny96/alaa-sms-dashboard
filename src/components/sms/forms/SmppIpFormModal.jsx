import React, { useEffect, useMemo } from 'react';
import { UseModal, useForm, Forms, UseInput } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';

const SmppIpFormModal = ({ show, onClose, onSubmit, record, submitting = false }) => {
  const initialValues = useMemo(
    () => ({
      ipAddress: record?.ipAddress ?? '',
      port: record?.port ?? '',
      notes: record?.notes ?? ''
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const handleSubmit = () => {
    const payload = {
      ipAddress: values.ipAddress?.trim(),
      port: values.port === '' || values.port == null ? null : Number(values.port),
      notes: values.notes?.trim() || null
    };
    onSubmit?.(payload);
  };

  const isEdit = !!record?.id;

  return (
    <UseModal
      title={isEdit ? 'Edit SMPP IP' : 'Add SMPP IP'}
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
          form="smpp-ip-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </IconButton>
      ]}
    >
      <Forms id="smpp-ip-form" onFinish={handleSubmit}>
        <UseInput
          name="ipAddress"
          label="IP Address"
          value={values.ipAddress}
          onChange={handleOnChange}
          placeholder="e.g. 192.168.1.1"
          readOnly={isEdit}
        />
        <UseInput
          name="port"
          label="Port (optional)"
          type="number"
          value={values.port}
          onChange={handleOnChange}
          placeholder="2775"
        />
        <UseInput
          name="notes"
          label="Notes"
          value={values.notes}
          onChange={handleOnChange}
          placeholder="Optional notes"
        />
      </Forms>
    </UseModal>
  );
};

export default SmppIpFormModal;
