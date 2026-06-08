import React from 'react';
import { Form } from 'react-bootstrap';
import SearchSelect from '../SearchSelect';

const UseSelect = ({
  name,
  label,
  value,
  options = [],
  onChange,
  showSearch,
  allowClear = true,
  className,
  placeholder,
  ...rest
}) => (
  <Form.Group className="mb-2">
    {label && <Form.Label>{label}</Form.Label>}
    <SearchSelect
      inputId={name}
      name={name}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder ?? 'Please select'}
      isClearable={allowClear}
      isSearchable={showSearch ?? true}
      size="md"
      className={className}
      {...rest}
    />
  </Form.Group>
);

export default UseSelect;
