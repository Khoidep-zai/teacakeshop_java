import api from './axios';
export const simulatePayment = (data: any) => api.post('/payments/simulate', data).then(r => r.data);
export const cashOnDelivery = (data: any) => api.post('/payments/cash-on-delivery', data).then(r => r.data);
// Backend yêu cầu ?phone= để xác thực khách vãng lai
export const getPaymentByOrder = (orderCode: string, phone: string) => 
  api.get(`/payments/orders/${orderCode}`, { params: { phone } }).then(r => r.data);
export const getAdminPayments = (params?: any) => api.get('/admin/payments', { params }).then(r => r.data);
export const markPaymentPaid = (id: number) => api.patch(`/admin/payments/${id}/mark-paid`).then(r => r.data);
