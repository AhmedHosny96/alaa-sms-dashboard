import React, { useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const BulkAllocationFormModal = ({ show, onClose, onSubmit }) => {
  const providerOptions = [{ id: 'bulktele', name: 'BulkTele' }];
  const rangeOptions = [
    { id: 'UKBK', name: 'UKBK' },
    { id: 'UKBX', name: 'UKBX' }
  ];
  const agentOptions = [
    { id: '887410', name: '887410' },
    { id: '4410144101', name: '4410144101' }
  ];
  const paytermOptions = [
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' }
  ];

  const initialValues = useMemo(
    () => ({
      providerId: '',
      rangeId: '',
      agentId: '',
      paymentTerm: '',
      qtyEachRange: 3
    }),
    []
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const handleSelectChange = (name) => (value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit?.(values);
    onClose?.();
  };

  return (
    <UseModal
      title="Allocate Numbers"
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      size="lg"
      footer={[
        <Button key="close" variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="bulk-allocation-form">
          Allocate Numbers
        </Button>
      ]}
    >
      <Forms id="bulk-allocation-form" onFinish={handleSubmit}>
        <div className="mb-2">
          <UseSelect
            name="providerId"
            label="Choose Provider"
            options={providerOptions}
            value={values.providerId}
            onChange={handleSelectChange('providerId')}
            placeholder="Please Select Provider"
          />
        </div>
        <div className="mb-2">
          <UseSelect
            name="agentId"
            label="Choose Agent"
            options={agentOptions}
            value={values.agentId}
            onChange={handleSelectChange('agentId')}
            placeholder="Please Select"
          />
        </div>
        <div className="mb-2">
          <UseSelect
            name="rangeId"
            label="Choose Range"
            options={rangeOptions}
            value={values.rangeId}
            onChange={handleSelectChange('rangeId')}
            placeholder="Select Range"
          />
        </div>
        <div className="mb-2">
          <Form.Label className="fw-semibold">Choose Payterm</Form.Label>
          <Form.Text className="text-700 d-block">
            Please ensure your ranges have payouts in selected payterm
          </Form.Text>
          <UseSelect
            name="paymentTerm"
            options={paytermOptions}
            value={values.paymentTerm}
            onChange={handleSelectChange('paymentTerm')}
            placeholder="Please Select"
          />
        </div>
        <UseInput
          name="qtyEachRange"
          label="Qty each Range to Allocate"
          type="number"
          value={values.qtyEachRange}
          onChange={handleOnChange}
          placeholder="0"
        />
      </Forms>
    </UseModal>
  );
};

export default BulkAllocationFormModal;
