import React, { useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';

const getOptionValue = (option) => {
  if (option == null) return '';
  if (typeof option === 'object') {
    if (option.value != null) return option.value;
    if (option._id != null) return option._id;
    if (option.id != null) return option.id;
  }
  return option;
};

const getOptionLabel = (option) => {
  if (option == null) return '';
  if (typeof option === 'object') {
    if (option.label != null) return option.label;
    if (option.name != null) return option.name;
  }
  return String(option);
};

const TableSelectFilter = ({
  value,
  options = [],
  placeholder = 'Select',
  onChange,
  size = 'sm',
  className,
  allowClear = true,
  ...rest
}) => {
  const normalized = useMemo(
    () =>
      options.map((opt) => ({
        value: getOptionValue(opt),
        label: getOptionLabel(opt)
      })),
    [options]
  );

  const selectedLabel = useMemo(() => {
    const match = normalized.find((opt) => String(opt.value) === String(value ?? ''));
    return match?.label ?? '';
  }, [normalized, value]);

  const handleSelect = (nextValue) => {
    if (onChange) onChange(nextValue);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        size={size}
        className={className}
        aria-label={placeholder}
        {...rest}
      >
        {selectedLabel || placeholder}
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-sm">
        {allowClear && (
          <Dropdown.Item onClick={() => handleSelect('')}>
            {placeholder}
          </Dropdown.Item>
        )}
        {normalized.map((opt) => (
          <Dropdown.Item key={String(opt.value)} onClick={() => handleSelect(opt.value)}>
            {opt.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TableSelectFilter;
