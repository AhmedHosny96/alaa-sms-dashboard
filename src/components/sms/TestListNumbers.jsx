import React, { useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Search, TableSelectFilter, UseModal, useForm, Forms, UseInput } from 'components/common/UseTable';
import TablePageLayout from 'components/common/TablePageLayout';

const TestListNumbers = () => {
  const [query, setQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [modalShow, setModalShow] = useState(false);

  const companyOptions = [
    { value: 'company-a', label: 'Company A' },
    { value: 'company-b', label: 'Company B' }
  ];

  const { values, setValues, handleOnChange } = useForm({ number: '' });

  const handleAdd = () => setModalShow(true);
  const handleCloseModal = () => {
    setModalShow(false);
    setValues({ number: '' });
  };

  const handleSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
      <TablePageLayout
        title="SMS Test Panel - Numbers"
        subtitle="Test SMS numbers for development and QA."
        toolbar={
          <>
            <Button
              variant="primary"
              size="sm"
              className="table-page-addButton"
              onClick={handleAdd}
            >
              <FontAwesomeIcon icon="plus" className="me-1" />
              Add Test Number
            </Button>
            <TableSelectFilter
              className="table-page-filter"
              value={filterCompany}
              placeholder="Company"
              onChange={(value) => setFilterCompany(value)}
              options={companyOptions}
            />
            <Search
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search ..."
              className="table-page-search"
            />
          </>
        }
      >
        <Table className="table-sm fs--1 mb-0 overflow-hidden">
          <thead className="bg-200 text-900">
            <tr>
              <th className="text-nowrap">Number</th>
              <th className="text-nowrap">Country</th>
              <th className="text-nowrap">Status</th>
              <th className="text-nowrap">Added Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="list">
            <tr>
              <td colSpan={5} className="text-center text-700 py-5">
                No test numbers added yet.
              </td>
            </tr>
          </tbody>
        </Table>
      </TablePageLayout>

      <UseModal
        title="Add Test Number"
        isVisible={modalShow}
        setIsVisible={setModalShow}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" variant="secondary" size="sm" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" variant="primary" size="sm" type="submit" form="test-number-form">
            Add
          </Button>
        ]}
      >
        <Forms id="test-number-form" onFinish={handleSubmit}>
          <UseInput
            name="number"
            label="Test Number"
            value={values.number}
            onChange={handleOnChange}
            placeholder="Enter test number"
          />
          <Form.Text className="text-700">Assign to a company from the filter above.</Form.Text>
        </Forms>
      </UseModal>
    </>
  );
};

export default TestListNumbers;
