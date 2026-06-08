import apiClient from './apiClient';

const clientService = {
  listAll(params) {
    return apiClient.get('/clients', params);
  },

  list(companyId, params) {
    return apiClient.get(`/companies/${companyId}/clients`, params);
  },

  getById(companyId, id) {
    return apiClient.get(`/companies/${companyId}/clients/${id}`);
  },

  create(companyId, payload) {
    return apiClient.post(`/companies/${companyId}/clients`, payload);
  },

  update(companyId, clientId, payload) {
    return apiClient.put(`/companies/${companyId}/clients/${clientId}`, payload);
  },

  delete(companyId, clientId) {
    return apiClient.del(`/companies/${companyId}/clients/${clientId}`);
  },

  setActive(companyId, clientId, active) {
    return apiClient.put(`/companies/${companyId}/clients/${clientId}/active`, { active });
  },

  resetPassword(companyId, clientId) {
    return apiClient.post(`/companies/${companyId}/clients/${clientId}/reset-password`, null);
  }
};

export default clientService;
