import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import SubtleBadge from 'components/common/SubtleBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CountUp from 'react-countup';

const SaasRevenue = ({ title = 'SMS Revenue', revenueCard }) => {
  const amount = revenueCard?.amount != null ? Number(revenueCard.amount) : 82.18;
  const badgeRaw = revenueCard?.badgePct != null ? String(revenueCard.badgePct).trim() : '61.8';
  const badgeUp = !badgeRaw.startsWith('-');
  const badgeDisplay = badgeRaw.includes('%') ? badgeRaw : `${badgeRaw}%`;
  return (
    <Card className="h-100">
      <Card.Body>
        <Row className="flex-between-center">
          <Col className="d-md-flex d-lg-block flex-between-center">
            <h6 className="mb-md-0 mb-lg-2">{title}</h6>
            <SubtleBadge bg="success" pill>
              <FontAwesomeIcon icon={badgeUp ? 'caret-up' : 'caret-down'} /> {badgeDisplay}
            </SubtleBadge>
          </Col>
          <Col xs="auto">
            <h4 className="fs-6 fw-normal text-700">
              <CountUp
                start={0}
                end={amount}
                duration={2.75}
                //suffix={'M'}
                prefix={'$'}
                decimals={2}
                decimal="."
              />
            </h4>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SaasRevenue;
