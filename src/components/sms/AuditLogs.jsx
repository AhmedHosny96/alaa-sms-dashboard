import React, { useMemo, useState } from 'react';
import { UseTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const AUDIT_COLUMNS = [
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'User', dataIndex: 'user', key: 'user' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Action', dataIndex: 'action', key: 'action' },
  { title: 'Target', dataIndex: 'target', key: 'target' },
  { title: 'IP', dataIndex: 'ip', key: 'ip' }
];

const AuditLogs = () => {
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
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const providerOptions = [{ value: 'provider-1', label: 'Provider 1' }];
  const rangeOptions = [{ value: 'range-1', label: 'Range 1' }];
  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Client', label: 'Client' }
  ];
  const actionOptions = [
    { value: 'Create', label: 'Create' },
    { value: 'Update', label: 'Update' },
    { value: 'Delete', label: 'Delete' }
  ];

  const columns = useMemo(() => AUDIT_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (filterRole) list = list.filter((row) => String(row.role) === String(filterRole));
    if (filterAction) list = list.filter((row) => String(row.action) === String(filterAction));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.timestamp, row.user, row.role, row.action, row.target, row.ip]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, filterRole, filterAction, query]);

  return (
    <TablePageLayout
      title="Audit Logs"
      subtitle="Track user actions and system changes."
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
              value={filterRole}
              placeholder="Role"
              onChange={(value) => setFilterRole(value)}
              options={roleOptions}
            />
            <TableSelectFilter
              className="table-page-filter"
              value={filterAction}
              placeholder="Action"
              onChange={(value) => setFilterAction(value)}
              options={actionOptions}
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

export default AuditLogs;
