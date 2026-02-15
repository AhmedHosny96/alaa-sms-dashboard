import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from 'components/common/IconButton';
import { useProductContext } from 'providers/ProductProvider';
import useProductHook from './useProductHook';
import ProductImage from './ProductImage';
import StarRating from 'components/common/StarRating';
import Flex from 'components/common/Flex';
import paths from 'routes/paths';

const ProductList = ({ product, index }) => {
  const {
    name,
    category,
    id,
    features,
    price,
    discount,
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
    <>
      <Col
        xs={12}
        className={classNames('p-x1', {
          'bg-100': index % 2 !== 0
        })}
      >
        <Row>
          <Col sm={5} md={4}>
            <ProductImage
              name={name}
              id={id}
              isNew={isNew}
              files={files}
              layout="list"
            />
          </Col>
          <Col sm={7} md={8}>
            <Row className="h-100">
              <Col lg={8}>
                <h5 className="mt-3 mt-sm-0">
                  <Link
                    to={paths.productDetails(id)}
                    className="text-1100 fs-9 fs-lg-8"
                  >
                    {name}
                  </Link>
                </h5>
                <p className="fs-10 mb-2 mb-md-3">
                  <Link to="#!" className="text-500">
                    {category}
                  </Link>
                </p>
                <ul className="list-unstyled d-none d-lg-block">
                  {features.map(feature => (
                    <li key={feature}>
                      <FontAwesomeIcon icon="circle" transform="shrink-12" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Col>
              <Col lg={4} as={Flex} justifyContent="between" direction="column">
                <div>
                  <h4 className="fs-8 fs-md-7 text-warning mb-0">
                    {`$${salePrice ? salePrice : price}`}
                  </h4>
                  {salePrice && (
                    <h5 className="fs-10 text-500 mb-0 mt-1">
                      <del>{`$${price}`}</del>
                      <span className="ms-2">-{discount}%</span>
                    </h5>
                  )}
                  <div className="mb-2 mt-3">
                    <StarRating initialValue={rating} />
                    <span className="ms-1">({totalReview})</span>
                  </div>
                  <div className="d-none d-lg-block">
                    <p className="fs-10 mb-1">
                      Shipping Cost: <strong>{`$${shippingCost}`}</strong>
                    </p>
                    <p className="fs-10 mb-1">
                      Stock:{' '}
                      <strong
                        className={classNames({
                          'text-success': isInStock,
                          'text-danger': !isInStock
                        })}
                      >
                        {isInStock ? 'Available' : 'Stock-Out'}
                      </strong>
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <IconButton
                    size="sm"
                    variant={
                      isInFavouriteItems(id)
                        ? 'outline-danger'
                        : 'outline-secondary'
                    }
                    className={classNames('d-lg-block me-2 me-lg-0 w-lg-100', {
                      'border-300': !isInFavouriteItems(id)
                    })}
                    icon={isInFavouriteItems(id) ? 'heart' : ['far', 'heart']}
                    onClick={handleFavouriteClick}
                  >
                    Favourite
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="primary"
                    className="d-lg-block mt-lg-2 w-lg-100"
                    icon="cart-plus"
                    onClick={() => handleAddToCart(1, true, true)}
                  >
                    Add to Cart
                  </IconButton>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default ProductList;
