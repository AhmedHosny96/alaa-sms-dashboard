import React, { useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const BulkAllocationFormModal = ({
  show,
  onClose,
  onSubmit,
  providerOptions: externalProviderOptions = [],
  rangeOptions: externalRangeOptions = [],
  clientOptions: externalClientOptions = []
}) => {
  const providerOptions =
    Array.isArray(externalProviderOptions) && externalProviderOptions.length
      ? externalProviderOptions
      : [{ id: 'bulktele', name: 'BulkTele' }];
  const rangeOptions =
    Array.isArray(externalRangeOptions) && externalRangeOptions.length
      ? externalRangeOptions
      : [{ id: 'UKBK', name: 'UKBK' }, { id: 'UKBX', name: 'UKBX' }];
  const agentOptions =
    Array.isArray(externalClientOptions) && externalClientOptions.length
      ? externalClientOptions
      : [{ id: '887410', name: '887410' }, { id: '4410144101', name: '4410144101' }];
  const paytermOptions = [
    { id: '1/1', name: '1/1' },
    { id: '7/1', name: '7/1' },
    { id: '7/7', name: '7/7' },
    { id: '15/15', name: '15/15' },
    { id: '15/30', name: '15/30' },
    { id: '30/15', name: '30/15' },
    { id: '30/30', name: '30/30' },
    { id: '30/45', name: '30/45' },
    { id: '30/60', name: '30/60' }
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
