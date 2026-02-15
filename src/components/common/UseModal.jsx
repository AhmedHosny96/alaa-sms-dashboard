import React from 'react';
import { Modal } from 'react-bootstrap';
import classNames from 'classnames';

const UseModal = ({
  children,
  title,
  isVisible,
  setIsVisible,
  width = 680,
  footer,
  onCancel,
  className,
  size = 'lg',
  centered = true,
  ...rest
}) => (
  <Modal
    show={isVisible}
    onHide={() => {
      setIsVisible?.(false);
      onCancel?.();
    }}
    centered={centered}
    size={size}
    className={classNames(className)}
    {...rest}
  >
      {title && (
        <Modal.Header closeButton>
          <Modal.Title as="h5">{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{children}</Modal.Body>
    {footer != null && <Modal.Footer>{footer}</Modal.Footer>}
  </Modal>
);

export default UseModal;
