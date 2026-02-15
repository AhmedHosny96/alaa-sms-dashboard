import React from 'react';
import { Link } from 'react-router';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import SubtleBadge from 'components/common/SubtleBadge';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';

const columns = [
  {
    accessorKey: 'country',
    header: 'Country',
    meta: {
      cellProps: { className: 'py-3' },
      headerProps: { style: { width: '40%' }, className: 'text-800' }
    },
    cell: ({ row: { original } }) => {
      const { country } = original;
      return <Link to="#!">{country}</Link>;
    }
  },
  {
    accessorKey: 'users',
    header: 'User Count',
    meta: {
      cellProps: { className: 'text-end' },
      headerProps: { className: 'text-end text-800' }
    }
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    meta: {
      cellProps: { className: 'text-end' },
      headerProps: { className: 'text-end text-800' }
    }
  },
  {
    accessorKey: 'language',
    header: 'Language Support',
    meta: {
      cellProps: { className: 'text-end' },
      headerProps: { className: 'text-end text-800' }
    },
    cell: ({ row: { original } }) => {
      const { status, variant } = original;
      return (
        <SubtleBadge pill bg={variant} className="me-2 fs-11 fw-medium">
          {status}
        </SubtleBadge>
      );
    }
  }
];

const UsersLocationTable = ({ data }) => {
  const table = useAdvanceTable({
    data,
    columns,
    sortable: true,
    pagination: true,
    perPage: 4
  });

  return (
    <AdvanceTableProvider {...table}>
      <div className="mx-ncard mt-3">
        <AdvanceTable
          headerClassName="bg-200 text-nowrap align-middle font-sans-serif"
          rowClassName="align-middle white-space-nowrap fw-semibold"
          tableProps={{
            className: 'fs-10 mb-0'
          }}
        />
      </div>
    </AdvanceTableProvider>
  );
};

export default UsersLocationTable;
