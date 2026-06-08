import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Forms, UseInput, UseSelect } from 'components/common/UseTable';

const NewDomain = () => {
  const typeOptions = useMemo(
    () => [
      { id: 'Primary', name: 'Primary' },
      { id: 'Secondary', name: 'Secondary' }
    ],
    []
  );

  const [values, setValues] = useState({
    domain: '',
    type: ''
  });

  const handleSubmit = () => {};

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-0">New Domain</h2>
          <p className="text-700 mb-0">
            Configure and add a new domain for your SMS platform.
          </p>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Domain Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Forms id="new-domain-form" onFinish={handleSubmit}>
                <UseInput
                  name="domain"
                  label="Domain Name"
                  value={values.domain}
                  onChange={(e) => setValues((prev) => ({ ...prev, domain: e.target.value }))}
                  placeholder="example.com"
                  size="small"
                  className="shadow-none border-300"
                />
                <UseSelect
                  name="type"
                  label="Domain Type"
                  value={values.type}
                  options={typeOptions}
                  onChange={(value) => setValues((prev) => ({ ...prev, type: value }))}
                  placeholder="Select domain type"
                  className="table-select-filter"
                />
                <Button variant="primary" size="sm" type="submit">
                  Add Domain
                </Button>
              </Forms>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewDomain;
