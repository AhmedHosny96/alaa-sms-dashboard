import React from 'react';
import { Col, Row } from 'react-bootstrap';
import StatisticsCard from './StatisticsCard';

const StatisticsCards = ({ stats }) => {
  if (!stats?.length) return null;
  return (
    <Row className="g-3 mb-3">
      {stats.map((stat) => (
        <Col key={stat.title} sm={6} md={4}>
          <StatisticsCard stat={stat} style={{ minWidth: '12rem' }} />
        </Col>
      ))}
    </Row>
  );
};

export default StatisticsCards;
