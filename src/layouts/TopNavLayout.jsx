import ProductProvider from 'providers/ProductProvider';
import React from 'react';
import ModalAuth from 'components/authentication/modal/ModalAuth';
import TopNavLayoutNavbarTop from 'components/navbar/top/TopNavLayoutNavbarTop';
import { Outlet } from 'react-router';

const TopNavLayout = () => {
  return (
    <div className="container">
      <ProductProvider>
        <div className="content">
          <TopNavLayoutNavbarTop />
          <Outlet />
        </div>
      </ProductProvider>
      <ModalAuth />
    </div>
  );
};

export default TopNavLayout;
