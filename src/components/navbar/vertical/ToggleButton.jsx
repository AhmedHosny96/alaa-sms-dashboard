import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppContext } from 'providers/AppProvider';

const ToggleButton = () => {
  const {
    config: { isNavbarVerticalCollapsed, isFluid, isRTL },
    setConfig
  } = useAppContext();

  const handleClick = () => {
    document
      .getElementsByTagName('html')[0]
      .classList.toggle('navbar-vertical-collapsed');
    setConfig('isNavbarVerticalCollapsed', !isNavbarVerticalCollapsed);
  };

  return (
    <div className="toggle-icon-wrapper">
      <Button
        variant="link"
        className="navbar-vertical-toggle navbar-vertical-toggle-btn"
        id="toggleNavigationTooltip"
        onClick={handleClick}
      >
        <FontAwesomeIcon
          icon={isNavbarVerticalCollapsed ? 'chevron-right' : 'chevron-left'}
          className="navbar-vertical-toggle-icon"
        />
      </Button>
    </div>
  );
};

export default ToggleButton;
