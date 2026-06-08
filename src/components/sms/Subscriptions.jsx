import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Badge, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { TableExportSelect } from 'components/common/UseTable';
import SubscriptionFormModal from 'components/sms/forms/SubscriptionFormModal';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import subscriptionService from 'services/subscriptionService';
import { toast } from 'react-toastify';

const normalizeStatus = (status) => {
  const raw = String(status || '').trim().toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'inactive') return 'Inactive';
  return status || 'Active';
};

const normalizeSubscription = (item) => ({
  ...item,
  status: normalizeStatus(item?.status)
});

const toSubscriptionPayload = (payload) => ({
  code: payload.code,
  name: payload.name,
  description: payload.description || null,
  tpsLimit: payload.tpsLimit === '' || payload.tpsLimit == null ? null : Number(payload.tpsLimit),
  priceMonthly: payload.priceMonthly === '' || payload.priceMonthly == null ? null : Number(payload.priceMonthly),
  currency: payload.currency || 'USD',
  billingCycle: payload.billingCycle || 'MONTHLY',
  status: normalizeStatus(payload.status)
});

const SUBSCRIPTION_COLUMNS = (onEdit, onDelete) => [
  { accessorKey: 'name', header: 'Plan Name', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'priceMonthly',
    header: 'Monthly Price',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) =>
      original.priceMonthly != null
        ? `${original.currency || 'USD'} ${Number(original.priceMonthly).toFixed(2)}/month`
        : '—'
  },
  {
    accessorKey: 'tpsLimit',
    header: 'TPS Limit',
    meta: { headerProps: { className: 'text-900' } }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => (
      <Badge bg={original.status === 'Active' ? 'success' : 'secondary'} className="text-uppercase">
        {original.status || '—'}
      </Badge>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) =>
      original.createdAt ? new Date(original.createdAt).toLocaleDateString() : '—'
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerProps: { className: 'text-900 text-end' }, cellProps: { className: 'text-end' } },
    cell: ({ row: { original } }) => (
      <div className="d-inline-flex align-items-center">
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="edit"
          transform="shrink-3"
          className="me-2 text-primary shadow-none"
          title="Edit"
          onClick={() => onEdit(original)}
        />
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="trash"
          transform="shrink-3"
          className="text-danger shadow-none"
          title="Delete"
          onClick={() => onDelete(original)}
        />
      </div>
    )
  }
];

const Subscriptions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await subscriptionService.list({ page: 0, size: 1000 });
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setData(list.map(normalizeSubscription));
    } catch (e) {
      setError(e.message || 'Failed to load subscriptions');
      toast.error(e.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const columns = useMemo(
    () =>
      SUBSCRIPTION_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        async (record) => {
          try {
            await subscriptionService.delete(record.id);
            toast.success('Subscription plan deleted');
            fetchSubscriptions();
          } catch (e) {
            toast.error(e.message || 'Failed to delete');
          }
        }
      ),
    [fetchSubscriptions]
  );

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.name, row.code, row.priceMonthly, row.tpsLimit, row.status, row.createdAt]
          .filter((v) => v != null)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const handleAdd = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (recordForEdit?.id) {
        await subscriptionService.update(recordForEdit.id, toSubscriptionPayload(payload));
        toast.success('Subscription plan updated');
      } else {
        await subscriptionService.create(toSubscriptionPayload(payload));
        toast.success('Subscription plan created');
      }
      handleCloseModal();
      fetchSubscriptions();
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

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
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Subscriptions</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="subscriptions-actions" className="d-flex align-items-center flex-nowrap gap-2">
                  <IconButton
                    variant="primary"
                    size="sm"
                    icon="plus"
                    transform="shrink-3"
                    title="Create"
                    onClick={handleAdd}
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
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading...</span>
              </div>
            ) : (
              <AdvanceTable
                headerClassName="bg-200 text-nowrap align-middle"
                rowClassName="align-middle white-space-nowrap"
                tableProps={{
                  size: 'sm',
                  striped: true,
                  className: 'fs-10 mb-0 overflow-hidden'
                }}
              />
            )}
          </Card.Body>
          <Card.Footer>
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <SubscriptionFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </>
  );
};

export default Subscriptions;
