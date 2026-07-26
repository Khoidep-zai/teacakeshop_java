import api from './axios';
import type { DashboardOverview, DailyRevenue, TopProduct, LowStockProduct, UserProfile } from '../types';

export const getDashboardOverview = () => api.get<DashboardOverview>('/admin/dashboard/overview').then(r => r.data);
export const getDailyRevenue = () => api.get<DailyRevenue[]>('/admin/dashboard/revenue/daily').then(r => r.data);
export const getTopProducts = () => api.get<TopProduct[]>('/admin/dashboard/top-products').then(r => r.data);
export const getTopCombos = () => api.get('/admin/dashboard/top-combos').then(r => r.data);
export const getLowStock = () => api.get<LowStockProduct[]>('/admin/dashboard/low-stock').then(r => r.data);
export const getUsers = () => api.get<UserProfile[]>('/admin/users').then(r => r.data);
