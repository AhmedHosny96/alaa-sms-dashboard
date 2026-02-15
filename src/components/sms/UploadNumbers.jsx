import React from 'react';
import { Card, Col, Container, Row, Form, Button, Alert } from 'react-bootstrap';

const UploadNumbers = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Upload SMS Numbers</h2>
        <p className="text-700 mb-0">
          Bulk upload SMS numbers from a CSV or Excel file.
        </p>
      </Col>
    </Row>
    <Row>
      <Col lg={8}>
        <Card className="mb-3">
          <Card.Header>
            <h5 className="mb-0">Upload Instructions</h5>
          </Card.Header>
          <Card.Body>
            <Alert variant="info">
              <p className="mb-0">
                Upload a CSV file with columns: Number, Country, Provider, Status.
                Maximum 10,000 numbers per upload.
              </p>
            </Alert>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header>
            <h5 className="mb-0">Upload File</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select File</Form.Label>
                <Form.Control type="file" accept=".csv,.xlsx" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Provider</Form.Label>
                <Form.Select>
                  <option>Select provider for all numbers</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary">Upload Numbers</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default UploadNumbers;
