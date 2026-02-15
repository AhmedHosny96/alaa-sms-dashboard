import React from 'react';
import { Card, Col, Container, Row, Table, Form, Button } from 'react-bootstrap';

const TestListNumbers = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS Test Panel - List Numbers</h2>
        <p className="text-700 mb-0">
          Test SMS numbers for development and QA.
        </p>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col lg={8}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Add Test Number</h5>
          </Card.Header>
          <Card.Body>
            <Form className="d-flex gap-2">
              <Form.Control type="text" placeholder="Enter test number" />
              <Button variant="primary">Add</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Test Numbers</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table className="table-sm fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="text-nowrap">Number</th>
                  <th className="text-nowrap">Country</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Added Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td colSpan={5} className="text-center text-700 py-5">
                    No test numbers added yet.
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

export default TestListNumbers;
