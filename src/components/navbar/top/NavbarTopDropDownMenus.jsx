import React from 'react';
import NavbarDropdown from './NavbarDropdown';
import {
  dashboardRoutes,
  appRoutes
} from 'routes/siteMaps';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import NavbarDropdownApp from './NavbarDropdownApp';
import { useAppContext } from 'providers/AppProvider';

const NavbarTopDropDownMenus = () => {
  const {
    config: { navbarCollapsed, showBurgerMenu },
    setConfig
  } = useAppContext();

  const handleDropdownItemClick = () => {
    if (navbarCollapsed) {
      setConfig('navbarCollapsed', !navbarCollapsed);
    }
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };
  return (
    <>
      <NavbarDropdown title="dashboard">
        <Dropdown.Item
          as={Link}
          className="link-600"
          to={dashboardRoutes.children[0].to}
          onClick={handleDropdownItemClick}
        >
          {dashboardRoutes.children[0].name}
        </Dropdown.Item>
      </NavbarDropdown>

      <NavbarDropdown title="SMS Platform">
        <NavbarDropdownApp items={appRoutes.children} />
      </NavbarDropdown>
    </>
  );
};

export default NavbarTopDropDownMenus;
