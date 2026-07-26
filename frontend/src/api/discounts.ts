import api from './axios';
import type { Discount, Page } from '../types';
export const getActiveDiscounts = () => api.get<Discount[]>('/discounts/active').then(r => r.data);
export const getProductDiscount = (productId: number) => api.get(`/discounts/price/products/${productId}`).then(r => r.data);
export const getComboDiscount = (comboId: number) => api.get(`/discounts/price/combos/${comboId}`).then(r => r.data);
export const getAdminDiscounts = (params?: Record<string, any>) =>
  api.get<Page<Discount>>('/admin/discounts', { params }).then(r => r.data);
export const createDiscount = (data: any) => api.post('/admin/discounts', data).then(r => r.data);
export const updateDiscount = (id: number, data: any) => api.put(`/admin/discounts/${id}`, data).then(r => r.data);
export const deleteDiscount = (id: number) => api.delete(`/admin/discounts/${id}`);
