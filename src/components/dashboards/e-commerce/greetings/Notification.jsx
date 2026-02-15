import React from 'react';
import classNames from 'classnames';
import { Col, ListGroup, Row } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import createMarkup from 'helpers/createMarkup';
import { Link } from 'react-router';

const Notification = ({ notification: { title, linkFor, type }, isLast }) => {
  return (
    <ListGroup.Item
      variant={type}
      className={classNames('mb-0 rounded-0 py-3 px-x1', {
        'border-top border-0': !(type === 'warning'),
        'border-x-0 border-top-0': !isLast
      })}
    >
      <Row className="flex-between-center">
        <Col>
          <Flex>
            <FontAwesomeIcon
              icon="circle"
              className={classNames('mt-1 fs-11', {
                'text-primary': !type
              })}
            />
            <p
              className="fs-10 ps-2 mb-0"
              dangerouslySetInnerHTML={createMarkup(title)}
            ></p>
          </Flex>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Link
            to="#!"
            className={classNames('fs-10 fw-medium', {
              'text-warning-emphasis': type === 'warning'
            })}
          >
            {`View ${linkFor}`}
            <FontAwesomeIcon icon="chevron-right" className="ms-1 fs-11" />
          </Link>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default Notification;
