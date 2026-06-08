import apiClient from './apiClient';

const ipService = {
  list(params = {}) {
    return apiClient.get('/smpp-ip-addresses', params);
  },

  listAvailable() {
    return apiClient.get('/smpp-ip-addresses/available');
  },

  getById(id) {
    return apiClient.get(`/smpp-ip-addresses/${id}`);
  },

  create(payload) {
    const normalizedPayload = {
      ipAddress: (payload?.ipAddress || payload?.ip || payload?.address || '').trim(),
      port:
        payload?.port === '' || payload?.port == null || Number.isNaN(Number(payload?.port))
          ? null
          : Number(payload.port),
      notes: payload?.notes ?? null
    };
    return apiClient.post('/smpp-ip-addresses', normalizedPayload);
  },

  update(id, payload) {
    return apiClient.put(`/smpp-ip-addresses/${id}`, payload);
  },

  delete(id) {
    return apiClient.del(`/smpp-ip-addresses/${id}`);
  }
};

export default ipService;
