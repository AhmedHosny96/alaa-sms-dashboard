import React, { useMemo, useState } from 'react';
import { Card, Col, Container, Row, Button } from 'react-bootstrap';
import { UseTable } from 'components/common/UseTable';

const INBOX_COLUMNS = [
  { title: 'From', dataIndex: 'from', key: 'from' },
  { title: 'Subject', dataIndex: 'subject', key: 'subject' },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Actions', dataIndex: 'actions', key: 'actions', align: 'right' }
];

const InboxMessages = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const columns = useMemo(() => INBOX_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  return (
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
              <TableContainer
                dataSource={data}
                loading={loading}
                rowKey={(r) => r.id ?? r.from}
                className="table-sm fs-10 mb-0 overflow-hidden"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InboxMessages;
