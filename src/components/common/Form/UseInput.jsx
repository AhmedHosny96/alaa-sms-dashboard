
import React, { useState } from 'react';
import classNames from 'classnames';
import { Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const UseInput = ({
  name,
  value,
  label,
  onChange,
  allowClear = true,
  size = 'small',
  className,
  type,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const sizeMap = { middle: undefined, small: 'sm', large: 'lg' };
  const bsSize = sizeMap[size];
  const showClear = allowClear && value != null && value !== '';

  const handleClear = () => {
    if (onChange) {
      const e = { target: { name, value: '' } };
      onChange(e);
    }
  };

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <Form.Group className="mb-2">
      {label && <Form.Label>{label}</Form.Label>}
      <InputGroup size={bsSize}>
        <Form.Control
          name={name}
          value={value ?? ''}
          onChange={onChange}
          className={classNames('shadow-none border-300', className)}
          type={inputType}
          {...rest}
        />
        {isPassword && (
          <InputGroup.Text
            as="button"
            type="button"
            className="bg-transparent border-start-0 text-600"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={showPassword ? 'eye' : 'low-vision'} />
          </InputGroup.Text>
        )}
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
