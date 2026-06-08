import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { TableExportSelect, ConfirmDelete } from 'components/common/UseTable';
import NewsFormModal from 'components/sms/forms/NewsFormModal';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import newsService from 'services/newsService';
import { exportTableData } from 'helpers/tableExport';
import { toast } from 'react-toastify';
import { getAuthUser } from 'components/authentication/authStorage';

const NEWS_COLUMNS = (onEdit, onDelete, isPlatformAdmin) => [
  {
    accessorKey: 'title',
    header: 'Title',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => (
      <span className="fw-semibold">{original.title || '—'}</span>
    )
  },
  {
    accessorKey: 'content',
    header: 'Content',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const text = original.content || '';
      return text.length > 100 ? text.slice(0, 100) + '…' : text;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const active = original.status === 'ACTIVE';
      return (
        <Badge bg={active ? 'soft-success' : 'soft-secondary'} className={active ? 'text-success' : 'text-secondary'}>
          {original.status}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      if (!original.createdAt) return '—';
      return new Date(original.createdAt).toLocaleString();
    }
  },
  ...(isPlatformAdmin
    ? [
        {
          accessorKey: 'actions',
          header: 'Actions',
          enableSorting: false,
          meta: {
            headerProps: { className: 'text-900 text-center' },
            cellProps: { className: 'text-center' }
          },
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
      ]
    : [])
];

const NEWS_EXPORT_COLUMNS = [
  { header: 'Title', key: 'title' },
  { header: 'Content', key: 'content' },
  { header: 'Status', key: 'status' },
  {
    header: 'Date',
    getValue: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : '—')
  }
];

const NewsList = () => {
  const user = getAuthUser();
  const roles = user?.roles || [];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = roles.includes('COMPANY_ADMIN');

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchNews = useCallback(async (pageArg = page, pageSizeArg = pageSize) => {
    setLoading(true);
    try {
      const params = { page: pageArg - 1, size: pageSizeArg };
      const result = await newsService.list(params);
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setData(list);
      setTotal(Number(result?.totalElements ?? list.length));
    } catch (e) {
      toast.error("Can't fetch records");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchNews(page, pageSize);
  }, [fetchNews, page, pageSize]);

  const columns = useMemo(
    () =>
      NEWS_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => {
          if (!record?.id) return;
          setDeleteTarget(record);
        },
        isPlatformAdmin || isCompanyAdmin
      ),
    [isPlatformAdmin, isCompanyAdmin]
  );

  const handleExport = async (type) => {
    try {
      await exportTableData({
        type,
        rows: filteredData,
        columns: NEWS_EXPORT_COLUMNS,
        filename: 'news',
        title: 'News Updates'
      });
      if (type !== 'print') toast.success(`Exported ${type.toUpperCase()}`);
    } catch (e) {
      toast.error(e.message || `Failed to export ${type.toUpperCase()}`);
    }
  };

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((row) =>
        [row.title, row.content, row.status]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query]);

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    sortable: true,
    pagination: true,
    perPage: pageSize,
    perPageOptions: [10, 25, 50, 100],
    totalCount: total,
    page,
    setPage,
    setPageSize
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await newsService.remove(deleteTarget.id);
      toast.success('News deleted');
      fetchNews();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

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
      if (recordForEdit) {
        await newsService.update(recordForEdit.id, payload);
        toast.success('News updated');
      } else {
        await newsService.create(payload);
        toast.success('News created');
      }
      fetchNews();
      handleCloseModal();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">News Updates</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
                  {(isPlatformAdmin || isCompanyAdmin) && (
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
                  )}
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    className="mx-2"
                    onExport={handleExport}
                  />
                  <IconButton
                    variant="falcon-default"
                    size="sm"
                    icon="sync"
                    transform="shrink-3"
                    className="border-300 me-2"
                    title="Refresh"
                    onClick={() => fetchNews(page, pageSize)}
                  >
                    <span className="d-none d-sm-inline-block ms-1">Refresh</span>
                  </IconButton>
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
                Loading news...
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
              totalCount={total}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      {(isPlatformAdmin || isCompanyAdmin) && (
        <>
          <NewsFormModal
            show={modalShow}
            record={recordForEdit}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
          />
          <ConfirmDelete
            show={!!deleteTarget}
            onHide={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            title="Delete News"
            message={`Are you sure you want to delete "${deleteTarget?.title || ''}"? This action cannot be undone.`}
            loading={deleting}
          />
        </>
      )}
    </>
  );
};

export default NewsList;
