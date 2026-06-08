import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';
import smsService from 'services/smsService';
import { getAuthUser } from 'components/authentication/authStorage';

const BILL_COLUMNS = [
  { accessorKey: 'billNo', header: 'Bill #', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'date', header: 'Date', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'period', header: 'Period', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'amount', header: 'Amount', meta: { headerProps: { className: 'text-900 text-end' }, cellProps: { className: 'text-end' } } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const s = String(original.status || '').toLowerCase();
      const cls = s === 'paid' ? 'text-success' : s === 'overdue' ? 'text-danger' : 'text-warning';
      return <span className={cls}>{original.status || 'Unpaid'}</span>;
    }
  }
];

const Bills = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = roles.includes('COMPANY_ADMIN');
  const resourceId = user?.resourceId || null;

  const columns = useMemo(() => BILL_COLUMNS, []);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 500 };
      if (!isPlatformAdmin && resourceId) params.companyId = resourceId;
      const res = await smsService.listBills(params);
      const content = res?.data?.content || res?.content || [];
      setData(content);
    } catch (e) {
      console.error('Failed to load bills', e);
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, resourceId]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        Object.values(row).filter((v) => v != null).some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: false,
    sortable: true,
    pagination: true,
    perPage: 25,
  });

  return (
    <AdvanceTableProvider {...table}>
      <Card className="mb-3">
        <Card.Header>
          <Row className="g-3 mb-2">
            <Col md={4}>
              <Card className="text-center border shadow-none">
                <Card.Body className="py-2">
                  <h6 className="text-700 mb-1 fs-10">Outstanding</h6>
                  <h4 className="text-danger mb-0">$0.00</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border shadow-none">
                <Card.Body className="py-2">
                  <h6 className="text-700 mb-1 fs-10">This Month</h6>
                  <h4 className="text-primary mb-0">$0.00</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border shadow-none">
                <Card.Body className="py-2">
                  <h6 className="text-700 mb-1 fs-10">Total Paid</h6>
                  <h4 className="text-success mb-0">$0.00</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Statements</h5>
              {loading && <Spinner animation="border" size="sm" className="ms-2" />}
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-2">
                {(isPlatformAdmin || isCompanyAdmin) && (
                  <IconButton variant="primary" size="sm" icon="plus" transform="shrink-3" title="New">
                    <span className="d-none d-sm-inline-block ms-1">New</span>
                  </IconButton>
                )}
                <TableExportSelect
                  icon="external-link-alt"
                  variant="falcon-default"
                  className="mx-2"
                  onExport={(type) => { if (type === 'print') window.print(); }}
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
            tableProps={{ size: 'sm', striped: true, className: 'fs-10 mb-0 overflow-hidden' }}
          />
        </Card.Body>
        <Card.Footer>
          <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo />
        </Card.Footer>
      </Card>
    </AdvanceTableProvider>
  );
};

export default Bills;
