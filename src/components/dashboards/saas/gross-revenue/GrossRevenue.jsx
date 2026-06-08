import React, { useState, useEffect, useRef } from 'react';
import { Card, Col, Form, Row, Button } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import GrossRevenueChart from './GrossRevenueChart';
import FalconLink from 'components/common/FalconLink';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const grossTableRows = [
  {
    id: 1,
    title: 'Platform Traffic',
    revenue: '$791.64',
    marketValue: {
      up: false,
      value: '13%'
    }
  },
  {
    id: 2,
    title: 'Client Traffic',
    revenue: '$113.86',
    marketValue: {
      up: true,
      value: '178%'
    }
  },
  {
    id: 3,
    title: 'Failed Traffic',
    revenue: '$0.00',
    marketValue: {
      up: false,
      value: ''
    }
  }
];

const currentMonth = months[new Date().getMonth()];
const previousMonthOf = (mon) => {
  const idx = months.indexOf(mon);
  if (idx < 0) return months[11];
  return idx === 0 ? months[11] : months[idx - 1];
};

const GrossRevenue = ({
  data,
  title = 'SMS Revenue',
  grossHeader,
  tableRows,
  className
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [previousMonth, setPreviousMonth] = useState(previousMonthOf(currentMonth));
  const chartRef = useRef(null);

  useEffect(() => {
    if (selectedMonth) {
      setPreviousMonth(previousMonthOf(selectedMonth));
    }
  }, [selectedMonth]);

  const handleLegend = (event, name) => {
    chartRef.current.getEchartsInstance().dispatchAction({
      type: 'legendToggleSelect',
      name: name
    });
    event.target.closest('button').classList.toggle('opacity-50');
  };

  const primary = grossHeader?.primaryFormatted ?? '$165.50';
  const changePct = grossHeader?.changePct != null ? String(grossHeader.changePct) : '5%';
  const changeTrim = changePct.trim();
  const changeUp = !changeTrim.startsWith('-');
  const rows = Array.isArray(tableRows) && tableRows.length ? tableRows : grossTableRows;

  return (
    <Card className={classNames('h-100 overflow-hidden', className)}>
      <Card.Header className="py-2">
        <Row className="align-items-start justify-content-between g-2 flex-nowrap">
          <Col className="min-w-0">
            <h6 className="mb-1 text-900">{title}</h6>
            <Flex className="align-items-center flex-wrap gap-2">
              <span className="text-primary fs-5 fw-semibold mb-0">{primary}</span>
              <SubtleBadge pill bg="primary" className="ms-0">
                <FontAwesomeIcon icon={changeUp ? 'caret-up' : 'caret-down'} /> {changePct}
              </SubtleBadge>
            </Flex>
          </Col>
          <Col xs="auto" className="flex-shrink-0">
            <Form.Select
              size="sm"
              className="pe-4"
              value={selectedMonth}
              onChange={({ target }) => setSelectedMonth(target.value)}
            >
              {months.map(mon => (
                <option key={mon} value={mon}>
                  {mon}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="pt-0 pb-2 h-100 d-flex flex-column">
        <div className="px-0 px-sm-1">
          {rows.map((row, idx) => (
            <Row
              key={row.id}
              className={classNames(
                'align-items-center g-1 g-sm-2 fs-10 fw-medium font-sans-serif py-2 mx-0',
                idx < rows.length - 1 && 'border-bottom border-200'
              )}
            >
              <Col xs={5} className="min-w-0 pe-1">
                <span className="text-900 text-truncate d-block" title={row.title}>
                  {row.title}
                </span>
              </Col>
              <Col xs={3} className="text-end text-nowrap ps-0 pe-1">
                {row.revenue}
              </Col>
              <Col xs={4} className="text-end text-700 text-nowrap ps-0">
                {row.marketValue.value && (
                  <FontAwesomeIcon
                    icon={row.marketValue.up ? 'long-arrow-alt-up' : 'long-arrow-alt-down'}
                    className={classNames('me-1', {
                      'text-success': row.marketValue.up,
                      'text-danger': !row.marketValue.up
                    })}
                  />
                )}
                {row.marketValue.value ? row.marketValue.value : '—'}
              </Col>
            </Row>
          ))}
        </div>
        <div className="mt-1 flex-grow-1 w-100" style={{ minWidth: 0 }}>
          <GrossRevenueChart
            ref={chartRef}
            selectedMonth={selectedMonth}
            previousMonth={previousMonth}
            data={data}
            className="w-100 h-100"
            style={{ minHeight: '10rem' }}
          />
        </div>
      </Card.Body>
      <Card.Footer as={Flex} className="border-top py-2 flex-between-center">
        <Flex>
          <Button
            variant="text"
            size="sm"
            className="d-flex align-items-center p-0 shadow-none"
            onClick={event => handleLegend(event, 'currentMonth')}
          >
            <FontAwesomeIcon
              icon="circle"
              className="text-primary fs-11 me-1"
            />
            <span className="text">{selectedMonth}</span>
          </Button>
          <Button
            variant="text"
            size="sm"
            className="d-flex align-items-center p-0 shadow-none ms-2"
            onClick={event => handleLegend(event, 'prevMonth')}
          >
            <FontAwesomeIcon icon="circle" className="text-300 fs-11 me-1" />
            <span className="text">{previousMonth}</span>
          </Button>
        </Flex>
    </Card.Footer>
    </Card>
  );
};

export default GrossRevenue;
