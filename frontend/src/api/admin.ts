import api from './axios';
import type { DashboardOverview, DailyRevenue, TopProduct, LowStockProduct, Page, UserProfile } from '../types';

export const getDashboardOverview = () => api.get<DashboardOverview>('/admin/dashboard/overview').then(r => r.data);
export const getDailyRevenue = (startDate?: string, endDate?: string) =>
  api.get<DailyRevenue[]>('/admin/dashboard/revenue/daily', {
    params: startDate || endDate ? { startDate, endDate } : undefined,
  }).then(r => r.data);
export const getTopProducts = () => api.get<TopProduct[]>('/admin/dashboard/top-products').then(r => r.data);
export const getTopCombos = () => api.get('/admin/dashboard/top-combos').then(r => r.data);
export const getLowStock = () => api.get<LowStockProduct[]>('/admin/dashboard/low-stock').then(r => r.data);
/** /admin/users trả về Page<UserAccountResponse> */
export const getUsers = (page = 0, size = 100) =>
  api.get<Page<UserProfile>>('/admin/users', { params: { page, size } }).then(r => r.data);
