import { useState, useMemo, useRef, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from 'components/common/Flex';
import classNames from 'classnames';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';

const SMALL_PAGE_SIZE_OPTIONS = [5, 50, 100, 500];
const LARGE_PAGE_SIZE_OPTIONS = [500, 1000, 5000, 10000];
const DEFAULT_SMALL_PAGE_SIZE = 100;
const DEFAULT_LARGE_PAGE_SIZE = 500;

function defaultGetRowKey(record, index) {
  if (record?.key != null) return record.key;
  if (record?.id != null) return record.id;
  if (record?.login?.uuid != null) return record.login.uuid;
  return String(index);
}

export function useTable(columns, data, loading = false, options = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    options.defaultPageSize ??
      (options.pageSizePreset === 'large'
        ? DEFAULT_LARGE_PAGE_SIZE
        : DEFAULT_SMALL_PAGE_SIZE)
  );
  const [sortField, setSortField] = useState(options.defaultSortField ?? null);
  const [sortOrder, setSortOrder] = useState(options.defaultSortOrder ?? null);
  const [filteredInfo, setFilteredInfo] = useState(options.initialFilters ?? {});

  const effectiveData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    const sortCol = columns?.find((c) => (c.dataIndex ?? c.key) === sortField);
    const sorter = resolveSorter(sortCol);
    if (sortField && sortOrder && sorter) {
      list.sort((a, b) => {
        const cmp = sorter(a, b);
        return sortOrder === 'descend' ? -cmp : cmp;
      });
    }
    return list;
  }, [data, sortField, sortOrder, columns]);

  const totalCount = effectiveData.length;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalCount);
  const pageData = effectiveData.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const onChangeRef = useRef(null);
  const notifyChange = (pagination, filters, sorter) => {
    options.onChange?.(pagination, filters, sorter);
    onChangeRef.current?.(pagination, filters, sorter);
  };

  const handlePageChange = (newPage) => {
    const p = Math.max(1, Math.min(newPage, totalPages));
    setPage(p);
    notifyChange({ current: p, pageSize }, filteredInfo, { field: sortField, order: sortOrder });
  };

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setPage(1);
    notifyChange({ current: 1, pageSize: size }, filteredInfo, { field: sortField, order: sortOrder });
  };

  const handleSort = (col) => {
    const key = col.dataIndex ?? col.key;
    const nextOrder = sortField === key && sortOrder === 'ascend' ? 'descend' : 'ascend';
    setSortField(key);
    setSortOrder(nextOrder);
    setPage(1);
    notifyChange({ current: 1, pageSize }, filteredInfo, { field: key, order: nextOrder });
  };

  const handleFilterConfirm = (colKey, selectedKeys) => {
    const next = { ...filteredInfo, [colKey]: selectedKeys?.length ? selectedKeys : undefined };
    setFilteredInfo(next);
    setPage(1);
    notifyChange({ current: 1, pageSize }, next, { field: sortField, order: sortOrder });
  };

  const handleFilterClear = (colKey) => {
    const next = { ...filteredInfo };
    delete next[colKey];
    setFilteredInfo(next);
    setPage(1);
    notifyChange({ current: page, pageSize }, next, { field: sortField, order: sortOrder });
  };

  const TableContainer = (props) => {
    const {
      dataSource,
      columns: propsColumns,
      loading: propsLoading,
      rowKey: rowKeyProp,
      onChange: propsOnChange,
      headerClassName,
      rowClassName,
      bodyClassName,
      ...tableRest
    } = props;

    onChangeRef.current = propsOnChange ?? null;

    const effectiveColumns = propsColumns ?? columns;
    const effectiveDataSource = dataSource ?? data;
    const effectiveLoading = propsLoading ?? loading;
    const effectiveRowKey = typeof rowKeyProp === 'function' ? rowKeyProp : defaultGetRowKey;

    const displayData = useMemo(() => {
      let list = Array.isArray(effectiveDataSource) ? [...effectiveDataSource] : [];
      const col = effectiveColumns?.find((c) => (c.dataIndex ?? c.key) === sortField);
      const sorter = resolveSorter(col);
      if (sortField && sortOrder && sorter) {
        list.sort((a, b) => {
          const cmp = sorter(a, b);
          return sortOrder === 'descend' ? -cmp : cmp;
        });
      }
      return list;
    }, [effectiveDataSource, sortField, sortOrder, effectiveColumns]);

    const displayTotalCount = displayData.length;
    const displayStart = (page - 1) * pageSize;
    const displayEnd = Math.min(displayStart + pageSize, displayTotalCount);
    const displayPageData = displayData.slice(displayStart, displayEnd);
    const displayTotalPages = Math.max(1, Math.ceil(displayTotalCount / pageSize));

    const resolvedPreset = options.pageSizePreset === 'large' || options.pageSizePreset === 'small'
      ? options.pageSizePreset
      : displayTotalCount >= 500
        ? 'large'
        : 'small';

    const pageSizeOptions = Array.isArray(options.pageSizeOptions) && options.pageSizeOptions.length
      ? options.pageSizeOptions
      : resolvedPreset === 'large'
        ? LARGE_PAGE_SIZE_OPTIONS
        : SMALL_PAGE_SIZE_OPTIONS;

    useEffect(() => {
      if (displayTotalPages > 0 && page > displayTotalPages) setPage(displayTotalPages);
    }, [displayTotalPages, page]);

    useEffect(() => {
      if (pageSizeOptions.length && !pageSizeOptions.includes(pageSize)) {
        const nextSize = pageSizeOptions[0];
        setPageSize(nextSize);
        setPage(1);
        notifyChange(
          { current: 1, pageSize: nextSize },
          filteredInfo,
          { field: sortField, order: sortOrder }
        );
      }
    }, [pageSizeOptions, pageSize, filteredInfo, sortField, sortOrder]);

    const mappedColumns = useMemo(
      () =>
        mapColumnsToAdvance(effectiveColumns, {
          sortField,
          sortOrder,
          onSort: handleSort,
          resolveSorter
        }),
      [effectiveColumns, sortField, sortOrder]
    );
    const advanceTable = useAdvanceTable({
      columns: mappedColumns,
      data: displayPageData,
      sortable: false,
      selection: false,
      pagination: false
    });

    return (
      <div
        className="position-relative"
        style={{ minHeight: displayPageData.length === 0 && !effectiveLoading ? 120 : undefined }}
      >
        {effectiveLoading && (
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-100 bg-opacity-75 rounded"
            style={{ zIndex: 1 }}
          >
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        <AdvanceTableProvider {...advanceTable}>
          <AdvanceTable
            headerClassName={classNames('bg-200 text-900 text-nowrap align-middle', headerClassName)}
            bodyClassName={classNames('list', bodyClassName)}
            rowClassName={classNames('align-middle white-space-nowrap', rowClassName)}
            emptyMessage="No records"
            tableProps={{
              ...tableRest,
              className: classNames('table-sm fs--1 mb-0 overflow-hidden', tableRest.className)
            }}
          />
        </AdvanceTableProvider>
        {displayTotalCount > 0 && (
          <Flex
            alignItems="center"
            justifyContent="between"
            className="mt-2 flex-wrap gap-2 fs--1"
          >
            <Flex alignItems="center" className="gap-2">
              <span className="text-700">
                {displayStart + 1} to {displayEnd} of {displayTotalCount}
              </span>
              <span className="text-700">Rows per page:</span>
              <Form.Select
                size="sm"
                className="w-auto"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Form.Select>
            </Flex>
            <Flex alignItems="center" className="gap-1">
              <Button
                size="sm"
                variant="falcon-default"
                className="px-2"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <FontAwesomeIcon icon="chevron-left" />
              </Button>
              <span className="text-700 px-2">
                Page {page} of {displayTotalPages}
              </span>
              <Button
                size="sm"
                variant="falcon-default"
                className="px-2"
                disabled={page >= displayTotalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <FontAwesomeIcon icon="chevron-right" />
              </Button>
            </Flex>
          </Flex>
        )}
      </div>
    );
  };

  return {
    TableContainer,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    sortField,
    sortOrder,
    filteredInfo,
    setFilteredInfo
  };
}

function mapColumnsToAdvance(columns = [], config = {}) {
  const { sortField, sortOrder, onSort, resolveSorter } = config;

  return columns.map((col, index) => {
    const colKey = col.dataIndex ?? col.key ?? col.title ?? `col-${index}`;
    const accessorKey = typeof col.dataIndex === 'string' ? col.dataIndex : undefined;
    const accessorFn = Array.isArray(col.dataIndex)
      ? (row) => col.dataIndex.reduce((acc, k) => acc?.[k], row)
      : col.dataIndex == null
        ? (row) => row
        : undefined;
    const alignClass = classNames({
      'text-end': col.align === 'right',
      'text-center': col.align === 'center',
      'text-start': col.align === 'left' || !col.align
    });
    const isActions = colKey === 'actions' || col.dataIndex === 'actions' || col.key === 'actions';
    const sorter = resolveSorter?.(col);
    const isSortable = Boolean(sorter) && !isActions;
    const isSorted = sortField === colKey;
    const sortClass = isSortable
      ? classNames('sort', isSorted && (sortOrder === 'descend' ? 'desc' : 'asc'))
      : undefined;

    return {
      id: String(colKey),
      accessorKey,
      accessorFn,
      header: () => (typeof col.title === 'function' ? col.title() : col.title),
      enableSorting: false,
      cell: (ctx) => {
        const record = ctx.row.original;
        const value =
          col.dataIndex != null
            ? typeof col.dataIndex === 'string'
              ? record?.[col.dataIndex]
              : Array.isArray(col.dataIndex)
                ? col.dataIndex.reduce((acc, k) => acc?.[k], record)
                : record
            : record;
        return typeof col.render === 'function'
          ? col.render(value, record, ctx.row.index)
          : value;
      },
      meta: {
        headerProps: {
          className: classNames(
            col.headerClassName,
            alignClass,
            'fw-semibold',
            sortClass
          ),
          style: col.width ? { width: col.width } : undefined,
          onClick: isSortable ? () => onSort?.(col) : undefined
        },
        cellProps: {
          className: classNames(col.className, alignClass)
        }
      }
    };
  });
}

function resolveSorter(col) {
  if (!col) return null;
  if (typeof col.sorter === 'function') return col.sorter;
  if (col.sorter === false) return null;

  const dataIndex = col.dataIndex;
  if (!dataIndex) return null;

  const getValue = (row) =>
    typeof dataIndex === 'string'
      ? row?.[dataIndex]
      : Array.isArray(dataIndex)
        ? dataIndex.reduce((acc, k) => acc?.[k], row)
        : row;

  return (a, b) => {
    const av = getValue(a);
    const bv = getValue(b);
    if (av == null && bv == null) return 0;
    if (av == null) return -1;
    if (bv == null) return 1;
    const an = Number(av);
    const bn = Number(bv);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return String(av).localeCompare(String(bv));
  };
}

function FilterDropdownCell({ column, filteredValue, onConfirm, onClear, filterIcon, filtered }) {
  const [open, setOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(filteredValue ?? []);
  useEffect(() => {
    if (open) setSelectedKeys(filteredValue ?? []);
  }, [open, filteredValue]);

  const dropdownContent =
    typeof column.filterDropdown === 'function'
      ? column.filterDropdown({
          setSelectedKeys,
          selectedKeys,
          confirm: () => {
            onConfirm(selectedKeys);
            setOpen(false);
          },
          clearFilters: () => {
            setSelectedKeys([]);
            onClear();
            setOpen(false);
          }
        })
      : null;

  return (
    <div className="position-relative d-inline-block ms-1">
      <Button
        variant="link"
        size="sm"
        className="p-0 text-700"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        style={{ minWidth: '1.25rem' }}
      >
        {typeof filterIcon === 'function' ? filterIcon(filtered) : <FontAwesomeIcon icon="filter" className="fs--2" />}
      </Button>
      {open && dropdownContent && (
        <>
          <div
            className="position-fixed top-0 start-0 end-0 bottom-0"
            style={{ zIndex: 1040 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="position-absolute start-0 mt-1 p-2 bg-white border rounded shadow-sm"
            style={{ zIndex: 1050, minWidth: 180 }}
          >
            {dropdownContent}
          </div>
        </>
      )}
    </div>
  );
}

export default useTable;
