import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

const AccountOverview = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Account Overview</h2>
        <p className="text-700 mb-0">
          Summary of your account status and key metrics.
        </p>
      </Col>
    </Row>
    <Row className="g-3">
      <Col md={3}>
        <Card>
          <Card.Body>
            <h6 className="text-700">Total Messages</h6>
            <h3 className="mb-0">0</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <h6 className="text-700">Active Providers</h6>
            <h3 className="mb-0">0</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <h6 className="text-700">Active Numbers</h6>
            <h3 className="mb-0">0</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <h6 className="text-700">Success Rate</h6>
            <h3 className="mb-0">0%</h3>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row className="mt-3">
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Recent Activity</h5>
          </Card.Header>
          <Card.Body>
            <p className="text-700 mb-0">Activity log will be displayed here.</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default AccountOverview;
