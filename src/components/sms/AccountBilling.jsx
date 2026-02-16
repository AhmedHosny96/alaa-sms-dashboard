import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import BillingProfileFormModal from 'components/sms/forms/BillingProfileFormModal';

const BILLING_COLUMNS = (onView, onDownload) => [
  { title: 'Invoice #', dataIndex: 'invoice', key: 'invoice' },
  { title: 'Period', dataIndex: 'period', key: 'period' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
  { title: 'Paid Date', dataIndex: 'paidDate', key: 'paidDate' },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <div className="d-flex justify-content-center gap-1">
        <Button
          variant="primary"
          size="sm"
          className="p-0 px-2"
          onClick={() => onView(record)}
          title="View"
        >
          <FontAwesomeIcon icon="eye" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="p-0 px-2"
          onClick={() => onDownload(record)}
          title="Download"
        >
          <FontAwesomeIcon icon="download" />
        </Button>
      </div>
    )
  }
];

const AccountBilling = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [profileModalShow, setProfileModalShow] = useState(false);
  const [filterProvider, setFilterProvider] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterAgent, setFilterAgent] = useState('');

  const providerOptions = [
    { value: 'provider-1', label: 'Provider 1' },
    { value: 'provider-2', label: 'Provider 2' }
  ];
  const companyOptions = [
    { value: 'company-a', label: 'Company A' },
    { value: 'company-b', label: 'Company B' }
  ];
  const agentOptions = [
    { value: 'agent-1', label: 'Agent 1' },
    { value: 'agent-2', label: 'Agent 2' }
  ];

  const columns = useMemo(() => BILLING_COLUMNS(() => {}, () => {}), []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterCompany) list = list.filter((row) => String(row.company) === String(filterCompany));
    if (filterAgent) list = list.filter((row) => String(row.agent) === String(filterAgent));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [
          row.invoice,
          row.period,
          row.amount,
          row.status,
          row.dueDate,
          row.paidDate,
          row.provider,
          row.company,
          row.agent
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterCompany, filterAgent, query]);

  return (
    <>
      <TablePageLayout
        title="Client Billing"
        subtitle="Review invoices and manage billing profile."
        topContent={
          <>
            <Row className="g-3 mb-2">
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h6 className="text-700">Current Balance</h6>
                    <h3 className="text-primary mb-0">$0.00</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h6 className="text-700">This Month</h6>
                    <h3 className="text-success mb-0">$0.00</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h6 className="text-700">Total Spent</h6>
                    <h3 className="text-info mb-0">$0.00</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        }
        toolbar={
          <>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <TableSelectFilter
                className="table-page-filter"
                value={filterProvider}
                placeholder="Provider"
                onChange={(value) => setFilterProvider(value)}
                options={providerOptions}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterCompany}
                placeholder="Company"
                onChange={(value) => setFilterCompany(value)}
                options={companyOptions}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterAgent}
                placeholder="Agent"
                onChange={(value) => setFilterAgent(value)}
                options={agentOptions}
              />
              <Button
                variant="primary"
                size="sm"
                className="table-page-addButton"
                onClick={() => setProfileModalShow(true)}
              >
                <FontAwesomeIcon icon="edit" className="me-1" />
                Update Billing Profile
              </Button>
              <TableExportSelect
                onExport={(type) => {
                  if (type === 'print') window.print();
                }}
              />
            </div>
            <Search
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search ..."
              className="table-page-search"
            />
          </>
        }
      >
        <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.invoice} />
      </TablePageLayout>

      <BillingProfileFormModal
        show={profileModalShow}
        onClose={() => setProfileModalShow(false)}
        onSubmit={() => setProfileModalShow(false)}
      />
    </>
  );
};

export default AccountBilling;
