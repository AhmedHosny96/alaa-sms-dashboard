import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router';
import { Dropdown } from 'react-bootstrap';
import team3 from 'assets/img/team/3.jpg';
import Avatar from 'components/common/Avatar';
import paths from 'routes/paths';

const ProfileDropdown = () => {
  return (
    <Dropdown navbar={true} as="li">
      <Dropdown.Toggle
        bsPrefix="toggle"
        as={Link}
        to="#!"
        className="pe-0 ps-2 nav-link"
      >
        <Avatar src={team3} />
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-caret dropdown-menu-card  dropdown-menu-end">
        <div className="bg-white rounded-2 py-2 dark__bg-1000">
          {/* <Dropdown.Item className="fw-bold text-warning" href="#!">
            <FontAwesomeIcon icon="crown" className="me-1" />
            <span>Go Pro</span>
          </Dropdown.Item>
          <Dropdown.Divider /> */}
          {/* <Dropdown.Item href="#!">Set status</Dropdown.Item> */}
          <Dropdown.Item as={Link} to={paths.userProfile}>
            My Profile
          </Dropdown.Item>
          {/* <Dropdown.Item href="#!">Feedback</Dropdown.Item>
          <Dropdown.Divider /> */}
          {/* <Dropdown.Item as={Link} to={paths.userSettings}>
            Settings
          </Dropdown.Item> */}
          <Dropdown.Item as={Link} to={paths.cardLogin}>
            Logout
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
