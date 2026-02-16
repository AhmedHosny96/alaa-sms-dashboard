import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { Search, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const TestCdrs = () => {
  const [query, setQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    return [start, end];
  });

  const companyOptions = [
    { value: 'company-a', label: 'Company A' },
    { value: 'company-b', label: 'Company B' }
  ];

  const statusOptions = [
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Failed', label: 'Failed' }
  ];

  return (
    <TablePageLayout
      title="SMS Test Panel - CDRs"
      subtitle="View CDRs for test SMS messages."
      toolbar={
        <>
          <TableDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="table-page-filter table-page-date-range"
            placeholder="Select dates"
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
            value={filterStatus}
            placeholder="Status"
            onChange={(value) => setFilterStatus(value)}
            options={statusOptions}
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
      <Table className="table-sm fs--1 mb-0 overflow-hidden">
        <thead className="bg-200 text-900">
          <tr>
            <th className="text-nowrap">Timestamp</th>
            <th className="text-nowrap">Number</th>
            <th className="text-nowrap">Message</th>
            <th className="text-nowrap">Status</th>
            <th className="text-nowrap">Provider</th>
          </tr>
        </thead>
        <tbody className="list">
          <tr>
            <td colSpan={5} className="text-center text-700 py-5">
              No test CDR records available.
            </td>
          </tr>
        </tbody>
      </Table>
    </TablePageLayout>
  );
};

export default TestCdrs;
