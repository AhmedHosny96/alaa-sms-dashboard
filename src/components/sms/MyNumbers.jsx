import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScopeStableEffect } from 'hooks/usePolling';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TableExportSelect, TableSelectFilter, ConfirmAction, ConfirmDelete } from 'components/common/UseTable';
import { UseModal, UseSelect } from 'components/common/UseTable';
import NumberFormModal from 'components/sms/forms/NumberFormModal';
import AssignNumberPanel from 'components/sms/forms/AssignNumberPanel';
import IconButton from 'components/common/IconButton';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import smsService from 'services/smsService';
import companyService from 'services/companyService';
import clientService from 'services/clientService';
import { getAuthUser, getTokenPayload, getUserResourceId } from 'components/authentication/authStorage';
import { toast } from 'react-toastify';
import { exportRowsByType } from 'utils/tableExport';
import { useNavigate } from 'react-router-dom';
import paths from 'routes/paths';
import {
  dedupeMsisdnsPreserveOrder,
  extractNumbersFromCsvText,
  extractNumbersFromFreeText,
  formatAssignedNumber,
  normalizeMsisdnDigits
} from 'utils/numberAssignmentInput';

const categoryLabelCell = (row) => {
  const stored = String(row.category ?? row.numberType ?? '').toLowerCase();
  if (stored === 'test' || stored.includes('test')) return 'Test';
  if (row.isTestNumber) return 'Test';
  return 'General SMS';
};

const mapCategoryPayload = (categoryId) => {
  const s = String(categoryId ?? '').trim();
  if (!s) return null;
  return s.toLowerCase().includes('test') ? 'test' : 'general';
};

const ROUTE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const parseOptionalRouteId = (raw) => {
  if (raw == null || raw === '') return undefined;
  const s = String(raw).trim();
  return ROUTE_UUID_RE.test(s) ? s : undefined;
};

const NUMBER_COLUMNS = (onEdit, onDelete, onToggleInbound, canManageNumbers, onAssign) => {
  const cols = [
    {
      accessorKey: 'provider',
      header: 'Provider',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => original.providerName || original.provider || original.connectorId || '—'
    },
    {
      accessorKey: 'range',
      header: 'Range',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => original.rangeName || original.range || original.rangeId || '—'
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => categoryLabelCell(original)
    },
    {
      accessorKey: 'prefix',
      header: 'Prefix',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => original.prefix || original.rangePrefix || '—'
    },
    {
      accessorKey: 'msisdn',
      header: 'Number',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => formatAssignedNumber(original)
    },
    // {
    //   accessorKey: 'inboundEnabled',
    //   header: 'Inbound',
    //   meta: { headerProps: { className: 'text-900 text-center' }, cellProps: { className: 'text-center' } },
    //   cell: ({ row: { original } }) =>
    //     canManageNumbers && onToggleInbound ? (
    //       <Badge
    //         bg={original.inboundEnabled ? 'success' : 'secondary'}
    //         className="cursor-pointer"
    //         onClick={() => onToggleInbound(original)}
    //         title="Click to toggle"
    //       >
    //         {original.inboundEnabled ? 'On' : 'Off'}
    //       </Badge>
    //     ) : (
    //       <Badge bg={original.inboundEnabled ? 'success' : 'secondary'}>{original.inboundEnabled ? 'On' : 'Off'}</Badge>
    //     )
    // },
    {
      accessorKey: 'myPayout',
      header: 'My Payout',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => original.myPayout || original.payout || '—'
    },
    {
      accessorKey: 'client',
      header: 'Client',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) =>
        original.clientName || original.client || original.agentName || original.assignedTo || original.clientId || '—'
    },
    {
      accessorKey: 'agentPayout',
      header: 'Payout',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => original.agentPayout || original.clientPayout || '—'
    },
    {
      accessorKey: 'limits',
      header: 'Limits',
      meta: { headerProps: { className: 'text-900' } },
      cell: ({ row: { original } }) => {
        const day = original.maxSmsDay ?? original.maxSmsLimitDay ?? 0;
        const week = original.maxSmsWeek ?? original.maxSmsLimitWeek ?? 0;
        return `SD : ${day} | SW : ${week}`;
      }
    }
  ];

  if (canManageNumbers) {
    cols.push({
      accessorKey: 'actions',
      header: 'Action',
      enableSorting: false,
      meta: { headerProps: { className: 'text-900 text-end' }, cellProps: { className: 'text-end' } },
      cell: ({ row: { original } }) => (
        <div className="d-inline-flex align-items-center">
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="user-plus"
            transform="shrink-3"
            className="me-2 text-info shadow-none"
            title="Assign"
            onClick={() => onAssign(original)}
          />
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
    });
  }

  return cols;
};

const normalizeRoleName = (role) => String(role || '')
  .trim()
  .toUpperCase()
  .replace(/^ROLE_/, '')
  .replace(/[\s-]+/g, '_')
  .replace(/^PLATFORMADMIN$/, 'PLATFORM_ADMIN')
  .replace(/^COMPANYADMIN$/, 'COMPANY_ADMIN')
  .replace(/^COMPANYFINANCE$/, 'COMPANY_FINANCE');

const coalesceRoles = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return Object.values(raw);
  if (raw) return [raw];
  return [];
};

const toOption = (value, label) => ({
  value: String(value),
  label: String(label || value)
});

const MyNumbers = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const tokenPayload = getTokenPayload();
  const normalizedRoles = coalesceRoles(authUser?.roles ?? tokenPayload?.roles).map(normalizeRoleName);
  const isPlatformAdmin = normalizedRoles.includes('PLATFORM_ADMIN');
  const isCompanyAdmin = normalizedRoles.includes('COMPANY_ADMIN');
  const isCompanyRole = normalizedRoles.some((role) => role.startsWith('COMPANY_'));
  const isClientRole = normalizedRoles.some((role) => role.startsWith('CLIENT_'));
  const canManageNumbers = isPlatformAdmin || isCompanyAdmin;
  const resourceId = getUserResourceId() || tokenPayload?.resourceId || tokenPayload?.companyId || null;
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [defaultCompanyId, setDefaultCompanyId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterRange, setFilterRange] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterNumberScope, setFilterNumberScope] = useState('');
  const [filterNumberType, setFilterNumberType] = useState('');
  const [providerOptions, setProviderOptions] = useState([]);
  const [rangeOptions, setRangeOptions] = useState([]);
  const [agentOptions, setAgentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [totalRows, setTotalRows] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkAssignShow, setBulkAssignShow] = useState(false);
  const [bulkAssignClientId, setBulkAssignClientId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteShow, setBulkDeleteShow] = useState(false);
  const [bulkUnassignShow, setBulkUnassignShow] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const companyContextId = resourceId ? String(resourceId) : '';
  const companyId = isPlatformAdmin
    ? (selectedCompanyId || '')
    : isCompanyRole
      ? (companyContextId || defaultCompanyId || '')
      : '';

  const numberTypeOptions = useMemo(
    () => [
      { value: 'test', label: 'Test' },
      { value: 'general', label: 'General' }
    ],
    []
  );

  const selectedProviderLabel = useMemo(
    () => providerOptions.find((option) => String(option.value) === String(filterProvider))?.label || '',
    [providerOptions, filterProvider]
  );

  const selectedRangeLabel = useMemo(
    () => rangeOptions.find((option) => String(option.value) === String(filterRange))?.label || '',
    [rangeOptions, filterRange]
  );

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];

    if ((isPlatformAdmin || isCompanyAdmin) && filterProvider) {
      list = list.filter((row) => {
        const selected = String(filterProvider);
        const selectedLabel = String(selectedProviderLabel || '');
        const matchValues = [row.providerName, row.provider, row.providerId, row.connectorId]
          .filter(Boolean)
          .map((value) => String(value));
        return matchValues.includes(selected) || (selectedLabel && matchValues.includes(selectedLabel));
      });
    }

    if (filterRange) {
      list = list.filter((row) => {
        const selected = String(filterRange);
        const selectedLabel = String(selectedRangeLabel || '');
        const matchValues = [
          row.rangeName,
          row.range,
          row.rangeId,
          row.prefix,
          [row.rangeStart, row.rangeEnd].filter(Boolean).join('-')
        ]
          .filter(Boolean)
          .map((value) => String(value));
        return matchValues.includes(selected) || (selectedLabel && matchValues.includes(selectedLabel));
      });
    }

    return list;
  }, [
    data,
    filterProvider,
    filterRange,
    isPlatformAdmin,
    selectedProviderLabel,
    selectedRangeLabel
  ]);

  const exportColumns = useMemo(
    () => [
      'Provider',
      'Range',
      'Category',
      'Prefix',
      'Number',
      'Inbound',
      'My Payout',
      'Client',
      'Payout',
      'Limits'
    ],
    []
  );

  const fetchCompanies = useCallback(async () => {
    try {
      if (isCompanyRole || isClientRole) {
        if (companyContextId) {
          setDefaultCompanyId(companyContextId);
        }
        const result = await companyService.list({ page: 0, size: 100 });
        const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
        if (list.length > 0) {
          const match = companyContextId ? list.find((c) => String(c?.id) === String(companyContextId)) : null;
          const resolved = match || list[0];
          setCompanies([resolved]);
          if (resolved?.id) {
            setDefaultCompanyId(String(resolved.id));
          }
          return;
        }
        if (companyContextId) {
          const company = await companyService.getById(companyContextId);
          const normalized = company?.id ? [company] : [];
          setCompanies(normalized);
          setDefaultCompanyId(company?.id ? String(company.id) : '');
          return;
        }
        setCompanies([]);
        setDefaultCompanyId('');
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
  }, [isPlatformAdmin, isCompanyRole, isClientRole, companyContextId]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if ((isCompanyRole || isClientRole) && defaultCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(defaultCompanyId);
    }
  }, [isCompanyRole, isClientRole, defaultCompanyId, selectedCompanyId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    companyId,
    debouncedQuery,
    filterAgent,
    filterNumberType,
    filterNumberScope,
    selectedCompanyId
  ]);

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

  const fetchNumbers = useCallback(
    async (silent = false, listOverrides = {}) => {
      if (!silent) setLoading(true);
      try {
        const pageIndex = listOverrides.pageIndex !== undefined ? listOverrides.pageIndex : pagination.pageIndex;
        const pageSize = listOverrides.pageSize !== undefined ? listOverrides.pageSize : pagination.pageSize;
        const params = {
          page: pageIndex,
          size: pageSize
        };
        if (silent) params.live = true;
        if (debouncedQuery) {
          params.search = debouncedQuery;
        }
        if (isClientRole && resourceId) {
          params.clientId = resourceId;
        } else if (companyId) {
          params.companyId = companyId;
        }
        if (filterAgent) {
          params.filterClientId = filterAgent;
        }
        if (filterNumberType) {
          params.category = filterNumberType;
        }
        if (filterNumberScope === 'allocated') {
          params.allocated = true;
        } else if (filterNumberScope === 'unallocated') {
          params.allocated = false;
        }
        const result = await smsService.listNumbers(params);
        const list = Array.isArray(result?.content)
          ? result.content
          : Array.isArray(result)
            ? result
            : [];
        setData(list);
        setTotalRows(typeof result?.totalElements === 'number' ? result.totalElements : list.length);
      } catch (e) {
        if (!silent) toast.error(e.message || 'Failed to load numbers');
        setData([]);
        setTotalRows(0);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      pagination.pageIndex,
      pagination.pageSize,
      debouncedQuery,
      companyId,
      isClientRole,
      resourceId,
      filterAgent,
      filterNumberType,
      filterNumberScope
    ]
  );

  useEffect(() => {
    fetchNumbers(false);
  }, [fetchNumbers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNumbers(true).finally(() => setRefreshing(false));
  };

  const dataRef = useRef(data);
  dataRef.current = data;

  useScopeStableEffect(() => {
    const loadFilterOptions = async () => {
      const rows = Array.isArray(dataRef.current) ? dataRef.current : [];
      let loadedProviders = [];
      let loadedRanges = [];
      let loadedClients = [];
      try {
        const providerParams = { page: 0, size: 200 };
        if (companyId) {
          providerParams.companyId = companyId;
        }
        const providerResult = await smsService.listProviders(providerParams);
        loadedProviders = Array.isArray(providerResult)
          ? providerResult
          : Array.isArray(providerResult?.content)
            ? providerResult.content
            : [];
        setProviderOptions(
          loadedProviders.map((item) => ({
            value: String(item.id ?? item.connectorId ?? item.name),
            label: item.name || item.connectorId || String(item.id)
          }))
        );
      } catch {
        setProviderOptions([]);
      }

      try {
        const rangeParams = { page: 0, size: 200 };
        if (companyId) {
          rangeParams.companyId = companyId;
        }
        const rangeResult = await smsService.listRanges(rangeParams);
        const ranges = Array.isArray(rangeResult?.content)
          ? rangeResult.content
          : Array.isArray(rangeResult)
            ? rangeResult
            : [];
        loadedRanges = ranges;
        setRangeOptions(
          ranges.map((item) => ({
            value: String(item.id ?? item.rangeId ?? item.name ?? item.rangeName),
            label: item.rangeName || item.name || item.prefix || String(item.id ?? item.rangeId)
          }))
        );
      } catch {
        setRangeOptions([]);
      }

      try {
        const clientResult = companyId
          ? await clientService.list(companyId, { page: 0, size: 200 })
          : { content: [] };
        const clients = Array.isArray(clientResult?.content)
          ? clientResult.content
          : Array.isArray(clientResult)
            ? clientResult
            : [];
        loadedClients = clients;
        setAgentOptions(
          clients.map((item) => ({
            value: String(item.id ?? item.clientId ?? item.username ?? item.name),
            label: item.name || item.username || String(item.id ?? item.clientId)
          }))
        );
      } catch {
        setAgentOptions([]);
      }

      if (!loadedProviders.length) {
        const providerFallback = new Map();
        loadedRanges.forEach((item) => {
          const id = item.providerId ?? item.provider_id;
          const name = item.providerName ?? item.provider ?? item.provider_name;
          if (id && name) providerFallback.set(String(id), String(name));
        });
        rows.forEach((row) => {
          const id = row.providerId || row.connectorId;
          const name = row.providerName || row.provider;
          if (id && name) providerFallback.set(String(id), String(name));
        });
        if (providerFallback.size) {
          setProviderOptions(
            Array.from(providerFallback.entries()).map(([value, label]) => toOption(value, label))
          );
        }
      }

      if (!loadedRanges.length) {
        const rangeFallback = new Map();
        rows.forEach((row) => {
          const id = row.rangeId || row.range || row.rangeName || row.prefix;
          const label = row.rangeName || row.range || row.prefix;
          if (id && label) rangeFallback.set(String(id), String(label));
        });
        if (rangeFallback.size) {
          setRangeOptions(Array.from(rangeFallback.entries()).map(([value, label]) => toOption(value, label)));
        }
      }

      if (!loadedClients.length) {
        const clientFallback = new Map();
        rows.forEach((row) => {
          const id = row.clientId || row.agentId || row.clientUsername || row.clientName || row.assignedTo;
          const label = row.clientName || row.client || row.agentName || row.assignedTo || row.clientUsername;
          if (id && label) clientFallback.set(String(id), String(label));
        });
        if (clientFallback.size) {
          setAgentOptions(Array.from(clientFallback.entries()).map(([value, label]) => toOption(value, label)));
        }
      }
    };

    loadFilterOptions();
  }, [companyId]);

  useScopeStableEffect(() => {
    const rows = Array.isArray(dataRef.current) ? dataRef.current : [];
    if (!rows.length) return;
    setProviderOptions((prev) => {
      if (prev.length) return prev;
      const m = new Map();
      rows.forEach((row) => {
        const id = row.providerId || row.connectorId;
        const name = row.providerName || row.provider;
        if (id && name) m.set(String(id), String(name));
      });
      return m.size ? Array.from(m.entries()).map(([value, label]) => toOption(value, label)) : prev;
    });
    setRangeOptions((prev) => {
      if (prev.length) return prev;
      const m = new Map();
      rows.forEach((row) => {
        const id = row.rangeId || row.range || row.rangeName || row.prefix;
        const label = row.rangeName || row.range || row.prefix;
        if (id && label) m.set(String(id), String(label));
      });
      return m.size ? Array.from(m.entries()).map(([value, label]) => toOption(value, label)) : prev;
    });
    setAgentOptions((prev) => {
      if (prev.length) return prev;
      const m = new Map();
      rows.forEach((row) => {
        const id = row.clientId || row.agentId || row.clientUsername || row.clientName || row.assignedTo;
        const label = row.clientName || row.client || row.agentName || row.assignedTo || row.clientUsername;
        if (id && label) m.set(String(id), String(label));
      });
      return m.size ? Array.from(m.entries()).map(([value, label]) => toOption(value, label)) : prev;
    });
  }, [companyId, pagination.pageIndex, data.length]);

  const handleToggleInbound = useCallback(
    async (record) => {
      if (!record?.id || !companyId) return;
      setSubmitting(true);
      try {
        await smsService.updateNumber(record.id, !record.inboundEnabled, { companyId });
        toast.success('Inbound updated');
        fetchNumbers(false);
      } catch (e) {
        toast.error(e.message || 'Failed to update inbound');
      } finally {
        setSubmitting(false);
      }
    },
    [companyId, fetchNumbers]
  );

  const handleDeleteNumber = async (record) => {
    if (!record?.id) return;
    if (!companyId && !isPlatformAdmin) {
      toast.error('Select a company first');
      return;
    }
    setSubmitting(true);
    try {
      await smsService.removeNumber(record.id, companyId ? { companyId } : undefined);
      toast.success('Number deleted');
      fetchNumbers(false);
    } catch (e) {
      toast.error(e.message || 'Failed to delete number');
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const columns = useMemo(
    () =>
      NUMBER_COLUMNS(
        (record) => {
          setRecordForEdit(record);
          setModalShow(true);
        },
        (record) => setDeleteTarget(record),
        handleToggleInbound,
        canManageNumbers,
        (record) => setAssignTarget(record)
      ),
    [handleToggleInbound, canManageNumbers]
  );

  const handleAddNumber = () => {
    setRecordForEdit(null);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setRecordForEdit(null);
  };

  const handleSubmit = async (values) => {
    if (!companyId) {
      toast.error('Select a company first');
      return;
    }
    const clientId = values.agentId || values.clientId || null;
    const method = values.addMethod || 'single';
    const categoryPayload = mapCategoryPayload(values.categoryId);
    const paymentTerm = values.paymentTerm || null;
    const clientPayout =
      values.agentPayout != null && String(values.agentPayout).trim() !== ''
        ? Number(values.agentPayout)
        : null;
    // Collect per-tier payouts entered in the Agent Payouts table.
    const tierKeys = ['1/1', '7/1', '7/7', '15/15', '15/30', '30/15', '30/30', '30/45', '30/60'];
    const tierPayoutsObj = {};
    tierKeys.forEach((t) => {
      const raw = values[`tierValue_${t.replace('/', '_')}`];
      if (raw != null && String(raw).trim() !== '' && !Number.isNaN(Number(raw))) {
        tierPayoutsObj[t] = Number(raw);
      }
    });
    const tierPayouts = Object.keys(tierPayoutsObj).length ? tierPayoutsObj : null;
    // 0 = none, otherwise the first N created numbers are marked category='test'.
    const testNumberCount = Number(values.testNumberCount) || 0;
    if (!categoryPayload) {
      toast.error('Select a number category');
      return;
    }
    const routeId = parseOptionalRouteId(values.rangeId);
    setSubmitting(true);
    try {
      if (recordForEdit?.id) {
        await smsService.updateNumberDetails(
          recordForEdit.id,
          {
            clientId,
            inboundEnabled: recordForEdit.inboundEnabled ?? true,
            category: categoryPayload,
            paymentTerm,
            clientPayout,
            tierPayouts
          },
          { companyId }
        );
        toast.success('Number updated');
      } else if (method === 'single') {
        const msisdn = normalizeMsisdnDigits(String(values.number || ''));
        if (!msisdn) {
          toast.error('Enter a valid number');
          return;
        }
        await smsService.createNumber(
          {
            clientId,
            msisdn,
            rangeStart: null,
            rangeEnd: null,
            inboundEnabled: true,
            category: categoryPayload,
            paymentTerm,
            clientPayout,
            tierPayouts,
            ...(testNumberCount > 0 ? { testNumberCount } : {}),
            ...(routeId ? { routeId } : {})
          },
          { companyId }
        );
        toast.success('Number created');
      } else if (method === 'series') {
        const rangeStart = normalizeMsisdnDigits(String(values.seriesStart || ''));
        const rangeEnd = normalizeMsisdnDigits(String(values.seriesEnd || ''));
        if (!rangeStart || !rangeEnd) {
          toast.error('Enter numeric start and end for the series');
          return;
        }
        if (!/^\d+$/.test(rangeStart) || !/^\d+$/.test(rangeEnd)) {
          toast.error('Series boundaries must be digits only');
          return;
        }
        try {
          if (BigInt(rangeStart) > BigInt(rangeEnd)) {
            toast.error('Series start must be less than or equal to end');
            return;
          }
        } catch {
          toast.error('Series range values are invalid');
          return;
        }
        const seriesRes = await smsService.createNumber(
          {
            clientId,
            msisdn: null,
            rangeStart,
            rangeEnd,
            inboundEnabled: true,
            category: categoryPayload,
            paymentTerm,
            clientPayout,
            tierPayouts,
            ...(testNumberCount > 0 ? { testNumberCount } : {}),
            ...(routeId ? { routeId } : {})
          },
          { companyId }
        );
        const seriesCount =
          typeof seriesRes?.createdCount === 'number'
            ? seriesRes.createdCount
            : Array.isArray(seriesRes?.items)
              ? seriesRes.items.length
              : 1;
        toast.success(`${seriesCount} number${seriesCount === 1 ? '' : 's'} created`);
      } else {
        let numbers = [];
        if (method === 'list') {
          numbers = extractNumbersFromFreeText(values.listNumbers);
        } else if (method === 'csv') {
          if (!values.csvFile) {
            toast.error('Select a CSV file');
            return;
          }
          const csvText = await values.csvFile.text();
          numbers = extractNumbersFromCsvText(csvText);
        }
        numbers = dedupeMsisdnsPreserveOrder(numbers);
        if (!numbers.length) {
          toast.error('No valid numbers found');
          return;
        }
        const response = await smsService.createNumbersBulk(
          {
            clientId,
            msisdnList: numbers,
            inboundEnabled: true,
            category: categoryPayload,
            paymentTerm,
            clientPayout,
            tierPayouts,
            ...(testNumberCount > 0 ? { testNumberCount } : {}),
            ...(routeId ? { routeId } : {})
          },
          { companyId }
        );
        const createdCount = Number(response?.createdCount ?? numbers.length);
        toast.success(`${createdCount} numbers created`);
      }
      handleCloseModal();
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      await fetchNumbers(true, { pageIndex: 0 });
    } catch (e) {
      toast.error(e.message || 'Failed to create number');
    } finally {
      setSubmitting(false);
    }
  };

  const manualPageCount =
    totalRows === 0 ? 0 : Math.ceil(totalRows / Math.max(1, pagination.pageSize));

  const tableFooterTotalRows = useMemo(() => {
    if (!Array.isArray(data)) return totalRows;
    if (filteredData.length !== data.length) {
      return filteredData.length;
    }
    return totalRows;
  }, [data, filteredData, totalRows]);

  const table = useAdvanceTable({
    data: filteredData,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    manualPagination: true,
    pageCount: manualPageCount,
    onPaginationChange: setPagination,
    controlledPagination: pagination,
    rowCount: totalRows,
    initialState: {
      sorting: [{ id: 'msisdn', desc: false }]
    },
    perPage: 25,
    perPageOptions: [25, 50, 100, 250],
    selectionColumnWidth: 30
  });

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        const day = row.maxSmsDay ?? row.maxSmsLimitDay ?? 0;
        const week = row.maxSmsWeek ?? row.maxSmsLimitWeek ?? 0;
        const numLabel = formatAssignedNumber(row);
        return {
          Provider: row.providerName || row.provider || row.connectorId || '-',
          Range: row.rangeName || row.range || row.rangeId || '-',
          Category: categoryLabelCell(row),
          Prefix: row.prefix || row.rangePrefix || '-',
          Number: numLabel === '—' ? '-' : numLabel,
          Inbound: row.inboundEnabled ? 'On' : 'Off',
          'My Payout': row.myPayout || row.payout || '-',
          Client: row.clientName || row.client || row.agentName || row.assignedTo || row.clientId || '-',
          Payout: row.agentPayout || row.clientPayout || '-',
          Limits: `SD : ${day} | SW : ${week}`
        };
      }),
    [table, filteredData]
  );

  const selectedRows = table.getSelectedRowModel?.().rows || [];
  const selectedAssignments = selectedRows.map((r) => r.original).filter(Boolean);
  const selectedIds = selectedAssignments.map((r) => r.id).filter(Boolean);

  const clearSelection = () => {
    try {
      table.resetRowSelection?.();
    } catch {}
  };

  const requireSelection = () => {
    if (!selectedIds.length) {
      toast.error('Select at least one number');
      return false;
    }
    return true;
  };

  const handleBulkDelete = async () => {
    if (!requireSelection()) return;
    if (!companyId) {
      toast.error('Select a company first');
      return;
    }
    setSubmitting(true);
    try {
      await smsService.bulkDeleteNumbers({ assignmentIds: selectedIds }, { companyId });
      toast.success(`${selectedIds.length} deleted`);
      clearSelection();
      fetchNumbers(false);
    } catch (e) {
      toast.error(e.message || 'Failed to delete selected numbers');
    } finally {
      setSubmitting(false);
      setBulkDeleteShow(false);
    }
  };

  const handleBulkUnassign = async () => {
    if (!requireSelection()) return;
    if (!companyId) {
      toast.error('Select a company first');
      return;
    }
    setSubmitting(true);
    try {
      await smsService.bulkUnassignNumbers({ assignmentIds: selectedIds }, { companyId });
      toast.success(`${selectedIds.length} unassigned`);
      clearSelection();
      fetchNumbers(false);
    } catch (e) {
      toast.error(e.message || 'Failed to unassign selected numbers');
    } finally {
      setSubmitting(false);
      setBulkUnassignShow(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!requireSelection()) return;
    setBulkAssignClientId(filterAgent || '');
    setBulkAssignShow(true);
  };

  const submitBulkAssign = async () => {
    if (!companyId) {
      toast.error('Select a company first');
      return;
    }
    if (!bulkAssignClientId) {
      toast.error('Select a client');
      return;
    }
    setSubmitting(true);
    try {
      await smsService.bulkAssignNumbers(
        { assignmentIds: selectedIds, clientId: bulkAssignClientId },
        { companyId }
      );
      toast.success(`${selectedIds.length} assigned`);
      setBulkAssignShow(false);
      clearSelection();
      fetchNumbers(false);
    } catch (e) {
      toast.error(e.message || 'Failed to assign selected numbers');
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
                <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Manage My SMS Numbers</h5>
              </Col>
              <Col xs={12} sm="auto" className="ps-0">
                <div
                  id="orders-actions"
                  className="table-page-header-actions d-flex align-items-center flex-wrap gap-2 justify-content-start justify-content-xl-end"
                >
                  {canManageNumbers && (
                    <IconButton
                      variant="primary"
                      size="sm"
                      icon="plus"
                      transform="shrink-3"
                      title="Add New Number"
                      onClick={handleAddNumber}
                      className="text-nowrap flex-shrink-0"
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
                      options={companies.map((c) => ({
                        value: String(c.id),
                        label: c.name || c.code || String(c.id)
                      }))}
                    />
                  )} */}
                  {(isPlatformAdmin || isCompanyAdmin) && (
                    <TableSelectFilter
                      className="table-page-filter"
                      value={filterProvider}
                      placeholder="Select Provider"
                      onChange={(value) => setFilterProvider(value || '')}
                      options={providerOptions}
                    />
                  )}
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterRange}
                    placeholder="Select Range"
                    onChange={(value) => setFilterRange(value || '')}
                    options={rangeOptions}
                  />
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterAgent}
                    placeholder="Select Client"
                    onChange={(value) => setFilterAgent(value || '')}
                    options={agentOptions}
                  />
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterNumberScope}
                    placeholder="All Numbers"
                    onChange={(value) => setFilterNumberScope(value || '')}
                    allowClear={false}
                    options={[
                      { value: '', label: 'All Numbers' },
                      { value: 'allocated', label: 'Allocated Numbers' },
                      { value: 'unallocated', label: 'Unallocated Numbers' }
                    ]}
                  />
                  <TableSelectFilter
                    className="table-page-filter"
                    value={filterNumberType}
                    placeholder="Number Type"
                    onChange={(value) => setFilterNumberType(value || '')}
                    options={numberTypeOptions}
                  />
                  <Button
                    variant="falcon-default"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="d-flex align-items-center gap-1 text-nowrap flex-shrink-0"
                  >
                    <FontAwesomeIcon icon="sync-alt" className={refreshing ? 'fa-spin' : ''} />
                    Refresh
                  </Button>
                  <TableExportSelect
                    icon="external-link-alt"
                    variant="falcon-default"
                    className="mx-2"
                    onExport={(type) => exportRowsByType({
                      type,
                      title: 'SMS Numbers',
                      filenamePrefix: 'sms-numbers',
                      columns: exportColumns,
                      rows: exportRows
                    })}
                  />
                  {canManageNumbers && (
                    <>
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="file-upload"
                        transform="shrink-3"
                        title="Upload numbers"
                        onClick={() => navigate(paths.smsUploadNumbers)}
                        disabled={submitting}
                      />
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="file-import"
                        transform="shrink-3"
                        title="Allocate by upload"
                        onClick={() => {
                          const qs = new URLSearchParams();
                          if (companyId) qs.set('companyId', companyId);
                          if (filterAgent) qs.set('clientId', filterAgent);
                          navigate(`${paths.smsUploadNumbers}?${qs.toString()}`);
                        }}
                        disabled={submitting}
                      />
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="user-check"
                        transform="shrink-3"
                        title="Assign all selected"
                        onClick={handleBulkAssign}
                        disabled={!selectedIds.length || submitting}
                      />
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="user-slash"
                        transform="shrink-3"
                        title="Unassign all selected"
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
          <Card.Body className="p-0 position-relative">
            {loading && (
              <div
                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-light bg-opacity-75"
                style={{ zIndex: 5 }}
              >
                <Spinner animation="border" size="sm" className="me-2" />
                Loading numbers...
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
            <AdvanceTableFooter
              rowsPerPageSelection
              navButtons
              rowInfo
              totalRowCountOverride={tableFooterTotalRows}
              rowsPerPageOptions={[25, 50, 100, 250]}
            />
          </Card.Footer>
        </Card>
      </AdvanceTableProvider>

      {canManageNumbers && (
        <NumberFormModal
          show={modalShow}
          record={recordForEdit}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          rangeOptions={rangeOptions.map((r) => ({ id: r.value, name: r.label }))}
          clientOptions={agentOptions.map((a) => ({ id: a.value, name: a.label }))}
        />
      )}

      {canManageNumbers && (
        <AssignNumberPanel
          show={!!assignTarget}
          onHide={() => setAssignTarget(null)}
          assignment={assignTarget}
          clientOptions={agentOptions.map((a) => ({ id: a.value, name: a.label }))}
          companyId={companyId}
          onAssigned={() => {
            setAssignTarget(null);
            fetchNumbers(false);
          }}
        />
      )}

      {canManageNumbers && (
        <UseModal
          title="Assign selected numbers"
          isVisible={bulkAssignShow}
          setIsVisible={setBulkAssignShow}
          onCancel={() => setBulkAssignShow(false)}
          size="md"
          footer={[
            <Button key="cancel" variant="secondary" size="sm" onClick={() => setBulkAssignShow(false)} disabled={submitting}>
              Cancel
            </Button>,
            <Button key="assign" variant="primary" size="sm" onClick={submitBulkAssign} disabled={submitting}>
              Assign
            </Button>
          ]}
        >
          <div className="mb-2 text-700">Selected: {selectedIds.length}</div>
          <UseSelect
            name="bulkAssignClientId"
            label="Client"
            options={agentOptions.map((a) => ({ id: a.value, name: a.label }))}
            value={bulkAssignClientId}
            onChange={(value) => setBulkAssignClientId(value || '')}
            placeholder="Select client..."
            showSearch
          />
        </UseModal>
      )}

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteNumber(deleteTarget)}
        title="Delete Number"
        message={`Are you sure you want to delete number "${deleteTarget?.msisdn || deleteTarget?.number || ''}"? This action cannot be undone.`}
        loading={submitting}
      />

      <ConfirmDelete
        show={bulkDeleteShow}
        onHide={() => setBulkDeleteShow(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Numbers"
        message={`Are you sure you want to delete ${selectedIds.length} selected number(s)? This action cannot be undone.`}
        loading={submitting}
      />

      <ConfirmAction
        show={bulkUnassignShow}
        onHide={() => setBulkUnassignShow(false)}
        onConfirm={handleBulkUnassign}
        title="Unassign Selected Numbers"
        message={`Are you sure you want to unassign ${selectedIds.length} selected number(s)?`}
        confirmLabel="Unassign"
        loading={submitting}
      />
    </>
  );
};

export default MyNumbers;
