import React from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';

const SmsBilling = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS Billing & Payment Requests</h2>
        <p className="text-700 mb-0">
          View bills, usage-based invoices and customer payment requests.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card className="mb-3">
          <Card.Header>
            <h5 className="mb-0">Invoices</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Account</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center text-700 py-4">
                    Billing data will be loaded from the core API.
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

export default SmsBilling;

