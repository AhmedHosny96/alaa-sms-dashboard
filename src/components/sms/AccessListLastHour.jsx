import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { Search, TableSelectFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const AccessListLastHour = () => {
  const [query, setQuery] = useState('');
  const [filterHours, setFilterHours] = useState('1');

  const hourOptions = [
    { value: '1', label: 'Last 1 Hour' },
    { value: '2', label: 'Last 2 Hours' },
    { value: '5', label: 'Last 5 Hours' },
    { value: '10', label: 'Last 10 Hours' },
    { value: '12', label: 'Last 12 Hours' },
    { value: '24', label: 'Last 24 Hours' }
  ];

  return (
    <TablePageLayout
      title="SMS Access"
      subtitle="View SMS access attempts for the selected timeframe."
      toolbar={
        <>
          <TableSelectFilter
            className="table-page-filter"
            value={filterHours}
            placeholder="Last 1 Hour"
            onChange={(value) => setFilterHours(value)}
            options={hourOptions}
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
            <th className="text-nowrap">Source IP</th>
            <th className="text-nowrap">Number</th>
            <th className="text-nowrap">Action</th>
            <th className="text-nowrap">Status</th>
          </tr>
        </thead>
        <tbody className="list">
          <tr>
            <td colSpan={5} className="text-center text-700 py-5">
              No access activity in the last hour.
            </td>
          </tr>
        </tbody>
      </Table>
    </TablePageLayout>
  );
};

export default AccessListLastHour;
