import Flex from 'components/common/Flex';
import { Link } from 'react-router';
import { Button, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { useProductContext } from 'providers/ProductProvider';
import useProductHook from './useProductHook';
import ProductImage from './ProductImage';
import StarRating from 'components/common/StarRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import paths from 'routes/paths';

const ProductGrid = ({ product, ...rest }) => {
  const {
    name,
    category,
    id,
    price,
    salePrice,
    shippingCost,
    rating,
    totalReview,
    isInStock,
    isNew,
    files
  } = product;

  const { isInFavouriteItems } = useProductContext();

  const { handleAddToCart, handleFavouriteClick } = useProductHook(product);
  return (
    <Col className="mb-4" {...rest}>
      <Flex
        direction="column"
        justifyContent="between"
        className="border rounded-1 h-100 pb-3"
      >
        <div className="overflow-hidden">
          <ProductImage
            name={name}
            id={id}
            isNew={isNew}
            files={files}
            layout="grid"
          />
          <div className="p-3">
            <h5 className="fs-9">
              <Link className="text-1100" to={paths.productDetails(id)}>
                {name}
              </Link>
            </h5>
            <p className="fs-10 mb-3">
              <Link to="#!" className="text-500">
                {category}
              </Link>
            </p>
            <h5 className="fs-md-7 text-warning mb-0 d-flex align-items-center mb-3">
              {`$${salePrice ? salePrice : price}`}
              {salePrice && <del className="ms-2 fs-10 text-500">${price}</del>}
            </h5>
            <p className="fs-10 mb-1">
              Shipping Cost: <strong>${shippingCost}</strong>
            </p>
            <p className="fs-10 mb-1">
              Stock:{' '}
              <strong
                className={classNames({
                  'text-success': isInStock,
                  'text-danger': !isInStock
                })}
              >
                {isInStock ? 'Available' : 'Sold-Out'}
              </strong>
            </p>
          </div>
        </div>
        <Flex alignItems="center" className="px-3">
          <div className="flex-1">
            <StarRating readonly initialValue={rating} />
            <span className="ms-1">({totalReview})</span>
          </div>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip style={{ position: 'fixed' }}>Add to Wish List</Tooltip>
            }
          >
            <Button
              variant="falcon-default"
              size="sm"
              onClick={handleFavouriteClick}
              className="me-2"
            >
              <FontAwesomeIcon
                icon={isInFavouriteItems(id) ? 'heart' : ['far', 'heart']}
              />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip style={{ position: 'fixed' }}>Add to Cart</Tooltip>
            }
          >
            <Button
              variant="falcon-default"
              size="sm"
              onClick={() => handleAddToCart(1, true, true)}
            >
              <FontAwesomeIcon icon="cart-plus" />
            </Button>
          </OverlayTrigger>
        </Flex>
      </Flex>
    </Col>
  );
};

export default ProductGrid;
