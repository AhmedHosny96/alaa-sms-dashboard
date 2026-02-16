import React from 'react';
import { Card, Col, Container, Row, Accordion, Form } from 'react-bootstrap';

const FaqExtended = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">FAQ - Frequently Asked Questions</h2>
        <p className="text-700 mb-0">
          Find answers to common questions about the SMS platform.
        </p>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col>
        <Card>
          <Card.Body>
            <Form.Control type="text" placeholder="Search FAQs..." />
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Common Questions</h5>
          </Card.Header>
          <Card.Body>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>How do I add a new SMS provider?</Accordion.Header>
                <Accordion.Body>
                  Navigate to IPRN SMS &gt; SMS Providers and fill in the required connection details including host, port, and authentication credentials.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>How can I view my SMS CDR reports?</Accordion.Header>
                <Accordion.Body>
                  Go to Statistics &gt; CDR Reports to view detailed call detail records for all your SMS traffic. You can filter by date, provider, and status.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>What is the difference between MT and MO SMS?</Accordion.Header>
                <Accordion.Body>
                  MT (Mobile Terminated) refers to messages sent to mobile devices, while MO (Mobile Originating) refers to messages received from mobile devices.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>How do I manage API keys?</Accordion.Header>
                <Accordion.Body>
                  Access Account &gt; API &amp; Log to generate new API keys, manage existing ones, and configure IP whitelisting for secure API access.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default FaqExtended;
