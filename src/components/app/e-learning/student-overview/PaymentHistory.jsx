import { Card } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import { Link } from 'react-router';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';

const columns = [
  {
    accessorKey: 'courseId',
    header: 'Course',
    meta: {
      headerProps: { className: 'text-900' }
    },
    cell: ({ row: { original } }) => {
      const { courseId } = original;
      return (
        <Link to="#!" className="text-primary fw-semibold">
          Course#{courseId}
        </Link>
      );
    }
  },
  {
    accessorKey: 'invoice',
    header: 'Invoice no.',
    meta: {
      headerProps: {
        className: 'fw-medium text-900'
      },
      cellProps: {
        className: 'pe-6 py-3'
      }
    },
    cell: ({ row }) => `#${row.original.invoice}`
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      headerProps: {
        className: 'text-end fw-medium text-900'
      },
      cellProps: {
        className: 'text-end py-3'
      }
    }
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      headerProps: {
        className: 'text-end fw-medium text-900 white-space-nowrap'
      },
      cellProps: {
        className: 'text-end py-3'
      }
    }
  },
  {
    accessorKey: 'status',
    header: 'Payment Status',
    meta: {
      headerProps: {
        className: 'text-end fw-medium text-900 white-space-nowrap'
      },
      cellProps: {
        className: 'text-end py-3 font-sans-serif fw-medium'
      }
    },
    cell: ({ row: { original } }) => {
      const { color, status } = original;
      return <span className={`text-${color}`}>{status}</span>;
    }
  }
];

const PaymentHistory = ({ data, perPage = 5 }) => {
  const table = useAdvanceTable({
    data,
    columns,
    sortable: true,
    pagination: true,
    perPage
  });

  return (
    <AdvanceTableProvider {...table}>
      <Card className="h-100">
        <Card.Header className="d-flex flex-between-center">
          <h5 className="mb-0 text-nowrap py-2 py-xl-0">Payment History</h5>
          <div>
            <IconButton
              variant="falcon-default"
              size="sm"
              icon="filter"
              iconClassName="me-sm-1"
              className="me-2"
            >
              <span className="d-none d-sm-inline-block">Filter</span>
            </IconButton>
            <IconButton
              variant="falcon-default"
              size="sm"
              icon="external-link-alt"
              iconClassName="me-sm-1"
            >
              <span className="d-none d-sm-inline-block">Export</span>
            </IconButton>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <AdvanceTable
            headerClassName="bg-body-tertiary fw-medium font-sans-serif"
            rowClassName="align-middle white-space-nowrap"
            tableProps={{
              className: 'fs-10 mb-0 overflow-hidden fw-semibold'
            }}
          />
        </Card.Body>
        <Card.Footer className="bg-body-tertiary d-flex align-items-center justify-content-end py-2">
          <AdvanceTableFooter rowInfo viewAllBtn />
        </Card.Footer>
      </Card>
    </AdvanceTableProvider>
  );
};

export default PaymentHistory;
