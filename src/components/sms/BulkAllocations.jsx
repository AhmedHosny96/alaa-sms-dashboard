import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useScopeStableEffect } from 'hooks/usePolling';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect, TableSelectFilter } from 'components/common/UseTable';
import BulkAllocationFormModal from 'components/sms/forms/BulkAllocationFormModal';
import smsService from 'services/smsService';
import companyService from 'services/companyService';
import clientService from 'services/clientService';
import { getAuthUser, getUserResourceId } from 'components/authentication/authStorage';
import { toast } from 'react-toastify';
import { exportRowsByType } from 'utils/tableExport';

const ALLOCATION_COLUMNS = (onDownload) => [
  { accessorKey: 'date', header: 'Date', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'agent', header: 'Agent', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'qtyEachRange', header: 'Qty/Each Range', meta: { headerProps: { className: 'text-900' } } },
  { accessorKey: 'totalNumber', header: 'Total Number', meta: { headerProps: { className: 'text-900' } } },
  {
    accessorKey: 'download',
    header: 'Download',
    enableSorting: false,
    meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } },
    cell: ({ row: { original } }) => (
      <div className="d-inline-flex align-items-center">
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="download"
          transform="shrink-3"
          className="me-2 text-success shadow-none"
          title="Download"
          onClick={() => onDownload(original)}
        />
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="file-alt"
          transform="shrink-3"
          className="text-primary shadow-none"
          title="View"
          onClick={() => onDownload(original)}
        />
      </div>
    )
  }
];

const BulkAllocations = () => {
  const authUser = getAuthUser();
  const isPlatformAdmin = authUser?.roles?.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = authUser?.roles?.includes('COMPANY_ADMIN');
  const resourceId = getUserResourceId();
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [defaultCompanyId, setDefaultCompanyId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [providerOptions, setProviderOptions] = useState([]);
  const [rangeOptions, setRangeOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const companyId = isPlatformAdmin
    ? (selectedCompanyId || '')
    : isCompanyAdmin
      ? (defaultCompanyId || '')
      : '';

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        if (isCompanyAdmin && resourceId) {
          const company = await companyService.getById(resourceId);
          setCompanies(company?.id ? [company] : []);
          setDefaultCompanyId(company?.id ? String(company.id) : '');
          return;
        }
        if (isPlatformAdmin) {
          const result = await companyService.list();
          const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
          setCompanies(list);
        }
        setDefaultCompanyId('');
      } catch {
        setCompanies([]);
        setDefaultCompanyId('');
      }
    };
    loadCompanies();
  }, [isPlatformAdmin, isCompanyAdmin, resourceId]);

  useEffect(() => {
    if (isCompanyAdmin && defaultCompanyId && !selectedCompanyId) setSelectedCompanyId(defaultCompanyId);
  }, [isCompanyAdmin, defaultCompanyId, selectedCompanyId]);

  const loadAllocations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = { page: 0, size: 200 };
      if (companyId) params.companyId = companyId;
      const resp = await smsService.listBulkAllocations(params);
      const list = Array.isArray(resp?.content) ? resp.content : Array.isArray(resp) ? resp : [];
      setData(list);
    } catch (e) {
      if (!silent) toast.error(e.message || 'Failed to load allocations');
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadAllocations(false);
  }, [loadAllocations]);

  useScopeStableEffect(() => {
    const loadOptions = async () => {
      try {
        const [providers, ranges, clients] = await Promise.all([
          smsService.listProviderOptions(),
          smsService.listRanges({ page: 0, size: 500 }),
          companyId ? clientService.list(companyId, { page: 0, size: 500 }) : Promise.resolve([])
        ]);
        setProviderOptions(
          Array.isArray(providers) ? providers : providers?.content || []
        );
        const rangeList = Array.isArray(ranges?.content) ? ranges.content : Array.isArray(ranges) ? ranges : [];
        setRangeOptions(rangeList.map((r) => ({ id: r.id ?? r.rangeId, name: r.rangeName ?? r.name ?? r.id ?? r.rangeId })));
        const clientList = Array.isArray(clients?.content) ? clients.content : Array.isArray(clients) ? clients : [];
        setClientOptions(clientList.map((c) => ({ id: c.id ?? c.clientId, name: c.name ?? c.username ?? c.id ?? c.clientId })));
      } catch {
        setProviderOptions([]);
        setRangeOptions([]);
        setClientOptions([]);
      }
    };
    loadOptions();
  }, [companyId]);

  const columns = useMemo(() => ALLOCATION_COLUMNS(() => {}), []);

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

  const handleAllocate = () => setModalShow(true);

  const handleCloseModal = () => setModalShow(false);

  const handleSubmit = async (values) => {
    if (!companyId) {
      toast.error('Select a company first');
      return;
    }
    setSubmitting(true);
    try {
      await smsService.createBulkAllocation(
        {
          providerId: values.providerId,
          rangeId: values.rangeId,
          agentId: values.agentId,
          agent: values.agentId,
          paymentTerm: values.paymentTerm,
          qtyEachRange: values.qtyEachRange ?? 0
        },
        { companyId }
      );
      toast.success('Bulk allocation created');
      handleCloseModal();
      loadAllocations(false);
    } catch (e) {
      toast.error(e.message || 'Failed to create allocation');
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

  const exportColumns = useMemo(
    () => ['Date', 'Agent', 'Qty/Each Range', 'Total Number'],
    []
  );

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        return {
          Date: row.date ?? '-',
          Agent: row.agent ?? '-',
          'Qty/Each Range': row.qtyEachRange ?? '-',
          'Total Number': row.totalNumber ?? '-'
        };
      }),
    [table, filteredData]
  );

  const providerSelectOptions = useMemo(
    () => providerOptions.map((p) => ({ id: String(p.id ?? p.connectorId), name: p.name || p.connectorId || String(p.id) })),
    [providerOptions]
  );

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">SMS Bulk Allocations</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
                  {(isPlatformAdmin || isCompanyAdmin) && (
                    <IconButton
                      variant="primary"
                      size="sm"
                      icon="plus"
                      transform="shrink-3"
                      title="Allocate Numbers"
                      onClick={handleAllocate}
                      disabled={!companyId}
                    >
                      <span className="d-none d-sm-inline-block ms-1">New</span>
                    </IconButton>
                  )}
                  {(isPlatformAdmin || isCompanyAdmin) && companies.length > 0 && (
                    <TableSelectFilter
                      className="table-page-filter flex-shrink-0"
                      value={selectedCompanyId}
                      placeholder="All Companies"
                      onChange={(v) => setSelectedCompanyId(v || '')}
                      options={companies.map((c) => ({ value: String(c.id), label: c.name || c.code || String(c.id) }))}
                    />
                  )}
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    className="mx-2"
                    onExport={(type) =>
                      exportRowsByType({
                        type,
                        title: 'SMS Bulk Allocations',
                        filenamePrefix: 'sms-bulk-allocations',
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
          <Card.Body className="p-0 position-relative">
            {loading && (
              <div
                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-light bg-opacity-75"
                style={{ zIndex: 5 }}
              >
                <Spinner animation="border" size="sm" className="me-2" />
                Loading...
              </div>
            )}
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

      {(isPlatformAdmin || isCompanyAdmin) && (
        <BulkAllocationFormModal
          show={modalShow}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          providerOptions={providerSelectOptions}
          rangeOptions={rangeOptions}
          clientOptions={clientOptions}
        />
      )}
    </>
  );
};

export default BulkAllocations;
