import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EXPORT_OPTIONS = [
  { value: 'copy', label: 'Copy', icon: 'copy' },
  { value: 'csv', label: 'CSV', icon: 'file-alt' },
  { value: 'excel', label: 'Excel', icon: 'table' },
  { value: 'pdf', label: 'PDF', icon: 'file-pdf' },
  { value: 'print', label: 'Print', icon: 'print' }
];

const TableExportSelect = ({ onExport, size = 'sm', className, ...rest }) => {
  const handleSelect = (value) => {
    if (!value) return;
    onExport?.(value);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        size={size}
        className={className}
        aria-label="Export or print table"
        {...rest}
      >
        Export
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-sm">
        {EXPORT_OPTIONS.map((opt) => (
          <Dropdown.Item key={opt.value} onClick={() => handleSelect(opt.value)}>
            <FontAwesomeIcon icon={opt.icon} className="me-2 text-700" />
            {opt.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TableExportSelect;
