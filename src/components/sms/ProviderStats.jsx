import React, { useMemo, useState } from 'react';
import { UseTable, Search, TableExportSelect, TableSelectFilter, TableDateRangeFilter } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const PROVIDER_COLUMNS = [
  { title: 'Provider', dataIndex: 'provider', key: 'provider' },
  { title: 'Total SMS', dataIndex: 'totalSms', key: 'totalSms' },
  { title: 'Delivered', dataIndex: 'delivered', key: 'delivered' },
  { title: 'Failed', dataIndex: 'failed', key: 'failed' },
  { title: 'DLR Rate', dataIndex: 'dlrRate', key: 'dlrRate' },
  { title: 'Avg TPS', dataIndex: 'avgTps', key: 'avgTps' },
  { title: 'Cost', dataIndex: 'cost', key: 'cost' }
];

const ProviderStats = () => {
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

  const providerOptions = [{ value: 'provider-1', label: 'Provider 1' }];
  const rangeOptions = [{ value: 'range-1', label: 'Range 1' }];

  const columns = useMemo(() => PROVIDER_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterProvider) list = list.filter((row) => String(row.provider) === String(filterProvider));
    if (filterRange) list = list.filter((row) => String(row.range) === String(filterRange));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.provider, row.totalSms, row.delivered, row.failed, row.dlrRate, row.avgTps, row.cost]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterProvider, filterRange, query]);

  return (
    <TablePageLayout
      title="Provider SMS Stats"
      subtitle="Per-provider throughput, DLR success rate, and error breakdown."
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
      <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.provider} />
    </TablePageLayout>
  );
};

export default ProviderStats;
