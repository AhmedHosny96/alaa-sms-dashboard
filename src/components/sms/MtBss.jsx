import React from 'react';
import { Card, Col, Container, Row, Table, Form } from 'react-bootstrap';

const MtBss = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">MT BSS (Business Support System)</h2>
        <p className="text-700 mb-0">
          Mobile Terminated BSS reports and analytics.
        </p>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col>
        <Card>
          <Card.Body>
            <Form>
              <Row className="g-2">
                <Col md={4}>
                  <Form.Control type="date" />
                </Col>
                <Col md={4}>
                  <Form.Select>
                    <option>All Services</option>
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
            <h5 className="mb-0">MT BSS Reports</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Date</th>
                  <th className="text-nowrap">Service</th>
                  <th className="text-nowrap">Total MT</th>
                  <th className="text-nowrap">Successful</th>
                  <th className="text-nowrap">Failed</th>
                  <th className="text-nowrap">Revenue</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={6} className="text-center text-700 py-5">
                    No MT BSS data available.
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

export default MtBss;
