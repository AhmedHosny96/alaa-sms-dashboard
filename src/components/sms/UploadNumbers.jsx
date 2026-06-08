import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Row, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import paths from 'routes/paths';
import smsService from 'services/smsService';
import companyService from 'services/companyService';
import clientService from 'services/clientService';
import { getAuthUser, getTokenPayload, getUserResourceId } from 'components/authentication/authStorage';
import { extractNumbersFromCsvText } from 'utils/numberAssignmentInput';

const normalizeRoleName = (role) =>
  String(role || '')
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^PLATFORMADMIN$/, 'PLATFORM_ADMIN')
    .replace(/^COMPANYADMIN$/, 'COMPANY_ADMIN')
    .replace(/^COMPANYFINANCE$/, 'COMPANY_FINANCE');

const coalesceRoles = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return Object.values(raw);
  if (raw) return [raw];
  return [];
};

const UploadNumbers = () => {
  const location = useLocation();
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qsCompanyId = qs.get('companyId') || '';
  const qsClientId = qs.get('clientId') || '';
  const authUser = getAuthUser();
  const tokenPayload = getTokenPayload();
  const normalizedRoles = coalesceRoles(authUser?.roles ?? tokenPayload?.roles).map(normalizeRoleName);
  const isPlatformAdmin = normalizedRoles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = normalizedRoles.includes('COMPANY_ADMIN');
  const isCompanyRole = normalizedRoles.some((role) => role.startsWith('COMPANY_'));
  const canUpload = isPlatformAdmin || isCompanyAdmin;

  const resourceId = getUserResourceId() || tokenPayload?.resourceId || tokenPayload?.companyId || null;
  const companyContextId = resourceId ? String(resourceId) : '';

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [defaultCompanyId, setDefaultCompanyId] = useState('');
  const [clientOptions, setClientOptions] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [numberCategory, setNumberCategory] = useState('general');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);

  const companyId = isPlatformAdmin
    ? (selectedCompanyId || '')
    : isCompanyRole
      ? (companyContextId || defaultCompanyId || '')
      : '';

  const fetchCompanies = useCallback(async () => {
    try {
      if (isCompanyRole) {
        if (companyContextId) setDefaultCompanyId(companyContextId);
        const result = await companyService.list({ page: 0, size: 100 });
        const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
        if (list.length > 0) {
          const match = companyContextId ? list.find((c) => String(c?.id) === String(companyContextId)) : null;
          const resolved = match || list[0];
          setCompanies([resolved]);
          if (resolved?.id) setDefaultCompanyId(String(resolved.id));
          return;
        }
        if (companyContextId) {
          const company = await companyService.getById(companyContextId);
          if (company?.id) {
            setCompanies([company]);
            setDefaultCompanyId(String(company.id));
            return;
          }
        }
        setCompanies([]);
        setDefaultCompanyId('');
        return;
      }
      if (isPlatformAdmin) {
        const result = await companyService.list({ page: 0, size: 500 });
        const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
        setCompanies(list);
      }
    } catch {
      setCompanies([]);
    } finally {
      setLoadingContext(false);
    }
  }, [isCompanyRole, companyContextId, isPlatformAdmin]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (isCompanyRole && defaultCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(defaultCompanyId);
    }
  }, [isCompanyRole, defaultCompanyId, selectedCompanyId]);

  useEffect(() => {
    if (isPlatformAdmin && qsCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(qsCompanyId);
    }
  }, [isPlatformAdmin, qsCompanyId, selectedCompanyId]);

  useEffect(() => {
    let cancelled = false;
    const loadClients = async () => {
      if (!companyId) {
        setClientOptions([]);
        return;
      }
      try {
        const clientResult = await clientService.list(companyId, { page: 0, size: 2000 });
        const clients = Array.isArray(clientResult?.content)
          ? clientResult.content
          : Array.isArray(clientResult)
            ? clientResult
            : [];
        if (cancelled) return;
        setClientOptions(
          clients.map((item) => ({
            value: String(item.id ?? item.clientId ?? item.username ?? item.name),
            label: item.name || item.username || String(item.id ?? item.clientId)
          }))
        );
      } catch {
        if (!cancelled) setClientOptions([]);
      }
    };
    loadClients();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    if (qsClientId && !selectedClientId) {
      setSelectedClientId(qsClientId);
    }
  }, [qsClientId, selectedClientId]);

  const companySelectOptions = useMemo(
    () => companies.map((c) => ({ value: String(c.id), label: c.name || c.code || String(c.id) })),
    [companies]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUpload) {
      toast.error('Insufficient permissions');
      return;
    }
    if (!companyId) {
      toast.error('Select company');
      return;
    }
    if (!file) {
      toast.error('Select a CSV file');
      return;
    }
    setSubmitting(true);
    try {
      const text = await file.text();
      const numbers = extractNumbersFromCsvText(text);
      if (!numbers.length) {
        toast.error('No valid numbers found in CSV');
        return;
      }
      const res = await smsService.createNumbersBulk(
        {
          clientId: selectedClientId || null,
          msisdnList: numbers,
          inboundEnabled: true,
          category: numberCategory
        },
        { companyId }
      );
      const createdCount = Number(res?.createdCount ?? numbers.length);
      toast.success(`${createdCount} numbers created`);
      setFile(null);
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onFileChange = (ev) => {
    const f = ev.target.files?.[0] || null;
    setFile(f);
  };

  if (loadingContext) {
    return (
      <Container fluid className="py-3 d-flex justify-content-center">
        <Spinner animation="border" size="sm" className="me-2" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-0">Upload SMS Numbers</h2>
          <p className="text-700 mb-0">Bulk-assign numbers from a CSV via the IPRN SMS number pool API.</p>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          {!canUpload && (
            <Alert variant="warning" className="mb-3">
              Only platform or company admins can bulk-upload numbers.
              <Link to={paths.smsMyNumbers} className="ms-1">
                Manage My Numbers
              </Link>
              to review assignments.
            </Alert>
          )}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Upload instructions</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-0">
                <p className="mb-2">
                  Use a comma-separated file with numbers in the first column (optional header row: Number / MSISDN).
                  Rows are trimmed and deduplicated before assignment.
                </p>
                <p className="mb-0 small">
                  You can also add numbers from the&nbsp;
                  <Link to={paths.smsMyNumbers}>My Numbers</Link>&nbsp; screen (single, series, list, or CSV in the modal).
                </p>
              </Alert>
            </Card.Body>
          </Card>

          {canUpload && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Upload file</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {(isPlatformAdmin || isCompanyAdmin) && companySelectOptions.length > 0 && (
                    <Form.Group className="mb-3">
                      <Form.Label>Company</Form.Label>
                      <Form.Select
                        value={selectedCompanyId}
                        onChange={(ev) => {
                          setSelectedCompanyId(ev.target.value);
                          setSelectedClientId('');
                        }}
                        required
                      >
                        <option value="">Select company…</option>
                        {companySelectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label>Client (optional)</Form.Label>
                    <Form.Select
                      value={selectedClientId}
                      onChange={(ev) => setSelectedClientId(ev.target.value)}
                      disabled={!companyId}
                    >
                      <option value="">Unassigned</option>
                      {clientOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Number category</Form.Label>
                    <Form.Select
                      value={numberCategory}
                      onChange={(ev) => setNumberCategory(ev.target.value)}
                      disabled={submitting}
                    >
                      <option value="general">General SMS</option>
                      <option value="test">Test</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>CSV file</Form.Label>
                    <Form.Control type="file" accept=".csv,text/csv" disabled={submitting} onChange={onFileChange} />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={submitting || !companyId}>
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2 align-middle" />
                        Uploading…
                      </>
                    ) : (
                      'Upload numbers'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UploadNumbers;
