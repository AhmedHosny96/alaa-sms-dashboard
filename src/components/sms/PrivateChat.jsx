import React from 'react';
import { Card, Col, Container, Row, Form, Button, ListGroup } from 'react-bootstrap';

const PrivateChat = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">Private Chat</h2>
        <p className="text-700 mb-0">
          Direct messaging with support and team members.
        </p>
      </Col>
    </Row>
    <Row>
      <Col md={4}>
        <Card className="h-100">
          <Card.Header>
            <h5 className="mb-0">Conversations</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <ListGroup variant="flush">
              <ListGroup.Item className="text-center text-700 py-4">
                No conversations yet
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
      <Col md={8}>
        <Card className="h-100">
          <Card.Header>
            <h5 className="mb-0">Messages</h5>
          </Card.Header>
          <Card.Body className="d-flex flex-column justify-content-between" style={{ minHeight: '500px' }}>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
              <p className="text-700 mb-0">Select a conversation to start chatting</p>
            </div>
            <Form>
              <Form.Group className="d-flex gap-2">
                <Form.Control type="text" placeholder="Type a message..." />
                <Button variant="primary">Send</Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default PrivateChat;
