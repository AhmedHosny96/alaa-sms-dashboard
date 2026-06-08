import React from 'react';
import { Dropdown } from 'react-bootstrap';

const CompanySelectDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select company',
  size = 'sm',
  className,
  disabled,
  ...rest
}) => {
  const selected = options.find(opt => String(opt.id) === String(value));

  return (
    <Dropdown {...rest}>
      <Dropdown.Toggle
        variant="outline-secondary"
        size={size}
        className={className}
        disabled={disabled}
        style={{ minWidth: 180, textAlign: 'left' }}
        aria-label="Select company"
      >
        {selected ? selected.name : placeholder}
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-sm" renderOnMount>
        {options.length === 0 && (
          <Dropdown.Item disabled>No options</Dropdown.Item>
        )}
        {options.map(opt => (
          <Dropdown.Item
            key={opt.id}
            active={String(opt.id) === String(value)}
            onClick={() => onChange(opt.id)}
          >
            {opt.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CompanySelectDropdown;
