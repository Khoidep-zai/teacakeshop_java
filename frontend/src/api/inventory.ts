import api from './axios';
import type { InventoryAdjustment, Page } from '../types';

export const adjustInventory = (
  productId: number,
  stockQuantity: number,
  note: string
) => api.patch<InventoryAdjustment>(
  `/staff/inventory/products/${productId}`,
  { stockQuantity, note }
).then(response => response.data);

export const getInventoryAdjustments = (page = 0, size = 20) =>
  api.get<Page<InventoryAdjustment>>(
    '/staff/inventory/adjustments',
    { params: { page, size } }
  ).then(response => response.data);
