import React from 'react';
import { Card, Col, Container, Row, Table, Badge, Button, Form } from 'react-bootstrap';

const PaymentRequests = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Payment Requests</h2>
        <p className="text-700 mb-0">
          Submit and track payment requests.
        </p>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col lg={6}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">New Payment Request</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control type="number" step="0.01" placeholder="0.00" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select>
                  <option>Bank Transfer</option>
                  <option>PayPal</option>
                  <option>Wire Transfer</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control as="textarea" rows={3} />
              </Form.Group>
              <Button variant="primary">Submit Request</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">My Payment Requests</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Request #</th>
                  <th className="text-nowrap">Date</th>
                  <th className="text-nowrap">Amount</th>
                  <th className="text-nowrap">Method</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={6} className="text-center text-700 py-5">
                    No payment requests yet.
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default PaymentRequests;
