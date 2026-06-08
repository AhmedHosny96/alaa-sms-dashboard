import React from 'react';
import Flex from 'components/common/Flex';
import LoginForm from 'components/authentication/LoginForm';

const Login = () => (
  <>
    <Flex justifyContent="between" alignItems="center" className="mb-2">
      <h5>Log in</h5>
    </Flex>
    <LoginForm />
  </>
);

export default Login;
