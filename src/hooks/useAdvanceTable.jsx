/* eslint-disable react/prop-types */
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import IndeterminateCheckbox from 'components/common/advance-table/IndeterminateCheckbox';

const shouldDisableSortingByDefault = column => {
  const accessor = String(column?.accessorKey ?? column?.id ?? '').toLowerCase();
  const header = typeof column?.header === 'string' ? column.header.toLowerCase() : '';

  if (column?.id === 'selection') return true;

  const nonImportantPattern =
    /(action|actions|status|password|pass|connectionstatus|connection_status|smppconnectionstatus)/;
  const nonImportantHeaderPattern = /(action|actions|status|password|connection status|esme status|esme pass)/;

  return nonImportantPattern.test(accessor) || nonImportantHeaderPattern.test(header);
};

const withSmartSortingDefaults = (columns = [], sortable) => {
  return columns.map(column => {
    if (Array.isArray(column?.columns)) {
      return {
        ...column,
        columns: withSmartSortingDefaults(column.columns, sortable)
      };
    }

    if (!sortable) {
      return {
        ...column,
        enableSorting: false
      };
    }

    if (column?.enableSorting !== undefined) {
      return column;
    }

    if (shouldDisableSortingByDefault(column)) {
      return {
        ...column,
        enableSorting: false
      };
    }

    return column;
  });
};

const selectionColumn = (selectionColumnWidth, selectionHeaderClassname) => {
  return {
    id: 'selection',
    accessorKey: '',
    header: ({ table }) => (
      <IndeterminateCheckbox
        className="form-check mb-0"
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler()
        }}
      />
    ),
    cell: ({ row }) => (
      <IndeterminateCheckbox
        className="form-check mb-0"
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler()
        }}
      />
    ),
    meta: {
      headerProps: {
        className: selectionHeaderClassname,
        style: {
          width: selectionColumnWidth
        }
      },
      cellProps: {
        style: {
          width: selectionColumnWidth
        }
      }
    }
  };
};

const buildStableRowId = (row, index) => {
  const candidateKeys = [
    'id',
    '_id',
    'uuid',
    'code',
    'connectorId',
    'username',
    'email',
    'name',
    'title'
  ];

  const values = candidateKeys
    .map(key => row?.[key])
    .filter(value => value !== undefined && value !== null && value !== '');

  return values.length > 0
    ? `${values.map(String).join('__')}__${index}`
    : String(index);
};

const useAdvanceTable = ({
  columns,
  data,
  sortable,
  selection,
  selectionColumnWidth,
  selectionHeaderClassname,
  pagination,
  initialState,
  perPage = 25,
  perPageOptions = [25, 50, 100, 250],
  manualPagination = false,
  pageCount: manualPageCount,
  onPaginationChange,
  controlledPagination,
  rowCount: manualRowCount
}) => {
  const defaultState = {
    pagination: { pageSize: pagination ? perPage : data.length },
    ...initialState
  };

  const processedColumns = withSmartSortingDefaults(
    selection
      ? [
          selectionColumn(selectionColumnWidth, selectionHeaderClassname),
          ...columns
        ]
      : columns,
    sortable
  );

  const table = useReactTable({
    data,
    columns: processedColumns,
    getRowId: (originalRow, index) => buildStableRowId(originalRow, index),
    enableSorting: sortable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: manualPageCount ?? 0,
          ...(manualRowCount != null ? { rowCount: manualRowCount } : {}),
          onPaginationChange,
          state: { pagination: controlledPagination },
          initialState: defaultState
        }
      : {
          ...(pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
          initialState: defaultState
        }),
    autoResetAll: !(manualPagination && controlledPagination),
    autoResetPageIndex: !manualPagination
  });

  return {
    ...table,
    perPageOptions
  };
};

export default useAdvanceTable;
