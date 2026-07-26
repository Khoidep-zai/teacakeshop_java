import api from './axios';
import type { Order, Page } from '../types';

/**
 * Checkout: tạo đơn hàng từ giỏ hàng.
 * Gửi đầy đủ orderType, shippingAddress, customerEmail.
 */
export const checkout = (data: any) => api.post<Order>('/orders/checkout', data).then(r => r.data);

/**
 * Khách vãng lai xem đơn bằng mã + SĐT.
 * Backend yêu cầu ?phone=... là bắt buộc.
 */
export const getOrder = (code: string, phone: string) =>
  api.get<Order>(`/orders/${code}`, { params: { phone } }).then(r => r.data);

/**
 * Lấy đơn hàng của user đăng nhập (Page<OrderResponse>).
 * Trả về mảng .content thay vì Page object.
 */
export const getMyOrders = (page = 0, size = 50) =>
  api.get<Page<Order>>('/customer/orders', { params: { page, size } })
    .then(r => r.data.content ?? []);

/**
 * Lấy chi tiết một đơn của user đăng nhập.
 */
export const getMyOrder = (id: number) =>
  api.get<Order>(`/customer/orders/${id}`).then(r => r.data);

/**
 * Admin: lấy tất cả đơn hàng (Page).
 */
export const getAdminOrders = (params?: any) =>
  api.get<Page<Order>>('/admin/orders', { params }).then(r => r.data);
export const getAdminOrder = (id: number) =>
  api.get<Order>(`/admin/orders/${id}`).then(r => r.data);

/**
 * Admin: cập nhật trạng thái đơn hàng.
 */
export const updateOrderStatus = (id: number, status: string) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then(r => r.data);
