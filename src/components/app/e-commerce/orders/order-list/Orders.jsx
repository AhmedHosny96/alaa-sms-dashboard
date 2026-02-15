import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { orderList } from 'data/ecommerce/orderList';
import CardDropdown from 'components/common/CardDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SubtleBadge from 'components/common/SubtleBadge';
import classNames from 'classnames';
import { Link } from 'react-router';
import OrdersTableHeader from './OrdersTableHeader';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import paths from 'routes/paths';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';

const columns = [
  {
    accessorKey: 'id',
    header: 'Order',
    meta: {
      headerProps: { className: 'pe-1 text-900' },
      cellProps: { className: 'py-2' }
    },
    cell: ({ row: { original } }) => {
      const { id, name, email } = original;
      return (
        <>
          <Link to={paths.orderDetails}>
            <strong>{id}</strong>
          </Link>{' '}
          by <strong>{name}</strong> <br />
          <a href={`mailto:${email}`}>{email}</a>
        </>
      );
    }
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      headerProps: { className: 'pe-7 text-900' }
    }
  },
  {
    accessorKey: 'address',
    header: 'Ship To',
    meta: {
      headerProps: { className: 'text-900' }
    },
    cell: ({ row: { original } }) => {
      const { address, shippingType } = original;
      return (
        <>
          {address}
          <p className="mb-0 text-500">{shippingType}</p>
        </>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      headerProps: {
        className: 'text-center text-900'
      },
      cellProps: {
        className: 'fs-9'
      }
    },
    cell: ({ row: { original } }) => {
      const { status } = original;
      return (
        <SubtleBadge
          pill
          bg={classNames({
            success: status === 'completed',
            primary: status === 'processing',
            warning: status === 'pending',
            secondary: status === 'onhold'
          })}
          className="d-flex flex-center"
        >
          <p className="mb-0">
            {status === 'completed' && 'Completed'}
            {status === 'processing' && 'Processing'}
            {status === 'pending' && 'Pending'}
            {status === 'onhold' && 'On-Hold'}
          </p>
          <FontAwesomeIcon
            icon={classNames({
              check: status === 'completed',
              redo: status === 'processing',
              stream: status === 'pending',
              ban: status === 'onhold'
            })}
            transform="shrink-2"
            className="ms-1"
          />
        </SubtleBadge>
      );
    }
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      headerProps: {
        className: 'text-end text-900'
      },
      cellProps: {
        className: 'text-end fs-9 fw-medium py-2'
      }
    },
    cell: ({ row }) => `$${row.original.amount}`
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
            <Dropdown.Item href="#!">Completed</Dropdown.Item>
            <Dropdown.Item href="#!">Processing</Dropdown.Item>
            <Dropdown.Item href="#!">On Hold</Dropdown.Item>
            <Dropdown.Item href="#!">Pending</Dropdown.Item>
            <Dropdown.Divider as="div" />
            <Dropdown.Item href="#!" className="text-danger">
              Delete
            </Dropdown.Item>
          </div>
        </CardDropdown>
      );
    }
  }
];

const Orders = () => {
  const [data] = useState(orderList);
  const table = useAdvanceTable({
    data,
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
          <OrdersTableHeader />
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

export default Orders;
