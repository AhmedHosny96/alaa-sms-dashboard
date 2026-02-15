import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';

const HttpConnections = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">HTTP Connections</h2>
        <p className="text-700 mb-0">
          Configure HTTP-based company connections.
        </p>
      </Col>
    </Row>
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">New HTTP Connection</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Connection Name</Form.Label>
                <Form.Control type="text" placeholder="Connection name" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>API Endpoint</Form.Label>
                <Form.Control type="url" placeholder="https://api.example.com" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Authentication Type</Form.Label>
                <Form.Select>
                  <option>Select auth type</option>
                  <option>API Key</option>
                  <option>Bearer Token</option>
                  <option>Basic Auth</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary">Create Connection</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default HttpConnections;
