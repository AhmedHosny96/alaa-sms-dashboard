import React from 'react';
import { Card, Col, Row, Tab, Nav, Form } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TopCoursesTable from './TopCoursesTable';
import FalconLink from 'components/common/FalconLink';
import SimpleBar from 'simplebar-react';
import classNames from 'classnames';

const TabTitle = ({ title, isPaid, icon }) => (
  <Flex className="p-3 ps-2 text-start cursor-pointer gap-1">
    <Flex className="flex-column flex-between-center">
      {isPaid && (
        <FontAwesomeIcon
          icon="crown"
          className="fs-11 text-warning"
          transform="shrink-4"
        />
      )}
      <FontAwesomeIcon icon={icon} className="fs-7 mt-auto" />
    </Flex>
    <div className="ms-2">
      <h6 className="text-700 fs-11 text-nowrap mb-1">{title}</h6>
      <h5 className="mb-0 lh-1">{isPaid ? 'Paid' : 'Free'}</h5>
    </div>
  </Flex>
);

const TopCourses = ({ tableData, className }) => {
  return (
    <Card className={classNames(className, 'overflow-hidden')}>
      <Tab.Container id="top-course-tab" defaultActiveKey="popularPaid">
        <SimpleBar>
          <Card.Header className="p-0">
            <Nav className="nav-tabs top-courses-tab border-0 flex-nowrap">
              <Nav.Item>
                <Nav.Link className="mb-0" eventKey="popularPaid">
                  <TabTitle
                    title="Most Popular"
                    isPaid={true}
                    isActive={true}
                    icon="fire"
                  />
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="mb-0" eventKey="popularFree">
                  <TabTitle
                    title="Most Popular"
                    isPaid={false}
                    isActive={false}
                    icon="fire"
                  />
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="mb-0" eventKey="topPaid">
                  <TabTitle
                    title="Top Rated"
                    isPaid={true}
                    isActive={false}
                    icon="star"
                  />
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="mb-0" eventKey="topFree">
                  <TabTitle
                    title="Top Rated"
                    isPaid={false}
                    isActive={false}
                    icon="star"
                  />
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </SimpleBar>

        <Card.Body className="p-0">
          <Tab.Content>
            <Tab.Pane unmountOnExit eventKey="popularPaid">
              <TopCoursesTable tableData={tableData.slice(0, 4)} />
            </Tab.Pane>
            <Tab.Pane unmountOnExit eventKey="popularFree">
              <TopCoursesTable tableData={tableData.slice(4, 8)} />
            </Tab.Pane>
            <Tab.Pane unmountOnExit eventKey="topPaid">
              <TopCoursesTable tableData={tableData.slice(8, 12)} />
            </Tab.Pane>
            <Tab.Pane unmountOnExit eventKey="topFree">
              <TopCoursesTable tableData={tableData.slice(12, 16)} />
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Tab.Container>

      <Card.Footer className="bg-body-tertiary py-2">
        <Row className="g-0 flex-between-center">
          <Col xs="auto">
            <Form.Select size="sm" className="me-2">
              <option>Last 7 days</option>
              <option>Last Month</option>
              <option>Last Year</option>
            </Form.Select>
          </Col>
          <Col xs="auto">
            <FalconLink title="All Courses" className="px-0 fw-medium" />
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
};

export default TopCourses;
