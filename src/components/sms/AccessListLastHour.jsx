import React, { useMemo, useState } from 'react';
import { Card, Col, Dropdown, Row } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect } from 'components/common/UseTable';

const ACCESS_COLUMNS = [
  { accessorKey: 'timestamp', header: 'Timestamp', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'sourceIp', header: 'Source IP', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'number', header: 'Number', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'action', header: 'Action', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'status', header: 'Status', meta: { headerProps: { className: 'text-900' } } }
];

const AccessListLastHour = () => {
  const [data] = useState([]);
  const [query, setQuery] = useState('');
  const [filterHours, setFilterHours] = useState('1');

  const hourOptions = [
    { value: '1', label: 'Last 1 Hour' },
    { value: '2', label: 'Last 2 Hours' },
    { value: '24', label: 'Last 24 Hours' }
  ];

  const selectedHoursLabel =
    hourOptions.find((opt) => String(opt.value) === String(filterHours))?.label || 'Last 1 Hour';

  const columns = useMemo(() => ACCESS_COLUMNS, []);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.timestamp, row.sourceIp, row.number, row.action, row.status]
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

  return (
    <AdvanceTableProvider {...table}>
      <Card className="mb-3">
        <Card.Header>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">SMS Access</h5>
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
                {/* <IconButton
                  variant="primary"
                  size="sm"
                  icon="plus"
                  transform="shrink-3"
                  title="New"
                >
                  <span className="d-none d-sm-inline-block ms-1">New</span>
                </IconButton> */}
                <TableExportSelect
                  icon="external-link-alt"
                  variant="falcon-default"
                  className="mx-2"
                  onExport={(type) => {
                    if (type === 'print') window.print();
                  }}
                />
                <Dropdown className="me-2">
                  <Dropdown.Toggle
                    as={IconButton}
                    variant="falcon-default"
                    size="sm"
                  >
                    {selectedHoursLabel}
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="shadow-sm"
                    renderOnMount
                    popperConfig={{ strategy: 'fixed' }}
                  >
                    {hourOptions.map((opt) => (
                      <Dropdown.Item
                        key={opt.value}
                        onClick={() => setFilterHours(String(opt.value))}
                      >
                        {opt.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
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
  );
};

export default AccessListLastHour;
