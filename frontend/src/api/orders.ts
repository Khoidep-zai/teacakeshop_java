import api from './axios';
import type { Order } from '../types';
export const checkout = (data: any) => api.post<Order>('/orders/checkout', data).then(r => r.data);
export const getOrder = (code: string) => api.get<Order>(`/orders/${code}`).then(r => r.data);
export const getMyOrders = () => api.get<Order[]>('/customer/orders').then(r => r.data);
export const getMyOrder = (id: number) => api.get<Order>(`/customer/orders/${id}`).then(r => r.data);
export const getAdminOrders = (params?: any) => api.get('/admin/orders', { params }).then(r => r.data);
export const updateOrderStatus = (id: number, status: string) => api.patch(`/admin/orders/${id}/status`, { status }).then(r => r.data);
