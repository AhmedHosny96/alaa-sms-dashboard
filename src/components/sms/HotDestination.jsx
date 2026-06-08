import React, { useMemo, useState } from 'react';
import { Card, Col, Container, Row, Form } from 'react-bootstrap';
import { UseTable } from 'components/common/UseTable';

const HOT_DESTINATION_COLUMNS = [
  { title: 'Rank', dataIndex: 'rank', key: 'rank' },
  { title: 'Destination', dataIndex: 'destination', key: 'destination' },
  { title: 'Country', dataIndex: 'country', key: 'country' },
  { title: 'Total SMS', dataIndex: 'totalSms', key: 'totalSms' },
  { title: 'Success Rate', dataIndex: 'successRate', key: 'successRate' },
  { title: 'Avg Response Time', dataIndex: 'avgResponseTime', key: 'avgResponseTime' }
];

const HotDestination = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const columns = useMemo(() => HOT_DESTINATION_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-0">Hot Destination</h2>
          <p className="text-700 mb-0">
            Track frequently accessed SMS destinations and hot routes.
          </p>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body>
              <Form>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Control type="date" />
                  </Col>
                  <Col md={4}>
                    <Form.Select>
                      <option>Last 24 Hours</option>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Destinations</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <TableContainer
                dataSource={data}
                loading={loading}
                rowKey={(r) => r.id ?? r.rank}
                className="table-sm fs-10 mb-0 overflow-hidden"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotDestination;
