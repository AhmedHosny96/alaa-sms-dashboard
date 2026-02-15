import React, { useEffect, useMemo } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const payoutTiers = ['1/1', '7/1', '7/7', '15/15', '15/30', '30/15', '30/30', '30/45', '30/60'];

const EntityForm = ({ record, onSubmit, onCancel }) => {
  const providerOptions = [
    { id: '', name: 'Select Provider' },
    { id: 'provider-1', name: 'Provider 1' },
    { id: 'provider-2', name: 'Provider 2' }
  ];
  const paymentTermOptions = [
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
  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' }
  ];
  const cliListOptions = [{ id: 'none', name: 'None' }];

  const initialRangeValues = useMemo(
    () => ({
      providerId: record?.providerId ?? '',
      rangeName: record?.rangeName ?? '',
      rangePrefix: record?.rangePrefix ?? '',
      paymentTerm: record?.paymentTerm ?? '',
      currency: record?.currency ?? '',
      payout: record?.payout ?? '',
      maxSmsLimitDay: record?.maxSmsLimitDay ?? '',
      memoText: record?.memoText ?? '',
      cliLimitsList: record?.cliLimitsList ?? '',
      agentOverrides: record?.agentOverrides ?? true,
      applyAllType: 'flat',
      applyAllValue: ''
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialRangeValues);

  useEffect(() => {
    setValues(initialRangeValues);
  }, [initialRangeValues, setValues]);

  const handleSelectChange = (name) => (value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRange = () => {
    onSubmit?.(values);
  };

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="mb-0">{record ? 'Edit Range' : 'Add New Range'}</h6>
          <small className="text-700">Define provider, prefix, and pricing basics.</small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={onCancel}>
          Close
        </Button>
      </Card.Header>
      <Card.Body>
        <Forms id="entity-form" onFinish={handleSubmitRange}>
          <div className="range-form">
            <Row className="g-3">
              <Col lg={8}>
                <Card className="range-form-card">
                  <Card.Header className="range-form-card-header">
                    <div>
                      <h6 className="mb-0">Range Details</h6>
                      <small className="text-700">Define provider, prefix, and pricing basics.</small>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <UseSelect
                          name="providerId"
                          label="Select Provider"
                          options={providerOptions}
                          value={values.providerId}
                          onChange={handleSelectChange('providerId')}
                          allowClear={false}
                        />
                      </Col>
                      <Col md={6}>
                        <UseInput
                          name="rangeName"
                          label="Range Name"
                          value={values.rangeName}
                          onChange={handleOnChange}
                          placeholder="Dummy Name"
                        />
                      </Col>
                      <Col md={6}>
                        <UseInput
                          name="rangePrefix"
                          label="Range Prefix"
                          value={values.rangePrefix}
                          onChange={handleOnChange}
                          placeholder="93147"
                        />
                      </Col>
                      <Col md={6}>
                        <UseSelect
                          name="paymentTerm"
                          label="Payment Term"
                          options={paymentTermOptions}
                          value={values.paymentTerm}
                          onChange={handleSelectChange('paymentTerm')}
                          placeholder="Choose Term"
                        />
                      </Col>
                      <Col md={6}>
                        <UseSelect
                          name="currency"
                          label="Currency"
                          options={currencyOptions}
                          value={values.currency}
                          onChange={handleSelectChange('currency')}
                          placeholder="Choose Currency"
                        />
                      </Col>
                      <Col md={6}>
                        <UseInput
                          name="payout"
                          label="Base Payout"
                          type="number"
                          value={values.payout}
                          onChange={handleOnChange}
                          placeholder="0"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="range-form-card mt-3">
                  <Card.Header className="range-form-card-header">
                    <div>
                      <h6 className="mb-0">Limits & Notes</h6>
                      <small className="text-700">Set daily limits and CLI rules.</small>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Limits (set 0 for no limit)</Form.Label>
                        <UseInput
                          name="maxSmsLimitDay"
                          label="Max SMS Limit/Day"
                          type="number"
                          value={values.maxSmsLimitDay}
                          onChange={handleOnChange}
                          placeholder="0"
                        />
                      </Col>
                      <Col md={6}>
                        <UseSelect
                          name="cliLimitsList"
                          label="CLI Limits List"
                          options={cliListOptions}
                          value={values.cliLimitsList}
                          onChange={handleSelectChange('cliLimitsList')}
                          placeholder="None"
                        />
                      </Col>
                      <Col md={12}>
                        <UseInput
                          name="memoText"
                          label="Memo Text"
                          as="textarea"
                          rows={4}
                          value={values.memoText}
                          onChange={handleOnChange}
                          placeholder="No Payout for UK CLI"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="range-form-card range-form-sticky">
                  <Card.Header className="range-form-card-header">
                    <div>
                      <h6 className="mb-0">Payout Summary</h6>
                      <small className="text-700">Quick view of range settings.</small>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="range-summary">
                      <div>
                        <div className="text-700 fs--1">Provider</div>
                        <div className="fw-semibold">{values.providerId || '—'}</div>
                      </div>
                      <div>
                        <div className="text-700 fs--1">Currency</div>
                        <div className="fw-semibold">{values.currency || '—'}</div>
                      </div>
                      <div>
                        <div className="text-700 fs--1">Payment Term</div>
                        <div className="fw-semibold">{values.paymentTerm || '—'}</div>
                      </div>
                      <div>
                        <div className="text-700 fs--1">Base Payout</div>
                        <div className="fw-semibold">{values.payout || '0'}</div>
                      </div>
                    </div>
                    <div className="range-divider" />
                    <Form.Check
                      type="switch"
                      id="agentOverrides"
                      name="agentOverrides"
                      checked={!!values.agentOverrides}
                      onChange={handleOnChange}
                      label="Enable agent overrides"
                      className="mb-3"
                    />
                    <Row className="g-2">
                      <Col xs={5}>
                        <Form.Select size="sm" name="applyAllType" value={values.applyAllType} onChange={handleOnChange}>
                          <option value="flat">Flat</option>
                          <option value="percent">%</option>
                        </Form.Select>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          size="sm"
                          name="applyAllValue"
                          value={values.applyAllValue}
                          onChange={handleOnChange}
                          placeholder="Apply to all tiers"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="range-form-card mt-3">
                  <Card.Header className="range-form-card-header">
                    <div>
                      <h6 className="mb-0">Agent Payouts</h6>
                      <small className="text-700">Configure tiered payouts for agents.</small>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table className="table-sm mb-0 range-tier-table" responsive>
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Type</th>
                          <th className="text-end">Value</th>
                          <th className="text-center">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutTiers.map((tier) => (
                          <tr key={tier}>
                            <td className="text-nowrap">({tier})</td>
                            <td>
                              <Form.Select
                                size="sm"
                                name={`tierType_${tier.replace('/', '_')}`}
                                value={values[`tierType_${tier.replace('/', '_')}`] ?? 'flat'}
                                onChange={handleOnChange}
                              >
                                <option value="flat">Flat</option>
                                <option value="percent">%</option>
                              </Form.Select>
                            </td>
                            <td className="text-end">
                              <Form.Control
                                size="sm"
                                name={`tierValue_${tier.replace('/', '_')}`}
                                type="number"
                                value={values[`tierValue_${tier.replace('/', '_')}`] ?? ''}
                                onChange={handleOnChange}
                                placeholder="0"
                              />
                            </td>
                            <td className="text-center">
                              <Form.Check
                                type="checkbox"
                                name={`tierActive_${tier.replace('/', '_')}`}
                                checked={values[`tierActive_${tier.replace('/', '_')}`] ?? true}
                                onChange={handleOnChange}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Forms>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Close
        </Button>
        <Button variant="primary" size="sm" type="submit" form="entity-form">
          {record ? 'Update' : 'Add'}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default EntityForm;
