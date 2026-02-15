import React from 'react';

import classNames from 'classnames';
import { Button, Form } from 'react-bootstrap';

const RadioItem = ({ name, label, active = false, onChange, image }) => {
  return (
    <Button variant="theme-default" className={classNames({ active: active })}>
      <Form.Label
        htmlFor={`${name}-${label}`}
        className="cursor-pointer hover-overlay"
      >
        <img className="w-100" src={image} alt="" />
      </Form.Label>
      <Form.Check
        type="radio"
        id={`${name}-${label}`}
        label={label.charAt(0).toUpperCase() + label.slice(1)}
        name={name}
        onChange={onChange}
        checked={active}
      />
    </Button>
  );
};

export default RadioItem;
