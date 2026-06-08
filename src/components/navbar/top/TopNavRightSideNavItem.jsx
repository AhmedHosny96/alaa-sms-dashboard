import React, { useState, useEffect, useRef } from 'react';
import CartNotification from 'components/navbar/top/CartNotification';
import NotificationDropdown from 'components/navbar/top/NotificationDropdown';
import ProfileDropdown from 'components/navbar/top/ProfileDropdown';
import { Nav } from 'react-bootstrap';
import NineDotMenu from './NineDotMenu';
import ThemeControlDropdown from './ThemeControlDropdown';

const UtcClock = () => {
  const [time, setTime] = useState(() => new Date().toISOString().slice(11, 19));
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <Nav.Item as="li" className="d-flex align-items-center me-2">
      <span className="text-900 fs-0">{time} UTC</span>
    </Nav.Item>
  );
};

const TopNavRightSideNavItem = () => {
  return (
    <Nav
      navbar
      className="navbar-nav-icons ms-auto flex-row align-items-center"
      as="ul"
    >
      <UtcClock />
      <ThemeControlDropdown />
     {/* <CartNotification /> */}
      <NotificationDropdown />
      {/* <NineDotMenu /> */}
      <ProfileDropdown />
    </Nav>
  );
};

export default TopNavRightSideNavItem;
