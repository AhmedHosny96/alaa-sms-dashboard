import { useState, useMemo, useRef, useEffect } from 'react';
import { Table, Form, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from 'components/common/Flex';
import classNames from 'classnames';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function defaultGetRowKey(record, index) {
  if (record?.key != null) return record.key;
  if (record?.id != null) return record.id;
  if (record?.login?.uuid != null) return record.login.uuid;
  return String(index);
}

export function useTable(columns, data, loading = false, options = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.defaultPageSize ?? 10);
  const [sortField, setSortField] = useState(options.defaultSortField ?? null);
  const [sortOrder, setSortOrder] = useState(options.defaultSortOrder ?? null);
  const [filteredInfo, setFilteredInfo] = useState(options.initialFilters ?? {});

  const effectiveData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    const sortCol = columns?.find((c) => (c.dataIndex ?? c.key) === sortField);
    if (sortField && sortOrder && sortCol?.sorter) {
      list.sort((a, b) => {
        const cmp = sortCol.sorter(a, b);
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
      if (sortField && sortOrder && col?.sorter) {
        list.sort((a, b) => {
          const cmp = col.sorter(a, b);
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

    useEffect(() => {
      if (displayTotalPages > 0 && page > displayTotalPages) setPage(displayTotalPages);
    }, [displayTotalPages, page]);

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
        <div className="table-responsive scrollbar">
          <Table
            className="table-sm fs--1 mb-0 overflow-hidden"
            style={{ overflowX: 'auto' }}
            {...tableRest}
          >
            <thead className="bg-200 text-900">
              <tr>
                {effectiveColumns?.map((col) => {
                  const colKey = col.dataIndex ?? col.key;
                  const hasSorter = typeof col.sorter === 'function';
                  const isSorted = sortField === colKey;
                  const filtered = (filteredInfo[colKey]?.length ?? 0) > 0;
                  return (
                    <th
                      key={colKey}
                      className={classNames('text-nowrap', col.headerClassName, {
                        'text-start': col.align === 'left' || !col.align,
                        'text-end': col.align === 'right',
                        'text-center': col.align === 'center',
                        'cursor-pointer': hasSorter
                      })}
                      style={col.width ? { width: col.width } : undefined}
                      onClick={hasSorter ? () => handleSort(col) : undefined}
                    >
                      <Flex alignItems="center" className="gap-1">
                        {typeof col.title === 'function' ? col.title() : col.title}
                        {hasSorter && (
                          <FontAwesomeIcon
                            icon={isSorted && sortOrder === 'descend' ? 'sort-amount-down' : 'sort-amount-up'}
                            className={classNames('fs--2', !isSorted && 'opacity-50')}
                          />
                        )}
                        {col.filterDropdown && (
                          <FilterDropdownCell
                            column={col}
                            filteredValue={filteredInfo[colKey] ?? null}
                            onConfirm={(keys) => handleFilterConfirm(colKey, keys)}
                            onClear={() => handleFilterClear(colKey)}
                            filterIcon={col.filterIcon}
                            filtered={filtered}
                          />
                        )}
                      </Flex>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="list">
              {displayPageData.length === 0 && !effectiveLoading ? (
                <tr>
                  <td
                    colSpan={effectiveColumns?.length ?? 1}
                    className="text-center text-700 py-5"
                  >
                    No records
                  </td>
                </tr>
              ) : (
                displayPageData.map((record, index) => (
                  <tr key={effectiveRowKey(record, displayStart + index)}>
                    {effectiveColumns?.map((col) => {
                      const colKey = col.dataIndex ?? col.key;
                      const value =
                        col.dataIndex != null
                          ? typeof col.dataIndex === 'string'
                            ? record[col.dataIndex]
                            : col.dataIndex.reduce((acc, k) => acc?.[k], record)
                          : record;
                      const content =
                        typeof col.render === 'function'
                          ? col.render(value, record, displayStart + index)
                          : value;
                      return (
                        <td
                          key={colKey}
                          className={classNames(col.className, {
                            'text-start': col.align === 'left' || !col.align,
                            'text-end': col.align === 'right',
                            'text-center': col.align === 'center'
                          })}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
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
                {PAGE_SIZE_OPTIONS.map((n) => (
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
