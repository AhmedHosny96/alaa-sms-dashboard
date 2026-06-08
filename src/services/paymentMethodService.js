import apiClient from './apiClient';

const paymentMethodService = {
  listOptions() {
    return apiClient.get('/payment-methods/options');
  }
};

export default paymentMethodService;

