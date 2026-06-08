import React from 'react';
import SearchSelect from './SearchSelect';

const TableSelectFilter = ({
  value,
  options = [],
  placeholder = 'Select',
  onChange,
  className,
  allowClear = true,
  ...rest
}) => (
  <SearchSelect
    value={value}
    options={options}
    placeholder={placeholder}
    onChange={onChange}
    className={className}
    isClearable={allowClear}
    size="sm"
    {...rest}
  />
);

export default TableSelectFilter;
