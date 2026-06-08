import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';

const normalizeRange = (dates) => {
  const [startRaw, endRaw] = Array.isArray(dates) ? dates : [null, null];
  const start = startRaw ? new Date(startRaw) : null;
  const end = endRaw ? new Date(endRaw) : null;
  // Preserve user-selected time when the picker provides one.
  // Only fill defaults when the user hasn't picked any time yet (00:00).
  return [start, end];
};

const formatDateTime = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hh}:${mm}`;
};

const CustomInput = React.forwardRef(
  ({ onClick, placeholder, className, icon }, ref) => {
    const hasIcon = Boolean(icon);

    return (
      <Button
        variant="falcon-default"
        size="sm"
        className={`d-flex align-items-center ${hasIcon ? 'gap-2' : ''} ${className || ''}`.trim()}
        onClick={onClick}
        ref={ref}
        type="button"
      >
        {hasIcon && <FontAwesomeIcon icon={icon} className="fs--1" />}
        <span className="text-truncate">{placeholder}</span>
      </Button>
    );
  }
);

const AdvanceTableDateRangeFilter = ({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD HH:mm - YYYY-MM-DD HH:mm',
  className = 'table-page-filter',
  dateFormat = 'yyyy-MM-dd HH:mm',
  icon = 'calendar-alt',
  showTimeSelect = true,
  timeIntervals = 5,
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
      allowSameDay
      dateFormat={dateFormat}
      showTimeSelect={showTimeSelect}
      timeFormat="HH:mm"
      timeIntervals={timeIntervals}
      timeCaption="Time"
      wrapperClassName="advance-table-date-range-wrapper"
      customInput={
        <CustomInput
          className={className}
          placeholder={placeholder}
          startDate={startDate}
          endDate={endDate}
          icon={icon}
        />
      }
      placeholderText={placeholder}
      {...rest}
    />
  );
};

export default AdvanceTableDateRangeFilter;
