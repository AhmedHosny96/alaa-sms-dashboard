import React, { useMemo, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { UseTable } from 'components/common/UseTable';

const BILLING_COLUMNS = [
  { title: 'Invoice #', dataIndex: 'invoice', key: 'invoice' },
  { title: 'Account', dataIndex: 'account', key: 'account' },
  { title: 'Period', dataIndex: 'period', key: 'period' },
  { title: 'Total', dataIndex: 'total', key: 'total' },
  { title: 'Status', dataIndex: 'status', key: 'status' }
];

const SmsBilling = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const columns = useMemo(() => BILLING_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-0">SMS Billing & Payment Requests</h2>
          <p className="text-700 mb-0">
            View bills, usage-based invoices and customer payment requests.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Invoices</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <TableContainer
                dataSource={data}
                loading={loading}
                rowKey={(r) => r.id ?? r.invoice}
                className="table-sm fs-10 mb-0 overflow-hidden"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SmsBilling;

