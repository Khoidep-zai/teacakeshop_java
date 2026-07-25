import api from './axios';
import type { Product, Page, ProductSuggestion } from '../types';

export const getProducts = (params?: Record<string,any>) => api.get<Page<Product>>('/products', { params }).then(r => r.data);
export const getProduct = (id: number) => api.get<Product>(`/products/${id}`).then(r => r.data);
export const getHotProducts = () => api.get<Product[]>('/products/hot').then(r => r.data);
export const getBestSellerProducts = () => api.get<Product[]>('/products/best-sellers').then(r => r.data);
export const getNewestProducts = () => api.get<Product[]>('/products/newest').then(r => r.data);
export const getProductSuggestions = (id: number) => api.get<ProductSuggestion[]>(`/products/${id}/suggestions`).then(r => r.data);

// Admin
export const createProduct = (data: any) => api.post<Product>('/admin/products', data).then(r => r.data);
export const updateProduct = (id: number, data: any) => api.put<Product>(`/admin/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id: number) => api.delete(`/admin/products/${id}`);
export const uploadProductImage = (productId: number, file: File) => {
  const formData = new FormData();
  formData.append('productId', productId.toString());
  formData.append('file', file);
  return api.post<{ imageUrl: string }>('/admin/images/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};
