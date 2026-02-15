import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Image,
  OverlayTrigger,
  Row,
  Tooltip
} from 'react-bootstrap';
import Flex from 'components/common/Flex';
import playIcon from 'assets/img/icons/play.svg';
import Hoverbox from 'components/common/Hoverbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ModalVideoContent from '../ModalVideoContent';
import { Link } from 'react-router';
import useCourses from 'hooks/useCourses';
import paths from 'routes/paths';
import { useCourseContext } from 'providers/CourseProvider';

const CourseGrid = ({ course }) => {
  const [showModal, setShowModal] = useState(false);

  const {
    thumbnail: { image, video, videoPoster },
    id,
    name,
    trainer,
    price,
    oldPrice,
    totalEnrolled
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
      <Card className="h-100 overflow-hidden">
        <Card.Body
          as={Flex}
          direction="column"
          justifyContent="between"
          className="p-0"
        >
          <div>
            <Hoverbox
              onClick={() => setShowModal(true)}
              className="text-center"
            >
              <Button
                variant="link"
                onClick={() => setShowModal(true)}
                className="p-0 border-0"
              >
                <Image src={image} alt="" className="w-100 h-100 fit-cover" />
              </Button>
              <Hoverbox.Content className="flex-center pe-none bg-holder overlay overlay-2">
                <Image src={playIcon} width={60} alt="" className="z-1" />
              </Hoverbox.Content>
            </Hoverbox>
            <div className="p-3">
              <h5 className="fs-9 mb-2">
                <Link to={paths.courseDetails(id)} className="text-1100">
                  {name}
                </Link>
              </h5>
              <h5 className="fs-9">
                <Link to={paths.trainerProfile}>{trainer}</Link>
              </h5>
            </div>
          </div>
          <Row className="g-0 mb-3 align-items-end">
            <Col className="ps-3">
              <h4 className="fs-8 text-warning d-flex align-items-center">
                <span>${price}</span>
                {oldPrice && (
                  <del className="ms-2 fs-10 text-700">${oldPrice}</del>
                )}
              </h4>
              <p className="mb-0 fs-10 text-800">
                {totalEnrolled.toLocaleString()} Enrolled
              </p>
            </Col>
            <Col xs="auto" className="pe-3">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip style={{ position: 'fixed' }}>
                    {isInFavouriteItems(id)
                      ? 'Remove from Wishlist'
                      : 'Add to Wishlist'}
                  </Tooltip>
                }
              >
                <Button
                  variant="falcon-default"
                  size="sm"
                  onClick={handleFavouriteClick}
                  className="me-2 hover-danger"
                >
                  <FontAwesomeIcon
                    icon={isInFavouriteItems(id) ? 'heart' : ['far', 'heart']}
                    className={`${isInFavouriteItems(id) && 'text-danger'}`}
                    transform="down-1"
                  />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip style={{ position: 'fixed' }}>
                    {isInCart(id) ? 'Remove from Cart' : 'Add to Cart'}
                  </Tooltip>
                }
              >
                <Button
                  variant={`${isInCart(id) ? 'primary' : 'falcon-default'}`}
                  size="sm"
                  onClick={handleAddToCart}
                >
                  <FontAwesomeIcon
                    icon={isInCart(id) ? 'shopping-cart' : 'cart-plus'}
                  />
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default CourseGrid;
