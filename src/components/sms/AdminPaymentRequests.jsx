import React from 'react';
import { Card, Col, Container, Row, Table, Badge, Button, Form } from 'react-bootstrap';

const AdminPaymentRequests = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Admin Payment Requests</h2>
        <p className="text-700 mb-0">
          Review and process client payment requests (Admin Only).
        </p>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col>
        <Card>
          <Card.Body>
            <Form>
              <Row className="g-2">
                <Col md={3}>
                  <Form.Select>
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select>
                    <option>All Clients</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Control type="date" />
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">All Payment Requests</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Request #</th>
                  <th className="text-nowrap">Client</th>
                  <th className="text-nowrap">Date</th>
                  <th className="text-nowrap">Amount</th>
                  <th className="text-nowrap">Method</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={7} className="text-center text-700 py-5">
                    No payment requests to review.
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

export default AdminPaymentRequests;
