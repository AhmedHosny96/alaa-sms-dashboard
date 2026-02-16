import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const REQUEST_COLUMNS = (onView, onApprove, onReject) => [
  { title: 'Request #', dataIndex: 'requestId', key: 'requestId' },
  { title: 'Company', dataIndex: 'company', key: 'company' },
  { title: 'Client', dataIndex: 'client', key: 'client' },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: 'Method', dataIndex: 'method', key: 'method' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
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
          variant="success"
          size="sm"
          className="p-0 px-2"
          onClick={() => onApprove(record)}
          title="Approve"
        >
          <FontAwesomeIcon icon="check" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="p-0 px-2"
          onClick={() => onReject(record)}
          title="Reject"
        >
          <FontAwesomeIcon icon="times" />
        </Button>
      </div>
    )
  }
];

const PaymentRequests = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    return [start, end];
  });

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  const companyOptions = [
    { value: 'company-a', label: 'Company A' },
    { value: 'company-b', label: 'Company B' }
  ];
  const clientOptions = [
    { value: 'client-1', label: 'Client 1' },
    { value: 'client-2', label: 'Client 2' }
  ];

  const columns = useMemo(() => REQUEST_COLUMNS(() => {}, () => {}, () => {}), []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (filterCompany) list = list.filter((row) => String(row.company) === String(filterCompany));
    if (filterClient) list = list.filter((row) => String(row.client) === String(filterClient));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.requestId, row.company, row.client, row.amount, row.method, row.status, row.date]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterStatus, filterCompany, filterClient, query]);

  return (
    <TablePageLayout
      title="Payment Requests"
      subtitle="Review and process payment requests."
      toolbar={
        <>
          <TableDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="table-page-filter table-page-date-range"
            placeholder="Date Range"
          />
          <TableSelectFilter
            className="table-page-filter"
            value={filterStatus}
            placeholder="Status"
            onChange={(value) => setFilterStatus(value)}
            options={statusOptions}
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
            value={filterClient}
            placeholder="Client"
            onChange={(value) => setFilterClient(value)}
            options={clientOptions}
          />
          <TableExportSelect
            onExport={(type) => {
              if (type === 'print') window.print();
            }}
          />
          <Search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search ..."
            className="table-page-search"
          />
        </>
      }
    >
      <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.requestId} />
    </TablePageLayout>
  );
};

export default PaymentRequests;
