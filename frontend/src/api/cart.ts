import api from './axios';
import type { Cart } from '../types';

export const createCart = () => api.post<Cart>('/carts').then(r => r.data);
export const getCart = (token: string) => api.get<Cart>(`/carts/${token}`).then(r => r.data);

export const addCartItem = (token: string, item: { itemType: string; itemId?: number; productId?: number; comboId?: number; quantity: number }) => {
  const payload = {
    itemType: item.itemType,
    itemId: item.itemId || item.productId || item.comboId,
    quantity: item.quantity
  };
  return api.post<Cart>(`/carts/${token}/items`, payload).then(r => r.data);
};

export const updateCartItem = (token: string, itemId: number, quantity: number) => api.put<Cart>(`/carts/${token}/items/${itemId}`, { quantity }).then(r => r.data);
export const removeCartItem = (token: string, itemId: number) => api.delete<Cart>(`/carts/${token}/items/${itemId}`).then(r => r.data);
export const clearCart = (token: string) => api.delete(`/carts/${token}/items`);
