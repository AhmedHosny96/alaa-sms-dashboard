import React from 'react';
import { Card, Col, Container, Row, Table, Form } from 'react-bootstrap';

const HotDestination = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Hot Destination</h2>
        <p className="text-700 mb-0">
          Track frequently accessed SMS destinations and hot routes.
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
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
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
            <h5 className="mb-0">Top Destinations</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Rank</th>
                  <th className="text-nowrap">Destination</th>
                  <th className="text-nowrap">Country</th>
                  <th className="text-nowrap">Total SMS</th>
                  <th className="text-nowrap">Success Rate</th>
                  <th className="text-nowrap">Avg Response Time</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={6} className="text-center text-700 py-5">
                    No hot destination data available.
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

export default HotDestination;
