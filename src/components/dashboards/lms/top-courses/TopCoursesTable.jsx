import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import CardDropdown from 'components/common/CardDropdown';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import paths from 'routes/paths';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';

const columns = [
  {
    accessorKey: 'title',
    header: 'Course Title',
    meta: {
      headerProps: { className: 'pe-1 fw-medium text-900' }
    },
    cell: ({ row: { original } }) => {
      const { title } = original;
      return <Link to={paths.courseDetails()}>{title}</Link>;
    }
  },
  {
    accessorKey: 'trainer',
    header: 'Trainer',
    meta: {
      headerProps: {
        className: 'pe-7 fw-medium text-900'
      }
    },
    cell: ({ row: { original } }) => {
      const { trainer } = original;
      return (
        <Link to={paths.trainerProfile} className="text-800">
          {trainer}
        </Link>
      );
    }
  },
  {
    accessorKey: 'published',
    header: 'Published on',
    meta: {
      headerProps: {
        className: 'text-end fw-medium text-900'
      },
      cellProps: {
        className: 'text-end'
      }
    }
  },
  {
    accessorKey: 'enrolled',
    header: 'Enrolled',
    meta: {
      headerProps: {
        className: 'text-end fw-medium text-900'
      },
      cellProps: {
        className: 'text-end'
      }
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: {
      headerProps: {
        className: 'text-end fw-medium text-900'
      },
      cellProps: {
        className: 'text-end'
      }
    }
  },
  {
    accessorKey: 'none',
    header: '',
    enableSorting: false,
    meta: {
      cellProps: {
        className: 'text-end'
      }
    },
    cell: () => {
      return (
        <CardDropdown drop="start">
          <div className="py-2">
            <Dropdown.Item href="#!">View</Dropdown.Item>
            <Dropdown.Item href="#!">Edit</Dropdown.Item>
            <Dropdown.Item href="#!">Refund</Dropdown.Item>
            <Dropdown.Divider as="div" />
            <Dropdown.Item href="#!" className="text-warning">
              Archive
            </Dropdown.Item>
            <Dropdown.Item href="#!" className="text-danger">
              Delete
            </Dropdown.Item>
          </div>
        </CardDropdown>
      );
    }
  }
];

const TopCoursesTable = ({ tableData }) => {
  const [data] = useState(tableData);
  const table = useAdvanceTable({
    data,
    columns,
    sortable: true
  });

  return (
    <AdvanceTableProvider {...table}>
      <AdvanceTable
        headerClassName="bg-200 text-nowrap align-middle font-sans-serif"
        rowClassName="btn-reveal-trigger text-nowrap align-middle"
        tableProps={{
          className: 'fs-10 fw-semibold mb-0 overflow-hidden'
        }}
      />
    </AdvanceTableProvider>
  );
};

export default TopCoursesTable;
