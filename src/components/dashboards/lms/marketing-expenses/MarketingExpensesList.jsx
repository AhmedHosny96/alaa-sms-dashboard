import React from 'react';
import { Col, Row } from 'react-bootstrap';

const ItemList = ({ data }) => {
  return (
    <ul className="list-unstyled mb-0">
      {data.map((item, index) => (
        <li
          key={item.id}
          className={`d-flex align-items-center fs-11 fw-medium pt-1 ${
            index !== data.length - 1 && 'mb-3'
          }`}
        >
          <span
            className={`dot bg-${item.color} bg-opacity-${item.colorOpacity}`}
          />
          <p className="lh-sm mb-0 text-700">
            {item.field}
            <span className="text-900 ps-2">{item.value}</span>
          </p>
        </li>
      ))}
    </ul>
  );
};

const MarketingExpensesList = ({ data }) => {
  return (
    <Row className="g-3 font-sans-serif">
      <Col sm={6}>
        <div className="rounded-3 border p-3">
          <div className="d-flex align-items-center mb-4">
            <span className="dot bg-info bg-opacity-25" />
            <h6 className="mb-0 fw-bold">Digital Marketing</h6>
          </div>
          <ItemList data={data.digitalMarketing} />
        </div>
      </Col>
      <Col sm={6}>
        <div className="rounded-3 border p-3 h-100">
          <div className="d-flex align-items-center mb-4">
            <span className="dot bg-primary bg-opacity-25" />
            <h6 className="mb-0 fw-bold">Offline Marketing</h6>
          </div>
          <ItemList data={data.offlineMarketing} />
        </div>
      </Col>
    </Row>
  );
};

export default MarketingExpensesList;
