import React from 'react';
import { Form } from 'react-bootstrap';

const getOptionValue = (option) => {
  if (option == null) return '';
  if (typeof option === 'object' && (option._id != null || option.id != null))
    return option._id ?? option.id;
  if (typeof option === 'object' && Array.isArray(option)) return option;
  return option;
};

const getOptionLabel = (option) => {
  if (option == null) return '';
  if (typeof option === 'object' && option.name != null) return option.name;
  return String(option);
};

const UseSelect = ({
  name,
  label,
  value,
  options = [],
  onChange,
  defaultValue,
  showSearch,
  allowClear = true,
  ...rest
}) => {
  const handleChange = (e) => {
    const v = e.target.value;
    if (onChange) onChange(v);
  };

  return (
    <Form.Group className="mb-2">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        name={name}
        value={value != null && value !== '' ? String(value) : ''}
        onChange={handleChange}
        style={{ textAlign: 'left' }}
        {...rest}
      >
        {allowClear && <option value="">{rest.placeholder ?? 'Please select'}</option>}
        {options.map((option, idx) => {
          const optValue = getOptionValue(option);
          const optLabel = getOptionLabel(option);
          const key = typeof optValue === 'object' ? idx : (option._id ?? option.id ?? optValue);
          const valueStr = typeof optValue === 'object' ? JSON.stringify(optValue) : String(optValue);
          return (
            <option key={key} value={valueStr}>
              {optLabel}
            </option>
          );
        })}
      </Form.Select>
    </Form.Group>
  );
};

export default UseSelect;
