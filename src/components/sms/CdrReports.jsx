import React, { useMemo, useState } from 'react';
import { useTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter, TableGroupBySelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const CDR_COLUMNS = () => [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Provider', dataIndex: 'provider', key: 'provider' },
  { title: 'Range', dataIndex: 'range', key: 'range' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Number', dataIndex: 'number', key: 'number' },
  { title: 'CLI', dataIndex: 'cli', key: 'cli' },
  { title: 'SMS', dataIndex: 'sms', key: 'sms' },
  { title: 'Agent', dataIndex: 'agent', key: 'agent' },
  { title: 'Manager', dataIndex: 'manager', key: 'manager' },
  { title: 'Currency', dataIndex: 'currency', key: 'currency' },
  { title: 'My Payout', dataIndex: 'myPayout', key: 'myPayout' },
  { title: 'Agent Payout', dataIndex: 'agentPayout', key: 'agentPayout' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value) => {
      const normalized = String(value ?? '').toLowerCase();
      const className = normalized === 'success'
        ? 'text-success'
        : normalized === 'failed'
          ? 'text-danger'
          : 'text-muted';
      return <span className={className}>{value ?? 'Unknown'}</span>;
    }
  },
  { title: 'IP', dataIndex: 'ip', key: 'ip' }
];

const CdrReports = () => {
  const [cdrData, setCdrData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    return [start, end];
  });

  const columns = CDR_COLUMNS();

  const { TableContainer } = useTable(columns, cdrData, loading);

  const [filterProvider, setFilterProvider] = useState('');
  const [filterRange, setFilterRange] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [groupBy, setGroupBy] = useState('');

  const directionOptions = [{ value: 'MT', label: 'MT' }, { value: 'MO', label: 'MO' }];
  const statusOptions = [
    { value: 'Success', label: 'Success' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Unknown', label: 'Unknown' }
  ];
  const providerOptions = [{ value: 'testnumber1', label: 'testnumber1' }];
  const rangeOptions = [{ value: 'Jamaica_Feb2026TX', label: 'Jamaica_Feb2026TX' }];
  const agentOptions = [{ value: '70700', label: '70700' }];
  const managerOptions = [{ value: 'manager1', label: 'manager1' }];

  const filteredData = useMemo(() => {
    let list = Array.isArray(cdrData) ? [...cdrData] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (filterAgent) list = list.filter((row) => String(row.agent) === String(filterAgent));
    if (filterManager) list = list.filter((row) => String(row.manager) === String(filterManager));
    if (filterDirection) list = list.filter((row) => String(row.direction) === String(filterDirection));
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [
          row.date,
          row.provider,
          row.range,
          row.type,
          row.number,
          row.cli,
          row.sms,
          row.agent,
          row.manager,
          row.currency,
          row.myPayout,
          row.agentPayout,
          row.status,
          row.ip
        ]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [
    cdrData,
    filterProvider,
    filterRange,
    filterAgent,
    filterManager,
    filterDirection,
    filterStatus,
    query
  ]);

  return (
    <>
      <TablePageLayout
        title="CDR Records"
        subtitle="Comprehensive Call Detail Records for all SMS traffic."
        toolbar={
          <>
            <div className="sms-numbers-toolbar-compact cdr-toolbar-inline d-flex gap-2 align-items-center">
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
                value={filterAgent}
                placeholder="Filter Agent"
                onChange={(value) => setFilterAgent(value)}
                options={agentOptions}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterManager}
                placeholder="Filter Manager"
                onChange={(value) => setFilterManager(value)}
                options={managerOptions}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterDirection}
                placeholder="Direction"
                onChange={(value) => setFilterDirection(value)}
                options={directionOptions}
              />
              <TableSelectFilter
                className="table-page-filter"
                value={filterStatus}
                placeholder="Status"
                onChange={(value) => setFilterStatus(value)}
                options={statusOptions}
              />
              <TableGroupBySelect
                className="table-page-filter"
                onSelect={(value) => setGroupBy(value)}
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
        <TableContainer
          className="table-sm fs--1 mb-0 overflow-hidden cdr-table"
          dataSource={filteredData}
          loading={loading}
          onChange={(pagination, filters, sorter) => {
            setFilteredInfo(filters);
          }}
          rowKey={(record) => record.id ?? record.request_uuid ?? record.timestamp}
        />
      </TablePageLayout>

    </>
  );
};

export default CdrReports;
