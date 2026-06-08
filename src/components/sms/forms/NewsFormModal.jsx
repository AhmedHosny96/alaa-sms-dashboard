import React, { useEffect, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { UseModal, useForm, Forms, UseInput, UseSelect } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';

const NewsFormModal = ({ show, onClose, record, onSubmit }) => {
  const initialValues = useMemo(
    () => ({
      title: record?.title ?? '',
      content: record?.content ?? '',
      status: record?.status ?? 'ACTIVE'
    }),
    [record]
  );

  const { values, setValues, handleOnChange } = useForm(initialValues);

  useEffect(() => {
    if (show) setValues(initialValues);
  }, [show, initialValues, setValues]);

  const statusOptions = [
    { id: 'ACTIVE', name: 'Active' },
    { id: 'INACTIVE', name: 'Inactive' }
  ];

  const handleSubmit = () => {
    onSubmit?.(values);
    onClose?.();
  };

  return (
    <UseModal
      title={record ? 'Edit News' : 'Add News'}
      isVisible={show}
      setIsVisible={() => {}}
      onCancel={onClose}
      size="lg"
      footer={[
        <IconButton key="close" variant="falcon-default" size="sm" onClick={onClose}>
          Close
        </IconButton>,
        <IconButton key="submit" variant="primary" size="sm" type="submit" form="news-form">
          {record ? 'Update' : 'Add'}
        </IconButton>
      ]}
    >
      <Forms id="news-form" onFinish={handleSubmit}>
        <Row>
          <Col md={8}>
            <UseInput
              name="title"
              label="Title"
              value={values.title}
              onChange={handleOnChange}
              placeholder="News title"
            />
          </Col>
          <Col md={4}>
            <UseSelect
              name="status"
              label="Status"
              value={values.status}
              options={statusOptions}
              onChange={(v) => setValues((prev) => ({ ...prev, status: v }))}
              placeholder="Select status"
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <UseInput
              name="content"
              label="Content"
              as="textarea"
              rows={6}
              value={values.content}
              onChange={handleOnChange}
              placeholder="Write the news content..."
            />
          </Col>
        </Row>
      </Forms>
    </UseModal>
  );
};

export default NewsFormModal;
