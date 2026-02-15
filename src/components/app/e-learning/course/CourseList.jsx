import { useState } from 'react';
import { Button, Card, Col, Image, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import classNames from 'classnames';
import { useCourseContext } from 'providers/CourseProvider';
import useCourses from 'hooks/useCourses';
import playIcon from 'assets/img/icons/play.svg';
import ModalVideoContent from '../ModalVideoContent';
import Flex from 'components/common/Flex';
import Hoverbox from 'components/common/Hoverbox';
import SubtleBadge from 'components/common/SubtleBadge';
import StarRating from 'components/common/StarRating';
import paths from 'routes/paths';

const CourseList = ({ course }) => {
  const [showModal, setShowModal] = useState(false);

  const {
    thumbnail: { image, video, videoPoster },
    id,
    name,
    trainer,
    price,
    oldPrice,
    totalEnrolled,
    tags,
    excerpt,
    rating,
    review
  } = course;

  const { isInFavouriteItems, isInCart } = useCourseContext();

  const { handleAddToCart, handleFavouriteClick } = useCourses(course);
  return (
    <>
      <ModalVideoContent
        show={showModal}
        setShow={setShowModal}
        attachment={{ image: videoPoster, src: video }}
      />
      <Card className="overflow-hidden">
        <Card.Body className="p-0">
          <Row className="g-0">
            <Col md={4} lg={3}>
              <Hoverbox onClick={() => setShowModal(true)} className="h-md-100">
                <Button
                  variant="link"
                  onClick={() => setShowModal(true)}
                  className="p-0 border-0 h-100"
                >
                  <Image src={image} alt="" className="w-100 h-100 fit-cover" />
                </Button>
                <Hoverbox.Content className="flex-center pe-none bg-holder overlay overlay-2">
                  <Image src={playIcon} width={60} alt="" className="z-1" />
                </Hoverbox.Content>
              </Hoverbox>
            </Col>
            <Col md={8} lg={9} className="p-x1">
              <Row className="g-0 h-100">
                <Col lg={8} as={Flex} className="flex-column pe-x1">
                  <Flex wrap="wrap" className="gap-2 mb-3">
                    {tags.map(tag => (
                      <SubtleBadge key={tag.id} pill bg={tag.type}>
                        <FontAwesomeIcon
                          icon={tag.icon}
                          className="me-1"
                          transform="shrink-4"
                        />
                        {tag.content}
                      </SubtleBadge>
                    ))}
                  </Flex>
                  <h5 className="fs-9">
                    <Link to={paths.trainerProfile}>{trainer}</Link>
                  </h5>
                  <h4 className="mt-3 mt-sm-0 fs-9 fs-lg-8">
                    <Link to={paths.courseDetails(id)} className="text-900">
                      {name}
                    </Link>
                  </h4>
                  <p className="fs-10 mt-2 d-none d-lg-block">
                    {excerpt.substring(0, 142)}...
                  </p>
                  <div className="flex-1 d-flex align-items-end fw-semibold fs-10">
                    <span className="me-1 text-900">{rating}</span>
                    <StarRating readonly initialValue={rating} />
                    <span className="ms-2 text-secondary">
                      {review.toLocaleString()} reviews
                    </span>
                  </div>
                </Col>
                <Col lg={4} className="mt-4 mt-lg-0">
                  <Flex
                    justifyContent="between"
                    className="h-100 rounded border-lg border-1 flex-lg-column p-lg-3"
                  >
                    <div className="mb-lg-4 mt-auto mt-lg-0">
                      <h4 className="fs-8 text-warning d-flex align-items-center">
                        <span>${price}</span>
                        {oldPrice && (
                          <del className="ms-2 fs-10 text-700">${oldPrice}</del>
                        )}
                      </h4>
                      <p className="mb-0 fs-10 text-800">
                        {totalEnrolled.toLocaleString()} Learners Enrolled
                      </p>
                    </div>
                    <Flex className="mt-3 flex-lg-column gap-2">
                      <Button
                        size="md"
                        variant="falcon-default"
                        className="fs-10 text-600 white-space-nowrap w-100"
                        onClick={handleFavouriteClick}
                      >
                        <FontAwesomeIcon
                          icon={
                            isInFavouriteItems(id) ? 'heart' : ['far', 'heart']
                          }
                          className={classNames('', {
                            'text-danger': isInFavouriteItems(id)
                          })}
                        />
                        <span className="ms-1 d-none d-lg-inline">
                          {isInFavouriteItems(id)
                            ? 'Wishlisted'
                            : 'Add to Wishlist'}
                        </span>
                      </Button>
                      <Button
                        size="md"
                        variant="primary"
                        className="fs-10"
                        onClick={handleAddToCart}
                      >
                        <FontAwesomeIcon
                          icon={`${
                            isInCart(id) ? 'shopping-cart' : 'cart-plus'
                          }`}
                        />
                        <span className="ms-1 d-none d-lg-inline">
                          {isInCart(id) ? 'Added' : 'Add to Cart'}
                        </span>
                      </Button>
                    </Flex>
                  </Flex>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default CourseList;
