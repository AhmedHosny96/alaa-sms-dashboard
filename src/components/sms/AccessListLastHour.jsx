import React from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';

const AccessListLastHour = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Access List - Last Hour</h2>
        <p className="text-700 mb-0">
          View all SMS access attempts in the last hour.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Recent Access Activity</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Timestamp</th>
                  <th className="text-nowrap">Source IP</th>
                  <th className="text-nowrap">Number</th>
                  <th className="text-nowrap">Action</th>
                  <th className="text-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={5} className="text-center text-700 py-5">
                    No access activity in the last hour.
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

export default AccessListLastHour;
