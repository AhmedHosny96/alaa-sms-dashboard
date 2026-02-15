import React from 'react';
import { Card, Col, Container, Row, Table, Button } from 'react-bootstrap';

const RangeProviders = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS Range Providers</h2>
        <p className="text-700 mb-0">
          Manage providers for SMS number ranges.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Range Providers</h5>
            <Button variant="primary" size="sm">Add Range Provider</Button>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Provider Name</th>
                  <th className="text-nowrap">Range Start</th>
                  <th className="text-nowrap">Range End</th>
                  <th className="text-nowrap">Country</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={6} className="text-center text-700 py-5">
                    No range providers configured yet.
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

export default RangeProviders;
