import React from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';

const AccountBilling = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Account Billing</h2>
        <p className="text-700 mb-0">
          View billing history and payment information.
        </p>
      </Col>
    </Row>
    <Row className="g-3">
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <h6 className="text-700">Current Balance</h6>
            <h3 className="text-primary mb-0">$0.00</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <h6 className="text-700">This Month</h6>
            <h3 className="text-success mb-0">$0.00</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <h6 className="text-700">Total Spent</h6>
            <h3 className="text-info mb-0">$0.00</h3>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row className="mt-3">
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Billing History</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Date</th>
                  <th className="text-nowrap">Description</th>
                  <th className="text-nowrap">Amount</th>
                  <th className="text-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={4} className="text-center text-700 py-5">
                    No billing history available yet.
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

export default AccountBilling;
