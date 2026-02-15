import React from 'react';
import { Card, Col, Container, Row, Table, Form, Button } from 'react-bootstrap';

const MtEdr = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS MT EDR (Event Detail Records)</h2>
        <p className="text-700 mb-0">
          Mobile Terminated event detail records for SMS traffic.
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
                  <Form.Control type="text" placeholder="Search number" />
                </Col>
                <Col md={3}>
                  <Form.Select>
                    <option>All Status</option>
                    <option>Success</option>
                    <option>Failed</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button variant="primary" className="w-100">Search</Button>
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
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">MT EDR Records</h5>
            <Button variant="outline-primary" size="sm">Export</Button>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Timestamp</th>
                  <th className="text-nowrap">Event ID</th>
                  <th className="text-nowrap">MSISDN</th>
                  <th className="text-nowrap">Message ID</th>
                  <th className="text-nowrap">Provider</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Details</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={7} className="text-center text-700 py-5">
                    No MT EDR records available.
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

export default MtEdr;
