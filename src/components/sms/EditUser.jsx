import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';

const EditUser = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Edit User</h2>
        <p className="text-700 mb-0">
          Update user information and permissions.
        </p>
      </Col>
    </Row>
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">User Information</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control type="text" defaultValue="John Doe" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" defaultValue="john@example.com" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select defaultValue="User">
                  <option>Select role</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>User</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Active" defaultChecked />
              </Form.Group>
              <Button variant="primary" className="me-2">Update User</Button>
              <Button variant="danger">Delete User</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default EditUser;
