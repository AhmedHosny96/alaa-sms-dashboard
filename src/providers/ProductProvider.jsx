import React, { createContext, use, useReducer } from 'react';
import { productData } from 'data/ecommerce/productData';
import { productReducer } from 'reducers/productReducer';

export const ProductContext = createContext({ products: [] });

const ProductProvider = ({ children }) => {
  const initData = {
    initProducts: productData,
    products: productData,
    cartItems: [
      {
        ...productData[0],
        quantity: 3,
        totalPrice: productData[0].price * 3
      },
      {
        ...productData[1],
        quantity: 3,
        totalPrice: productData[1].price * 3
      },
      { ...productData[2], quantity: 3, totalPrice: productData[2].price * 3 }
    ],
    promo: null,
    favouriteItems: [],
    cartModal: {
      show: false,
      product: {},
      quantity: 0,
      type: 'add'
    }
  };
  const [productsState, productsDispatch] = useReducer(
    productReducer,
    initData
  );

  const isInShoppingCart = id =>
    !!productsState.cartItems.find(cartItem => cartItem.id === id);
  const isInFavouriteItems = id =>
    !!productsState.favouriteItems.find(
      favouriteItem => favouriteItem.id === id
    );

  return (
    <ProductContext
      value={{
        productsState,
        productsDispatch,
        isInShoppingCart,
        isInFavouriteItems
      }}
    >
      {children}
    </ProductContext>
  );
};

export const useProductContext = () => use(ProductContext);

export default ProductProvider;
