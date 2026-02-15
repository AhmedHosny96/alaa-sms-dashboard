import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useProductContext } from 'providers/ProductProvider';
import { getProductsQuantity } from 'helpers/utils';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router';
import paths from 'routes/paths';

const CartNotification = () => {
  const {
    productsState: { cartItems }
  } = useProductContext();

  return (
    <Nav.Item as="li" className="d-none d-sm-block">
      <Nav.Link
        as={Link}
        to={paths.shoppingCart}
        className={classNames('px-0', {
          'notification-indicator notification-indicator-warning position-relative notification-indicator-fill':
            getProductsQuantity(cartItems)
        })}
      >
        {cartItems.length > 0 && (
          <span className="notification-indicator-number">
            {getProductsQuantity(cartItems)}
          </span>
        )}
        <FontAwesomeIcon
          icon="shopping-cart"
          transform="shrink-7"
          className="fs-5"
        />
      </Nav.Link>
    </Nav.Item>
  );
};

export default CartNotification;
