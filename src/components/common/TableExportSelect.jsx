import React from 'react';
import classNames from 'classnames';
import { Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EXPORT_OPTIONS = [
  { value: 'copy', label: 'Copy', icon: 'copy' },
  { value: 'csv', label: 'CSV', icon: 'file-alt' },
  { value: 'excel', label: 'Excel', icon: 'table' },
  { value: 'pdf', label: 'PDF', icon: 'file-pdf' },
  { value: 'print', label: 'Print', icon: 'print' }
];

const ExportToggle = React.forwardRef(
  ({ icon, iconClassName, transform, children, iconAlign = 'left', ...props }, ref) => (
    <Button {...props} ref={ref}>
      {iconAlign === 'right' && children}
      <FontAwesomeIcon
        icon={icon}
        className={classNames(iconClassName, {
          'me-1': children && iconAlign === 'left',
          'ms-1': children && iconAlign === 'right'
        })}
        transform={transform}
      />
      {iconAlign === 'left' || iconAlign === 'middle' ? children : false}
    </Button>
  )
);

ExportToggle.displayName = 'ExportToggle';

const TableExportSelect = ({
  onExport,
  size = 'sm',
  className,
  icon,
  label = 'Export',
  variant = 'outline-secondary',
  transform = 'shrink-3',
  ...rest
}) => {
  const handleSelect = (value) => {
    if (!value) return;
    onExport?.(value);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        as={icon ? ExportToggle : undefined}
        icon={icon}
        variant={variant}
        size={size}
        className={className}
        transform={transform}
        aria-label="Export or print table"
        {...rest}
      >
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="shadow-sm"
        renderOnMount
        popperConfig={{
          strategy: 'fixed',
          modifiers: [
            { name: 'offset', options: { offset: [0, 6] } },
            { name: 'preventOverflow', options: { boundary: 'viewport' } },
            { name: 'computeStyles', options: { adaptive: false } }
          ]
        }}
      >
        {EXPORT_OPTIONS.map((opt) => (
          <Dropdown.Item key={opt.value} onClick={() => handleSelect(opt.value)}>
            <FontAwesomeIcon icon={opt.icon} fixedWidth className="me-2 text-700" />
            {opt.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TableExportSelect;
