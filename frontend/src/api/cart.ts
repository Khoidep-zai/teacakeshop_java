import api from './axios';
import type { Cart, CartItem } from '../types';
export const createCart = () => api.post<Cart>('/carts').then(r => r.data);
export const getCart = (token: string) => api.get<Cart>(`/carts/${token}`).then(r => r.data);
export const addCartItem = (token: string, item: Partial<CartItem> & { itemType: string }) => api.post<Cart>(`/carts/${token}/items`, item).then(r => r.data);
export const updateCartItem = (token: string, itemId: number, quantity: number) => api.put<Cart>(`/carts/${token}/items/${itemId}`, { quantity }).then(r => r.data);
export const removeCartItem = (token: string, itemId: number) => api.delete<Cart>(`/carts/${token}/items/${itemId}`).then(r => r.data);
export const clearCart = (token: string) => api.delete(`/carts/${token}/items`);
