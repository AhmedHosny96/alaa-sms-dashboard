import React, { useMemo, useState } from 'react';
import { Card, Col, Container, Row, Tabs, Tab } from 'react-bootstrap';
import { UseTable } from 'components/common/UseTable';

const REPORT_COLUMNS = [
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'Direction', dataIndex: 'direction', key: 'direction' },
  { title: 'MSISDN', dataIndex: 'msisdn', key: 'msisdn' },
  { title: 'Provider', dataIndex: 'provider', key: 'provider' },
  { title: 'Status', dataIndex: 'status', key: 'status' }
];

const SmsReports = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const columns = useMemo(() => REPORT_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  return (
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
                  <div className="mt-3">
                    <TableContainer
                      dataSource={data}
                      loading={loading}
                      rowKey={(r) => r.id ?? r.timestamp}
                      className="table-sm fs-10 mb-0 overflow-hidden"
                    />
                  </div>
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
};

export default SmsReports;

