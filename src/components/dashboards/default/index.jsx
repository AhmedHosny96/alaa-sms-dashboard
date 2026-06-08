import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Row, Col, Card, Badge, Table, ProgressBar, Spinner, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BasicECharts from 'components/common/BasicEChart';
import Flex from 'components/common/Flex';
import { useAppContext } from 'providers/AppProvider';
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import { getAuthUser } from 'components/authentication/authStorage';
import smsService from 'services/smsService';
import companyService from 'services/companyService';
import paths from 'routes/paths';
import { toast } from 'react-toastify';
import { cdrStatusBadgeVariant, cdrStatusLabel } from 'constants/cdrStatus';

echarts.use([GridComponent, TooltipComponent, LineChart, PieChart, CanvasRenderer]);

const fmtNum = (n) => {
  if (n == null) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
};

const fmtMoney = (n) => {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const sparklineOpts = (getThemeColor, color = 'primary') => ({
  tooltip: { show: false },
  xAxis: { show: false, type: 'category', data: [1, 2, 3, 4, 5, 6, 7] },
  yAxis: { show: false, type: 'value' },
  series: [{
    type: 'line', data: [3, 5, 4, 6, 3, 7, 5], showSymbol: false, smooth: true,
    lineStyle: { width: 2, color: getThemeColor(color) },
    areaStyle: { color: getThemeColor(color + '-100') || getThemeColor(color) }
  }],
  grid: { left: 0, right: 0, top: 5, bottom: 0 }
});

const StatCard = ({ title, value, subtitle, color = 'primary', icon }) => {
  const { getThemeColor } = useAppContext();
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <p className="fs-10 text-700 mb-1">{title}</p>
            <h3 className="mb-1">{value}</h3>
            {subtitle && <div className="fs-11 text-600">{subtitle}</div>}
          </div>
          <div className="ms-2" style={{ width: '6rem' }}>
            {icon ? (
              <div className="rounded-circle bg-soft-primary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                <FontAwesomeIcon icon={icon} className="text-primary fs-7" />
              </div>
            ) : (
              <BasicECharts echarts={echarts} options={sparklineOpts(getThemeColor, color)} style={{ height: 50 }} />
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const TopListCard = ({ title, items, nameKey = 'name', valueKey = 'count', valueFmt = fmtNum }) => (
  <Card className="h-100">
    <Card.Body>
      <h6 className="mb-3">{title}</h6>
      {(!items || items.length === 0) ? (
        <p className="text-600 fs-10">No data yet</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((item, i) => (
            <Flex key={i} justifyContent="between" alignItems="center">
              <Flex alignItems="center" className="gap-2">
                <div className="rounded-circle bg-100 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                  <span className="fw-bold text-primary fs-10">{i + 1}</span>
                </div>
                <span className="fw-semibold text-900 fs-10">{item[nameKey] || '—'}</span>
              </Flex>
              <span className="fw-semibold text-900 fs-10">{valueFmt(item[valueKey])}</span>
            </Flex>
          ))}
        </div>
      )}
    </Card.Body>
  </Card>
);

const CdrStatsCard = ({ stats }) => {
  const entries = stats ? Object.entries(stats) : [];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return (
    <Card className="h-100">
      <Card.Body>
        <h6 className="mb-3">CDRs Stats</h6>
        {entries.length === 0 ? (
          <p className="text-600 fs-10">No data yet</p>
        ) : (
          <Table responsive borderless className="mb-0 fs-10">
            <thead className="text-700">
              <tr><th>Status</th><th className="text-end">Count</th><th style={{ width: '40%' }}>Share</th></tr>
            </thead>
            <tbody>
              {entries.map(([status, count]) => {
                const { bg, text } = cdrStatusBadgeVariant(status);
                return (
                  <tr key={status}>
                    <td>
                      <Badge bg={bg} className={`text-${text} fs-10`}>{cdrStatusLabel(status)}</Badge>
                    </td>
                    <td className="text-end">{fmtNum(count)}</td>
                    <td><ProgressBar now={total > 0 ? (count / total) * 100 : 0} style={{ height: 6 }} /></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

const avatarColor = (str) => {
  const palette = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

const AvatarListCard = ({ title, items, nameKey = 'name', valueKey = 'count', valueFmt = fmtNum, hideValue = false }) => {
  const seen = new Set();
  const unique = (items || []).filter(item => {
    const k = String(item?.id ?? item?.[nameKey] ?? '');
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return (
    <Card className="h-100">
      <Card.Body>
        <h6 className="mb-3">{title}</h6>
        {unique.length === 0 ? (
          <p className="text-600 fs-10">No data yet</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {unique.map((item, i) => {
              const name = String(item?.[nameKey] || '—');
              const color = avatarColor(name);
              const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
              return (
                <Flex key={i} justifyContent="between" alignItems="center">
                  <Flex alignItems="center" className="gap-2">
                    <div
                      className={`bg-soft-${color} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                      style={{ width: 34, height: 34 }}
                    >
                      <span className={`fw-bold text-${color} fs-10`}>{initials}</span>
                    </div>
                    <span className="fw-semibold text-900 fs-10">{name}</span>
                  </Flex>
                  {!hideValue && (
                    <span className="fw-semibold text-900 fs-10">{valueFmt(item?.[valueKey])}</span>
                  )}
                </Flex>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

const SmsVolumeChart = ({ totalSale }) => {
  const { getThemeColor } = useAppContext();
  const navigate = useNavigate();

  if (!totalSale) return null;

  const allData = totalSale?.all || totalSale;
  const currentData = allData?.lastMonth || [];
  const prevData = allData?.previousMonth || [];
  const labels = totalSale?.labels || currentData.map((_, i) => `H${i}`);

  const opts = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const label = params[0]?.name || '';
        const lines = params.map(p => `${p.seriesName}: ${fmtNum(p.value)}`).join('<br/>');
        return `${label}<br/>${lines}`;
      }
    },
    legend: { data: ['This Week', 'Last Week'], bottom: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10, rotate: 35 } },
    yAxis: { type: 'value', axisLabel: { formatter: v => fmtNum(v), fontSize: 10 } },
    series: [
      {
        name: 'This Week',
        type: 'line',
        data: currentData,
        smooth: true,
        showSymbol: true,
        lineStyle: { color: getThemeColor('primary'), width: 2 },
        itemStyle: { color: getThemeColor('primary') }
      },
      {
        name: 'Last Week',
        type: 'line',
        data: prevData,
        smooth: true,
        showSymbol: true,
        lineStyle: { color: getThemeColor('warning'), width: 2, type: 'dashed' },
        itemStyle: { color: getThemeColor('warning') }
      }
    ],
    grid: { left: '3%', right: '4%', bottom: '18%', top: '6%', containLabel: true }
  };

  const handleClick = useCallback(() => {
    navigate(paths.smsCdrReports);
  }, [navigate]);

  return (
    <Card className="h-100">
      <Card.Body>
        <h6 className="mb-3">SMS Volume</h6>
        <BasicECharts
          echarts={echarts}
          options={opts}
          style={{ height: 300 }}
          onEvents={{ click: handleClick }}
        />
      </Card.Body>
    </Card>
  );
};

// ─── Platform Admin Dashboard ───

const PlatformAdminDashboard = ({ data }) => {
  const [togglingId, setTogglingId] = useState(null);
  const [companies, setCompanies] = useState(data.companies || []);

  useEffect(() => { setCompanies(data.companies || []); }, [data.companies]);

  const handleToggleStatus = async (company) => {
    const newStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setTogglingId(company.id);
    try {
      await companyService.updateStatus(company.id, newStatus);
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: newStatus } : c));
      toast.success(`${company.name} ${newStatus === 'SUSPENDED' ? 'suspended' : 'activated'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Row className="g-3 mb-3">
        <Col md={6} xxl={3}>
          <StatCard title="SMS Today" value={fmtNum(data.smsToday)} icon="paper-plane" />
        </Col>
        <Col md={6} xxl={3}>
          <StatCard title="SMS This Week" value={fmtNum(data.smsThisWeek)} icon="calendar-week" />
        </Col>
        <Col md={6} xxl={3}>
          <StatCard title="SMS This Month" value={fmtNum(data.smsThisMonth)} icon="calendar-alt" />
        </Col>
        <Col md={6} xxl={3}>
          <StatCard title="Total Companies" value={fmtNum(data.totalCompanies)} subtitle={data.growthRate} icon="building" />
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={6}>
          <TopListCard title="Best Companies" items={data.topCompanies} />
        </Col>
        <Col lg={6}>
          <TopListCard title="Customers per Company" items={data.customersPerCompany} />
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={6}>
          <CdrStatsCard stats={data.cdrStats} />
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="mb-3">Companies</h6>
              <div className="table-responsive">
                <Table className="mb-0 fs-10" borderless>
                  <thead className="text-700">
                    <tr>
                      <th>Company</th>
                      <th className="text-end">SMS (Month)</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(c => (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.name}</td>
                        <td className="text-end">{fmtNum(c.smsCount)}</td>
                        <td className="text-center">
                          <Badge bg={c.status === 'ACTIVE' ? 'soft-success' : 'soft-danger'}
                            className={c.status === 'ACTIVE' ? 'text-success' : 'text-danger'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Form.Check
                            type="switch"
                            id={`switch-${c.id}`}
                            checked={c.status === 'ACTIVE'}
                            disabled={togglingId === c.id}
                            onChange={() => handleToggleStatus(c)}
                            label=""
                            className="d-inline-block"
                          />
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-600 py-3">No companies</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

// ─── Company Admin Dashboard ───

const CompanyAdminDashboard = ({ data }) => (
  <>
    <Row className="g-3 mb-3">
      <Col lg={12}>
        <SmsVolumeChart totalSale={data.totalSale} />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col lg={6}>
        <AvatarListCard
          title="Recent Clients"
          items={data.recentAgents || data.topClients}
          hideValue
        />
      </Col>
      <Col lg={6}>
        <AvatarListCard title="Top SID" items={data.topSids} hideValue />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col lg={12}>
        <Card>
          <Card.Body>
            <Flex justifyContent="between" alignItems="center" className="mb-3">
              <h6 className="mb-0">Overview</h6>
            </Flex>
            <Row className="g-3">
              {[
                { label: 'CDR Reports', to: paths.smsCdrReports, icon: 'file-alt' },
                { label: 'Test Numbers', to: paths.smsTestListNumbers, icon: 'hashtag' },
                { label: 'Agents', to: paths.smsUsersAgents, icon: 'users' },
                { label: 'Billing Ranges', to: paths.smsCreateRanges, icon: 'layer-group' }
              ].map(item => (
                <Col sm={6} md={3} key={item.label}>
                  <Button as={Link} to={item.to} variant="falcon-default" className="w-100 text-start">
                    <FontAwesomeIcon icon={item.icon} className="me-2 text-primary" />
                    {item.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col md={4}>
        <StatCard title="Total Revenue" value={fmtMoney(data.totalRevenue)} icon="dollar-sign" />
      </Col>
      <Col md={4}>
        <StatCard title="Revenue Growth vs Last Month" value={data.growthRate || '0%'} icon="arrow-trend-up" />
      </Col>
      <Col md={4}>
        <StatCard
          title="New Clientssss"
          subtitle="Created this month"
          value={fmtNum(data.newCustomers ?? 0)}
          icon="user-plus"
        />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col md={4}>
        <StatCard title="SMS Today" value={fmtNum(data.smsToday)} icon="paper-plane" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS This Week" value={fmtNum(data.smsThisWeek)} icon="calendar-week" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS This Month" value={fmtNum(data.smsThisMonth)} icon="calendar-alt" />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col md={4}>
        <StatCard title="SMS Yesterday" value={fmtNum(data.smsYesterday)} icon="paper-plane" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS Last Week" value={fmtNum(data.smsLastWeek)} icon="calendar-minus" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS Last Month" value={fmtNum(data.smsLastMonth)} icon="calendar-times" />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col lg={4}>
        <AvatarListCard title="Top Ranges" items={data.topDestinations} hideValue />
      </Col>
      <Col lg={4}>
        <StatCard title="Net Profit" value={fmtMoney(data.netProfit)} icon="chart-line" />
      </Col>
      <Col lg={4}>
        <CdrStatsCard stats={data.cdrStats} />
      </Col>
    </Row>

    {/* <Row className="g-3 mb-3">
      <Col lg={6}>
        <AvatarListCard title="Recent Agents" items={data.recentAgents || []} />
      </Col>
      <Col lg={6}>
        <TopListCard
          title="Recent Billing Groups / Ranges"
          items={data.recentBillingGroups || data.recentBillingRanges || []}
        />
      </Col>
    </Row> */}
  </>
);

// ─── Client Dashboard ───

const ClientDashboard = ({ data }) => (
  <>
    <Row className="g-3 mb-3">
      <Col lg={12}>
        <SmsVolumeChart totalSale={data.totalSale} />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col md={4}>
        <StatCard title="SMS Today" value={fmtNum(data.smsToday)} icon="paper-plane" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS This Week" value={fmtNum(data.smsThisWeek)} icon="calendar-week" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS This Month" value={fmtNum(data.smsThisMonth)} icon="calendar-alt" />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col md={4}>
        <StatCard title="SMS Yesterday" value={fmtNum(data.smsYesterday)} icon="paper-plane" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS Last Week" value={fmtNum(data.smsLastWeek)} icon="calendar-minus" />
      </Col>
      <Col md={4}>
        <StatCard title="SMS Last Month" value={fmtNum(data.smsLastMonth)} icon="calendar-times" />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col lg={6}>
        <AvatarListCard title="Top Ranges" items={data.topDestinations} hideValue />
      </Col>
      <Col lg={6}>
        <CdrStatsCard stats={data.cdrStats} />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col md={6}>
        <StatCard title="Total Revenue" value={fmtMoney(data.totalRevenue)} icon="dollar-sign" />
      </Col>
      <Col md={6}>
        <StatCard title="Revenue Growth vs Last Month" value={data.growthRate || '0%'} icon="arrow-trend-up" />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col lg={12}>
        <AvatarListCard title="Top SID" items={data.topSids} hideValue />
      </Col>
    </Row>

    <Row className="g-3 mb-3">
      <Col lg={12}>
        <Card className="h-100">
          <Card.Body>
            <h6 className="mb-3">Overview</h6>
            <Row className="g-2">
              {[
                { label: 'Test Numbers', to: paths.smsTestListNumbers, icon: 'hashtag' },
                { label: 'CDR Test Numbers', to: paths.smsTestCdrs, icon: 'chart-line' }
              ].map(item => (
                <Col sm={6} key={item.label}>
                  <Button as={Link} to={item.to} variant="falcon-default" className="w-100 text-start">
                    <FontAwesomeIcon icon={item.icon} className="me-2 text-primary" />
                    {item.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </>
);

// ─── Main Dashboard Router ───

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = roles.includes('COMPANY_ADMIN') || roles.includes('COMPANY_USER') || roles.includes('COMPANY_FINANCE');
  const isClient = roles.includes('CLIENT_ADMIN') || roles.includes('CLIENT_USER') || roles.includes('CLIENT_FINANCE');

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await smsService.getDashboard();
      setData(res || {});
    } catch (e) {
      if (!silent) console.error('Failed to load dashboard', e);
      setData({});
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const d = data || {};

  if (isPlatformAdmin) return <PlatformAdminDashboard data={d} />;
  if (isClient) return <ClientDashboard data={d} />;
  if (isCompanyAdmin) return <CompanyAdminDashboard data={d} />;

  return (
    <Card className="py-5 text-center">
      <Card.Body>
        <h5 className="text-700">Welcome</h5>
        <p className="text-600">Your dashboard is being set up.</p>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;
