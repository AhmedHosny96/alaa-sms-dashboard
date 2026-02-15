import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDelete = ({
  show,
  onHide,
  onConfirm,
  title = 'Delete record',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
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
        {loading ? 'Deleting…' : confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmDelete;
