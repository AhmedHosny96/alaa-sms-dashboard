import React from 'react';
import { Card, Col, Container, Row, Table, Badge } from 'react-bootstrap';

const ListHttpConnections = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">HTTP Connections List</h2>
        <p className="text-700 mb-0">
          View all configured HTTP connections.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Active HTTP Connections</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Connection Name</th>
                  <th className="text-nowrap">Endpoint</th>
                  <th className="text-nowrap">Auth Type</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Last Used</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={6} className="text-center text-700 py-5">
                    No HTTP connections configured yet.
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

export default ListHttpConnections;
