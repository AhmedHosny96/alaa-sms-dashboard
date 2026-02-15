import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { useProductContext } from 'providers/ProductProvider';
import { getDiscountPrice } from 'helpers/utils';
import paths from 'routes/paths';

const OrderSummary = ({
  shippingCost,
  subTotal,
  total,
  payableTotal,
  ...rest
}) => {
  const {
    productsState: { cartItems, promo }
  } = useProductContext();

  return (
    <Card {...rest}>
      <Card.Header className="bg-body-tertiary btn-reveal-trigger d-flex flex-between-center">
        <h5 className="mb-0">Order Summary</h5>
        <Link
          to={paths.shoppingCart}
          className="btn btn-link btn-sm btn-reveal text-600"
        >
          <FontAwesomeIcon icon="pencil-alt" />
        </Link>
      </Card.Header>
      <Card.Body>
        <Table borderless className="fs-10 mb-0">
          <tbody>
            {cartItems?.map((product, index) => (
              <tr key={product.id} className="border-bottom">
                <th
                  className={classNames('ps-0', {
                    'pt-0': index === 0
                  })}
                >
                  {product.name} x {product.quantity}
                  <div className="text-400 fw-normal fs-11">
                    {product.features.join(', ')}
                  </div>
                </th>
                <th
                  className={classNames('pe-0 text-end', {
                    'pt-0': index === 0
                  })}
                >
                  ${product.totalPrice}
                </th>
              </tr>
            ))}

            <tr className="border-bottom">
              <th className="ps-0">Subtotal</th>
              <th className="pe-0 text-end">${subTotal}</th>
            </tr>
            <tr className="border-bottom">
              <th className="ps-0">Shipping</th>
              <th className="pe-0 text-end">+${shippingCost}</th>
            </tr>
            <tr>
              <th className="ps-0 pb-0">Total</th>
              <th className="pe-0 text-end pb-0">${total}</th>
            </tr>
            {promo && (
              <tr className="border-bottom">
                <th className="ps-0 pb-0">
                  Coupon:
                  <span className="text-success"> {promo.code}</span> ( -
                  {promo.discount}%)
                </th>
                <th className="pe-0 text-end">
                  -${getDiscountPrice(total, promo.discount)}
                </th>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between bg-body-tertiary">
        <div className="fw-semibold">Payable Total</div>
        <div className="fw-bold">${payableTotal}</div>
      </Card.Footer>
    </Card>
  );
};

export default OrderSummary;
