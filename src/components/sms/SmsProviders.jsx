import React, { useMemo, useState } from 'react';
import TableSearchInput from 'components/common/TableSearchInput';
import IconButton from 'components/common/IconButton';
import TablePageLayout from 'components/common/TablePageLayout';
import { UseTable, TableExportSelect } from 'components/common/UseTable';

const SMS_PROVIDER_COLUMNS = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Throughput', dataIndex: 'throughput', key: 'throughput' },
  { title: 'Actions', dataIndex: 'actions', key: 'actions', align: 'right' }
];

const SmsProviders = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');

  const columns = useMemo(() => SMS_PROVIDER_COLUMNS, []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.name, row.type, row.status, row.throughput]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  return (
    <TablePageLayout
      title="SMS Providers & Routing"
      subtitle="Manage SMPP and HTTP providers, routes and priorities."
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
        rowKey={(r) => r.id ?? r.name}
        className="table-sm fs-10 mb-0 overflow-hidden"
      />
    </TablePageLayout>
  );
};

export default SmsProviders;

