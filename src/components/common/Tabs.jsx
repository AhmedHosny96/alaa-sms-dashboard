import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import classNames from 'classnames';

const Tabs = ({ tabs, defaultActiveKey = '1', className }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const activeIndex = Math.max(0, parseInt(activeKey, 10) - 1);
  const activeTab = tabs[activeIndex];

  return (
    <>
      <Nav variant="tabs" className={classNames('mb-3', className)}>
        {tabs.map((tab, index) => {
          const key = String(index + 1);
          return (
            <Nav.Item key={key}>
              <Nav.Link
                active={activeKey === key}
                onClick={() => setActiveKey(key)}
                className="cursor-pointer"
              >
                {tab.label}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
      <div>{activeTab?.component}</div>
    </>
  );
};

export default Tabs;
