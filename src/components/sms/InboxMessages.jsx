import React from 'react';
import { Card, Col, Container, Row, Table, Badge, Button } from 'react-bootstrap';

const InboxMessages = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Inbox</h2>
        <p className="text-700 mb-0">
          View and manage your messages and notifications.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Messages</h5>
            <Button variant="primary" size="sm">Compose</Button>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">From</th>
                  <th className="text-nowrap">Subject</th>
                  <th className="text-nowrap">Date</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={5} className="text-center text-700 py-5">
                    Your inbox is empty. No messages to display.
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

export default InboxMessages;
