import React, { useRef } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import LinePaymentChart from './LinePaymentChart';

const LinePayment = ({ data, title = 'SMS Volume (24h)', subtitle = '', subtitleValue = '' }) => {
  const chartRef = useRef(null);

  return (
    <Card className="rounded-3 overflow-hidden h-100 shadow-none">
      <Card.Body
        className="bg-line-chart-gradient"
        as={Flex}
        justifyContent="between"
        direction="column"
      >
        <Row className="align-items-center gx-2 gy-0">
          <Col>
            <h4 className="text-white mb-0 text-nowrap">{title}</h4>
            {subtitle && (
              <p className="fs-10 fw-semibold text-white mb-0">
                {subtitle}{subtitleValue && <span className="opacity-50"> {subtitleValue}</span>}
              </p>
            )}
          </Col>
        </Row>
        <LinePaymentChart
          ref={chartRef}
          data={data}
          paymentStatus="successful"
          style={{ height: '200px' }}
        />
      </Card.Body>
    </Card>
  );
};

export default LinePayment;
