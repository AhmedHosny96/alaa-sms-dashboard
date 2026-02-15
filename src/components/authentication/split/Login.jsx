import React from 'react';
import { Link } from 'react-router';
import LoginForm from 'components/authentication/LoginForm';
import AuthSplitLayout from 'layouts/AuthSplitLayout';
import bgImg from 'assets/img/generic/14.jpg';
import Flex from 'components/common/Flex';
import paths from 'routes/paths';

const Login = () => {
  return (
    <AuthSplitLayout bgProps={{ image: bgImg, position: '50% 20%' }}>
      <Flex alignItems="center" justifyContent="between">
        <h3>Login</h3>
        <p className="mb-0 fs-10">
          <span className="fw-semibold">New User? </span>
          <Link to={paths.splitRegister}>Create account</Link>
        </p>
      </Flex>
      <LoginForm layout="split" hasLabel />
    </AuthSplitLayout>
  );
};

export default Login;
