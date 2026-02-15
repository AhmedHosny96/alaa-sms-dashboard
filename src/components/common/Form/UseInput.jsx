import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UseInput = ({ name, value, label, onChange, allowClear = true, size = 'middle', ...rest }) => {
  const sizeMap = { middle: undefined, small: 'sm', large: 'lg' };
  const bsSize = sizeMap[size];
  const showClear = allowClear && value != null && value !== '';

  const handleClear = () => {
    if (onChange) {
      const e = { target: { name, value: '' } };
      onChange(e);
    }
  };

  return (
    <Form.Group className="mb-2">
      {label && <Form.Label>{label}</Form.Label>}
      <InputGroup size={bsSize}>
        <Form.Control
          name={name}
          value={value ?? ''}
          onChange={onChange}
          {...rest}
        />
        {showClear && (
          <InputGroup.Text
            className="bg-transparent border-start-0 cursor-pointer"
            onClick={handleClear}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon="times" className="text-400" />
          </InputGroup.Text>
        )}
      </InputGroup>
    </Form.Group>
  );
};

export default UseInput;
