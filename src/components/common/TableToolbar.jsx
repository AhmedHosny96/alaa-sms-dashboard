import React from 'react';
import Flex from 'components/common/Flex';
import classNames from 'classnames';

const TableToolbar = ({ children, className, ...rest }) => (
  <Flex alignItems="center" className={classNames('gap-2 flex-wrap mb-3', className)} {...rest}>
    {children}
  </Flex>
);

export default TableToolbar;
