import React, { useMemo } from 'react';
import classNames from 'classnames';
import Select, { components as RSComponents } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

const ControlWithIcon = (props) => (
  <RSComponents.Control {...props}>
    <span className="search-select__leading-icon" aria-hidden="true">
      <FontAwesomeIcon icon="search" />
    </span>
    {props.children}
  </RSComponents.Control>
);

const NoOptions = (props) => (
  <RSComponents.NoOptionsMessage {...props}>
    <span className="search-select__empty">No matches</span>
  </RSComponents.NoOptionsMessage>
);

const portalTarget = typeof document !== 'undefined' ? document.body : null;

/**
 * Single searchable select used in table filter rows and forms.
 *
 * Uses the `search-select__*` class prefix (not the global `.react-select__*`)
 * so its portaled menu can be styled independently of legacy form-side
 * react-select styling.
 */
const SearchSelect = ({
  value,
  options = [],
  placeholder = 'Select',
  onChange,
  className,
  size = 'sm',
  isClearable = true,
  isSearchable = true,
  invalid = false,
  inputId,
  name,
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

  const selected = useMemo(() => {
    if (value == null || value === '') return null;
    return normalized.find((opt) => String(opt.value) === String(value)) || null;
  }, [normalized, value]);

  const handleChange = (opt) => {
    if (onChange) onChange(opt?.value ?? '');
  };

  return (
    <Select
      inputId={inputId || name}
      name={name}
      value={selected}
      options={normalized}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable={isSearchable}
      classNamePrefix="search-select"
      className={classNames(
        'search-select',
        `search-select--${size}`,
        invalid && 'search-select--invalid',
        className
      )}
      menuPortalTarget={portalTarget}
      menuPlacement="auto"
      menuShouldScrollIntoView={false}
      components={{ Control: ControlWithIcon, NoOptionsMessage: NoOptions }}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 1080 })
      }}
      {...rest}
    />
  );
};

export default SearchSelect;
