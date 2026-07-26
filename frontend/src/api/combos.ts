import api from './axios';
import type { Combo, WeatherType, Page } from '../types';
export const getCombos = (params?: Record<string,any>) => api.get<Page<Combo>>('/combos', { params }).then(r => r.data);
export const getAdminCombos = (params?: Record<string,any>) => api.get<Page<Combo>>('/admin/combos', { params }).then(r => r.data);
export const getCombo = (id: number) => api.get<Combo>(`/combos/${id}`).then(r => r.data);
export const getHotCombos = () => api.get<Combo[]>('/combos/hot').then(r => r.data);
export const getBestSellerCombos = () => api.get<Combo[]>('/combos/best-sellers').then(r => r.data);
export const getNewestCombos = () => api.get<Combo[]>('/combos/newest').then(r => r.data);
export const getCombosByWeather = (w: WeatherType) => api.get<Combo[]>(`/combos/weather/${w}`).then(r => r.data);
export const getComboSuggestions = (id: number) => api.get<any[]>(`/combos/${id}/suggestions`).then(r => r.data);
export const createCombo = (data: any) => api.post('/admin/combos', data).then(r => r.data);
export const updateCombo = (id: number, data: any) => api.put(`/admin/combos/${id}`, data).then(r => r.data);
export const deleteCombo = (id: number) => api.delete(`/admin/combos/${id}`);
export const uploadComboImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ publicId: string; imageUrl: string }>('/admin/images/combos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};
