import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import smsService from 'services/smsService';

const DELIVERED_KEYS = ['DELIVERED_HANDSET', 'DELIVERED_OPERATOR'];

const computeSuccessRate = (cdrStats) => {
  if (!cdrStats || typeof cdrStats !== 'object') return null;
  const entries = Object.entries(cdrStats);
  if (!entries.length) return null;
  let delivered = 0;
  let total = 0;
  entries.forEach(([key, value]) => {
    const num = Number(value) || 0;
    total += num;
    if (DELIVERED_KEYS.includes(String(key).toUpperCase())) {
      delivered += num;
    }
  });
  if (total <= 0) return null;
  return ((delivered / total) * 100).toFixed(1);
};

const KpiCard = ({ title, value, loading, textClass, suffix }) => (
  <Card className="h-100">
    <Card.Body>
      <h6 className="text-700">{title}</h6>
      <h3 className={`mb-0 ${textClass}`}>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            {value}
            {suffix || ''}
          </>
        )}
      </h3>
    </Card.Body>
  </Card>
);

const AccountOverview = () => {
  const [loading, setLoading] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);
  const [activeProviders, setActiveProviders] = useState(0);
  const [activeNumbers, setActiveNumbers] = useState(0);
  const [successRate, setSuccessRate] = useState('0%');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = (await smsService.getDashboard().catch(() => null)) || {};

        if (cancelled) return;
        const messages = data.smsThisMonth ?? data.smsToday ?? 0;
        setTotalMessages(Number(messages) || 0);

        if (data.providersActive != null) {
          setActiveProviders(Number(data.providersActive) || 0);
        } else {
          try {
            const provRes = await smsService.listProviderOptions();
            const list = provRes?.data || provRes || [];
            if (!cancelled) setActiveProviders(Array.isArray(list) ? list.length : 0);
          } catch {
            if (!cancelled) setActiveProviders(0);
          }
        }

        if (data.numbersActive != null) {
          setActiveNumbers(Number(data.numbersActive) || 0);
        } else {
          try {
            const numRes = await smsService.listNumbers({ size: 1 });
            const payload = numRes?.data || numRes || {};
            const total =
              typeof payload.totalElements === 'number'
                ? payload.totalElements
                : Array.isArray(payload?.content)
                  ? payload.content.length
                  : 0;
            if (!cancelled) setActiveNumbers(total);
          } catch {
            if (!cancelled) setActiveNumbers(0);
          }
        }

        const rate = computeSuccessRate(data.cdrStats);
        if (!cancelled) setSuccessRate(rate == null ? '0%' : `${rate}%`);
      } catch {
        if (!cancelled) {
          setTotalMessages(0);
          setActiveProviders(0);
          setActiveNumbers(0);
          setSuccessRate('0%');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-0">Account Overview</h2>
          <p className="text-700 mb-0">
            Summary of your account status and key metrics.
          </p>
        </Col>
      </Row>
      <Row className="g-3">
        <Col md={3}>
          <KpiCard
            title="Total Messages"
            value={Number(totalMessages).toLocaleString()}
            loading={loading}
            textClass="text-primary"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            title="Active Providers"
            value={Number(activeProviders).toLocaleString()}
            loading={loading}
            textClass="text-info"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            title="Active Numbers"
            value={Number(activeNumbers).toLocaleString()}
            loading={loading}
            textClass="text-warning"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            title="Success Rate"
            value={successRate}
            loading={loading}
            textClass="text-success"
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-700 mb-0">Open Reports & Stats for detailed activity.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountOverview;
