import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { TableExportSelect } from 'components/common/UseTable';
import IpFormModal from 'components/sms/forms/IpFormModal';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import ipService from 'services/ipService';
import { toast } from 'react-toastify';

const STATUS_TAG_STYLES = {
  success: { color: '#00f382', borderColor: '#00f382', backgroundColor: '#FFFFFF' },
  secondary: { color: '#6c757d', borderColor: '#6c757d', backgroundColor: '#FFFFFF' }
};

const StatusTag = ({ tone = 'secondary', children }) => {
  const palette = STATUS_TAG_STYLES[tone] || STATUS_TAG_STYLES.secondary;
  return (
    <span
      className="fw-semibold text-uppercase"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1px 9px',
        borderRadius: 6,
        border: `1px solid ${palette.borderColor}`,
        color: palette.color,
        backgroundColor: palette.backgroundColor,
        fontSize: '0.82rem',
        fontWeight: 600,
        lineHeight: 1.25
      }}
    >
      {children}
    </span>
  );
};

const IP_COLUMNS = (onEdit) => [
  { accessorKey: 'ipAddress', header: 'IP Address', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'notes',
    header: 'Description',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const notes = original.notes ?? '';
      return notes ? String(notes).slice(0, 60) + (String(notes).length > 60 ? '…' : '') : '—';
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) =>
      original.createdAt ? new Date(original.createdAt).toLocaleString() : '—'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const status = String(original.status || '').toUpperCase();
      const isActive = status === 'FREE' || status === 'ACTIVE';
      const label = isActive ? 'Active' : status || 'Inactive';
      return <StatusTag tone={isActive ? 'success' : 'secondary'}>{label}</StatusTag>;
    }
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
          className="text-primary shadow-none"
          title="Edit"
          onClick={() => onEdit(original)}
        />
      </div>
    )
  }
];

const IpManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const normalizeRow = (row) => ({
    id: row.id,
    ipAddress: row.ipAddress ?? row.ip_address ?? '',
    port: row.port,
    status: row.status ?? '',
    companyId: row.companyId ?? row.company_id,
    companyName: row.companyName ?? row.company_name ?? '',
    notes: row.notes ?? row.description ?? '',
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at
  });

  const fetchIps = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await ipService.list({ page: 0, size: 100 });
      const content = Array.isArray(result?.content) ? result.content : [];
      setData(content.map(normalizeRow));
    } catch (e) {
      if (!silent) toast.error(e.message || 'Failed to load IPs');
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIps(false);
  }, [fetchIps]);

  const columns = useMemo(
    () =>
      IP_COLUMNS((record) => {
        setRecordForEdit(record);
        setModalShow(true);
      }),
    []
  );

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (row) =>
          [row.ipAddress, row.notes, row.status, row.companyName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
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
        await ipService.update(recordForEdit.id, payload);
        toast.success('IP updated');
      } else {
        await ipService.create(payload);
        toast.success('IP added');
      }
      handleCloseModal();
      fetchIps(false);
    } catch (e) {
      toast.error(e.message || 'Failed to save IP');
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
    perPageOptions: [25, 50, 100, 250, 500, 1000, 5000],
    selectionColumnWidth: 30
  });

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">IP Management</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
                  <IconButton
                    variant="primary"
                    size="sm"
                    icon="plus"
                    transform="shrink-3"
                    title="New"
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
                <Spinner animation="border" size="sm" className="me-2" />
                Loading IPs...
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
            <AdvanceTableFooter
              rowsPerPageSelection
              navButtons
              rowInfo
              rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <IpFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </>
  );
};

export default IpManagement;
