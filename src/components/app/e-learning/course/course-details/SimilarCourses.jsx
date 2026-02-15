import React from 'react';
import { Card } from 'react-bootstrap';
import FalconCardHeader from 'components/common/FalconCardHeader';
import FalconLink from 'components/common/FalconLink';
import { courseData } from 'data/elearning/courseData';
import Slider from 'react-slick';
import CourseGrid from '../CourseGrid';
import paths from 'routes/paths';

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 2.03,
  slidesToScroll: 1,
  initialSlide: 1,
  responsive: [
    {
      breakpoint: 1540,
      settings: {
        slidesToShow: 2.03,
        initialSlide: 1
      }
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 1
      }
    }
  ]
};

const SimilarCourses = () => {
  return (
    <Card className="mb-3 mb-lg-0">
      <FalconCardHeader title="Similar Courses" titleTag="h6" />
      <Card.Body className="bg-body-tertiary py-0">
        <Slider
          {...sliderSettings}
          className="full-height-slider slick-slider-arrow-inner similar-courses-slider"
        >
          {courseData.map(course => (
            <CourseGrid course={course} key={course.id} />
          ))}
        </Slider>
      </Card.Body>
      <Card.Footer className="text-end py-2">
        <FalconLink
          title="All courses"
          to={paths.courses('course-grid')}
          icon="external-link-alt"
          className="fw-medium"
        />
      </Card.Footer>
    </Card>
  );
};

export default SimilarCourses;
