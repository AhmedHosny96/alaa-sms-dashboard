import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { TableSelectFilter, TableExportSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';
import AdvanceTableDateRangeFilter from 'components/common/advance-table/AdvanceTableDateRangeFilter';
import useAdvanceTable from 'hooks/useAdvanceTable';
import smsService from 'services/smsService';
import { getAuthUser } from 'components/authentication/authStorage';
import { toast } from 'react-toastify';

const REQUEST_COLUMNS = (isPlatformAdmin, onApprove, onReject) => {
  const cols = [
    { accessorKey: 'requestId', header: 'Request #', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'company', header: 'Company', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'date', header: 'Date', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'amount', header: 'Amount', meta: { headerProps: { className: 'text-900 text-end' }, cellProps: { className: 'text-end' } } },
    { accessorKey: 'method', header: 'Method', meta: { headerProps: { className: 'text-900' } } },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => {
        const s = String(original.status || '').toLowerCase();
        const cls = s === 'approved' ? 'text-success' : s === 'rejected' ? 'text-danger' : 'text-warning';
        return <span className={cls}>{original.status}</span>;
      }
    }
  ];

  if (isPlatformAdmin) {
    cols.push({
      accessorKey: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } },
      cell: ({ row: { original } }) => (
        <div className="d-inline-flex align-items-center">
          <IconButton variant="falcon-default" size="sm" icon="check" transform="shrink-3"
            className="me-2 text-success shadow-none" title="Approve"
            onClick={() => onApprove(original)} />
          <IconButton variant="falcon-default" size="sm" icon="times" transform="shrink-3"
            className="text-danger shadow-none" title="Reject"
            onClick={() => onReject(original)} />
        </div>
      )
    });
  }

  return cols;
};

const PaymentRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    return [start, end];
  });

  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = roles.includes('COMPANY_ADMIN');
  const resourceId = user?.resourceId || null;

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 500 };
      if (!isPlatformAdmin && resourceId) params.companyId = resourceId;
      const res = await smsService.listPaymentRequests(params);
      const content = res?.data?.content || res?.content || [];
      setData(content);
    } catch (e) {
      console.error('Failed to load payment requests', e);
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, resourceId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = useCallback(async (record) => {
    try {
      await smsService.approvePaymentRequest(record.id);
      toast.success('Payment request approved');
      fetchRequests();
    } catch (e) {
      toast.error('Failed to approve');
    }
  }, [fetchRequests]);

  const handleReject = useCallback(async (record) => {
    try {
      await smsService.rejectPaymentRequest(record.id);
      toast.success('Payment request rejected');
      fetchRequests();
    } catch (e) {
      toast.error('Failed to reject');
    }
  }, [fetchRequests]);

  const columns = useMemo(
    () => REQUEST_COLUMNS(isPlatformAdmin || isCompanyAdmin, handleApprove, handleReject),
    [isPlatformAdmin, isCompanyAdmin, handleApprove, handleReject]
  );

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (filterStatus) list = list.filter((row) => String(row.status) === String(filterStatus));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        Object.values(row).filter(Boolean).some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, filterStatus, query]);

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 25,
    perPageOptions: [100, 500, 1000],
    selectionColumnWidth: 30
  });

  return (
    <AdvanceTableProvider {...table}>
      <Card className="mb-3">
        <Card.Header>
          <Row className="flex-between-center">
            <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Payment Requests</h5>
              {loading && <Spinner animation="border" size="sm" className="ms-2" />}
            </Col>
            <Col xs={12} sm="auto" className="ps-0">
              <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-2">
                <TableExportSelect
                  icon="external-link-alt"
                  variant="falcon-default"
                  className="mx-2 flex-shrink-0"
                  onExport={(type) => { if (type === 'print') window.print(); }}
                />
                <AdvanceTableDateRangeFilter
                  value={dateRange}
                  onChange={setDateRange}
                  className="table-page-filter flex-shrink-0"
                  placeholder="Date"
                />
                <TableSelectFilter
                  className="table-page-filter flex-shrink-0"
                  value={filterStatus}
                  placeholder="Status"
                  onChange={(value) => setFilterStatus(value)}
                  options={statusOptions}
                />
                <TableSearchInput
                  className="table-page-filter"
                  value={query}
                  onChange={setQuery}
                  placeholder="Search ..."
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
          <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]} />
        </Card.Footer>
      </Card>
    </AdvanceTableProvider>
  );
};

export default PaymentRequests;
