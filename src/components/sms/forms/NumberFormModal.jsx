import React, { useEffect, useMemo } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

// Same payout tiers used when defining payouts for ranges.
const payoutTiers = ['1/1', '7/1', '7/7', '15/15', '15/30', '30/15', '30/30', '30/45', '30/60'];

const NumberFormModal = ({
  show,
  onClose,
  record,
  onSubmit,
  rangeOptions: externalRangeOptions = [],
  clientOptions: externalClientOptions = []
}) => {
  const rangeOptions = externalRangeOptions.length ? externalRangeOptions : [];
  const agentOptions = externalClientOptions.length ? externalClientOptions : [];
  const categoryOptions = [
    { id: 'Test', name: 'Test' },
    { id: 'General SMS', name: 'General SMS' }
  ];
  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' }
  ];

  const initialValues = useMemo(
    () => ({
      rangeId: record?.rangeId ?? record?.range ?? '',
      categoryId: record
        ? record.isTestNumber || String(record.category ?? '').toLowerCase().includes('test')
          ? 'Test'
          : 'General SMS'
        : 'General SMS',
      addMethod: record ? 'single' : 'single',
      number: record?.msisdn ?? record?.number ?? '',
      seriesStart: '',
      seriesEnd: '',
      listNumbers: '',
      csvFile: '',
      // 0 = none, 1/5/10 = first N numbers marked as test category.
      // Reading legacy `isTestNumber` boolean flag from existing records.
      testNumberCount: record?.isTestNumber ? 1
        : (String(record?.category ?? '').toLowerCase().includes('test') ? 1 : 0),
      maxSmsDay: '',
      maxSmsWeek: '',
      agentId: record?.clientId ?? record?.agent?.id ?? '',
      paymentTerm: record?.paymentTerm ?? '',
      currency: record?.currency ?? '',
      agentPayout: record?.agentPayout ?? '',
      // Prefill per-tier payout inputs from the saved tierPayouts map (edit mode).
      ...Object.fromEntries(
        payoutTiers.map((t) => [`tierValue_${t.replace('/', '_')}`, record?.tierPayouts?.[t] ?? ''])
      )
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const selectedClientName = useMemo(() => {
    if (!values.agentId) return '—';
    return agentOptions.find((o) => String(o.id) === String(values.agentId))?.name || values.agentId;
  }, [agentOptions, values.agentId]);

  const handleSelectChange = (name) => (value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setValues((prev) => ({ ...prev, csvFile: file }));
  };

  const handleSubmit = () => {
    onSubmit?.(values);
  };

  return (
    <UseModal
      title={record ? 'Edit Number' : 'Add New Number'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      size="xl"
      footer={[
        <Button key="close" variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>,
        <Button key="submit" variant="primary" size="sm" type="submit" form="number-form">
          {record ? 'Update' : 'Add'}
        </Button>
      ]}
    >
      <Forms id="number-form" onFinish={handleSubmit}>
        <div className="range-form">
          <Row className="g-3">
            <Col lg={8}>
              <Card className="range-form-card">
                <Card.Header className="range-form-card-header">
                  <div>
                    <h6 className="mb-0">Number Details</h6>
                    <small className="text-700">Select range, category, and add method.</small>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <UseSelect
                        name="rangeId"
                        label="Select Range"
                        options={rangeOptions}
                        value={values.rangeId}
                        onChange={handleSelectChange('rangeId')}
                        placeholder="Search Range"
                      />
                    </Col>
                    <Col md={6}>
                      <UseSelect
                        name="categoryId"
                        label="Number Category"
                        options={categoryOptions}
                        value={values.categoryId}
                        onChange={handleSelectChange('categoryId')}
                        placeholder="Please Select"
                      />
                    </Col>
                    <Col md={6}>
                      <UseSelect
                        name="agentId"
                        label="Select Client"
                        options={agentOptions}
                        value={values.agentId}
                        onChange={handleSelectChange('agentId')}
                        placeholder="Search client..."
                        showSearch
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
                    <Col md={12}>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-semibold">How you will Add Number?</Form.Label>
                        <div className="d-flex flex-wrap gap-3">
                          <Form.Check
                            type="radio"
                            name="addMethod"
                            label="Single Number"
                            value="single"
                            checked={values.addMethod === 'single'}
                            onChange={handleOnChange}
                          />
                          <Form.Check
                            type="radio"
                            name="addMethod"
                            label="Series"
                            value="series"
                            checked={values.addMethod === 'series'}
                            onChange={handleOnChange}
                          />
                          <Form.Check
                            type="radio"
                            name="addMethod"
                            label="List"
                            value="list"
                            checked={values.addMethod === 'list'}
                            onChange={handleOnChange}
                          />
                          <Form.Check
                            type="radio"
                            name="addMethod"
                            label="CSV Upload"
                            value="csv"
                            checked={values.addMethod === 'csv'}
                            onChange={handleOnChange}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      {values.addMethod === 'single' && (
                        <UseInput
                          name="number"
                          label="Number"
                          value={values.number}
                          onChange={handleOnChange}
                          placeholder="Enter Number"
                        />
                      )}
                      {values.addMethod === 'series' && (
                        <Row className="g-2">
                          <Col sm={6}>
                            <UseInput
                              name="seriesStart"
                              label="Series Start"
                              value={values.seriesStart}
                              onChange={handleOnChange}
                              placeholder="Start Number"
                            />
                          </Col>
                          <Col sm={6}>
                            <UseInput
                              name="seriesEnd"
                              label="Series End"
                              value={values.seriesEnd}
                              onChange={handleOnChange}
                              placeholder="End Number"
                            />
                          </Col>
                        </Row>
                      )}
                      {values.addMethod === 'list' && (
                        <UseInput
                          name="listNumbers"
                          label="Numbers List"
                          as="textarea"
                          rows={5}
                          value={values.listNumbers}
                          onChange={handleOnChange}
                          placeholder="Enter one number per line"
                        />
                      )}
                      {values.addMethod === 'csv' && (
                        <Form.Group className="mb-2">
                          <Form.Label>CSV Upload</Form.Label>
                          <Form.Control type="file" name="csvFile" accept=".csv,text/csv" onChange={handleCsvFileChange} />
                          <Form.Text className="text-700">Upload a CSV file with one number per row.</Form.Text>
                        </Form.Group>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="range-form-card mt-3">
                <Card.Header className="range-form-card-header">
                  <div>
                    <h6 className="mb-0">Limits</h6>
                    <small className="text-700">Set SMS limits and testing rules.</small>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-semibold">Set First Numbers as Test Numbers</Form.Label>
                        <Form.Select
                          name="testNumberCount"
                          size="sm"
                          value={String(values.testNumberCount ?? 0)}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, testNumberCount: Number(e.target.value) || 0 }))
                          }
                        >
                          <option value="0">None</option>
                          <option value="1">First 1</option>
                          <option value="2">First 2</option>
                          <option value="5">First 5</option>
                          <option value="10">First 10</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      {/* <UseInput
                        name="maxSmsDay"
                        label="Maximum SMS in Day"
                        type="number"
                        value={values.maxSmsDay}
                        onChange={handleOnChange}
                        placeholder="0"
                      />
                    </Col>
                    <Col md={6}>
                      <UseInput
                        name="maxSmsWeek"
                        label="Maximum SMS in Week"
                        type="number"
                        value={values.maxSmsWeek}
                        onChange={handleOnChange}
                        placeholder="0"
                      /> */}
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
                    <small className="text-700">Quick view of payout settings.</small>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="range-summary">
                    <div>
                      <div className="text-700 fs--1">Client</div>
                      <div className="fw-semibold">{selectedClientName}</div>
                    </div>
                    <div>
                      <div className="text-700 fs--1">Currency</div>
                      <div className="fw-semibold">{values.currency || '—'}</div>
                    </div>
                  </div>
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
                              min={0}
                              step={0.001}
                              value={values[`tierValue_${tier.replace('/', '_')}`] ?? ''}
                              onChange={handleOnChange}
                              placeholder="0"
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
    </UseModal>
  );
};

export default NumberFormModal;
