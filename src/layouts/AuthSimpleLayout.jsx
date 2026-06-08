import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Logo from 'components/common/Logo';
import Section from 'components/common/Section';
import { Outlet } from 'react-router';
import { useAppContext } from 'providers/AppProvider';

const AuthSimpleLayout = () => {
  const { branding } = useAppContext();
  const theme = branding || {};
  const footerText =
    theme.loginFooter || `${theme.name || 'SMS Pro'} © ${new Date().getFullYear()}. All rights reserved.`;
  const backgroundStyle = theme.loginBackgroundUrl
    ? {
        backgroundImage: `url(${theme.loginBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : undefined;

  return (
    <Section className="py-0" style={backgroundStyle}>
      <Row className="flex-center min-vh-100 py-6">
        <Col sm={10} md={8} lg={6} xl={5} className="col-xxl-4">
          <Logo logoSrc={theme.logoUrl} text={theme.name || 'SMS Pro'} />
          <Card>
            <Card.Body className="p-4 p-sm-5">
              <Outlet />
            </Card.Body>
          </Card>
          <div className="text-center text-700 fs--1 mt-3">
            {footerText}
          </div>
        </Col>
      </Row>
    </Section>
  );
};

export default AuthSimpleLayout;
