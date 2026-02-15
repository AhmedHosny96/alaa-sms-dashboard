import ProductProvider from 'providers/ProductProvider';
import React from 'react';
import ModalAuth from 'components/authentication/modal/ModalAuth';
import { DoubleTopLayoutNavbarTop } from 'components/navbar/top/DoubleTopLayoutNavbarTop';
import { Outlet } from 'react-router';

const DoubleTopNavLayout = () => {
  return (
    <div className="container">
      <ProductProvider>
        <div className="content">
          <DoubleTopLayoutNavbarTop />
          <Outlet />
        </div>
      </ProductProvider>
      <ModalAuth />
    </div>
  );
};

export default DoubleTopNavLayout;
