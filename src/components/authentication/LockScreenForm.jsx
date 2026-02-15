import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Col, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

const LockScreenForm = ({ type, ...rest }) => {
  // State
  const [password, setPassword] = useState('');

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    // setRedirect(true);
    toast.success(
      <div className='py-2 flex-1'>
        Logged in as Emma Watson
      </div>
      , {
      theme: 'colored'
    });
  };

  return (
    <Row
      {...rest}
      as={Form}
      className={classNames('gx-2 mt-4', {
        'mx-sm-4 mb-2': type === 'simple'
      })}
      onSubmit={handleSubmit}
    >
      <Col>
        <Form.Control
          placeholder="Enter your password"
          value={password}
          name="password"
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
      </Col>
      <Col xs={type === 'simple' ? 'auto' : 4}>
        <Button
          variant="primary"
          type="submit"
          disabled={!password}
          className={classNames({ 'w-100': type !== 'simple' })}
        >
          Login
        </Button>
      </Col>
    </Row>
  );
};

export default LockScreenForm;
