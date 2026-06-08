import React, { useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TableSearchInput = ({ value, onChange, placeholder = 'Search...', className, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={classNames('search-select search-select--sm', className)} style={style}>
      <div
        className={classNames(
          'search-select__control',
          focused && 'search-select__control--is-focused'
        )}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <span className="search-select__leading-icon" aria-hidden="true">
          <FontAwesomeIcon icon="search" />
        </span>
        <input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '0.8125rem',
            color: 'inherit',
            padding: '0 4px'
          }}
        />
      </div>
    </div>
  );
};

export default TableSearchInput;
