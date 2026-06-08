import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useScopeStableEffect } from 'hooks/usePolling';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect, TableSelectFilter, ConfirmDelete, UseSelect } from 'components/common/UseTable';
import RangeFormModal from 'components/sms/forms/RangeFormModal';
import smsService from 'services/smsService';
import clientService from 'services/clientService';
import companyService from 'services/companyService';
import { getAuthUser, getUserResourceId } from 'components/authentication/authStorage';
import { toast } from 'react-toastify';
import { exportRowsByType } from 'utils/tableExport';
import * as XLSX from 'xlsx';

const RANGE_COLUMNS = (onEdit, onDelete, onAssign, onUnassign, onDownload, canManageRanges) => {
  const cols = [
    { accessorKey: 'providerName', header: 'Provider', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'rangeName', header: 'Name', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'rangePrefix', header: 'Prefix', meta: { headerProps: { className: 'text-900' } } },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } }
    },
    { accessorKey: 'currency', header: 'Currency', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'paymentTerm', header: 'Payterm', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'payout', header: 'Payout', meta: { headerProps: { className: 'text-900' } } },
    { accessorKey: 'cliList', header: 'CLLList', meta: { headerProps: { className: 'text-900' } } },
    {
      accessorKey: 'qty',
      header: 'Qty',
      meta: { headerProps: { className: 'text-900 text-end' }, cellProps: { className: 'text-end' } }
    }
  ];

  if (canManageRanges) {
    cols.push({
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } },
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
            icon="user-plus"
            transform="shrink-3"
            className="me-2 text-success shadow-none"
            title="Assign Client"
            onClick={() => onAssign(original)}
          />
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="user-slash"
            transform="shrink-3"
            className="me-2 text-warning shadow-none"
            title="Unassign Client"
            onClick={() => onUnassign(original)}
          />
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="download"
            transform="shrink-3"
            className="me-2 text-info shadow-none"
            title="Download Numbers"
            onClick={() => onDownload(original)}
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
    });
  }

  return cols;
};

const CreateRanges = () => {
  const authUser = getAuthUser();
  const roleSet = new Set(
    (Array.isArray(authUser?.roles) ? authUser.roles : []).map((r) =>
      String(r || '')
        .replace(/^ROLE_/i, '')
        .trim()
        .toUpperCase()
    )
  );
  const isPlatformAdmin = roleSet.has('PLATFORM_ADMIN');
  const isCompanyAdmin = roleSet.has('COMPANY_ADMIN');
  const canManageRanges = isPlatformAdmin || isCompanyAdmin;
  const isClientRole = authUser?.roles?.some((r) => String(r || '').startsWith('CLIENT_'));
  const resourceId = getUserResourceId();
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [defaultCompanyId, setDefaultCompanyId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [providerFilterOptions, setProviderFilterOptions] = useState([]);
  const [providerSelectOptions, setProviderSelectOptions] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [assignModalShow, setAssignModalShow] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignClientId, setAssignClientId] = useState('');
  const [assigningClient, setAssigningClient] = useState(false);

  const companyId = isPlatformAdmin
    ? (selectedCompanyId || '')
    : isCompanyAdmin
      ? (defaultCompanyId || '')
      : '';

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        if ((isCompanyAdmin || isClientRole) && resourceId) {
          const company = await companyService.getById(resourceId);
          const normalized = company?.id ? [company] : [];
          setCompanies(normalized);
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
  }, [isPlatformAdmin, isCompanyAdmin, isClientRole, resourceId]);

  useEffect(() => {
    if ((isCompanyAdmin || isClientRole) && defaultCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(defaultCompanyId);
    }
  }, [isCompanyAdmin, isClientRole, defaultCompanyId, selectedCompanyId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(String(query || '').trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [companyId, filterProvider, debouncedQuery, selectedCompanyId]);

  useEffect(() => {
    const size = Math.max(1, pagination.pageSize);
    if (totalRows <= 0) {
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
      return;
    }
    const maxIndex = Math.max(0, Math.ceil(totalRows / size) - 1);
    if (pagination.pageIndex > maxIndex) {
      setPagination((p) => ({ ...p, pageIndex: maxIndex }));
    }
  }, [totalRows, pagination.pageSize, pagination.pageIndex]);

  useScopeStableEffect(() => {
    const loadProviders = async () => {
      try {
        const result = companyId
          ? await companyService.listProviders(companyId, { page: 0, size: 200 })
          : await smsService.listProviderOptions();
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.content)
            ? result.content
            : [];
        setProviderFilterOptions(
          list.map((p) => ({
            value: String(p.id ?? p.connectorId ?? p.name),
            label: p.name || p.connectorId || String(p.id)
          }))
        );
        setProviderSelectOptions(
          list.map((p) => ({
            id: String(p.id),
            name: p.name || p.connectorId || String(p.id)
          }))
        );
      } catch (e) {
        toast.error(e.message || 'Failed to load providers');
        setProviderFilterOptions([]);
        setProviderSelectOptions([]);
      }
    };
    loadProviders();
  }, [companyId]);

  useScopeStableEffect(() => {
    const loadClients = async () => {
      try {
        if (!companyId) {
          setClientOptions([]);
          return;
        }
        const result = await clientService.list(companyId, { page: 0, size: 200 });
        const clients = Array.isArray(result?.content)
          ? result.content
          : Array.isArray(result)
            ? result
            : [];
        setClientOptions(
          clients.map((c) => ({
            id: String(c.id ?? c.clientId ?? c.username ?? c.name),
            name: c.name || c.username || String(c.id ?? c.clientId)
          }))
        );
      } catch {
        setClientOptions([]);
      }
    };
    loadClients();
  }, [companyId]);

  const loadRanges = useCallback(
    async (silent = false, overrides = {}) => {
      if (!silent) setLoading(true);
      try {
        const pageIndex = overrides.pageIndex !== undefined ? overrides.pageIndex : pagination.pageIndex;
        const pageSize = overrides.pageSize !== undefined ? overrides.pageSize : pagination.pageSize;
        const params = {
          page: pageIndex,
          size: Math.max(1, pageSize)
        };
        if (companyId) {
          params.companyId = companyId;
        }
        if ((isPlatformAdmin || isCompanyAdmin) && filterProvider) {
          params.provider = filterProvider;
        }
        if (debouncedQuery) {
          params.search = debouncedQuery;
        }
        const resp = await smsService.listRanges(params);
        const list = Array.isArray(resp?.content) ? resp.content : Array.isArray(resp) ? resp : [];
        const normalized = list.map((item) => {
          const active = item.active ?? true;
          return {
            id: item.id,
            providerId: item.providerId ?? item.provider_id,
            providerName: item.providerName ?? item.provider ?? item.provider_name ?? '',
            rangeName: item.rangeName ?? item.name ?? '',
            rangePrefix: item.rangePrefix ?? item.prefix ?? '',
            currency: item.currency ?? '',
            paymentTerm: item.paymentTerm ?? item.payment ?? '',
            payout: item.payout ?? null,
            cliList: item.cliList ?? item.cliLimitsList ?? '',
            active,
            status: active ? 'Active' : 'Inactive',
            qty: item.qty ?? 0,
            ...item
          };
        });
        setData(normalized);
        setTotalRows(typeof resp?.totalElements === 'number' ? resp.totalElements : normalized.length);
      } catch (e) {
        if (!silent) toast.error(e.message || 'Failed to load ranges');
        setData([]);
        setTotalRows(0);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      pagination.pageIndex,
      pagination.pageSize,
      companyId,
      filterProvider,
      debouncedQuery,
      isPlatformAdmin,
      isCompanyAdmin
    ]
  );

  useEffect(() => {
    loadRanges(false);
  }, [loadRanges]);

  const handleDeleteRange = useCallback(
    async (record) => {
      if (!record?.id) return;
      setDeleting(true);
      try {
        await smsService.removeRange(record.id);
        toast.success('Range deleted');
        loadRanges(false);
      } catch (e) {
        toast.error(e.message || 'Failed to delete range');
      } finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    },
    [loadRanges]
  );

  const handleAssignOpen = useCallback((record) => {
    setAssignTarget(record);
    setAssignClientId('');
    setAssignModalShow(true);
  }, []);

  const handleAssignSubmit = useCallback(async () => {
    if (!assignTarget?.id || !assignClientId) {
      toast.error('Select a client');
      return;
    }
    setAssigningClient(true);
    try {
      await smsService.assignRangeClient(assignTarget.id, { clientId: assignClientId });
      toast.success('Client assigned to range');
      setAssignModalShow(false);
      setAssignTarget(null);
      setAssignClientId('');
      loadRanges(false);
    } catch (e) {
      toast.error(e.message || 'Failed to assign client');
    } finally {
      setAssigningClient(false);
    }
  }, [assignTarget, assignClientId, loadRanges]);

  const handleUnassignClient = useCallback(async (record) => {
    if (!record?.id) return;
    try {
      await smsService.unassignRangeClient(record.id);
      toast.success('Client unassigned from range');
      loadRanges(false);
    } catch (e) {
      toast.error(e.message || 'Failed to unassign client');
    }
  }, [loadRanges]);

  const handleDownloadNumbers = useCallback(async (record) => {
    if (!record?.id) return;
    try {
      const res = await smsService.getRangeNumbers(record.id);
      const items = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      if (!items.length) {
        toast.warn('No numbers found');
        return;
      }

      const allNumbers = [];
      for (const item of items) {
        if (item.type === 'single') {
          allNumbers.push(item.number);
        } else if (item.type === 'range') {
          const start = BigInt(item.rangeStart);
          const end = BigInt(item.rangeEnd);
          const limit = 100000n;
          const count = end - start + 1n > limit ? limit : end - start + 1n;
          for (let n = start; n < start + count; n++) {
            allNumbers.push(String(n));
          }
        }
      }
      if (!allNumbers.length) {
        toast.warn('No numbers found');
        return;
      }

      const rangeName = record.rangeName || record.name || 'range';

      const ws = XLSX.utils.json_to_sheet(allNumbers.map((n) => ({ Number: n })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Numbers');
      XLSX.writeFile(wb, `${rangeName}-numbers.xlsx`);

      const txt = allNumbers.join('\n');
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rangeName}-numbers.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to download numbers');
    }
  }, []);

  const manualPageCount =
    totalRows === 0 ? 0 : Math.ceil(totalRows / Math.max(1, pagination.pageSize));

  const columns = useMemo(
    () =>
      RANGE_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => setDeleteTarget(record),
        handleAssignOpen,
        handleUnassignClient,
        handleDownloadNumbers,
        canManageRanges
      ),
    [canManageRanges, handleAssignOpen, handleUnassignClient, handleDownloadNumbers]
  );

  const exportColumns = useMemo(
    () => ['Provider', 'Name', 'Prefix', 'Status', 'Currency', 'Payterm', 'Payout', 'CLLList', 'Qty'],
    []
  );

  const table = useAdvanceTable({
    data,
    columns,
    selection: canManageRanges,
    sortable: true,
    pagination: true,
    manualPagination: true,
    pageCount: manualPageCount,
    onPaginationChange: setPagination,
    controlledPagination: pagination,
    rowCount: totalRows,
    perPage: 25,
    perPageOptions: [25, 50, 100, 500, 1000, 5000],
    selectionColumnWidth: 30
  });

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        return {
          Provider: row.providerName || '-',
          Name: row.rangeName || '-',
          Prefix: row.rangePrefix || '-',
          Status: row.status || '-',
          Currency: row.currency || '-',
          Payterm: row.paymentTerm || '-',
          Payout: row.payout ?? '-',
          CLLList: row.cliList || '-',
          Qty: row.qty ?? '-'
        };
      }),
    [table, data]
  );

  const handleAddRange = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const [bulkAssignShow, setBulkAssignShow] = useState(false);
  const [bulkAssignProviderId, setBulkAssignProviderId] = useState('');
  const [bulkUnassignShow, setBulkUnassignShow] = useState(false);
  const [bulkDeleteShow, setBulkDeleteShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedRows = table.getSelectedRowModel?.().rows || [];
  const selectedRanges = selectedRows.map((r) => r.original).filter(Boolean);
  const selectedIds = selectedRanges.map((r) => r.id).filter(Boolean);

  const clearSelection = () => {
    try {
      table.resetRowSelection?.();
    } catch {
      // ignore
    }
  };

  const requireSelection = () => {
    if (!selectedIds.length) {
      toast.error('Select at least one range');
      return false;
    }
    return true;
  };

  const handleBulkDelete = async () => {
    if (!requireSelection()) return;
    setSubmitting(true);
    try {
      const resp = await smsService.bulkDeleteRanges({ rangeIds: selectedIds });
      const count = resp?.deletedCount ?? selectedIds.length;
      toast.success(`${count} range${count === 1 ? '' : 's'} deleted`);
      clearSelection();
      loadRanges(false);
    } catch (e) {
      toast.error(e.message || 'Failed to delete selected ranges');
    } finally {
      setSubmitting(false);
      setBulkDeleteShow(false);
    }
  };

  const handleBulkUnassign = async () => {
    if (!requireSelection()) return;
    setSubmitting(true);
    try {
      const resp = await smsService.bulkUnassignRangesProvider({ rangeIds: selectedIds });
      const count = resp?.updatedCount ?? selectedIds.length;
      toast.success(`${count} range${count === 1 ? '' : 's'} unassigned from provider`);
      clearSelection();
      loadRanges(false);
    } catch (e) {
      toast.error(e.message || 'Failed to unassign selected ranges');
    } finally {
      setSubmitting(false);
      setBulkUnassignShow(false);
    }
  };

  const handleBulkAssignOpen = () => {
    if (!requireSelection()) return;
    setBulkAssignProviderId(filterProvider || '');
    setBulkAssignShow(true);
  };

  const submitBulkAssign = async () => {
    if (!bulkAssignProviderId) {
      toast.error('Select a provider');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await smsService.bulkAssignRangesProvider({
        rangeIds: selectedIds,
        providerId: bulkAssignProviderId
      });
      const count = resp?.updatedCount ?? selectedIds.length;
      toast.success(`${count} range${count === 1 ? '' : 's'} assigned to provider`);
      setBulkAssignShow(false);
      clearSelection();
      loadRanges(false);
    } catch (e) {
      toast.error(e.message || 'Failed to assign selected ranges');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRange = async (values) => {
    const providerName =
      providerSelectOptions.find((p) => String(p.id) === String(values.providerId))?.name ?? null;

    const payload = {
      providerId: values.providerId || null,
      providerName,
      rangeName: values.rangeName || '',
      rangePrefix: values.rangePrefix || '',
      paymentTerm: values.paymentTerm || '',
      currency: values.currency || '',
      payout: values.payout || null,
      maxSmsLimitDay: values.maxSmsLimitDay || null,
      cliLimitsList: values.cliLimitsList || null,
      memoText: values.memoText || null
    };

    try {
      if (recordForEdit && recordForEdit.id) {
        await smsService.updateRange(recordForEdit.id, payload);
        toast.success('Range updated');
      } else {
        await smsService.createRange(payload);
        toast.success('Range created');
      }
      handleCloseModal();
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      loadRanges(false, { pageIndex: 0 });
    } catch (e) {
      toast.error(e.message || 'Failed to save range');
    }
  };

  return (
    <>
      <AdvanceTableProvider {...table}>
        <Card className="mb-3">
          <Card.Header>
            <Row className="flex-between-center">
              <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Manage SMS Ranges</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
                  {canManageRanges && (
                    <IconButton
                      variant="primary"
                      size="sm"
                      icon="plus"
                      transform="shrink-3"
                      title="Add New Range"
                      onClick={handleAddRange}
                    >
                      <span className="d-none d-sm-inline-block ms-1">New</span>
                    </IconButton>
                  )}
                  {/* {(isPlatformAdmin || isCompanyAdmin) && companies.length > 0 && (
                    <TableSelectFilter
                      className="table-page-filter flex-shrink-0"
                      value={selectedCompanyId}
                      placeholder="All Companies"
                      onChange={(value) => setSelectedCompanyId(value || '')}
                      options={companies.map((c) => ({ value: String(c.id), label: c.name || c.code || String(c.id) }))}
                    />
                  )} */}
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    className="mx-2"
                    onExport={(type) => exportRowsByType({
                      type,
                      title: 'SMS Ranges',
                      filenamePrefix: 'sms-ranges',
                      columns: exportColumns,
                      rows: exportRows
                    })}
                  />
                  {(isPlatformAdmin || isCompanyAdmin) && (
                    <TableSelectFilter
                      className="table-page-filter"
                      value={filterProvider}
                      placeholder="Select Provider"
                      onChange={(value) => setFilterProvider(value)}
                      options={providerFilterOptions}
                    />
                  )}
                  {canManageRanges && (
                    <>
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="user-check"
                        transform="shrink-3"
                        title="Assign provider to selected"
                        onClick={handleBulkAssignOpen}
                        disabled={!selectedIds.length || submitting}
                      />
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="user-slash"
                        transform="shrink-3"
                        title="Unassign provider from selected"
                        onClick={() => {
                          if (!requireSelection()) return;
                          setBulkUnassignShow(true);
                        }}
                        disabled={!selectedIds.length || submitting}
                      />
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="trash"
                        transform="shrink-3"
                        title="Delete selected"
                        onClick={() => {
                          if (!requireSelection()) return;
                          setBulkDeleteShow(true);
                        }}
                        disabled={!selectedIds.length || submitting}
                        className="text-danger"
                      />
                    </>
                  )}
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
              <div className="text-center py-5">Loading ranges...</div>
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
              totalRowCountOverride={totalRows}
              rowsPerPageOptions={[25, 50, 100, 250, 500, 1000, 5000]}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      {canManageRanges && (
        <RangeFormModal
          show={modalShow}
          record={recordForEdit}
          onClose={handleCloseModal}
          onSubmit={handleSubmitRange}
          providerOptions={providerSelectOptions}
        />
      )}
      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteRange(deleteTarget)}
        title="Delete Range"
        message={`Are you sure you want to delete range "${deleteTarget?.rangeName || ''}"? This action cannot be undone.`}
        loading={deleting}
      />

      <Modal show={bulkAssignShow} onHide={() => setBulkAssignShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-9">Assign Provider to {selectedIds.length} Range{selectedIds.length === 1 ? '' : 's'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-0">
            <Form.Label className="fs-10 mb-1">Provider</Form.Label>
            <TableSelectFilter
              value={bulkAssignProviderId}
              placeholder="Select a provider"
              onChange={(value) => setBulkAssignProviderId(value || '')}
              options={providerFilterOptions}
              allowClear={false}
              className="w-100"
            />
            <Form.Text className="text-600 fs-11">
              The selected ranges will route through this provider as their primary.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="falcon-default" size="sm" onClick={() => setBulkAssignShow(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={submitBulkAssign} disabled={!bulkAssignProviderId || submitting}>
            {submitting ? 'Assigning…' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDelete
        show={bulkUnassignShow}
        onHide={() => setBulkUnassignShow(false)}
        onConfirm={handleBulkUnassign}
        title="Unassign Provider"
        message={`Remove the primary provider from ${selectedIds.length} selected range${selectedIds.length === 1 ? '' : 's'}? They will fall back to their default routing.`}
        confirmLabel="Unassign"
        loading={submitting}
      />

      <ConfirmDelete
        show={bulkDeleteShow}
        onHide={() => setBulkDeleteShow(false)}
        onConfirm={handleBulkDelete}
        title="Delete Ranges"
        message={`Delete ${selectedIds.length} selected range${selectedIds.length === 1 ? '' : 's'}? This will also cascade-delete the linked number assignments. This action cannot be undone.`}
        loading={submitting}
      />

      <Modal show={assignModalShow} onHide={() => { setAssignModalShow(false); setAssignTarget(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-9">Assign Client to Range "{assignTarget?.rangeName || ''}"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-0">
            <Form.Label className="fs-10 mb-1">Client</Form.Label>
            <UseSelect
              name="assignClientId"
              label=""
              options={clientOptions}
              value={assignClientId}
              onChange={(value) => setAssignClientId(value || '')}
              placeholder="Select client..."
              showSearch
            />
            <Form.Text className="text-600 fs-11">
              The selected client will be assigned to this range.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="falcon-default" size="sm" onClick={() => { setAssignModalShow(false); setAssignTarget(null); }} disabled={assigningClient}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleAssignSubmit} disabled={!assignClientId || assigningClient}>
            {assigningClient ? 'Assigning...' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateRanges;
