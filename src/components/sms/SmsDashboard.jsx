import React from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Container, Row, Button, Badge, Table, ProgressBar } from 'react-bootstrap';
import BasicECharts from 'components/common/BasicEChart';
import Flex from 'components/common/Flex';
import { useAppContext } from 'providers/AppProvider';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import paths from 'routes/paths';

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
      lineStyle: {
        width: 2,
        color: getThemeColor('primary')
      },
      areaStyle: {
        color: getThemeColor('primary-100')
      }
    }
  ],
  grid: { left: 0, right: 0, top: 5, bottom: 0 }
});

const StatCard = ({ title, value, change, data }) => {
  const { getThemeColor } = useAppContext();
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <p className="fs-10 text-700 mb-1">{title}</p>
            <h3 className="mb-2">{value}</h3>
            <Badge bg="soft-success" className="text-success">
              {change}
            </Badge>
          </div>
          <div className="ms-2" style={{ width: '6.5rem' }}>
            <BasicECharts
              echarts={echarts}
              options={getSparklineOptions(getThemeColor, data)}
              style={{ height: 56 }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const ListCard = ({ title, subtitle, action, items }) => (
  <Card className="h-100">
    <Card.Body>
      <Flex justifyContent="between" alignItems="center" className="mb-3">
        <div>
          <h6 className="mb-0">{title}</h6>
          {subtitle && <div className="fs-10 text-700">{subtitle}</div>}
        </div>
        <Button size="sm" variant="falcon-default">
          {action}
        </Button>
      </Flex>
      <div className="d-flex flex-column gap-3">
        {items.map((item, index) => (
          <Flex key={`${item.label}-${index}`} justifyContent="between" alignItems="center">
            <Flex alignItems="center" className="gap-2">
              {item.icon}
              <div>
                <div className="fw-semibold text-900">{item.label}</div>
                <div className="fs-10 text-700">{item.subLabel}</div>
              </div>
            </Flex>
            <div className="text-end">
              <div className="fw-semibold text-900">{item.value}</div>
              <Badge bg={item.trend === 'down' ? 'soft-danger' : 'soft-success'} className={item.trend === 'down' ? 'text-danger' : 'text-success'}>
                {item.change}
              </Badge>
            </div>
          </Flex>
        ))}
      </div>
    </Card.Body>
  </Card>
);

const SmsDashboard = () => {
  const topSid = [
    {
      label: 'TikTok',
      subLabel: 'App',
      value: '50075',
      change: '+2.6%',
      trend: 'up',
      icon: ['fab', 'tiktok']
    },
    {
      label: 'Linked In',
      subLabel: 'App',
      value: '4',
      change: '-0.4%',
      trend: 'down',
      icon: ['fab', 'linkedin-in']
    },
    {
      label: 'Slack',
      subLabel: 'App',
      value: '794',
      change: '+0.2%',
      trend: 'up',
      icon: ['fab', 'slack']
    },
    {
      label: 'YouTube',
      subLabel: 'App',
      value: '1,578',
      change: '+4.1%',
      trend: 'up',
      icon: ['fab', 'youtube']
    },
    {
      label: 'Instagram',
      subLabel: 'Web Site',
      value: '3,458',
      change: '+8.3%',
      trend: 'up',
      icon: ['fab', 'instagram']
    },
    {
      label: 'Facebook',
      subLabel: 'App',
      value: '2,047',
      change: '+1.9%',
      trend: 'up',
      icon: ['fab', 'facebook-f']
    }
  ];

  const topDestinations = [
    {
      label: 'Palestine',
      subLabel: 'Social Network',
      value: '50K SMS',
      change: '+2.6%',
      trend: 'up'
    },
    {
      label: 'Egypt',
      subLabel: 'All Social Channels',
      value: '4,062',
      change: '-0.4%',
      trend: 'down'
    },
    {
      label: 'Turkey',
      subLabel: 'Mailchimp Campaigns',
      value: '1,680',
      change: '+0.2%',
      trend: 'up'
    },
    {
      label: 'France',
      subLabel: 'Impact Radius visits',
      value: '849',
      change: '+4.1%',
      trend: 'up'
    },
    {
      label: 'Oman',
      subLabel: 'Many Sources',
      value: '604',
      change: '-8.3%',
      trend: 'down'
    }
  ];

  const sidItems = topSid.map(item => ({
    ...item,
    icon: (
      <div className="rounded-circle bg-100 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
        <FontAwesomeIcon icon={item.icon} className="text-primary" />
      </div>
    )
  }));

  const destinationItems = topDestinations.map(item => ({
    ...item,
    icon: (
      <div className="rounded-circle bg-100 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
        <FontAwesomeIcon icon="flag" className="text-primary" />
      </div>
    )
  }));

  return (
    <Container fluid className="py-3">
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="mb-1">HOME</h3>
          <p className="text-700 mb-0">Dashboards / SMS</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
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
          <StatCard title="Revenue" value="$69,700" change="+2.2%" data={[6, 4, 7, 3, 6, 5, 7]} />
        </Col>
        <Col xl={3} lg={6}>
          <StatCard title="Total SMS Today" value="29,420" change="+2.6%" data={[4, 6, 5, 7, 4, 6, 5]} />
        </Col>
        <Col xl={3} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <p className="fs-10 text-700 mb-1">TPS Usage</p>
              <h3 className="mb-2">42 / 100</h3>
              <ProgressBar now={42} className="mb-2" style={{ height: 6 }} />
              <div className="fs-10 text-700">Current usage vs plan limit</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <ListCard title="Top SID" subtitle="6 Apps" action="View All" items={sidItems} />
        </Col>
        <Col xl={3} lg={6}>
          <ListCard title="Top Destination" action="View All" items={destinationItems} />
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={3} md={6}>
          <StatCard title="Total SMS This Week" value="700K" change="+2.6%" data={[3, 4, 3, 6, 4, 7, 5]} />
        </Col>
        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body>
              <p className="fs-10 text-700 mb-1">Active Companies</p>
              <h3 className="mb-2">24</h3>
              <Badge bg="soft-success" className="text-success">+1.4%</Badge>
              <div className="mt-3">
                <p className="fs-10 text-700 mb-2">Active Clients</p>
                <h4 className="mb-0">1,240</h4>
              </div>
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
                  <h6 className="mb-0">Top Client</h6>
                  <p className="fs-10 text-700 mb-0">Best client today</p>
                </div>
                <Button size="sm" variant="falcon-default">View All</Button>
              </Flex>
              <Table responsive borderless className="mb-0 fs-10">
                <thead className="text-700">
                  <tr>
                    <th>Client</th>
                    <th className="text-end">Total SMS</th>
                  </tr>
                </thead>
                <tbody>
                  {['Alpha Telecom', 'Skyline Media', 'Pulse CRM'].map((name, idx) => (
                    <tr key={name}>
                      <td className="fw-semibold">{name}</td>
                      <td className="text-end">{["25,400", "18,320", "9,880"][idx]}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Flex justifyContent="between" alignItems="center" className="mb-3">
                <div>
                  <h6 className="mb-0">CDRs Stats</h6>
                  <p className="fs-10 text-700 mb-0">Updated 37 minutes ago</p>
                </div>
                <Button size="sm" variant="falcon-default">History</Button>
              </Flex>
              <Table responsive className="mb-0 fs-10">
                <thead className="text-700">
                  <tr>
                    <th>Customer</th>
                    <th>Total SMS</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Delta Media', sms: '12,440', progress: 78, status: 'Active' },
                    { name: 'Orion Labs', sms: '9,210', progress: 65, status: 'Active' },
                    { name: 'Apex SMS', sms: '4,980', progress: 45, status: 'Warning' }
                  ].map(row => (
                    <tr key={row.name}>
                      <td className="fw-semibold">{row.name}</td>
                      <td>{row.sms}</td>
                      <td>
                        <ProgressBar now={row.progress} style={{ height: 6 }} />
                      </td>
                      <td>
                        <Badge bg={row.status === 'Active' ? 'soft-success' : 'soft-warning'} className={row.status === 'Active' ? 'text-success' : 'text-warning'}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SmsDashboard;

