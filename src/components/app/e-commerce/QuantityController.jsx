import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import classNames from 'classnames';

const QuantityController = ({
  quantity,
  handleChange,
  handleIncrease,
  handleDecrease,
  btnClassName
}) => {
  return (
    <InputGroup size="sm">
      <Button
        variant="outline-secondary"
        size="sm"
        className={classNames(btnClassName, 'border-300')}
        onClick={handleDecrease}
      >
        -
      </Button>
      <Form.Control
        className="text-center px-2 input-spin-none"
        type="number"
        min="1"
        value={quantity}
        onChange={handleChange}
        style={{ width: '50px' }}
      />
      <Button
        variant="outline-secondary"
        size="sm"
        className={classNames(btnClassName, 'border-300')}
        onClick={handleIncrease}
      >
        +
      </Button>
    </InputGroup>
  );
};

export default QuantityController;
