/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Flex from '../Flex';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';

export const AdvanceTableFooter = ({
  viewAllBtn,
  navButtons,
  className,
  rowInfo,
  rowsPerPageSelection,
  rowsPerPageOptions,
  totalRowCountOverride
}) => {
  const {
    setPageSize,
    setPageIndex,
    previousPage,
    nextPage,
    getCanNextPage,
    getCanPreviousPage,
    getState,
    getPrePaginationRowModel,
    getPaginationRowModel,
    perPageOptions: contextPerPageOptions
  } = useAdvanceTableContext();

  const {
    pagination: { pageSize, pageIndex }
  } = getState();
  const [perPage] = useState(pageSize);
  const [isAllVisible, setIsAllVisible] = useState(false);
  const defaultPerPageOptions = [25, 50, 100, 500, 1000, 5000];
  const effectivePerPageOptions =
    rowsPerPageOptions || contextPerPageOptions || defaultPerPageOptions;
  const maxSafePageSize = 5000;
  const totalRows =
    totalRowCountOverride != null
      ? totalRowCountOverride
      : getPrePaginationRowModel().rows.length;
  const pageRowsCount = getPaginationRowModel().rows.length;
  const fromRow =
    totalRows === 0 ? 0 : Math.min(totalRows, pageSize * pageIndex + 1);
  const toRow =
    totalRows === 0
      ? 0
      : Math.min(totalRows, pageSize * pageIndex + pageRowsCount);

  return (
    <Flex
      className={classNames(
        className,
        'align-items-center justify-content-between'
      )}
    >
      <Flex alignItems="center" className="fs-10">
        {rowInfo && (
          <p className="mb-0">
            <span className="me-2">
              <span className="d-none d-sm-inline">Showing </span>
              <span className="fw-semibold">
                {fromRow}–{toRow}
              </span>
              <span className="d-none d-sm-inline"> of </span>
              <span className="d-inline d-sm-none"> / </span>
              <span className="fw-semibold">{totalRows}</span>
              <span className="d-none d-sm-inline"> entries</span>
            </span>
            {viewAllBtn && (
              <>
                <span className="d-none d-sm-inline-block me-2">&mdash;</span>
                <Button
                  variant="link"
                  size="sm"
                  className="py-2 px-0 fw-semibold"
                  onClick={() => {
                    setIsAllVisible(!isAllVisible);
                    setPageSize(
                      isAllVisible
                        ? perPage
                        : Math.min(getPrePaginationRowModel().rows.length, maxSafePageSize)
                    );
                  }}
                >
                  View {isAllVisible ? 'less' : totalRows > maxSafePageSize ? maxSafePageSize : 'all'}
                  <FontAwesomeIcon
                    icon="chevron-right"
                    className="ms-1 fs-11"
                  />
                </Button>
              </>
            )}
          </p>
        )}
        {rowsPerPageSelection && (
          <>
            <p className="mb-0 mx-2">Rows per page:</p>
            <Form.Select
              size="sm"
              className="w-auto"
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              value={pageSize}
            >
              {effectivePerPageOptions.map(value => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </>
        )}
      </Flex>
      {navButtons && (
        <Flex>
          <Button
            size="sm"
            variant={getCanPreviousPage() ? 'primary' : 'tertiary'}
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
            className={classNames({ disabled: !getCanPreviousPage() })}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant={getCanNextPage() ? 'primary' : 'tertiary'}
            disabled={!getCanNextPage()}
            className={classNames('px-4 ms-2', {
              disabled: !getCanNextPage()
            })}
            onClick={() => nextPage()}
          >
            Next
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default AdvanceTableFooter;
