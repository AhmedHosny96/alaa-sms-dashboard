import React from 'react';
import Background from 'components/common/Background';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { Link } from 'react-router';
import { useAppContext } from 'providers/AppProvider';

const AuthSplitLayout = ({ children, bgProps }) => {
  const { branding } = useAppContext();
  const theme = branding || {};
  const companyName = theme.name || 'SMS Pro';
  const websiteHost = String(theme.domain || '').trim();
  const website = websiteHost ? `https://${websiteHost}` : '';
  const currentYear = new Date().getFullYear();
  const rightsLabel = websiteHost ? `@${websiteHost}` : companyName;
  const resolvedBgProps = theme.loginBackgroundUrl
    ? {
        ...(bgProps || {}),
        image: theme.loginBackgroundUrl
      }
    : bgProps;

  return (
    <Container fluid>
      <Row className="min-vh-100 bg-100">
        <Col xs={6} className="d-none d-lg-block position-relative">
          {resolvedBgProps && <Background {...resolvedBgProps} />}
        </Col>
        <Col sm={10} md={6} className="px-sm-0 mx-auto py-5 d-flex flex-column">
          <Row className="g-0 justify-content-center flex-grow-1 align-content-center">
            <Col lg={9} xl={8} className="col-xxl-6">
              <Card>
                <Card.Header className="bg-shape bg-circle-shape text-center p-2">
                  <Link
                    className="text-white font-sans-serif fw-bolder fs-5 z-1 position-relative"
                    to="/"
                  >
                    {companyName}
                  </Link>
                </Card.Header>
                <Card.Body className="p-4">{children}</Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="text-center text-700 fs--1 mt-4">
            All rights reserved {currentYear} &copy;{' '}
            {website ? <a href={website}>{rightsLabel}</a> : rightsLabel}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthSplitLayout;
