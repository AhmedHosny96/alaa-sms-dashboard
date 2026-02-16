import React, { useMemo, useState } from 'react';
import { UseTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const LOG_COLUMNS = [
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'Level', dataIndex: 'level', key: 'level' },
  { title: 'Source', dataIndex: 'source', key: 'source' },
  { title: 'Message', dataIndex: 'message', key: 'message' },
  { title: 'User', dataIndex: 'user', key: 'user' },
  { title: 'IP', dataIndex: 'ip', key: 'ip' }
];

const SystemLogs = () => {
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
  const [filterLevel, setFilterLevel] = useState('');

  const providerOptions = [{ value: 'provider-1', label: 'Provider 1' }];
  const rangeOptions = [{ value: 'range-1', label: 'Range 1' }];
  const levelOptions = [
    { value: 'Info', label: 'Info' },
    { value: 'Warning', label: 'Warning' },
    { value: 'Error', label: 'Error' }
  ];

  const columns = useMemo(() => LOG_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (filterLevel) list = list.filter((row) => String(row.level) === String(filterLevel));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.timestamp, row.level, row.source, row.message, row.user, row.ip]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, filterLevel, query]);

  return (
    <TablePageLayout
      title="System Logs"
      subtitle="Detailed system activity and events."
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
              value={filterLevel}
              placeholder="Level"
              onChange={(value) => setFilterLevel(value)}
              options={levelOptions}
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
      <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.timestamp} />
    </TablePageLayout>
  );
};

export default SystemLogs;
