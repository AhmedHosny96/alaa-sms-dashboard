import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { UseModal, UseSelect } from 'components/common/UseTable';
import { UseInput } from 'components/common/Form';
import smsService from 'services/smsService';
import { toast } from 'react-toastify';

const paymentTermOptions = [
  { id: '1/1', name: '1/1' },
  { id: '7/1', name: '7/1' },
  { id: '7/7', name: '7/7' },
  { id: '15/15', name: '15/15' },
  { id: '15/30', name: '15/30' },
  { id: '30/15', name: '30/15' },
  { id: '30/30', name: '30/30' },
  { id: '30/45', name: '30/45' },
  { id: '30/60', name: '30/60' }
];

const AssignNumberPanel = ({
  show,
  onHide,
  assignment,
  clientOptions = [],
  companyId,
  onAssigned
}) => {
  const [clientId, setClientId] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [clientPayout, setClientPayout] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);

  const routeId = assignment?.rangeId || null;

  useEffect(() => {
    if (!show) return;
    setClientId(assignment?.clientId || '');
    setPaymentTerm(assignment?.paymentTerm || '');
    setClientPayout(assignment?.agentPayout ?? assignment?.clientPayout ?? '');
    setPricing([]);
  }, [show, assignment]);

  const fetchPricing = useCallback(async () => {
    if (!companyId || !routeId) {
      setPricing([]);
      return;
    }
    setPricingLoading(true);
    try {
      const result = await smsService.getRoutePricing(companyId, routeId);
      setPricing(Array.isArray(result) ? result : []);
    } catch {
      setPricing([]);
    } finally {
      setPricingLoading(false);
    }
  }, [companyId, routeId]);

  useEffect(() => {
    if (show) {
      fetchPricing();
    }
  }, [show, fetchPricing]);

  const handleAssign = async () => {
    if (!assignment?.id) return;
    if (!companyId) {
      toast.error('Company context is required');
      return;
    }
    if (!clientId) {
      toast.error('Select a client');
      return;
    }
    setSubmitting(true);
    try {
      await smsService.bulkAssignNumbers(
        {
          assignmentIds: [assignment.id],
          clientId,
          paymentTerm: paymentTerm || null,
          clientPayout: clientPayout !== '' ? Number(clientPayout) : null
        },
        { companyId }
      );
      toast.success('Number assigned');
      onAssigned?.();
    } catch (e) {
      toast.error(e.message || 'Failed to assign number');
    } finally {
      setSubmitting(false);
    }
  };

  const numberLabel = assignment?.msisdn || assignment?.number || assignment?.id || '';

  return (
    <UseModal
      title={`Assign Number ${numberLabel}`}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onHide}
      size="lg"
      footer={[
        <Button key="close" variant="secondary" size="sm" onClick={onHide} disabled={submitting}>
          Close
        </Button>
      ]}
    >
      <Row className="g-3">
        <Col md={12}>
          <Card className="range-form-card">
            <Card.Header className="range-form-card-header">
              <div>
                <h6 className="mb-0">Assign to Customer</h6>
                <small className="text-700">Select a client and set payout details.</small>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <UseSelect
                    name="clientId"
                    label="Select Client"
                    options={clientOptions}
                    value={clientId}
                    onChange={(value) => setClientId(value || '')}
                    placeholder="Search client..."
                    showSearch
                  />
                </Col>
                <Col md={6}>
                  <UseSelect
                    name="paymentTerm"
                    label="Payment Term"
                    options={paymentTermOptions}
                    value={paymentTerm}
                    onChange={(value) => setPaymentTerm(value || '')}
                    placeholder=""
                  />
                </Col>
                <Col md={6}>
                  <UseInput
                    name="clientPayout"
                    label="Client Payout"
                    type="number"
                    min={0}
                    step={0.001}
                    value={clientPayout}
                    onChange={(e) => setClientPayout(e.target.value)}
                    placeholder="0.000"
                  />
                </Col>
                <Col md={6} className="d-flex align-items-end mb-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAssign}
                    disabled={submitting || !clientId}
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Assigning...
                      </>
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="range-form-card">
            <Card.Header className="range-form-card-header">
              <div>
                <h6 className="mb-0">Price List</h6>
                <small className="text-700">Pricing for this number's route.</small>
              </div>
            </Card.Header>
            <Card.Body>
              {!routeId ? (
                <div className="text-700 fs--1">No route assigned</div>
              ) : pricingLoading ? (
                <div className="d-flex align-items-center gap-2">
                  <Spinner animation="border" size="sm" />
                  Loading pricing...
                </div>
              ) : pricing.length === 0 ? (
                <div className="text-700 fs--1">No pricing found for this route</div>
              ) : (
                <Table size="sm" striped className="fs-10 mb-0">
                  <thead className="bg-200 text-nowrap">
                    <tr>
                      <th className="text-900">Country</th>
                      <th className="text-900">Brand</th>
                      <th className="text-900">Direction</th>
                      <th className="text-900">Price</th>
                      <th className="text-900">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.country || '—'}</td>
                        <td>{row.brand || '—'}</td>
                        <td>{row.direction || '—'}</td>
                        <td>{row.unitPriceClient ?? '—'}</td>
                        <td>{row.unitCostVendor ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </UseModal>
  );
};

export default AssignNumberPanel;
