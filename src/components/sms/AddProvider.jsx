import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';

const AddProvider = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Add Provider</h2>
        <p className="text-700 mb-0">
          Configure and add a new SMS provider connection (SMPP or HTTP).
        </p>
      </Col>
    </Row>
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Provider Configuration</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Provider Name</Form.Label>
                <Form.Control type="text" placeholder="Provider name" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Connection Type</Form.Label>
                <Form.Select>
                  <option>Select type</option>
                  <option>SMPP</option>
                  <option>HTTP</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Host</Form.Label>
                <Form.Control type="text" placeholder="smpp.example.com" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Port</Form.Label>
                <Form.Control type="number" placeholder="2775" />
              </Form.Group>
              <Button variant="primary">Add Provider</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default AddProvider;
