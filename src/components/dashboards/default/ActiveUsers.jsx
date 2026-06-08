import React from 'react';
import FalconCardFooterLink from 'components/common/FalconCardFooterLink';
import FalconCardHeader from 'components/common/FalconCardHeader';
import CardDropdown from 'components/common/CardDropdown';
import { Card } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import { Link } from 'react-router';
import Avatar from 'components/common/Avatar';
import classNames from 'classnames';
import paths from 'routes/paths';

const ActiveUsers = ({ users, end = 5, title = 'Active Users', footerTitle = 'All active users', footerTo, itemTo, ...rest }) => {
  const resolvedFooterTo = footerTo || paths.smsClientsList;
  return (
    <Card {...rest}>
      <FalconCardHeader
        light
        title={title}
        titleTag="h6"
        className="py-2"
        endEl={<CardDropdown />}
      />
      <Card.Body className="py-2">
        {users.slice(0, end).map(({ id, ...rest }, index) => (
          <ActiveUser {...rest} key={id} isLast={index === users.length - 1} itemTo={itemTo || resolvedFooterTo} />
        ))}
      </Card.Body>
      {/* <FalconCardFooterLink
        title={footerTitle}
        to={resolvedFooterTo}
        size="sm"
      /> */}
    </Card>
  );
};

const ActiveUser = ({ name, avatar, role, isLast, itemTo }) => (
  <Flex
    className={classNames('align-items-center position-relative', {
      'mb-3': !isLast
    })}
  >
    <Avatar
      name={name}
      mediaClass={`text-${avatar.color || 'primary'}-emphasis bg-${avatar.color || 'primary'}-subtle fs-9`}
    />
    <div className="ms-3">
      <h6 className="mb-0 fw-semibold">
        <Link className="text-900 stretched-link" to={itemTo || paths.smsClientsList}>
          {name}
        </Link>
      </h6>
      <p className="text-500 fs-11 mb-0">{role}</p>
    </div>
  </Flex>
);

export default ActiveUsers;
