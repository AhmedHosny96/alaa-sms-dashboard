import apiClient from './apiClient';

const newsService = {
  list(params) {
    return apiClient.get('/news', params);
  },
  create(payload) {
    return apiClient.post('/news', payload);
  },
  update(id, payload) {
    return apiClient.put(`/news/${id}`, payload);
  },
  remove(id) {
    return apiClient.del(`/news/${id}`);
  }
};

export default newsService;
