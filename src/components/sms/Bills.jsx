import React from 'react';
import { Card, Col, Container, Row, Table, Badge, Button } from 'react-bootstrap';

const Bills = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Bills</h2>
        <p className="text-700 mb-0">
          View and manage billing statements.
        </p>
      </Col>
    </Row>
    <Row className="g-3 mb-3">
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <h6 className="text-700">Outstanding</h6>
            <h3 className="text-danger mb-0">$0.00</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <h6 className="text-700">This Month</h6>
            <h3 className="text-primary mb-0">$0.00</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <h6 className="text-700">Total Paid</h6>
            <h3 className="text-success mb-0">$0.00</h3>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">All Bills</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Bill #</th>
                  <th className="text-nowrap">Date</th>
                  <th className="text-nowrap">Period</th>
                  <th className="text-nowrap">Amount</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={6} className="text-center text-700 py-5">
                    No bills available yet.
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

export default Bills;
