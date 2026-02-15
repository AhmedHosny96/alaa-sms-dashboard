import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

const SmsDashboard = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS Dashboard</h2>
        <p className="text-700 mb-0">
          High-level view of SMS traffic, delivery and billing.
        </p>
      </Col>
    </Row>
    <Row className="g-3">
      <Col md={4}>
        <Card>
          <Card.Body>
            <Card.Title>Traffic</Card.Title>
            <Card.Text className="text-700">
              Summary cards for MT/MO volume, success rate, and top routes.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <Card.Title>Providers</Card.Title>
            <Card.Text className="text-700">
              Quick status of connected providers and route health.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <Card.Title>Billing</Card.Title>
            <Card.Text className="text-700">
              Today&apos;s revenue, outstanding invoices and payment requests.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default SmsDashboard;

