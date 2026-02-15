import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';

const AccountSettings = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Account Settings</h2>
        <p className="text-700 mb-0">
          Manage your account configuration and preferences.
        </p>
      </Col>
    </Row>
    <Row>
      <Col lg={8}>
        <Card className="mb-3">
          <Card.Header>
            <h5 className="mb-0">Profile Information</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control type="text" defaultValue="My SMS Company" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" defaultValue="admin@company.com" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control type="tel" defaultValue="+1234567890" />
              </Form.Group>
              <Button variant="primary">Save Changes</Button>
            </Form>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header>
            <h5 className="mb-0">Security Settings</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control type="password" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" />
              </Form.Group>
              <Button variant="primary">Update Password</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default AccountSettings;
