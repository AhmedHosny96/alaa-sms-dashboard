import React from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const SearchInput = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  enterButton = false,
  className,
  size = 'sm',
  ...rest
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(value);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSearch?.(value);
  };

  return (
    <InputGroup className={classNames(className)} {...rest}>
      <Form.Control
        size={size}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="search"
        className="shadow-none border-300"
      />
      {(enterButton || onSearch) && (
        <Button
          size={size}
          variant="outline-primary"
          className="border-300"
          onClick={handleSubmit}
        >
          <FontAwesomeIcon icon="search" className="fs--1" />
        </Button>
      )}
    </InputGroup>
  );
};

export default SearchInput;
