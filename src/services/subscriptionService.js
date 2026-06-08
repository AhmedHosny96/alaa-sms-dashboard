import apiClient from './apiClient';

const subscriptionService = {
  list(params = {}) {
    return apiClient.get('/subscription-plans', params);
  },

  listActive() {
    return apiClient.get('/subscription-plans', { activeOnly: true });
  },

  getById(id) {
    return apiClient.get(`/subscription-plans/${id}`);
  },

  create(payload) {
    return apiClient.post('/subscription-plans', payload);
  },

  update(id, payload) {
    return apiClient.put(`/subscription-plans/${id}`, payload);
  },

  delete(id) {
    return apiClient.del(`/subscription-plans/${id}`);
  }
};

export default subscriptionService;
