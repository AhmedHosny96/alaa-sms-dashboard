import React from 'react';
import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CountUp from 'react-countup';

const LmsStatItem = ({ stat }) => {
  return (
    <Col xxl={3} md={6} className={`${stat.className} px-3 text-center`}>
      <div className={`icon-circle icon-circle-${stat.color}`}>
        <FontAwesomeIcon
          icon={stat.icon}
          className={`fs-7 text-${stat.color}`}
        />
      </div>
      <h4 className="mb-1 font-sans-serif">
        <CountUp
          start={0}
          end={stat.amount}
          duration={2.75}
          className="text-700"
          separator=","
        />
        <span className="fw-normal text-600">{' ' + stat.title}</span>
      </h4>

      <p className="fs-10 fw-semibold mb-0">
        {stat.amountLastMonth}{' '}
        <span className="text-600 fw-normal">last month</span>
      </p>
    </Col>
  );
};

export default LmsStatItem;
