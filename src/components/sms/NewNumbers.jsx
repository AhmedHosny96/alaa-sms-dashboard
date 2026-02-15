import React from 'react';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';

const NewNumbers = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">New Numbers</h2>
        <p className="text-700 mb-0">
          Add new SMS numbers to the rate card.
        </p>
      </Col>
    </Row>
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Add Number to Rate Card</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Select>
                  <option>Select country</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prefix</Form.Label>
                <Form.Control type="text" placeholder="+1" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Number Type</Form.Label>
                <Form.Select>
                  <option>Mobile</option>
                  <option>Landline</option>
                  <option>Toll-Free</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rate (per SMS)</Form.Label>
                <Form.Control type="number" step="0.01" placeholder="0.05" />
              </Form.Group>
              <Button variant="primary">Add to Rate Card</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default NewNumbers;
