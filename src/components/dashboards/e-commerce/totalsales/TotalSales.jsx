import React, { useMemo, useRef } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import CardDropdown from 'components/common/CardDropdown';
import TotalSalesChart from './TotalSalesChart';
import Flex from 'components/common/Flex';

const formatSum = n =>
  typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString() : '—';

const sumSeries = arr =>
  (Array.isArray(arr) ? arr : []).reduce((a, x) => a + (Number(x) || 0), 0);

const defaultVolume = () => ({
  all: { lastMonth: [], previousYear: [] },
  successful: { lastMonth: [], previousYear: [] },
  failed: { lastMonth: [], previousYear: [] }
});

const volumeFromLegacyData = data => {
  if (!data || typeof data !== 'object') return null;
  const lm = data.lastMonth;
  const py = data.previousYear;
  if (!Array.isArray(lm) || !Array.isArray(py)) return null;
  return {
    all: { lastMonth: lm, previousYear: py },
    successful: { lastMonth: lm, previousYear: py },
    failed: {
      lastMonth: lm.map(() => 0),
      previousYear: py.map(() => 0)
    }
  };
};

function TotalSales({ volume, data, title = 'Total Sales' }) {
  const chartRef = useRef(null);

  const v = useMemo(() => {
    if (volume && typeof volume === 'object' && volume.all) return volume;
    const fromData = volumeFromLegacyData(data);
    if (fromData) return fromData;
    return defaultVolume();
  }, [volume, data]);

  const chartData = useMemo(() => {
    const block = v.successful || v.all;
    return {
      lastMonth: Array.isArray(block?.lastMonth) ? block.lastMonth : [],
      previousYear: Array.isArray(block?.previousYear) ? block.previousYear : [],
      labels: Array.isArray(v.labels) ? v.labels : null
    };
  }, [v]);

  const handleLegendToggle = name => {
    chartRef.current.getEchartsInstance().dispatchAction({
      type: 'legendToggleSelect',
      name
    });
  };

  const lastStr = formatSum(sumSeries(chartData.lastMonth));
  const prevStr = formatSum(sumSeries(chartData.previousYear));

  return (
    <Card>
      <Card.Header>
        <Row className="flex-between-center g-0">
          <Col xs="auto">
            <h6 className="mb-0">{title}</h6>
          </Col>
          <Col md="auto" className="order-1 order-md-0 mt-3 mt-md-0">
            <Flex className="flex-wrap gap-2 gap-md-3">
              <button
                type="button"
                className="btn btn-link p-0 fs-11 text-600 text-decoration-none"
                onClick={() => handleLegendToggle('lastMonth')}
              >
                <span className="dot dot-primary me-1" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--falcon-primary)' }} />
                This Week: <span className="text-1100">{lastStr} SMS</span>
              </button>
              <button
                type="button"
                className="btn btn-link p-0 fs-11 text-600 text-decoration-none"
                onClick={() => handleLegendToggle('previousYear')}
              >
                <span className="dot dot-warning me-1" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--falcon-warning)', opacity: 0.75 }} />
                Last Week: <span className="text-1100">{prevStr} SMS</span>
              </button>
            </Flex>
          </Col>
          <Col xs="auto" className="order-3">
            <CardDropdown />
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="pe-xxl-0">
        <TotalSalesChart
          data={chartData}
          ref={chartRef}
          style={{ height: '18.625rem' }}
        />
      </Card.Body>
    </Card>
  );
}

export default TotalSales;
