import apiClient from './apiClient';

const userService = {
  list(params) {
    return apiClient.get('/users', params);
  },

  getById(id) {
    return apiClient.get(`/users/${id}`);
  },

  listRoles() {
    return apiClient.get('/users/roles');
  },

  listPlatformAdmins() {
    return apiClient.get('/platform/users');
  },

  createPlatformAdmin(payload) {
    return apiClient.post('/platform/users', payload);
  },

  updatePlatformAdmin(userId, active) {
    return apiClient.put(`/platform/users/${userId}`, null, { active });
  },

  listByCompany(companyId) {
    return apiClient.get(`/companies/${companyId}/users`);
  },

  createForCompany(companyId, payload) {
    return apiClient.post(`/companies/${companyId}/users`, payload);
  },

  updateUser(companyId, userId, payload) {
    return apiClient.put(`/companies/${companyId}/users/${userId}`, payload);
  }
};

export default userService;
