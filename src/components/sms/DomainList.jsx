import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Badge, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { TableExportSelect } from 'components/common/UseTable';
import { TableSelectFilter } from 'components/common/UseTable';
import DomainFormModal from 'components/sms/forms/DomainFormModal';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import companyService from 'services/companyService';
import domainService from 'services/domainService';
import { toast } from 'react-toastify';

const DOMAIN_COLUMNS = (onEdit) => [
  { accessorKey: 'domain', header: 'Domain', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { headerProps: { className: 'text-900' } },
    cell: ({ row: { original } }) => {
      const rawStatus = String(original.status || '').toUpperCase();
      const isActive = rawStatus === 'ACTIVE';
      const label = isActive ? 'Active' : rawStatus || 'Inactive';
      return (
        <Badge bg={isActive ? 'success' : 'secondary'} className="text-uppercase">
          {label}
        </Badge>
      );
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

const DomainList = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const result = await companyService.list();
      const list = Array.isArray(result?.content) ? result.content : [];
      setCompanies(list);
      // Do not auto-select a company
    } catch (e) {
      toast.error(e.message || 'Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 100 };
      const result = selectedCompanyId
        ? await domainService.list(selectedCompanyId, params)
        : await domainService.listAll(params);
      // API returns { content: [...] }
      setData(Array.isArray(result?.content) ? result.content : []);
    } catch (e) {
      toast.error(e.message || 'Failed to load domains');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const columns = useMemo(
    () =>
      DOMAIN_COLUMNS((record) => {
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
          [row.domain, row.status, row.createdAt]
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
    const companyId = selectedCompanyId || payload.companyId;
    if (!companyId && !recordForEdit) {
      toast.error('Select a company first');
      return;
    }
    setSubmitting(true);
    try {
      if (recordForEdit?.id) {
        await domainService.update(companyId, recordForEdit.id, { status: payload.status });
        toast.success('Domain updated');
      } else {
        await domainService.create(companyId, { domain: payload.domain });
        toast.success('Domain added');
      }
      handleCloseModal();
      fetchDomains();
    } catch (e) {
      toast.error(e.message || 'Failed to save domain');
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

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Domain Management</h5>
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
                  <TableSelectFilter
                    className="table-page-filter flex-shrink-0"
                    value={selectedCompanyId}
                    placeholder="Select Company"
                    onChange={val => setSelectedCompanyId(val || '')}
                    options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
                    disabled={loadingCompanies}
                  />
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
                Loading domains...
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
            <AdvanceTableFooter rowsPerPageSelection navButtons rowInfo rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]} />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      <DomainFormModal
        show={modalShow}
        record={recordForEdit}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        companyId={recordForEdit ? recordForEdit.companyId : ''}
        companyName={recordForEdit ? (companies.find(c => c.id === recordForEdit.companyId)?.name || '') : ''}
        companies={companies}
      />
    </>
  );
};

export default DomainList;
