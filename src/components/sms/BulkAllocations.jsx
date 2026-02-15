import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UseTable, Search, TableExportSelect } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';
import BulkAllocationFormModal from 'components/sms/forms/BulkAllocationFormModal';

const ALLOCATION_COLUMNS = (onDownload) => [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Agent', dataIndex: 'agent', key: 'agent' },
  { title: 'Qty/Each Range', dataIndex: 'qtyEachRange', key: 'qtyEachRange' },
  { title: 'Total Number', dataIndex: 'totalNumber', key: 'totalNumber' },
  {
    title: 'Download',
    key: 'download',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <div className="d-flex justify-content-center gap-1">
        <Button
          variant="danger"
          size="sm"
          className="px-2 py-0"
          onClick={() => onDownload(record)}
          title="Download"
        >
          <FontAwesomeIcon icon="download" />
        </Button>
        <Button
          variant="warning"
          size="sm"
          className="px-2 py-0"
          onClick={() => onDownload(record)}
          title="View"
        >
          <FontAwesomeIcon icon="file-alt" />
        </Button>
      </div>
    )
  }
];

const BulkAllocations = () => {
  const [data] = useState([
    { id: 1, date: '2023-03-19 02:29:59', agent: '887410', qtyEachRange: 50, totalNumber: 0 },
    { id: 2, date: '2023-03-10 23:05:09', agent: '887410', qtyEachRange: 5, totalNumber: 0 },
    { id: 3, date: '2023-03-09 13:15:46', agent: '887410', qtyEachRange: 10, totalNumber: 0 },
    { id: 4, date: '2023-03-09 13:04:03', agent: '4410144101', qtyEachRange: 3, totalNumber: 0 }
  ]);
  const [loading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);

  const columns = useMemo(() => ALLOCATION_COLUMNS(() => {}), []);
  const { TableContainer } = UseTable(columns, data, loading);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.date, row.agent, row.qtyEachRange, row.totalNumber]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const handleAllocate = () => {
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
  };

  const handleSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="SMS Bulk Allocations"
        subtitle="Review recent bulk allocations."
        toolbar={
          <>
            <Button variant="primary" size="sm" className="table-page-addButton" onClick={handleAllocate}>
              <FontAwesomeIcon icon="plus" className="me-1" />
              Allocate Numbers
            </Button>
            <TableExportSelect
              onExport={(type) => {
                if (type === 'print') window.print();
              }}
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
        <TableContainer dataSource={filteredData} loading={loading} rowKey={(r) => r.id ?? r.date} />
      </TablePageLayout>

      <BulkAllocationFormModal show={modalShow} onClose={handleCloseModal} onSubmit={handleSubmit} />
    </>
  );
};

export default BulkAllocations;
