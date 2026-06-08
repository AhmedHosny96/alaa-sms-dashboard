import React, { useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect } from 'components/common/UseTable';
import { exportRowsByType } from 'utils/tableExport';

const SMS_NUMBERS_COLUMNS = [
  { accessorKey: 'number', header: 'Number / Range', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'type', header: 'Type', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'country', header: 'Country', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'assignedTo', header: 'Assigned To', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'status', header: 'Status', meta: { headerProps: { className: 'text-900' } } }
];

const SmsNumbers = () => {
  const [data] = useState([]);
  const [query, setQuery] = useState('');
  const columns = useMemo(() => SMS_NUMBERS_COLUMNS, []);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.number, row.type, row.country, row.assignedTo, row.status]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 25,
    selectionColumnWidth: 30
  });

  const exportColumns = useMemo(
    () => ['Number / Range', 'Type', 'Country', 'Assigned To', 'Status'],
    []
  );

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        return {
          'Number / Range': row.number ?? '-',
          Type: row.type ?? '-',
          Country: row.country ?? '-',
          'Assigned To': row.assignedTo ?? '-',
          Status: row.status ?? '-'
        };
      }),
    [table, filteredData]
  );

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">SMS Numbers & Ranges</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
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
                    onExport={(type) =>
                      exportRowsByType({
                        type,
                        title: 'SMS Numbers & Ranges',
                        filenamePrefix: 'sms-numbers-ranges',
                        columns: exportColumns,
                        rows: exportRows
                      })}
                  />
                  <TableSearchInput
                    className="table-page-filter"
                    value={query}
                    onChange={setQuery}
                    placeholder="search ..."
                  />
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            <AdvanceTable
              headerClassName="bg-200 text-nowrap align-middle"
              rowClassName="align-middle white-space-nowrap"
              tableProps={{
                size: 'sm',
                striped: true,
                className: 'fs-10 mb-0 overflow-hidden'
              }}
            />
          </Card.Body>
          <Card.Footer>
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>
    </>
  );
};

export default SmsNumbers;

