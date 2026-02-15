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

const CustomInput = React.forwardRef(({ value, onClick, placeholder, className }, ref) => (
  <Button variant="outline-secondary" size="sm" className={className} onClick={onClick} ref={ref} type="button">
    {value || placeholder}
  </Button>
));

const TableDateRangeFilter = ({
  value,
  onChange,
  placeholder = 'Date Range',
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
      customInput={<CustomInput className={className} placeholder={placeholder} />}
      placeholderText={placeholder}
      {...rest}
    />
  );
};

export default TableDateRangeFilter;
