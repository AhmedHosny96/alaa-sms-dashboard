import React, { useEffect, useMemo } from 'react';
import { UseModal, useForm, Forms, UseInput } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';

const IpFormModal = ({ show, onClose, onSubmit, record, submitting = false }) => {
  const initialValues = useMemo(
    () => ({
      address: record?.address ?? '',
      description: record?.description ?? ''
    }),
    [record]
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
      title={isEdit ? 'Edit IP' : 'Add IP'}
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
          form="ip-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </IconButton>
      ]}
    >
      <Forms id="ip-form" onFinish={handleSubmit}>
        <UseInput
          name="address"
          label="IP Address"
          value={values.address}
          onChange={handleOnChange}
          placeholder="e.g. 192.168.1.1"
          size="small"
          className="shadow-none border-300"
        />
        <UseInput
          name="description"
          label="Description"
          value={values.description}
          onChange={handleOnChange}
          placeholder="Optional description"
          size="small"
          className="shadow-none border-300"
        />
      </Forms>
    </UseModal>
  );
};

export default IpFormModal;
