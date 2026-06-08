import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DepositeStatus = ({ html }) => {
  if (!html) return null;
  return (
    <Card className="bg-body-tertiary dark__bg-opacity-50 my-3">
      <Card.Body className="p-3">
        <p
          className="fs-10 mb-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card.Body>
    </Card>
  );
};

export default DepositeStatus;
