import React from 'react';
import { Col, Row } from 'react-bootstrap';
import CheckoutShipping from './CheckoutShipping';
import OrderSummary from './OrderSummary';
import PaymentMethod from './PaymentMethod';
import { useProductContext } from 'providers/ProductProvider';
import { getSubtotal, getDiscountPrice } from 'helpers/utils';

const Checkout = () => {
  const {
    productsState: { cartItems, promo }
  } = useProductContext();

  const shippingCost = parseFloat(
    cartItems.reduce((acc, product) => acc + product.shippingCost, 0)
  );
  const subTotal = parseFloat(getSubtotal(cartItems).toFixed(2));
  const total = shippingCost + subTotal;
  const payableTotal = parseFloat(
    promo ? total - getDiscountPrice(total, promo.discount) : total
  ).toFixed(2);

  return (
    <Row className="g-3">
      <Col xl={{ span: 4, order: 1 }}>
        <OrderSummary
          shippingCost={shippingCost}
          subTotal={subTotal}
          total={total}
          payableTotal={payableTotal}
          className="mb-3"
        />
      </Col>
      <Col xl={8}>
        <CheckoutShipping />
        <PaymentMethod payableTotal={payableTotal} />
      </Col>
    </Row>
  );
};

export default Checkout;
