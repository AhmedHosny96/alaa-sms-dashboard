import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Button, Card, Col, Container, ProgressBar, Row, Spinner, Table } from 'react-bootstrap';
import BasicECharts from 'components/common/BasicEChart';
import Flex from 'components/common/Flex';
import { useAppContext } from 'providers/AppProvider';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import paths from 'routes/paths';
import smsService from 'services/smsService';

echarts.use([GridComponent, TooltipComponent, LineChart, CanvasRenderer]);

const getSparklineOptions = (getThemeColor, data) => ({
  tooltip: {
    trigger: 'axis',
    padding: [6, 10],
    formatter: '{c0}',
    transitionDuration: 0,
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    axisPointer: { type: 'none' },
    data: data.map((_, idx) => idx + 1)
  },
  yAxis: {
    type: 'value',
    splitLine: { show: false },
    axisLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    axisPointer: { type: 'none' }
  },
  series: [
    {
      type: 'line',
      data,
      showSymbol: false,
      smooth: true,
      lineStyle: { width: 2, color: getThemeColor('primary') },
      areaStyle: { color: getThemeColor('primary-100') }
    }
  ],
  grid: { left: 0, right: 0, top: 5, bottom: 0 }
});

const StatCard = ({ title, value, change, data, loading }) => {
  const { getThemeColor } = useAppContext();
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <p className="fs-10 text-700 mb-1">{title}</p>
            {loading ? (
              <Spinner animation="border" size="sm" className="my-2" />
            ) : (
              <h3 className="mb-2">{value}</h3>
            )}
            {change && (
              <Badge bg="soft-success" className="text-success">{change}</Badge>
            )}
          </div>
          <div className="ms-2" style={{ width: '6.5rem' }}>
            <BasicECharts
              echarts={echarts}
              options={getSparklineOptions(getThemeColor, data || [0, 0, 0, 0, 0, 0, 0])}
              style={{ height: 56 }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const fmt = n => {
  if (n == null) return '—';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const fmtMoney = n => {
  if (n == null) return '—';
  return '$' + Number(n).toFixed(2);
};

const SmsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await smsService.getDashboard();
      const data = res?.data?.data ?? res?.data ?? {};
      setStats(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Dashboard fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats().finally(() => setRefreshing(false));
  };

  const s = stats || {};

  const topClients = Array.isArray(s.topClients) ? s.topClients : [];
  const topSids = Array.isArray(s.topSids) ? s.topSids : [];
  const topDestinations = Array.isArray(s.topDestinations) ? s.topDestinations : [];
  const cdrStats = s.cdrStats || {};

  const updatedLabel = lastUpdated
    ? `Updated ${lastUpdated.toLocaleTimeString()}`
    : 'Loading...';

  return (
    <Container fluid className="py-3">
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="mb-1">HOME</h3>
          <p className="text-700 mb-0">Dashboards / SMS</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button
            variant="falcon-default"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <FontAwesomeIcon icon="sync-alt" className={`me-2 ${refreshing ? 'fa-spin' : ''}`} />
            Refresh
          </Button>
          <Button as={Link} to={paths.smsTestListNumbers} variant="falcon-default">
            <FontAwesomeIcon icon="hashtag" className="me-2" />
            Test Numbers
          </Button>
          <Button as={Link} to={paths.smsTestCdrs} variant="success">
            <FontAwesomeIcon icon="chart-line" className="me-2" />
            CDR Test Numbers
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xl={3} lg={6}>
          <StatCard
            title="Revenue Today"
            value={fmtMoney(s.totalRevenue)}
            change={s.growthRate}
            data={[6, 4, 7, 3, 6, 5, 7]}
            loading={loading}
          />
        </Col>
        <Col xl={3} lg={6}>
          <StatCard
            title="Total SMS Today"
            value={fmt(s.smsToday)}
            change={s.growthRate}
            data={[4, 6, 5, 7, 4, 6, 5]}
            loading={loading}
          />
        </Col>
        <Col xl={3} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <p className="fs-10 text-700 mb-1">Total SMS This Week</p>
              {loading ? (
                <Spinner animation="border" size="sm" className="my-2" />
              ) : (
                <h3 className="mb-2">{fmt(s.smsThisWeek)}</h3>
              )}
              <p className="fs-10 text-700 mb-1 mt-2">Total SMS This Month</p>
              {loading ? null : (
                <h4 className="mb-0">{fmt(s.smsThisMonth)}</h4>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <p className="fs-10 text-700 mb-1">Top Destinations</p>
              {loading ? (
                <Spinner animation="border" size="sm" className="my-2" />
              ) : topDestinations.length === 0 ? (
                <p className="fs-10 text-500 mb-0">No data yet</p>
              ) : (
                <div className="d-flex flex-column gap-2 mt-1">
                  {topDestinations.slice(0, 4).map((item, i) => (
                    <Flex key={i} justifyContent="between" alignItems="center">
                      <span className="fw-semibold text-900 fs-10">{item.name}</span>
                      <Badge bg="soft-primary" className="text-primary">{fmt(item.count)}</Badge>
                    </Flex>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body>
              <p className="fs-10 text-700 mb-1">Active Companies</p>
              {loading ? (
                <Spinner animation="border" size="sm" className="my-2" />
              ) : (
                <h3 className="mb-2">{fmt(s.totalCompanies)}</h3>
              )}
              <div className="mt-2">
                <p className="fs-10 text-700 mb-1">Net Profit Today</p>
                {loading ? null : (
                  <h4 className="mb-0">{fmtMoney(s.netProfit)}</h4>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body>
              <p className="fs-10 text-700 mb-1">Top SIDs Today</p>
              {loading ? (
                <Spinner animation="border" size="sm" className="my-2" />
              ) : topSids.length === 0 ? (
                <p className="fs-10 text-500 mb-0">No data yet</p>
              ) : (
                <div className="d-flex flex-column gap-2 mt-1">
                  {topSids.slice(0, 5).map((item, i) => (
                    <Flex key={i} justifyContent="between" alignItems="center">
                      <span className="fw-semibold text-900 fs-10 text-truncate" style={{ maxWidth: 120 }}>{item.name}</span>
                      <Badge bg="soft-success" className="text-success">{fmt(item.count)}</Badge>
                    </Flex>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} md={12}>
          <Card className="h-100">
            <Card.Body>
              <Flex justifyContent="between" alignItems="center" className="mb-3">
                <div>
                  <h6 className="mb-0">Reports & Stats</h6>
                  <p className="fs-10 text-700 mb-0">Quick access to SMS reporting modules.</p>
                </div>
                <Button as={Link} to={paths.smsCdrReports} size="sm" variant="falcon-default">
                  Open Reports
                </Button>
              </Flex>
              <Row className="g-2">
                {[
                  { label: 'CDR Reports', to: paths.smsCdrReports },
                  { label: 'Client SMS Stats', to: paths.smsClientStats },
                  { label: 'Provider SMS Stats', to: paths.smsProviderStats },
                  { label: 'SMS Range Stats', to: paths.smsRangeStats },
                  { label: 'Numbers Range Stats', to: paths.smsNumberStats },
                  { label: 'Failed SMS', to: paths.smsFailedMessages }
                ].map(item => (
                  <Col sm={6} key={item.label}>
                    <Button as={Link} to={item.to} variant="falcon-default" className="w-100 text-start">
                      {item.label}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Flex justifyContent="between" alignItems="center" className="mb-3">
                <div>
                  <h6 className="mb-0">Top Clients Today</h6>
                  <p className="fs-10 text-700 mb-0">{updatedLabel}</p>
                </div>
                <Button as={Link} to={paths.smsClientStats} size="sm" variant="falcon-default">View All</Button>
              </Flex>
              {loading ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
              ) : topClients.length === 0 ? (
                <p className="fs-10 text-500 mb-0">No data yet today</p>
              ) : (
                <Table responsive borderless className="mb-0 fs-10">
                  <thead className="text-700">
                    <tr>
                      <th>Client</th>
                      <th className="text-end">Total SMS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((row, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{row.name}</td>
                        <td className="text-end">{fmt(row.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Flex justifyContent="between" alignItems="center" className="mb-3">
                <div>
                  <h6 className="mb-0">CDR Status Breakdown</h6>
                  <p className="fs-10 text-700 mb-0">{updatedLabel}</p>
                </div>
                <Button as={Link} to={paths.smsCdrReports} size="sm" variant="falcon-default">CDR Reports</Button>
              </Flex>
              {loading ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
              ) : Object.keys(cdrStats).length === 0 ? (
                <p className="fs-10 text-500 mb-0">No data yet today</p>
              ) : (
                <Table responsive className="mb-0 fs-10">
                  <thead className="text-700">
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cdrStats).map(([status, count]) => {
                      const total = Object.values(cdrStats).reduce((a, b) => a + Number(b), 0);
                      const pct = total > 0 ? Math.round((Number(count) / total) * 100) : 0;
                      const isGood = ['DELIVERED_HANDSET', 'DELIVERED_OPERATOR', 'SENT'].includes(status);
                      return (
                        <tr key={status}>
                          <td className="fw-semibold">{status}</td>
                          <td>{fmt(count)}</td>
                          <td style={{ minWidth: 100 }}>
                            <ProgressBar
                              now={pct}
                              variant={isGood ? 'success' : 'warning'}
                              style={{ height: 6 }}
                              label={`${pct}%`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SmsDashboard;
