import NavbarVertical from 'components/navbar/vertical/NavbarVertical';
import ProductProvider from 'providers/ProductProvider';
import React from 'react';
import ModalAuth from 'components/authentication/modal/ModalAuth';
import VerticalLayoutNavbarTop from 'components/navbar/top/VerticalLayoutNavbarTop';
import { Outlet } from 'react-router';

const VerticalNavLayout = () => {
  return (
    <div className="container">
      <NavbarVertical />
      <ProductProvider>
        <div className="content">
          <VerticalLayoutNavbarTop />
          <Outlet />
        </div>
      </ProductProvider>
      <ModalAuth />
    </div>
  );
};

export default VerticalNavLayout;
