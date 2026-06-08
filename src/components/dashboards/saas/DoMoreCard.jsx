import React from 'react';
import { Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from 'components/common/IconButton';

const moreItems = [
  {
    id: 1,
    label: 'High-throughput SMS routing',
    icon: 'infinity'
  },
  {
    id: 2,
    label: 'Priority delivery channels',
    icon: 'check'
  },
  { id: 3, label: 'Dedicated sender management', icon: 'check' },
  {
    id: 4,
    label: 'Advanced SMS analytics',
    icon: 'check'
  }
];

const DoMoreCard = ({ ...rest }) => {
  return (
    <Card {...rest}>
      <Card.Body className="p-4">
        <h4 className="text-800">SMS Plan Overview</h4>
        <h5 className="text-600 fs-9">
          Increase capacity with <span className="text-primary fw-semibold">Pro SMS</span>
        </h5>
        <Alert variant="success" className="mt-3">
          <h3 className="mb-0 text-800">
            $29
            <span className="fs-9 fw-medium font-sans-serif text-600">/month</span>
          </h3>
        </Alert>
        <ul className="fa-ul ms-2 ps-x1 mb-2">
          {moreItems.map(item => (
            <li key={item.id} className="py-1">
              <h6 className="text-700">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="fa-li text-success"
                />
                {item.label}
              </h6>
            </li>
          ))}
        </ul>
        <IconButton
          icon="crown"
          variant="success"
          iconClassName="me-2"
          className="w-100"
        >
          Upgrade SMS Plan
        </IconButton>
      </Card.Body>
    </Card>
  );
};

export default DoMoreCard;
