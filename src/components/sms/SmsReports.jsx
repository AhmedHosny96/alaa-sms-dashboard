import React from 'react';
import { Card, Col, Container, Row, Table, Tabs, Tab } from 'react-bootstrap';

const SmsReports = () => (
  <Container fluid className="py-3">
    <Row className="mb-3">
      <Col>
        <h2 className="mb-0">SMS CDR & Traffic Reports</h2>
        <p className="text-700 mb-0">
          Explore CDRs, client and provider SMS statistics, and failed traffic.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Card>
          <Card.Body>
            <Tabs defaultActiveKey="cdr" id="sms-reports-tabs">
              <Tab eventKey="cdr" title="CDR Reports">
                <Table responsive hover size="sm" className="mt-3 mb-0">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Direction</th>
                      <th>MSISDN</th>
                      <th>Provider</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="text-center text-700 py-4">
                        CDR data will be loaded from the messaging engine API.
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Tab>
              <Tab eventKey="client" title="Client SMS Stats">
                <p className="text-700 mt-3 mb-0">
                  Per-client SMS volumes, success rates and revenue.
                </p>
              </Tab>
              <Tab eventKey="provider" title="Provider SMS Stats">
                <p className="text-700 mt-3 mb-0">
                  Per-provider throughput, DLR success rate and error breakdown.
                </p>
              </Tab>
              <Tab eventKey="failed" title="Failed SMS">
                <p className="text-700 mt-3 mb-0">
                  List and analyze failed messages for troubleshooting.
                </p>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default SmsReports;

