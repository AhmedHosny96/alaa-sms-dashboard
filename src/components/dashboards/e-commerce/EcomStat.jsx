import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const EcomStatItem = ({ stat }) => {
  return (
    <Col xs={6} md={4} className={stat.className}>
      <h6 className="pb-1 text-700">{stat.title}</h6>
      <p className="font-sans-serif lh-1 mb-1 fs-7">{stat.amount}</p>
      <div className="d-flex align-items-center">
        <h6 className="fs-10 text-500 mb-0">{stat.subAmount}</h6>
        <h6
          className={classNames('fs-11 ps-3 mb-0', {
            'text-success': stat.type === 'up',
            'text-danger': stat.type === 'down',
            'text-primary': stat.type === 'standard',
            'text-warning': stat.type === 'warning',
            'text-info': stat.type === 'pending'
          })}
        >
          <FontAwesomeIcon icon="caret-up" className="me-1" />
          {stat.percent}%
        </h6>
      </div>
    </Col>
  );
};

const EcomStat = ({ data }) => {
  return (
    <Card className="py-3 mb-3">
      <Card.Body className="py-3">
        <Row className="g-0">
          {data.map((stat, index) => (
            <EcomStatItem
              key={stat.title}
              stat={stat}
              index={index}
              lastIndex={data.length - 1}
            />
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default EcomStat;
