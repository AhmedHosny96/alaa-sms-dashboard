import React from 'react';
import { Navigate, useParams } from 'react-router';
import { Card, Col, Row } from 'react-bootstrap';
import ProductDetailsMedia from './ProductDetailsMedia';
import ProductDetailsMain from './ProductDetailsMain';
import ProductDetailsFooter from './ProductDetailsFooter';
import { useProductContext } from 'providers/ProductProvider';
import CartModal from '../../cart/CartModal';
import Flex from 'components/common/Flex';
import paths from 'routes/paths';

const ProductDetails = () => {
  const { productId } = useParams();

  const {
    productsState: { products },
    productsDispatch
  } = useProductContext();

  const product = products.find(product => product.id === productId);

  return product ? (
    <>
      <Card>
        <Card.Body>
          <Row>
            <Col lg={6} className="mb-4 mb-lg-0">
              <ProductDetailsMedia product={product} />
            </Col>
            <Col lg={6} as={Flex} justifyContent="between" direction="column">
              <ProductDetailsMain
                product={product}
                productsDispatch={productsDispatch}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <ProductDetailsFooter
                product={product}
                productsDispatch={productsDispatch}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <CartModal />
    </>
  ) : (
    <Navigate to={paths.productDetails(products[2].id)} replace />
  );
};

export default ProductDetails;
