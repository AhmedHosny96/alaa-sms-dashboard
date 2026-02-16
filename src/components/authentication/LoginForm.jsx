import Divider from 'components/common/Divider';
import { useState } from 'react';
import { Button, Col, Form, Row, InputGroup } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import SocialAuthButtons from './SocialAuthButtons';
import paths from 'routes/paths';
import { setAuthUser } from './authStorage';

const forgotPasswordPaths = {
  simple: paths.simpleForgotPassword,
  split: paths.splitForgotPassword,
  card: paths.cardForgotPassword
};

const LoginForm = ({ hasLabel = false, layout = 'simple' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  // State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    const email = formData.email.trim();
    const password = formData.password;
    const isValid = email === 'test@exampl.com' && password === 'password123';

    if (!isValid) {
      toast.error(
        <div className="py-2 flex-1">
          Invalid email or password
        </div>,
        { theme: 'colored' }
      );
      return;
    }

    setAuthUser({ email }, formData.remember);
    toast.success(
      <div className='py-2 flex-1'>
        Logged in as {email}
      </div>,
      { theme: 'colored' }
    );
    navigate(from, { replace: true });
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Email address</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Email address' : ''}
          value={formData.email}
          name="email"
          onChange={handleFieldChange}
          type="email"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Password</Form.Label>}
        <InputGroup>
          <Form.Control
            placeholder={!hasLabel ? 'Password' : ''}
            value={formData.password}
            name="password"
            onChange={handleFieldChange}
            type={showPassword ? 'text' : 'password'}
            className="border-end-0"
          />
          <InputGroup.Text
            as="button"
            type="button"
            className="bg-transparent border-start-0 text-600"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <FontAwesomeIcon icon={showPassword ? 'eye' : 'low-vision'} />
          </InputGroup.Text>
        </InputGroup>
      </Form.Group>

      <Row className="justify-content-between align-items-center">
        <Col xs="auto">
          <Form.Check type="checkbox" id="rememberMe" className="mb-0">
            <Form.Check.Input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={e =>
                setFormData({
                  ...formData,
                  remember: e.target.checked
                })
              }
            />
            <Form.Check.Label className="mb-0 text-700">
              Remember me
            </Form.Check.Label>
          </Form.Check>
        </Col>

        <Col xs="auto">
          <Link className="fs-10 mb-0" to={forgotPasswordPaths[layout]}>
            Forgot Password?
          </Link>
        </Col>
      </Row>

      <Form.Group>
        <Button
          type="submit"
          color="primary"
          className="mt-3 w-100"
          disabled={!formData.email || !formData.password}
        >
          Log in
        </Button>
      </Form.Group>

      <Divider className="mt-4">or log in with</Divider>

      <SocialAuthButtons />
    </Form>
  );
};

export default LoginForm;
