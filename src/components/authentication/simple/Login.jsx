import React from 'react';
import { Link } from 'react-router';
import Flex from 'components/common/Flex';
import LoginForm from 'components/authentication/LoginForm';
import paths from 'routes/paths';

const Login = () => (
  <>
    <Flex justifyContent="between" alignItems="center" className="mb-2">
      <h5>Log in</h5>
      <p className="fs-10 text-600 mb-0">
        or <Link to={paths.simpleRegister}>Create an account</Link>
      </p>
    </Flex>
    <LoginForm />
  </>
);

export default Login;
