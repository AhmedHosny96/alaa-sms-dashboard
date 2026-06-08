import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

const normalizeRange = (dates) => {
  const [startRaw, endRaw] = Array.isArray(dates) ? dates : [null, null];
  let start = startRaw ? new Date(startRaw) : null;
  let end = endRaw ? new Date(endRaw) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 0, 0);

  return [start, end];
};

const formatDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CustomInput = React.forwardRef(
  ({ value, onClick, placeholder, className, startDate, endDate }, ref) => {
    const display = startDate || endDate
      ? `${formatDate(startDate)}${endDate ? ` - ${formatDate(endDate)}` : ''}`
      : value;

    return (
      <Button
        variant="outline-secondary"
        size="sm"
        className={className}
        onClick={onClick}
        ref={ref}
        type="button"
      >
        {display || placeholder}
      </Button>
    );
  }
);

const TableDateRangeFilter = ({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD - YYYY-MM-DD',
  className,
  dateFormat = 'yyyy-MM-dd',
  ...rest
}) => {
  const [startDate, endDate] = useMemo(() => normalizeRange(value), [value]);

  return (
    <DatePicker
      selected={startDate}
      onChange={(dates) => onChange?.(normalizeRange(dates))}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      dateFormat={dateFormat}
      customInput={
        <CustomInput
          className={className}
          placeholder={placeholder}
          startDate={startDate}
          endDate={endDate}
        />
      }
      placeholderText={placeholder}
      {...rest}
    />
  );
};

export default TableDateRangeFilter;
