import apiClient from './apiClient';

const accountService = {
  getSettings(companyId) {
    return apiClient.get('/account/settings', companyId ? { companyId } : undefined);
  },

  updateSettings(payload, companyId) {
    return apiClient.put('/account/settings', payload, companyId ? { companyId } : undefined);
  },

  changePassword(payload) {
    return apiClient.post('/account/password', payload);
  },

  getBillingSummary(companyId) {
    return apiClient.get('/account/billing/summary', companyId ? { companyId } : undefined);
  },

  getBillingInvoices(companyId, groupBy) {
    const params = {};
    if (companyId) params.companyId = companyId;
    if (groupBy) params.groupBy = groupBy;
    return apiClient.get('/account/billing/invoices', Object.keys(params).length ? params : undefined);
  }
};

export default accountService;
