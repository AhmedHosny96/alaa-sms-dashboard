import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmAction = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  loading = false
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title as="h5">{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" size="sm" onClick={onHide} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant="danger" size="sm" onClick={onConfirm} disabled={loading}>
        {loading ? 'Processing…' : confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmAction;
