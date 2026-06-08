import React, { useCallback, useEffect, useState } from 'react';
import { Button, Spinner, Table } from 'react-bootstrap';
import { UseModal, ConfirmDelete } from 'components/common/UseTable';
import IconButton from 'components/common/IconButton';
import ProviderFormModal from 'components/sms/forms/ProviderFormModal';
import companyService from 'services/companyService';
import { toast } from 'react-toastify';

const buildReq = (payload) => ({
  providerName: payload.providerName || payload.name,
  connectorId: payload.connectorId || null,
  email: payload.email,
  username: payload.username,
  password: payload.password,
  throughput: payload.throughput ? parseInt(payload.throughput, 10) : null,
  ipAddresses: payload.ipAddresses,
  httpNumberField: payload.httpNumberField,
  httpCliField: payload.httpCliField,
  apiUrl: payload.apiUrl,
  messageField: payload.messageField,
  messageValue: payload.messageValue,
  uniqueIdField: payload.uniqueIdField,
  uniqueIdValue: payload.uniqueIdValue,
  returnValue: payload.returnValue,
  uuidValue: payload.uuidValue,
  ussdIpAddresses: payload.ussdIpAddresses,
  smppHost: payload.smppHost,
  smppPort: payload.smppPort ? parseInt(payload.smppPort, 10) : null,
  smppSystemId: payload.smppSystemId,
  smppPassword: payload.smppPassword,
  smppBindMode: payload.smppBindMode
});

const CompanyProvidersModal = ({ company, show, onClose }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    try {
      const resp = await companyService.listProviders(company.id, { page: 0, size: 500 });
      const content = resp?.content ?? [];
      setRows(Array.isArray(content) ? content : []);
    } catch (e) {
      toast.error(e.message || 'Failed to load providers');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    if (show && company?.id) load();
  }, [show, company?.id, load]);

  const handleSubmit = async (payload) => {
    if (!company?.id) return;
    try {
      const req = buildReq(payload);
      if (recordForEdit?.id) {
        await companyService.updateProvider(company.id, recordForEdit.id, req);
        toast.success('Provider updated');
      } else {
        await companyService.createProvider(company.id, req);
        toast.success('Provider added');
      }
      setFormOpen(false);
      setRecordForEdit(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!company?.id || !deleteTarget?.id) return;
    setDeleting(true);
    try {
      await companyService.deleteProvider(company.id, deleteTarget.id);
      toast.success('Provider removed');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <UseModal
        title={company?.name ? `SMS providers — ${company.name}` : 'SMS providers'}
        isVisible={show}
        setIsVisible={() => {}}
        onCancel={onClose}
        size="xl"
        footer={[
          <IconButton key="close" variant="falcon-default" size="sm" onClick={onClose}>
            Close
          </IconButton>,
          <Button key="add" variant="primary" size="sm" onClick={() => {
            setRecordForEdit(null);
            setFormOpen(true);
          }}>
            Add provider
          </Button>
        ]}
      >
        <p className="text-700 fs--1 mb-3">
          Each company can have many outbound providers. The MT connector id must match an existing Jasmin smppc
          connector on your SMS server (e.g. shared across tenants or unique per provider).
        </p>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading…
          </div>
        ) : (
          <Table responsive hover size="sm" className="fs--1 mb-0">
            <thead className="bg-200">
              <tr>
                <th>Name</th>
                <th>MT connector</th>
                <th>API URL</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted text-center py-3">
                    No providers yet. Add one to link this company to an SMS gateway.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name || r.providerName || '—'}</td>
                    <td><code>{r.connectorId || '—'}</code></td>
                    <td className="text-truncate" style={{ maxWidth: 220 }} title={r.apiUrl}>
                      {r.apiUrl || '—'}
                    </td>
                    <td className="text-end">
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="edit"
                        className="me-1"
                        title="Edit"
                        onClick={() => {
                          setRecordForEdit(r);
                          setFormOpen(true);
                        }}
                      />
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="trash"
                        className="text-danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(r)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </UseModal>

      <ProviderFormModal
        show={formOpen}
        onClose={() => {
          setFormOpen(false);
          setRecordForEdit(null);
        }}
        record={recordForEdit}
        onSubmit={handleSubmit}
        showConnectorField
        closeOnSubmit={false}
        modalTitle={recordForEdit ? 'Edit company provider' : 'Add company provider'}
      />

      <ConfirmDelete
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove provider"
        message={`Remove provider "${deleteTarget?.name || deleteTarget?.providerName || ''}" from this company?`}
        loading={deleting}
      />
    </>
  );
};

export default CompanyProvidersModal;
