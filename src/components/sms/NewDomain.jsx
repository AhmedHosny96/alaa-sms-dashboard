import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';

const NewDomain = () => (
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
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Domain Name</Form.Label>
                <Form.Control type="text" placeholder="example.com" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Domain Type</Form.Label>
                <Form.Select>
                  <option>Select domain type</option>
                  <option>Primary</option>
                  <option>Secondary</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary">Add Domain</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default NewDomain;
