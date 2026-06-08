import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import './TablePage.css';

const TablePageLayout = ({
  title,
  subtitle,
  topContent,
  toolbar,
  children,
  className,
  cardClassName
}) => {
  const hasToolbar = Boolean(toolbar);

  return (
    <Container fluid className={className ?? 'py-3'}>
      <Card className={cardClassName ? `table-page-card ${cardClassName}` : 'table-page-card'}>
        {(title || subtitle || toolbar) && (
          <Card.Header className="py-2">
            <Row className="flex-between-center">
              <Col xs={hasToolbar ? 4 : 12} sm="auto" className="d-flex align-items-center pe-0">
                <div className="py-2 py-xl-0">
                  {title && <h5 className="fs-9 mb-0 text-nowrap">{title}</h5>}
                  {subtitle && <span className="text-700 fs--1 mb-0 d-block">{subtitle}</span>}
                </div>
              </Col>
              {toolbar && (
                <Col xs={12} sm="auto" className="ps-0">
                  <div id="orders-actions" className="table-page-header-actions d-flex align-items-center flex-nowrap">
                    {toolbar}
                  </div>
                </Col>
              )}
            </Row>
          </Card.Header>
        )}
        <Card.Body className="p-0">
          {topContent && <div className="p-3">{topContent}</div>}
          <div className="p-0">{children}</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TablePageLayout;
