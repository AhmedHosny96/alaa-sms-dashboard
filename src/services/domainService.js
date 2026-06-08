import apiClient from './apiClient';

const domainService = {
  listAll(params) {
    return apiClient.get('/domains', params);
  },

  list(companyId, params) {
    return apiClient.get(`/companies/${companyId}/domains`, params);
  },

  create(companyId, payload) {
    return apiClient.post(`/companies/${companyId}/domains`, payload);
  },

  update(companyId, domainId, payload) {
    return apiClient.put(`/companies/${companyId}/domains/${domainId}`, payload);
  }
};

export default domainService;
