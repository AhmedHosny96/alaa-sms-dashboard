import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import TableSearchInput from 'components/common/TableSearchInput';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import IconButton from 'components/common/IconButton';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { TableExportSelect } from 'components/common/UseTable';
import smsService from 'services/smsService';
import { toast } from 'react-toastify';
import { exportRowsByType } from 'utils/tableExport';

const RANGE_PROVIDER_COLUMNS = [
	{ accessorKey: 'providerName', header: 'Provider Name', meta: { headerProps: { className: 'text-900' } } },
	{ accessorKey: 'rangeStart', header: 'Range Start', meta: { headerProps: { className: 'text-900' } } },
	{ accessorKey: 'rangeEnd', header: 'Range End', meta: { headerProps: { className: 'text-900' } } },
	{ accessorKey: 'country', header: 'Country', meta: { headerProps: { className: 'text-900' } } },
	{ accessorKey: 'status', header: 'Status', meta: { headerProps: { className: 'text-900' } } },
	{
		accessorKey: 'actions',
		header: 'Actions',
		enableSorting: false,
		meta: { headerProps: { className: 'text-900 text-end' }, cellProps: { className: 'text-end' } }
	}
];

const RangeProviders = () => {
  const [data, setData] = useState([]);
	const [total, setTotal] = useState(0);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
	const [query, setQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const columns = useMemo(() => RANGE_PROVIDER_COLUMNS, []);

	// Debounce the search box, and reset to the first page when the term changes.
	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedQuery(query.trim());
			setPagination((p) => ({ ...p, pageIndex: 0 }));
		}, 350);
		return () => clearTimeout(t);
	}, [query]);

	const loadRanges = useCallback(async () => {
		try {
			const params = { page: pagination.pageIndex, size: Math.max(1, pagination.pageSize) };
			if (debouncedQuery) params.search = debouncedQuery;
			const resp = await smsService.listRanges(params);
			const list = Array.isArray(resp?.content) ? resp.content : Array.isArray(resp) ? resp : [];
			const normalized = list.map((item) => ({
				id: item.id,
				providerName: item.providerName ?? item.provider ?? '',
				rangeStart: item.rangePrefix ?? item.rangeStart ?? '',
				rangeEnd: item.rangeEnd ?? '',
				country: item.country ?? '',
				status: (item.active ?? true) ? 'Active' : 'Inactive',
				...item
			}));
			setData(normalized);
			setTotal(typeof resp?.totalElements === 'number' ? resp.totalElements : normalized.length);
		} catch (e) {
			toast.error(e.message || 'Failed to load range providers');
			setData([]);
			setTotal(0);
		}
	}, [pagination.pageIndex, pagination.pageSize, debouncedQuery]);

	useEffect(() => {
		loadRanges();
	}, [loadRanges]);

	const manualPageCount =
		total === 0 ? 0 : Math.ceil(total / Math.max(1, pagination.pageSize));

	const table = useAdvanceTable({
		data,
		columns,
		selection: true,
		sortable: true,
		pagination: true,
		manualPagination: true,
		pageCount: manualPageCount,
		onPaginationChange: setPagination,
		controlledPagination: pagination,
		rowCount: total,
		perPage: pagination.pageSize,
		perPageOptions: [25, 50, 100, 250, 500, 1000],
		selectionColumnWidth: 30
	});

  const exportColumns = useMemo(
    () => ['Provider Name', 'Range Start', 'Range End', 'Country', 'Status'],
    []
  );

  const exportRows = useMemo(
    () =>
      table.getSortedRowModel().rows.map((r) => {
        const row = r.original || {};
        return {
          'Provider Name': row.providerName ?? '-',
          'Range Start': row.rangeStart ?? '-',
          'Range End': row.rangeEnd ?? '-',
          Country: row.country ?? '-',
          Status: row.status ?? '-'
        };
      }),
    [table, data]
  );

	return (
		<>
			<AdvanceTableProvider {...table}>
				<Card className="mb-3">
					<Card.Header>
						<Row className="flex-between-center">
							<Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
								<h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">SMS Ranges</h5>
							</Col>
							<Col xs={12} sm="auto" className="ps-0">
								<div id="orders-actions" className="d-flex align-items-center flex-nowrap gap-2">
									<IconButton
										variant="primary"
										size="sm"
										icon="plus"
										transform="shrink-3"
										title="New"
									>
										<span className="d-none d-sm-inline-block ms-1">New</span>
									</IconButton>
									<TableExportSelect
										icon="external-link-alt"
										variant="falcon-default"
										className="mx-2"
										onExport={(type) =>
                      exportRowsByType({
                        type,
                        title: 'SMS Ranges',
                        filenamePrefix: 'sms-ranges',
                        columns: exportColumns,
                        rows: exportRows
                      })}
									/>
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
						<AdvanceTableFooter rowsPerPageSelection navButtons rowInfo rowsPerPageOptions={[25, 50, 100, 250, 500, 1000]} totalRowCountOverride={total} />
					</Card.Footer>
				</Card>
			</AdvanceTableProvider>
		</>
	);
};

export default RangeProviders;
