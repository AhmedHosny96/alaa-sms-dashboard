import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

const Steps = ({ steps, initialStep = 0, className }) => {
  const [current, setCurrent] = useState(initialStep);

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <>
      <div className={classNames('d-flex align-items-center gap-2 mb-3', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.title ?? index}>
            <div
              className={classNames(
                'd-flex align-items-center gap-2 rounded px-2 py-1',
                index === current && 'bg-primary text-white',
                index < current && 'bg-200 text-700'
              )}
            >
              <span className="fw-semibold">{index + 1}</span>
              <span className="fs--1">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <span className="text-400" style={{ width: 16 }}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mb-3">{steps[current]?.content}</div>
      <div className="d-flex gap-2 justify-content-end">
        {current < steps.length - 1 && (
          <Button variant="primary" size="sm" onClick={next}>
            Next
          </Button>
        )}
        {current > 0 && (
          <Button variant="secondary" size="sm" onClick={prev}>
            Previous
          </Button>
        )}
      </div>
    </>
  );
};

export default Steps;
