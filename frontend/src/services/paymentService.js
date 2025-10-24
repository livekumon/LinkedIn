import api from './api';

export const paymentAPI = {
  createOrder: (planId) => api.post('/payments/create-order', { planId }),
  captureOrder: (orderId) => api.post('/payments/capture-order', { orderId }),
  getPaymentHistory: () => api.get('/payments/history'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};

export default paymentAPI;




