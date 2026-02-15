import React from 'react';
import { Card, Col, Container, Row, Table, Form } from 'react-bootstrap';

const TestCdrs = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS Test Panel - CDRs</h2>
        <p className="text-700 mb-0">
          View CDRs for test SMS messages.
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
                  <Form.Control type="date" />
                </Col>
                <Col md={3}>
                  <Form.Control type="text" placeholder="Filter by number" />
                </Col>
                <Col md={3}>
                  <Form.Select>
                    <option>All Status</option>
                    <option>Delivered</option>
                    <option>Failed</option>
                  </Form.Select>
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
            <h5 className="mb-0">Test CDR Records</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Timestamp</th>
                  <th className="text-nowrap">Number</th>
                  <th className="text-nowrap">Message</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Provider</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={5} className="text-center text-700 py-5">
                    No test CDR records available.
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

export default TestCdrs;
