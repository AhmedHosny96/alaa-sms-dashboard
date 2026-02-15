import { CloseButton, Modal } from 'react-bootstrap';

const ModalVideoContent = ({ show, setShow, attachment }) => {
  return (
    <Modal
      show={show}
      size="xl"
      onHide={() => setShow(false)}
      className="video-popup"
      contentClassName="bg-transparent border-0"
      backdropClassName="video-popup-backdrop"
      centered
    >
      <CloseButton
        variant="white"
        onClick={() => setShow(false)}
        className="video-popup-close-btn"
      />
      <Modal.Body className="p-0 rounded overflow-hidden">
        <video
          poster={attachment.image}
          className="d-block"
          width="100%"
          height="100%"
          controls
          autoPlay
        >
          <source src={attachment.src} type="video/mp4" />
        </video>
      </Modal.Body>
    </Modal>
  );
};

export default ModalVideoContent;
