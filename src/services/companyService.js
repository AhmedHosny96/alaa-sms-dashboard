import apiClient from './apiClient';

const companyService = {
  list(params) {
    return apiClient.get('/companies', params);
  },

  getById(id) {
    return apiClient.get(`/companies/${id}`);
  },

  create(payload) {
    return apiClient.post('/companies', payload);
  },

  update(id, payload) {
    return apiClient.put(`/companies/${id}`, payload);
  },

  remove(id) {
    return apiClient.del(`/companies/${id}`);
  },

  updateStatus(id, status) {
    const params = { statusParam: status };
    return apiClient.patch(`/companies/${id}/status`, null, params);
  },

  generateApiKey(id) {
    return apiClient.post(`/companies/${id}/apikey`);
  },

  listUsers(id) {
    return apiClient.get(`/companies/${id}/users`);
  },

  createUser(id, payload) {
    return apiClient.post(`/companies/${id}/users`, payload);
  },

  getByDomain(domain) {
    return apiClient.get(`/companies/domain/${encodeURIComponent(domain)}`);
  },

  listProviders(companyId, params) {
    return apiClient.get(`/companies/${companyId}/providers`, params);
  },

  createProvider(companyId, payload) {
    return apiClient.post(`/companies/${companyId}/providers`, payload);
  },

  updateProvider(companyId, providerId, payload) {
    return apiClient.put(`/companies/${companyId}/providers/${providerId}`, payload);
  },

  deleteProvider(companyId, providerId) {
    return apiClient.del(`/companies/${companyId}/providers/${providerId}`);
  }
};

export default companyService;
