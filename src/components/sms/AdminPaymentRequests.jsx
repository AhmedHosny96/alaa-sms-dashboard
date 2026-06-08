import React, { useMemo, useState } from 'react';
import TableSearchInput from 'components/common/TableSearchInput';
import IconButton from 'components/common/IconButton';
import TablePageLayout from 'components/common/TablePageLayout';
import { UseTable, TableSelectFilter, TableExportSelect } from 'components/common/UseTable';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';

const ADMIN_REQUEST_COLUMNS = [
  { title: 'Request #', dataIndex: 'requestId', key: 'requestId' },
  { title: 'Client', dataIndex: 'client', key: 'client' },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: 'Method', dataIndex: 'method', key: 'method' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Actions', dataIndex: 'actions', key: 'actions', align: 'right' }
];

const AdminPaymentRequests = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
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

  const clientOptions = [
    { value: 'client-1', label: 'Client 1' },
    { value: 'client-2', label: 'Client 2' }
  ];

  const columns = useMemo(() => ADMIN_REQUEST_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (filterClient) list = list.filter((row) => String(row.client) === String(filterClient));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.requestId, row.client, row.date, row.amount, row.method, row.status]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterStatus, filterClient, query]);

  return (
    <TablePageLayout
      title="Admin Payment Requests"
      subtitle="Review and process client payment requests (Admin Only)."
      toolbar={
        <>
          <IconButton
            variant="primary"
            size="sm"
            icon="plus"
            transform="shrink-3"
            title="New"
          >
            <span className="d-none d-sm-inline-block ms-1">New</span>
          </IconButton>
          <AdvanceTableDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="table-page-filter"
            placeholder="Date"
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
            value={filterClient}
            placeholder="Client"
            onChange={(value) => setFilterClient(value)}
            options={clientOptions}
          />
          <TableExportSelect
            icon="external-link-alt"
            variant="falcon-default"
            className="mx-2"
            onExport={(type) => {
              if (type === 'print') window.print();
            }}
          />
          <TableSearchInput
            className="table-page-filter"
            value={query}
            onChange={setQuery}
            placeholder="search ..."
          />
        </>
      }
    >
      <TableContainer
        dataSource={filteredData}
        loading={loading}
        rowKey={(r) => r.id ?? r.requestId}
        className="table-sm fs-10 mb-0 overflow-hidden"
      />
    </TablePageLayout>
  );
};

export default AdminPaymentRequests;
