import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GROUP_BY_OPTIONS = [
  { value: 'date', label: 'Date', icon: 'calendar-day' },
  { value: 'month', label: 'Month', icon: 'calendar' },
  { value: 'provider', label: 'Provider', icon: 'building' },
  { value: 'range', label: 'Range', icon: 'layer-group' },
  { value: 'manager', label: 'Manager', icon: 'user-tie' },
  { value: 'agent', label: 'Agent', icon: 'user' },
  { value: 'number', label: 'Number', icon: 'hashtag' },
  { value: 'cli', label: 'CLI', icon: 'phone' }
];

const TableGroupBySelect = ({ onSelect, size = 'sm', className, ...rest }) => {
  const handleSelect = (value) => {
    if (!value) return;
    onSelect?.(value);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        size={size}
        className={className}
        aria-label="Group by"
        {...rest}
      >
        Group By
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-sm">
        {GROUP_BY_OPTIONS.map((opt) => (
          <Dropdown.Item key={opt.value} onClick={() => handleSelect(opt.value)}>
            <FontAwesomeIcon icon={opt.icon} className="me-2 text-700" />
            {opt.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TableGroupBySelect;
