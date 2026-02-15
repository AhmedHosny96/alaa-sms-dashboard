import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { customersData } from 'data/ecommerce/customersData';
import CardDropdown from 'components/common/CardDropdown';
import { Link } from 'react-router';
import Flex from 'components/common/Flex';
import Avatar from 'components/common/Avatar';
import CustomersTableHeader from './CustomersTableHeader';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import paths from 'routes/paths';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      headerProps: { className: 'pe-1 text-900' },
      cellProps: {
        className: 'py-2'
      }
    },
    cell: ({ row: { original } }) => {
      const { name, avatar } = original;
      return (
        <Link to={paths.customerDetails}>
          <Flex alignItems="center">
            {avatar.img ? (
              <Avatar src={avatar.img} size="xl" className="me-2" />
            ) : (
              <Avatar size="xl" name={avatar.name} className="me-2" />
            )}
            <div className="flex-1">
              <h5 className="mb-0 fs-10">{name}</h5>
            </div>
          </Flex>
        </Link>
      );
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: {
      headerProps: { className: 'text-900' }
    },
    cell: ({ row: { original } }) => {
      const { email } = original;
      return <a href={`mailto:${email}`}>{email}</a>;
    }
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    meta: {
      headerProps: { className: 'text-900' }
    },
    cell: ({ row: { original } }) => {
      const { phone } = original;
      return <a href={`tel:${phone}`}>{phone}</a>;
    }
  },
  {
    accessorKey: 'address',
    header: 'Billing Address',
    meta: {
      headerProps: { style: { minWidth: '200px' }, className: 'ps-5 text-900' },
      cellProps: { className: 'ps-5' }
    }
  },
  {
    accessorKey: 'joined',
    header: 'Joined',
    meta: {
      headerProps: { className: 'text-900' }
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
        <CardDropdown>
          <div className="py-2">
            <Dropdown.Item href="#!">Edit</Dropdown.Item>
            <Dropdown.Item href="#!">Delete</Dropdown.Item>
          </div>
        </CardDropdown>
      );
    }
  }
];

const Customers = () => {
  const [customers] = useState(customersData);
  const table = useAdvanceTable({
    data: customers,
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 10
  });

  return (
    <AdvanceTableProvider {...table}>
      <Card className="mb-3">
        <Card.Header>
          <CustomersTableHeader />
        </Card.Header>
        <Card.Body className="p-0">
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
          <AdvanceTablePagination />
        </Card.Footer>
      </Card>
    </AdvanceTableProvider>
  );
};

export default Customers;
