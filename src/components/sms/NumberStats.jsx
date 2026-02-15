import React, { useMemo, useState } from 'react';
import { UseTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const NUMBER_COLUMNS = [
  { title: 'Number', dataIndex: 'number', key: 'number' },
  { title: 'Country', dataIndex: 'country', key: 'country' },
  { title: 'SMS Sent', dataIndex: 'smsSent', key: 'smsSent' },
  { title: 'SMS Received', dataIndex: 'smsReceived', key: 'smsReceived' },
  { title: 'Success Rate', dataIndex: 'successRate', key: 'successRate' },
  { title: 'Last Used', dataIndex: 'lastUsed', key: 'lastUsed' }
];

const NumberStats = () => {
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
  const [filterNumber, setFilterNumber] = useState('');

  const providerOptions = [{ value: 'provider-1', label: 'Provider 1' }];
  const rangeOptions = [{ value: 'range-1', label: 'Range 1' }];
  const numberOptions = [{ value: '447406524375', label: '447406524375' }];

  const columns = useMemo(() => NUMBER_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (filterNumber) list = list.filter((row) => String(row.number) === String(filterNumber));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.number, row.country, row.smsSent, row.smsReceived, row.successRate, row.lastUsed]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, filterNumber, query]);

  return (
    <TablePageLayout
      title="SMS Number Stats"
      subtitle="Individual SMS number usage statistics."
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
              value={filterNumber}
              placeholder="Filter Number"
              onChange={(value) => setFilterNumber(value)}
              options={numberOptions}
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
      <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.number} />
    </TablePageLayout>
  );
};

export default NumberStats;
