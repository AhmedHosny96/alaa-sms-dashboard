import apiClient from './apiClient';

const removeScopedIds = (params) => {
  if (!params || typeof params !== 'object') return params;
  const { companyId, clientId, resourceId, ...rest } = params;
  return rest;
};

const smsService = {
  // CDR & EDR
  getCdrReports(params) {
    return apiClient.get('/sms/cdrs', params);
  },
  getAuditLogs(params) {
    return apiClient.get('/audit/logs', params);
  },
  getMtEdr(params) {
    return apiClient.get('/sms/edr/mt', params);
  },

  // Providers / Carriers
  listProviders(params) {
    return apiClient.get('/sms/providers', removeScopedIds(params));
  },
  listProviderOptions() {
    return apiClient.get('/sms/providers/options');
  },
  syncProviders() {
    return apiClient.post('/sms/providers/sync', null);
  },
  createProvider(payload) {
    return apiClient.post('/sms/providers', payload);
  },
  updateProvider(id, payload) {
    return apiClient.put(`/sms/providers/${id}`, payload);
  },
  startProvider(id) {
    return apiClient.post(`/sms/providers/${id}/start`, null);
  },
  stopProvider(id) {
    return apiClient.post(`/sms/providers/${id}/stop`, null);
  },
  removeProvider(id) {
    return apiClient.del(`/sms/providers/${id}`);
  },

  // Ranges
  listRanges(params) {
    return apiClient.get('/sms/ranges', params);
  },
  listRangeOptions(params) {
    return apiClient.get('/sms/ranges', { ...(params || {}), size: params?.size ?? 200 });
  },
  createRange(payload) {
    return apiClient.post('/sms/ranges', payload);
  },
  updateRange(id, payload) {
    return apiClient.put(`/sms/ranges/${id}`, payload);
  },
  removeRange(id) {
    return apiClient.del(`/sms/ranges/${id}`);
  },
  assignRangeClient(rangeId, payload, params) {
    return apiClient.post(`/sms/ranges/${rangeId}/assign-client`, payload, params);
  },
  unassignRangeClient(rangeId, params) {
    return apiClient.post(`/sms/ranges/${rangeId}/unassign-client`, {}, params);
  },
  getRangeNumbers(rangeId, params) {
    return apiClient.get(`/sms/ranges/${rangeId}/numbers`, params);
  },

  // Numbers
  listNumbers(params) {
    return apiClient.get('/sms/numbers', params);
  },
  createNumber(payload, params) {
    return apiClient.post('/sms/numbers', payload, params);
  },
  createNumbersBulk(payload, params) {
    return apiClient.post('/sms/numbers/bulk', payload, params);
  },
  updateNumber(id, inboundEnabled, params) {
    const query = { ...(params || {}), inboundEnabled };
    return apiClient.put(`/sms/numbers/${id}`, null, query);
  },
  updateNumberDetails(id, payload, params) {
    return apiClient.put(`/sms/numbers/${id}/details`, payload, params);
  },
  removeNumber(id, params) {
    return apiClient.del(`/sms/numbers/${id}`, undefined, params);
  },

  bulkAssignNumbers(payload, params) {
    return apiClient.post('/sms/numbers/bulk/assign', payload, params);
  },
  bulkUnassignNumbers(payload, params) {
    return apiClient.post('/sms/numbers/bulk/unassign', payload, params);
  },
  bulkDeleteNumbers(payload, params) {
    return apiClient.post('/sms/numbers/bulk/delete', payload, params);
  },

  getRoutePricing(companyId, routeId) {
    return apiClient.get(`/companies/${companyId}/number-assignments/routes/${routeId}/pricing`);
  },

  bulkAssignRangesProvider(payload, params) {
    return apiClient.post('/sms/ranges/bulk/assign', payload, params);
  },
  bulkUnassignRangesProvider(payload, params) {
    return apiClient.post('/sms/ranges/bulk/unassign', payload, params);
  },
  bulkDeleteRanges(payload, params) {
    return apiClient.post('/sms/ranges/bulk/delete', payload, params);
  },

  listBulkAllocations(params) {
    return apiClient.get('/sms/bulk-allocations', params);
  },
  createBulkAllocation(payload, params) {
    return apiClient.post('/sms/bulk-allocations', payload, params);
  },

  // Stats
  getClientStats(params) {
    return apiClient.get('/sms/stats/clients', params);
  },
  getProviderStats(params) {
    return apiClient.get('/sms/stats/providers', params);
  },
  getRangeStats(params) {
    return apiClient.get('/sms/stats/ranges', params);
  },
  getNumberStats(params) {
    return apiClient.get('/sms/stats/numbers', params);
  },
  getFailedMessages(params) {
    return apiClient.get('/sms/stats/failed', params);
  },
  getOssMtBss(params) {
    return apiClient.get('/sms/stats/oss/mt-bss', params);
  },
  getOssMtBssSenderDetail(params) {
    return apiClient.get('/sms/stats/oss/mt-bss/sender-detail', params);
  },

  // Test Panel
  getTestNumbers(params) {
    return apiClient.get('/sms/test/numbers', params);
  },
  getTestCdrs(params) {
    return apiClient.get('/sms/test/cdrs', params);
  },

  // Dashboard
  getDashboard() {
    return apiClient.get('/sms/dashboard');
  },

  // Rate Card
  getRateCard(params) {
    return apiClient.get('/sms/ratecard', params);
  },

  // Bills / Statements
  listBills(params) {
    return apiClient.get('/sms/bills', params);
  },
  createBill(payload) {
    return apiClient.post('/sms/bills', payload);
  },

  // Payment Requests
  listPaymentRequests(params) {
    return apiClient.get('/sms/payment-requests', params);
  },
  createPaymentRequest(payload) {
    return apiClient.post('/sms/payment-requests', payload);
  },
  approvePaymentRequest(id) {
    return apiClient.put(`/sms/payment-requests/${id}/approve`, null);
  },
  rejectPaymentRequest(id) {
    return apiClient.put(`/sms/payment-requests/${id}/reject`, null);
  }
};

export default smsService;
