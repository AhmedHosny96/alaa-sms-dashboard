import React from 'react';
import { Form } from 'react-bootstrap';

export const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not valid phone number'
  },
  number: {
    len: '${label} must equal 12 digits'
  }
};

const Forms = ({ id = 'myform', onFinish, children, ...rest }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFinish) onFinish(e);
  };

  return (
    <Form id={id} onSubmit={handleSubmit} className="form-container" {...rest}>
      {children}
    </Form>
  );
};

export default Forms;
