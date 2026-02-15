import { Link } from 'react-router';
import { Card, Dropdown, ProgressBar } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import IconButton from 'components/common/IconButton';
import Flex from 'components/common/Flex';
import CardDropdown from 'components/common/CardDropdown';
import FalconCardFooterLink from 'components/common/FalconCardFooterLink';
import paths from 'routes/paths';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';

const columns = [
  {
    accessorKey: 'title',
    header: 'Course Title',
    meta: {
      headerProps: { className: 'fw-medium text-900' },
      cellProps: {
        className: 'white-space-nowrap',
        style: { maxWidth: '23rem' }
      }
    },
    cell: ({ row: { original } }) => {
      const { title, image } = original;
      return (
        <Flex alignItems="center" className="gap-3 position-relative">
          <img
            className="rounded-1 border border-200"
            src={image}
            width={60}
            alt={title}
          />
          <Link
            className="text-truncate stretched-link"
            to={paths.courseDetails()}
          >
            {title}
          </Link>
        </Flex>
      );
    }
  },
  {
    accessorKey: 'trainer',
    header: 'Trainer',
    meta: {
      headerProps: {
        className: 'fw-medium text-900'
      }
    },
    cell: ({ row: { original } }) => {
      const { trainer } = original;
      return (
        <Link className="text-800" to={paths.trainerProfile}>
          {trainer}
        </Link>
      );
    }
  },
  {
    accessorKey: 'enrollmentDate',
    header: 'Enrollment',
    meta: {
      headerProps: {
        className: 'fw-medium text-900'
      }
    }
  },
  {
    accessorKey: 'worked',
    header: 'Worked',
    meta: {
      headerProps: {
        className: 'fw-medium text-900'
      }
    }
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    meta: {
      headerProps: {
        className: 'fw-medium text-900'
      }
    },
    cell: ({ row: { original } }) => {
      const { progress } = original;
      return (
        <ProgressBar
          className="me-3 bg-200 rounded-pill"
          now={progress}
          style={{ width: 80, height: 5 }}
        />
      );
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: {
      headerProps: {
        className: 'fw-medium text-end text-900'
      },
      cellProps: {
        className: 'text-end'
      }
    },
    cell: ({ row }) => `${row.original.price}`
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

const EnrolledCourses = ({ data, perPage = 6 }) => {
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
          <h6 className="mb-0">Enrolled Courses</h6>
          <div>
            <IconButton
              variant="falcon-default"
              size="sm"
              icon="filter"
              className="me-2"
            >
              <span className="d-none d-sm-inline-block">Filter</span>
            </IconButton>
            <IconButton
              variant="falcon-default"
              size="sm"
              icon="expand-arrows-alt"
            >
              <span className="d-none d-sm-inline-block">Expand</span>
            </IconButton>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <AdvanceTable
            headerClassName="bg-body-tertiary fw-medium font-sans-serif white-space-nowrap"
            rowClassName="btn-reveal-trigger align-middle white-space-nowrap"
            tableProps={{
              className: 'fs-10 mb-0 overflow-hidden fw-semibold'
            }}
          />
        </Card.Body>
        <FalconCardFooterLink title="Show all enrollments" size="sm" />
      </Card>
    </AdvanceTableProvider>
  );
};

export default EnrolledCourses;
