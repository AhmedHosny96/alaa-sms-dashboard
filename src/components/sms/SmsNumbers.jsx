import React from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';

const SmsNumbers = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS Numbers & Ranges</h2>
        <p className="text-700 mb-0">
          Manage allocated SMS numbers, ranges and bulk allocations.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">My Numbers</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Number / Range</th>
                  <th>Type</th>
                  <th>Country</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center text-700 py-4">
                    Number and range data will be loaded from the core API.
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

export default SmsNumbers;

