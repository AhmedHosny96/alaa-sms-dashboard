import React from 'react';
import { Card, Container } from 'react-bootstrap';
import TableToolbar from 'components/common/TableToolbar';
import './TablePage.css';

const TablePageLayout = ({
  title,
  subtitle,
  toolbar,
  children,
  className,
  cardClassName
}) => (
  <Container fluid className={className ?? 'py-3'}>
    <Card className={cardClassName ? `table-page-card ${cardClassName}` : 'table-page-card'}>
      {(title || subtitle) && (
        <Card.Header className="d-flex flex-column gap-0 py-2">
          {title && <Card.Title as="h5" className="mb-0">{title}</Card.Title>}
          {subtitle && <Card.Text as="span" className="text-700 fs--1 mb-0">{subtitle}</Card.Text>}
        </Card.Header>
      )}
      <Card.Body>
        {toolbar && (
          <TableToolbar className="table-page-toolbar justify-content-between flex-wrap gap-2">
            {toolbar}
          </TableToolbar>
        )}
        <div className="p-0">{children}</div>
      </Card.Body>
    </Card>
  </Container>
);

export default TablePageLayout;
