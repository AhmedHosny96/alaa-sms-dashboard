import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { version } from 'config';
import { useAppContext } from 'providers/AppProvider';

const Footer = () => {
  const { branding } = useAppContext();
  const companyName = branding?.name || 'SMS Pro';
  const domain = String(branding?.domain || '').trim();
  const website = domain ? `https://${domain}` : '';
  const websiteHost = domain;
  const year = new Date().getFullYear();
  const linkLabel = websiteHost ? `@${websiteHost}` : companyName;

  return (
    <footer className="footer">
      <Row className="justify-content-between text-center fs-10 mt-4 mb-3">
        <Col sm="auto">
          <p className="mb-0 text-600">
            All rights reserved {year} &copy;{' '}
            {website ? (
              <a href={website}>{linkLabel}</a>
            ) : (
              companyName
            )}
          </p>
        </Col>
        <Col sm="auto">
          <p className="mb-0 text-600">v{version}</p>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
