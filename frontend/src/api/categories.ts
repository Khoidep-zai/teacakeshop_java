import api from './axios';
import type { Category } from '../types';
export const getCategories = () => api.get<Category[]>('/categories').then(r => r.data);
export const getAdminCategories = () => api.get<Category[]>('/admin/categories').then(r => r.data);
export const getCategory = (id: number) => api.get<Category>(`/categories/${id}`).then(r => r.data);
export const createCategory = (data: Partial<Category>) => api.post('/admin/categories', data).then(r => r.data);
export const updateCategory = (id: number, data: Partial<Category>) => api.put(`/admin/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id: number) => api.delete(`/admin/categories/${id}`);
