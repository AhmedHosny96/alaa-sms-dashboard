import React from 'react';
import { Card, Col, Form, Row, Table } from 'react-bootstrap';
import { candleChartStatsData } from 'data/dashboard/saas';

const CandleChart = ({ data, title = 'SMS Trend' }) => {
  const tableRows = candleChartStatsData.map(item => ({
    id: item.id,
    metric: item.title,
    current: item.amount,
    previous: item.title === 'Queued SMS' ? '1,772' : item.title === 'Delivered SMS' ? '980' : '$229,312',
    change: `${item.grow.isGrow ? '+' : '-'}${item.grow.growAmount}%`,
    isUp: item.grow.isGrow
  }));

  return (
    <Card className="h-100" dir="ltr">
      <Card.Header>
        <Row className="flex-between-center">
          <Col xs="auto">
            <h6 className="mb-0">{title}</h6>
          </Col>
          <Col md="auto" className="order-1 order-md-0 mt-3 mt-md-0">
            <Form.Select size="sm" className="pe-4">
              <option>Last Month</option>
              <option>Last Quarter</option>
              <option>Last Year</option>
            </Form.Select>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="pt-0">
        <Table responsive className="mb-0 fs-10 align-middle">
          <thead className="text-700">
            <tr>
              <th>Metric</th>
              <th className="text-end">Current</th>
              <th className="text-end">Previous</th>
              <th className="text-end">Change</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(row => (
              <tr key={row.id}>
                <td className="fw-semibold text-900">{row.metric}</td>
                <td className="text-end">{row.current}</td>
                <td className="text-end text-700">{row.previous}</td>
                <td className={`text-end fw-semibold ${row.isUp ? 'text-success' : 'text-danger'}`}>{row.change}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default CandleChart;
