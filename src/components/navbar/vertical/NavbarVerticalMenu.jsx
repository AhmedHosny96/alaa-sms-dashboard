import React, { useState } from 'react';
import classNames from 'classnames';
import { Collapse, Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router';
import NavbarVerticalMenuItem from './NavbarVerticalMenuItem';
import { useAppContext } from 'providers/AppProvider';
import { getAuthUser } from 'components/authentication/authStorage';

const CollapseItems = ({ route, isOpen, onToggle }) => {
  return (
    <Nav.Item as="li">
      <Nav.Link
        onClick={() => {
          onToggle(route.name);
        }}
        className={classNames('dropdown-indicator cursor-pointer', {
          'text-500': !route.active
        })}
        aria-expanded={isOpen}
        // {...route}
      >
        <NavbarVerticalMenuItem route={route} />
      </Nav.Link>
      <Collapse in={isOpen}>
        <Nav className="flex-column nav" as="ul">
          <NavbarVerticalMenu routes={route.children} />
        </Nav>
      </Collapse>
    </Nav.Item>
  );
};

const filterRoutesByRole = (routes, userRoles) => {
  return routes
    .filter(route => {
      if (route.roles && route.roles.length > 0) {
        return route.roles.some(r => userRoles.includes(r));
      }
      return true;
    })
    .map(route => {
      if (route.children) {
        return {
          ...route,
          children: filterRoutesByRole(route.children, userRoles)
        };
      }
      return route;
    });
};

const NavbarVerticalMenu = ({ routes }) => {
  const {
    config: { showBurgerMenu },
    setConfig
  } = useAppContext();

  const { pathname } = useLocation();
  const user = getAuthUser();
  const userRoles = user?.roles || [];
  const filteredRoutes = filterRoutesByRole(routes, userRoles);

  const findOpenRoute = (routeList) => {
    for (const route of routeList) {
      if (route.children) {
        const checkLink = (children) => {
          if (children.to === pathname) return true;
          return (
            Object.prototype.hasOwnProperty.call(children, 'children') &&
            children.children.some(checkLink)
          );
        };
        if (route.children.some(checkLink)) return route.name;
      }
    }
    return null;
  };

  const [openKey, setOpenKey] = useState(() => findOpenRoute(filteredRoutes));

  const handleToggle = (name) => {
    setOpenKey(prev => (prev === name ? null : name));
  };

  const handleNavItemClick = () => {
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };

  // Clicking a side-menu item that's already the active route is a no-op for
  // react-router NavLink. Force a soft refresh (re-run of the route's data
  // hooks) by reloading the page when the same path is clicked.
  const handleSamePathReload = (to) => (e) => {
    if (!to || to === '#!' || to === '/#') return;
    try {
      const target = new URL(to, window.location.origin);
      if (target.pathname === window.location.pathname) {
        e.preventDefault();
        window.location.reload();
      }
    } catch {
      // Ignore malformed `to` values; let the default NavLink behavior run.
    }
  };

  return filteredRoutes.map(route => {
    if (!route.children) {
      return (
        <Nav.Item as="li" key={route.name} onClick={handleNavItemClick}>
          <NavLink
            end={route.exact}
            to={route.to}
            target={route?.newtab && '_blank'}
            onClick={(e) => {
              if (route.name === 'Modal') {
                setConfig('openAuthModal', true);
                return;
              }
              handleSamePathReload(route.to)(e);
            }}
            className={({ isActive }) =>
              isActive && route.to !== '#!' ? 'active nav-link' : 'nav-link'
            }
          >
            <NavbarVerticalMenuItem route={route} />
          </NavLink>
        </Nav.Item>
      );
    }
    return (
      <CollapseItems
        route={route}
        key={route.name}
        isOpen={openKey === route.name}
        onToggle={handleToggle}
      />
    );
  });
};

export default NavbarVerticalMenu;
