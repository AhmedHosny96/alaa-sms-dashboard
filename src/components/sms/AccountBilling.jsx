import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Modal, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import BillingProfileFormModal from 'components/sms/forms/BillingProfileFormModal';
import IconButton from 'components/common/IconButton';
import { getAuthUser } from 'components/authentication/authStorage';
import accountService from 'services/accountService';
import companyService from 'services/companyService';
import { exportRowsByType } from 'utils/tableExport';
import { toast } from 'react-toastify';

const formatMoney = (amount, currencyCode) => {
  const n = amount === undefined || amount === null ? NaN : Number(amount);
  if (!Number.isFinite(n)) return '—';
  const c = (currencyCode || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
};

const AccountBilling = () => {
  const user = getAuthUser();
  const isPlatformAdmin = user?.roles?.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = user?.roles?.includes('COMPANY_ADMIN');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState('');
  const [profileModalShow, setProfileModalShow] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [defaultCompanyId, setDefaultCompanyId] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [profileRecord, setProfileRecord] = useState(null);

  const selectedTenantId = isPlatformAdmin
    ? selectedCompanyId || ''
    : isCompanyAdmin
      ? defaultCompanyId || ''
      : '';

  const companyIdParam = isPlatformAdmin && selectedTenantId ? selectedTenantId : undefined;

  const groupBy = billingCycle === 'Weekly' ? 'week' : 'month';

  const loadCompanies = useCallback(async () => {
    try {
      if (isCompanyAdmin && user?.resourceId) {
        const company = await companyService.getById(user.resourceId);
        const list = company?.id ? [company] : [];
        setCompanies(list);
        setDefaultCompanyId(company?.id ? String(company.id) : '');
        return;
      }
      if (isPlatformAdmin) {
        const result = await companyService.list({ page: 0, size: 500 });
        const list = Array.isArray(result?.content) ? result.content : [];
        setCompanies(list);
        if (list.length) {
          setSelectedCompanyId((prev) => prev || String(list[0].id));
        }
        return;
      }
      setDefaultCompanyId(user?.resourceId ? String(user.resourceId) : '');
    } catch {
      setCompanies([]);
    }
  }, [isCompanyAdmin, isPlatformAdmin, user?.resourceId]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (isCompanyAdmin && defaultCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(defaultCompanyId);
    }
  }, [isCompanyAdmin, defaultCompanyId, selectedCompanyId]);

  const loadSummary = useCallback(async () => {
    if (isPlatformAdmin && !selectedTenantId) {
      setSummary(null);
      setSummaryLoading(false);
      return;
    }
    setSummaryLoading(true);
    try {
      const s = await accountService.getBillingSummary(companyIdParam);
      setSummary(s);
    } catch (e) {
      toast.error(e.message || 'Failed to load summary');
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [companyIdParam, isPlatformAdmin, selectedTenantId]);

  const loadInvoices = useCallback(async () => {
    if (isPlatformAdmin && !selectedTenantId) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const list = await accountService.getBillingInvoices(companyIdParam, groupBy);
      setData(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e.message || 'Failed to load invoices');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companyIdParam, groupBy, isPlatformAdmin, selectedTenantId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const onProfileSubmit = useCallback(
    async (values) => {
      if (isPlatformAdmin && !selectedTenantId) return;
      const payload = {
        billingName: values.billingName || null,
        billingEmail: values.billingEmail || null,
        billingAddress: values.billingAddress || null,
        taxId: values.taxId || null,
        paymentMethod: values.paymentMethod || null,
        billingCyclePref: values.billingCycle || null,
        currency: values.currency || null
      };
      try {
        await accountService.updateSettings(payload, companyIdParam);
        toast.success('Billing profile updated');
        await loadSummary();
        setProfileModalShow(false);
      } catch (e) {
        toast.error(e.message || 'Failed to save billing profile');
      }
    },
    [companyIdParam, isPlatformAdmin, loadSummary, selectedTenantId]
  );

  const [viewInvoice, setViewInvoice] = useState(null);
  const onView = (record) => setViewInvoice(record || null);
  const onDownload = (record) => {
    if (!record) return;
    const rows = [
      {
        'Invoice #': record.invoice ?? '-',
        Period: record.period ?? '-',
        Amount: formatMoney(record.amount, summary?.currency),
        Status: record.status ?? '-',
        'Due Date': record.dueDate ?? '-',
        'Paid Date': record.paidDate ?? '-'
      }
    ];
    exportRowsByType({
      type: 'pdf',
      title: `Invoice ${record.invoice || ''}`.trim(),
      filenamePrefix: `invoice-${(record.invoice || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      columns: ['Invoice #', 'Period', 'Amount', 'Status', 'Due Date', 'Paid Date'],
      rows
    });
  };

  const cur = summary?.currency || 'USD';

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.invoice, row.period, row.status, row.dueDate, row.paidDate]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'invoice',
        header: 'Invoice #',
        meta: { headerProps: { className: 'text-900' } },
        cell: ({ row: { original } }) => original?.invoice ?? '-'
      },
      {
        accessorKey: 'period',
        header: 'Period',
        meta: { headerProps: { className: 'text-900' } },
        cell: ({ row: { original } }) => original?.period ?? '-'
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        meta: {
          headerProps: { className: 'text-900 text-end' },
          cellProps: { className: 'text-end' }
        },
        cell: ({ row: { original } }) => formatMoney(original?.amount, cur)
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { headerProps: { className: 'text-900' } },
        cell: ({ row: { original } }) => original?.status ?? '-'
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        meta: { headerProps: { className: 'text-900' } },
        cell: ({ row: { original } }) => original?.dueDate ?? '-'
      },
      {
        accessorKey: 'paidDate',
        header: 'Paid Date',
        meta: { headerProps: { className: 'text-900' } },
        cell: ({ row: { original } }) => original?.paidDate ?? '-'
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerProps: { className: 'text-900 text-center' },
          cellProps: { className: 'text-center' }
        },
        cell: ({ row: { original } }) => (
          <div className="d-inline-flex align-items-center">
            <IconButton
              variant="falcon-default"
              size="sm"
              icon="eye"
              transform="shrink-3"
              className="me-2 text-primary shadow-none"
              title="View"
              onClick={() => onView(original)}
            />
            <IconButton
              variant="falcon-default"
              size="sm"
              icon="download"
              transform="shrink-3"
              className="text-danger shadow-none"
              title="Download"
              onClick={() => onDownload(original)}
            />
          </div>
        )
      }
    ],
    [cur, summary?.currency]
  );

  const companyFilterOptions = useMemo(
    () => companies.map((c) => ({ value: String(c.id), label: c.name || c.code || c.id })),
    [companies]
  );

  const exportColumns = useMemo(
    () => ['Invoice #', 'Period', 'Amount', 'Status', 'Due Date', 'Paid Date'],
    []
  );

  const exportRows = useMemo(
    () =>
      filteredData.map((row) => ({
        'Invoice #': row.invoice ?? '-',
        Period: row.period ?? '-',
        Amount: formatMoney(row.amount, summary?.currency),
        Status: row.status ?? '-',
        'Due Date': row.dueDate ?? '-',
        'Paid Date': row.paidDate ?? '-'
      })),
    [filteredData, summary?.currency]
  );

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    sortable: true,
    pagination: true,
    perPage: 25,
    perPageOptions: [25, 50, 100, 500,1000,5000]
  });

  return (
    <>
      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-700">This month (MTD)</h6>
              {summaryLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3 className="text-primary mb-0">{formatMoney(summary?.monthToDate, summary?.currency)}</h3>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-700">Previous month</h6>
              {summaryLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3 className="text-success mb-0">{formatMoney(summary?.previousMonth, summary?.currency)}</h3>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-700">Lifetime spend</h6>
              {summaryLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3 className="text-info mb-0">{formatMoney(summary?.lifetime, summary?.currency)}</h3>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Client Billing</h5>
                {loading && <Spinner animation="border" size="sm" className="ms-2" />}
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div
                  className="d-flex align-items-center flex-nowrap gap-2"
                  style={{ overflowX: 'auto', overflowY: 'visible' }}
                >
                  {/* <Button
                    variant="primary"
                    size="sm"
                    className="table-page-addButton"
                    onClick={openProfile}
                    disabled={isPlatformAdmin && !selectedTenantId}
                  >
                    <FontAwesomeIcon icon="edit" className="me-1" />
                    Update Billing Profile
                  </Button> */}
                  <ButtonGroup size="sm" className="flex-shrink-0">
                    <Button
                      variant={billingCycle === 'Weekly' ? 'primary' : 'outline-primary'}
                      onClick={() => setBillingCycle('Weekly')}
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={billingCycle === 'Monthly' ? 'primary' : 'outline-primary'}
                      onClick={() => setBillingCycle('Monthly')}
                    >
                      Monthly
                    </Button>
                  </ButtonGroup>
                  {/* {(isPlatformAdmin || isCompanyAdmin) && companyFilterOptions.length > 0 && (
                    <TableSelectFilter
                      className="table-page-filter flex-shrink-0"
                      value={selectedCompanyId}
                      placeholder="Company"
                      onChange={(value) => setSelectedCompanyId(value || '')}
                      options={companyFilterOptions}
                    />
                  )} */}
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    label="Export"
                    onExport={(type) =>
                      exportRowsByType({
                        type,
                        title: 'Account Billing',
                        filenamePrefix: 'account-billing',
                        columns: exportColumns,
                        rows: exportRows
                      })
                    }
                  />
                  <TableSearchInput
                    className="table-page-filter"
                    value={query}
                    onChange={setQuery}
                    placeholder="search ..."
                  />
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0 position-relative">
            {loading && (
              <div
                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-light bg-opacity-75"
                style={{ zIndex: 5 }}
              >
                <Spinner animation="border" size="sm" className="me-2" />
                Loading invoices...
              </div>
            )}
            <AdvanceTable
              headerClassName="bg-200 text-nowrap align-middle"
              rowClassName="align-middle white-space-nowrap"
              tableProps={{
                size: 'sm',
                striped: true,
                className: 'fs-10 mb-0 overflow-hidden'
              }}
            />
          </Card.Body>
          <Card.Footer>
            <AdvanceTableFooter
              rowsPerPageSelection
              navButtons
              rowInfo
              rowsPerPageOptions={[25, 50, 100, 250]}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <BillingProfileFormModal
        show={profileModalShow}
        onClose={() => setProfileModalShow(false)}
        onSubmit={onProfileSubmit}
        record={profileRecord}
      />

      <Modal show={!!viewInvoice} onHide={() => setViewInvoice(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-9">Invoice {viewInvoice?.invoice || ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewInvoice ? (
            <dl className="row mb-0 fs-10">
              <dt className="col-4 text-700">Invoice #</dt>
              <dd className="col-8">{viewInvoice.invoice ?? '-'}</dd>
              <dt className="col-4 text-700">Period</dt>
              <dd className="col-8">{viewInvoice.period ?? '-'}</dd>
              <dt className="col-4 text-700">Amount</dt>
              <dd className="col-8 fw-semibold">{formatMoney(viewInvoice.amount, summary?.currency)}</dd>
              <dt className="col-4 text-700">Status</dt>
              <dd className="col-8">{viewInvoice.status ?? '-'}</dd>
              <dt className="col-4 text-700">Due Date</dt>
              <dd className="col-8">{viewInvoice.dueDate ?? '-'}</dd>
              <dt className="col-4 text-700">Paid Date</dt>
              <dd className="col-8">{viewInvoice.paidDate ?? '-'}</dd>
            </dl>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setViewInvoice(null)}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (viewInvoice) onDownload(viewInvoice);
            }}
          >
            <FontAwesomeIcon icon="download" className="me-1" />
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AccountBilling;
