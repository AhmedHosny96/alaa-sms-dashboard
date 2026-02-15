import React, { useEffect, useMemo } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';

const EntityForm = ({ record, onSubmit, onCancel }) => {
  const rangeOptions = [
    { id: 'UKBK', name: 'UKBK' },
    { id: 'UKBX', name: 'UKBX' }
  ];
  const agentOptions = [
    { id: '369874', name: '369874' },
    { id: '369875', name: '369875' }
  ];
  const categoryOptions = [
    { id: 'General', name: 'General' },
    { id: 'Premium', name: 'Premium' }
  ];
  const paymentTermOptions = [
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' }
  ];

  const initialValues = useMemo(
    () => ({
      rangeId: record?.range ?? '',
      categoryId: record?.category ?? '',
      addMethod: 'single',
      number: record?.number ?? '',
      seriesStart: '',
      seriesEnd: '',
      listNumbers: '',
      csvFile: '',
      isTestNumber: false,
      maxSmsDay: '',
      maxSmsWeek: '',
      agentId: record?.agent?.id ?? '',
      paymentTerm: '',
      agentPayout: ''
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues, setValues]);

  const handleSelectChange = (name) => (value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit?.(values);
  };

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="mb-0">{record ? 'Edit Number' : 'Add New Number'}</h6>
          <small className="text-700">Add numbers by single, series, list or CSV upload.</small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={onCancel}>
          Close
        </Button>
      </Card.Header>
      <Card.Body>
        <Forms id="entity-form" onFinish={handleSubmit}>
          <Row className="g-3">
            <Col lg={4}>
              <UseSelect
                name="rangeId"
                label="Select Range"
                options={rangeOptions}
                value={values.rangeId}
                onChange={handleSelectChange('rangeId')}
                placeholder="Search Range"
              />
              <UseSelect
                name="categoryId"
                label="Number Category"
                options={categoryOptions}
                value={values.categoryId}
                onChange={handleSelectChange('categoryId')}
                placeholder="Please Select"
              />
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
                  <Form.Control type="file" name="csvFile" accept=".csv" onChange={handleOnChange} />
                  <Form.Text className="text-700">Upload a CSV file with one number per row.</Form.Text>
                </Form.Group>
              )}
            </Col>
            <Col lg={4}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold">Set First Number as Test Number</Form.Label>
                <div>
                  <Form.Check
                    type="checkbox"
                    name="isTestNumber"
                    label="Yes"
                    checked={!!values.isTestNumber}
                    onChange={handleOnChange}
                  />
                </div>
              </Form.Group>
              <UseInput
                name="maxSmsDay"
                label="Maximum SMS in Day"
                type="number"
                value={values.maxSmsDay}
                onChange={handleOnChange}
                placeholder="0"
              />
              <UseInput
                name="maxSmsWeek"
                label="Maximum SMS in Week"
                type="number"
                value={values.maxSmsWeek}
                onChange={handleOnChange}
                placeholder="0"
              />
            </Col>
            <Col lg={4}>
              <div className="mb-2">
                <div className="fw-semibold">Number Allocation to Agent</div>
                <div className="text-700 fs--1">Select Agent if you want to allocate</div>
              </div>
              <UseSelect
                name="agentId"
                label="Select Agent"
                options={agentOptions}
                value={values.agentId}
                onChange={handleSelectChange('agentId')}
                placeholder="Please Select"
              />
              <UseSelect
                name="paymentTerm"
                label="Payment Term"
                options={paymentTermOptions}
                value={values.paymentTerm}
                onChange={handleSelectChange('paymentTerm')}
                placeholder=""
              />
              <UseInput
                name="agentPayout"
                label="Agent Payout"
                type="number"
                value={values.agentPayout}
                onChange={handleOnChange}
                placeholder="0"
              />
            </Col>
          </Row>
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
