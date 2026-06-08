import React, { useMemo } from 'react';
import { Col, Row, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import LinePayment from './line-payment/LinePayment';
import SaasActiveUser from './SaasActiveUser';
import SaasRevenue from './SaasRevenue';
import SaasConversion from './SaasConversion';
import DepositeStatus from './DepositeStatus';
import StatisticsCards from './stats-cards/StatisticsCards';
import ActiveUsers from '../default/ActiveUsers';
import SharedFiles from '../default/SharedFiles';
import BandwidthSaved from '../default/BandwidthSaved';
import DoMoreCard from './DoMoreCard';
import TransactionSummary from './TransactionSummary';
import GrossRevenue from './gross-revenue/GrossRevenue';
import TotalSales from '../e-commerce/totalsales/TotalSales';
import { getAuthUser } from 'components/authentication/authStorage';
import paths from 'routes/paths';
import useSmsDashboard from 'hooks/useSmsDashboard';
import { buildSmsDashboardView, formatCompactCount } from './dashboardViewModel';

const OverviewCard = ({ items }) => (
  <Card className="h-100">
    <Card.Body>
      <h6 className="mb-3">Overview</h6>
      <Row className="g-2">
        {items.map(item => (
          <Col sm={6} key={item.label}>
            <Button as={Link} to={item.to} variant="falcon-default" className="w-100 text-start">
              {item.label}
            </Button>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
);

const Saas = () => {
  const { data } = useSmsDashboard();
  const vm = useMemo(() => buildSmsDashboardView(data), [data]);

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isCompany =
    roles.includes('COMPANY_ADMIN') ||
    roles.includes('COMPANY_USER') ||
    roles.includes('COMPANY_FINANCE');
  const isClient =
    roles.includes('CLIENT_ADMIN') ||
    roles.includes('CLIENT_USER') ||
    roles.includes('CLIENT_FINANCE');

  if (isClient) {
    return (
      <>
        <Row className="g-3 mb-3">
          <Col xxl={8}>
            <StatisticsCards stats={vm.primaryStatsCards} />
          </Col>
          <Col xxl={4}>
            <SaasRevenue title="Total Revenue" revenueCard={vm.revenueCard} />
          </Col>
        </Row>

        <Row className="g-3 mb-3">
          <Col xxl={9}>
            <LinePayment
              data={vm.linePayment.chart}
              title={vm.linePayment.title}
              subtitle={vm.linePayment.subtitle}
              subtitleValue={vm.linePayment.subtitleValue}
            />
          </Col>
          <Col xxl={3}>
            <ActiveUsers
              className="h-100"
              users={vm.topSidsUsers}
              end={5}
              title="Top SID"
            //  footerTitle="All SIDs"
              footerTo={paths.smsCdrReports}
            />
          </Col>
        </Row>

        <Row className="g-3 mb-3">
          <Col lg={6}>
            <ActiveUsers
              users={vm.topDestinationUsers}
              end={7}
              title="Top Destination"
              footerTitle="All destinations"
              footerTo={paths.smsCdrReports}
            />
          </Col>
          <Col lg={6}>
            <StatisticsCards stats={vm.comparisonStatsCards} />
            <TotalSales
              volume={vm.totalSaleVolume}
              title="Total SMS Volume"
            />
          </Col>
        </Row>

        <Row className="g-3">
          <Col xs={12}>
            <OverviewCard
              items={[
                { label: 'Test Numbers', to: paths.smsTestListNumbers },
                { label: 'CDR Test Numbers', to: paths.smsTestCdrs }
              ]}
            />
          </Col>
        </Row>
      </>
    );
  }

  if (isCompany) {
    return (
      <>
        <Row className="g-3 mb-3">
          <Col xxl={9}>
            <LinePayment
              data={vm.linePayment.chart}
              title={vm.linePayment.title}
              subtitle={vm.linePayment.subtitle}
              subtitleValue={vm.linePayment.subtitleValue}
            />
          </Col>
          <Col>
            <Row className="g-3">
              <Col md={4} xxl={12}>
                <SaasRevenue title="Total Revenue" revenueCard={vm.revenueCard} />
              </Col>
              <Col md={4} xxl={12}>
                <SaasConversion
                  title="Revenue Growth"
                  deliveryCard={vm.deliveryCard}
                />
              </Col>
              <Col md={4} xxl={12}>
                <SaasActiveUser
                  data={vm.newCustomersSparkline}
                  title="New Clients"
                  totalLabel={formatCompactCount(vm.newCustomersTotal)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="g-3 mb-3">
          <Col xs={12}>
            <StatisticsCards stats={vm.primaryStatsCards} />
          </Col>
          <Col xs={12}>
            <StatisticsCards stats={vm.comparisonStatsCards} />
            <TotalSales
              volume={vm.totalSaleVolume}
              title="Total SMS Volume"
            />
          </Col>
        </Row>
        <Row className="g-3 align-items-stretch mb-3">
          <Col xs={12} lg={4}>
            <ActiveUsers
              className="h-100"
              users={vm.topCustomersUsers}
              end={7}
              title="Top Clients"
              footerTitle="All clients"
              footerTo={paths.smsClientsList}
            />
          </Col>
          <Col xs={12} lg={4}>
            <ActiveUsers
              className="h-100"
              users={vm.topDestinationUsers}
              end={7}
              title="Top Destinations"
              footerTitle="All ranges"
              footerTo={paths.smsCdrReports}
            />
          </Col>
          <Col xs={12} lg={4}>
            <Row className="g-3 h-100">
              <Col sm={6} lg={12}>
                <ActiveUsers
                  className="h-100"
                  users={vm.topSidsUsers}
                  end={5}
                  title="Top SID"
                  //footerTitle="All SIDs"
                 // footerTo={paths.smsCdrReports}
                />
              </Col>
              <Col sm={6} lg={12}>
                <GrossRevenue
                  className="h-100"
                  data={vm.grossRevenue}
                  title="Net Profit"
                  grossHeader={vm.grossHeader}
                  tableRows={vm.grossTableRows}
                />
              </Col>
              {/* <Col xs={12}>
                <OverviewCard
                  items={[
                    { label: 'Recent Clients', to: paths.smsUsersAgents },
                    { label: 'Recent Billing Groups/Ranges', to: paths.smsCreateRanges }
                  ]}
                />
              </Col> */}
            </Row>
          </Col>
        </Row>
        <ActiveUsers
          users={vm.recentAgentsUsers}
          end={7}
          title="Recent Clients"
          footerTitle="All clients"
          footerTo={paths.smsClientsList}
        />
      </>
    );
  }

  return (
    <>
      <Row className="g-3 mb-3">
        <Col xxl={9}>
          <LinePayment
            data={vm.linePayment.chart}
            title={vm.linePayment.title}
            subtitle={vm.linePayment.subtitle}
            subtitleValue={vm.linePayment.subtitleValue}
          />
        </Col>
        <Col>
          <Row className="g-3">
            <Col md={4} xxl={12}>
              <SaasActiveUser
                data={vm.newCustomersSparkline}
                totalLabel={formatCompactCount(vm.newCustomersTotal)}
              />
            </Col>
            <Col md={4} xxl={12}>
              <SaasRevenue revenueCard={vm.revenueCard} />
            </Col>
            <Col md={4} xxl={12}>
              <SaasConversion deliveryCard={vm.deliveryCard} />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="g-3 mb-3">
        <Col xs={12}>
          <DepositeStatus html={vm.depositBanner} />
        </Col>
        <Col xs={12}>
          <StatisticsCards stats={vm.primaryStatsCards} />
        </Col>
        <Col xs={12}>
          <StatisticsCards stats={vm.comparisonStatsCards} />
          <TotalSales
            volume={vm.totalSaleVolume}
            title="Total SMS Volume"
          />
        </Col>
      </Row>
      <Row className="g-3 align-items-stretch mb-3">
        <Col xs={12} lg={4}>
          <ActiveUsers
            className="h-100"
            users={vm.topCustomersUsers}
            end={7}
            title="Top Client"
            footerTitle="All clients"
          />
        </Col>
        <Col xs={12} lg={4}>
          <GrossRevenue
            className="h-100"
            data={vm.grossRevenue}
            grossHeader={vm.grossHeader}
            tableRows={vm.grossTableRows}
          />
        </Col>
        <Col xs={12} lg={4}>
          <Row className="g-3 h-100">
            <Col sm={6} lg={12}>
              <SharedFiles
                files={vm.topSidsFiles}
                title="Top SID"
                viewAllText="View all"
                className="h-100"
              />
            </Col>
            <Col sm={6} lg={12}>
              <BandwidthSaved
                title="SMS Delivery Health"
                gaugeValue={vm.deliveryGauge ?? undefined}
                savedLabel={vm.bandwidthSub ?? undefined}
                totalLabel={vm.bandwidthTotal ?? undefined}
              />
            </Col>
            <Col xs={12}>
              <DoMoreCard />
            </Col>
          </Row>
        </Col>
      </Row>
      <TransactionSummary data={vm.transactions} />
    </>
  );
};

export default Saas;
