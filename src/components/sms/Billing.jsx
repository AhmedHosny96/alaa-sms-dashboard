import React, { useMemo, useState } from 'react';
import { UseTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const BILLING_COLUMNS = [
  { title: 'Invoice #', dataIndex: 'invoice', key: 'invoice' },
  { title: 'Client', dataIndex: 'client', key: 'client' },
  { title: 'Plan', dataIndex: 'plan', key: 'plan' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Period', dataIndex: 'period', key: 'period' },
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' }
];

const Billing = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    return [start, end];
  });
  const [filterProvider, setFilterProvider] = useState('');
  const [filterRange, setFilterRange] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const providerOptions = [{ value: 'provider-1', label: 'Provider 1' }];
  const rangeOptions = [{ value: 'range-1', label: 'Range 1' }];
  const statusOptions = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Failed', label: 'Failed' }
  ];

  const columns = useMemo(() => BILLING_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.invoice, row.client, row.plan, row.amount, row.status, row.period, row.createdAt]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, filterStatus, query]);

  return (
    <TablePageLayout
      title="Billing"
      subtitle="Review invoices and subscription billing history."
      toolbar={
        <>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <TableDateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              className="table-page-filter table-page-date-range"
              placeholder="Select dates"
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterProvider}
              placeholder="Filter Provider"
              onChange={(value) => setFilterProvider(value)}
              options={providerOptions}
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterRange}
              placeholder="Filter Range"
              onChange={(value) => setFilterRange(value)}
              options={rangeOptions}
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterStatus}
              placeholder="Status"
              onChange={(value) => setFilterStatus(value)}
              options={statusOptions}
            />
            <TableExportSelect
              onExport={(type) => {
                if (type === 'print') window.print();
              }}
            />
          </div>
          <Search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ..."
            className="table-page-search"
          />
        </>
      }
    >
      <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.invoice} />
    </TablePageLayout>
  );
};

export default Billing;
