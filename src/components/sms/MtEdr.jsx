import React, { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from 'components/common/IconButton';
import TablePageLayout from 'components/common/TablePageLayout';
import { useTable, TableSelectFilter, TableExportSelect } from 'components/common/UseTable';

const MT_EDR_COLUMNS = () => [
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'Message ID', dataIndex: 'messageId', key: 'messageId' },
  { title: 'From', dataIndex: 'from', key: 'from' },
  { title: 'To', dataIndex: 'to', key: 'to' },
  { title: 'Direction', dataIndex: 'direction', key: 'direction' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Error', dataIndex: 'error', key: 'error' },
  { title: 'Failure Cause', dataIndex: 'failureCause', key: 'failureCause' },
  { title: 'Provider', dataIndex: 'provider', key: 'provider' },
  { title: 'Client', dataIndex: 'client', key: 'client' },
  { title: 'Message', dataIndex: 'message', key: 'message' },
  { title: 'Segments', dataIndex: 'segments', key: 'segments', align: 'right' },
  { title: 'Cost', dataIndex: 'cost', key: 'cost', align: 'right' }
];

const MtEdr = () => {
  const [data] = useState([]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const statusOptions = [
    { value: 'Success', label: 'Success' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Unknown', label: 'Unknown' }
  ];

  const columns = useMemo(() => MT_EDR_COLUMNS(), []);
  const { TableContainer } = useTable(columns, data, loading, {
    pageSizePreset: 'large',
    defaultPageSize: 500
  });

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [
          row.timestamp,
          row.messageId,
          row.from,
          row.to,
          row.provider,
          row.client,
          row.status,
          row.error
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterStatus, query]);

  return (
    <TablePageLayout
      title="SMS MT EDR"
     // subtitle="All traffic details, including errors, failures, message IDs, and message-specific information."
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
          <Form className="d-flex align-items-center flex-wrap ms-2">
            <Form.Control size="sm" type="date" className="me-2" />
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search number or message ID"
              className="me-2"
            />
            <TableSelectFilter
              value={filterStatus}
              placeholder="All Status"
              onChange={(value) => setFilterStatus(value)}
              options={statusOptions}
              className="me-2"
            />
            <TableSearchInput
              className="table-page-filter"
              value={query}
              onChange={setQuery}
              placeholder="search ..."
            />
          </Form>
        </>
      }
    >
      <TableContainer
        className="table-sm fs-10 mb-0 overflow-hidden"
        dataSource={filteredData}
        rowKey={(row) => row.id ?? row.messageId ?? row.timestamp}
      />
    </TablePageLayout>
  );
};

export default MtEdr;
