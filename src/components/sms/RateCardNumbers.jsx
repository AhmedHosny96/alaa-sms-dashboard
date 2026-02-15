import React from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';

const RateCardNumbers = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Rate Card Numbers</h2>
        <p className="text-700 mb-0">
          View pricing for all SMS numbers and ranges.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Rate Card</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Country</th>
                  <th className="text-nowrap">Prefix</th>
                  <th className="text-nowrap">Number Type</th>
                  <th className="text-nowrap">Rate (per SMS)</th>
                  <th className="text-nowrap">Currency</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={5} className="text-center text-700 py-5">
                    Rate card data will be loaded from API.
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

export default RateCardNumbers;
