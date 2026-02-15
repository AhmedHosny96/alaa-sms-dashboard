import React from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const sizeMap = { small: 'sm', medium: undefined, large: 'lg' };

const Search = ({ onChange, size = 'medium', placeholder = 'search ...', value, onSearch, className, ...rest }) => {
  const bsSize = sizeMap[size] ?? sizeMap.medium;

  const handleChange = (e) => {
    onChange?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(value ?? e.target?.value);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSearch?.(value);
  };

  return (
    <InputGroup className={classNames(className)} size={bsSize} {...rest}>
      <Form.Control
        size={bsSize}
        value={value ?? ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="search"
        className="shadow-none border-300"
      />
      <Button
        size={bsSize}
        variant="outline-primary"
        className="border-300"
        onClick={handleSubmit}
      >
        <FontAwesomeIcon icon="search" className="fs--1" />
      </Button>
    </InputGroup>
  );
};

export default Search;
