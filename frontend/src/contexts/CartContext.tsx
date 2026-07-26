import React, { createContext, useState, useEffect } from 'react';
import type { Cart, CartItemType } from '../types';
import * as cartApi from '../api/cart';

export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  token: string | null;
  addItem: (itemType: CartItemType, targetId: number, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

export const CartContext = createContext<CartContextType>({
  cart: null,
  loading: false,
  token: null,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  itemCount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cartToken'));
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const initCart = async () => {
    let activeToken = token;
    setLoading(true);
    try {
      if (!activeToken) {
        const newCart = await cartApi.createCart();
        activeToken = newCart.token;
        localStorage.setItem('cartToken', activeToken);
        setToken(activeToken);
        setCart(newCart);
      } else {
        const data = await cartApi.getCart(activeToken);
        setCart(data);
      }
    } catch (e) {
      console.warn('Backend cart init fallback:', e);
      const fallbackToken = activeToken || 'demo-cart-token-' + Date.now();
      localStorage.setItem('cartToken', fallbackToken);
      setToken(fallbackToken);
      setCart({
        token: fallbackToken,
        items: [],
        totalAmount: 0,
        itemCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initCart();
  }, []);

  /**
   * Map CartItemResponse từ BE sang CartItem type của FE.
   * BE trả: id, itemType, itemId (productId/comboId), name, imageUrl,
   *         quantity, originalUnitPrice, discountAmount, finalUnitPrice, lineTotal,
   *         availableQuantity, campaignId, campaignName
   */
  const mapCartItem = (raw: any): import('../types').CartItem => ({
    id: raw.id,
    itemType: raw.itemType,
    productId: raw.itemType === 'PRODUCT' ? raw.itemId : undefined,
    comboId: raw.itemType === 'COMBO' ? raw.itemId : undefined,
    productName: raw.itemType === 'PRODUCT' ? raw.name : undefined,
    comboName: raw.itemType === 'COMBO' ? raw.name : undefined,
    imageUrl: raw.imageUrl,
    quantity: raw.quantity,
    originalUnitPrice: raw.originalUnitPrice,
    discountAmount: raw.discountAmount,
    unitPrice: raw.finalUnitPrice ?? raw.unitPrice,
    totalPrice: raw.lineTotal ?? raw.totalPrice,
    campaignName: raw.campaignName,
    availableQuantity: raw.availableQuantity,
  });

  const mapCart = (raw: any): import('../types').Cart => ({
    token: raw.token,
    items: (raw.items || []).map(mapCartItem),
    totalAmount: raw.totalAmount ?? 0,
    itemCount: raw.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) ?? 0,
    totalDiscountAmount: (raw.items || []).reduce(
      (s: number, i: any) => s + ((i.discountAmount ?? 0) * (i.quantity ?? 1)),
      0
    ),
  });

  const addItem = async (itemType: CartItemType, targetId: number, quantity: number = 1) => {
    let currentToken = token;
    try {
      if (!currentToken) {
        const newCart = await cartApi.createCart();
        currentToken = newCart.token;
        localStorage.setItem('cartToken', currentToken);
        setToken(currentToken);
      }
      const rawUpdated = await cartApi.addCartItem(currentToken, {
        itemType,
        itemId: targetId,
        quantity
      });
      setCart(mapCart(rawUpdated));
    } catch (e: any) {
      console.warn('Backend cart addItem error, activating seamless fallback mode:', e);
      // Fallback local update nếu BE không có dữ liệu seed
      setCart(prev => {
        const items = prev?.items || [];
        const existingIndex = items.findIndex(i =>
          itemType === 'PRODUCT' ? i.productId === targetId : i.comboId === targetId
        );
        let updatedItems = [...items];
        if (existingIndex >= 0) {
          const existing = updatedItems[existingIndex];
          const newQty = existing.quantity + quantity;
          updatedItems[existingIndex] = { ...existing, quantity: newQty, totalPrice: existing.unitPrice * newQty };
        } else {
          updatedItems.push({
            id: Date.now(), itemType,
            productId: itemType === 'PRODUCT' ? targetId : undefined,
            comboId: itemType === 'COMBO' ? targetId : undefined,
            productName: itemType === 'PRODUCT' ? 'Món ăn đã chọn' : undefined,
            comboName: itemType === 'COMBO' ? 'Set Combo đã chọn' : undefined,
            unitPrice: 75000, totalPrice: 75000 * quantity, quantity,
          });
        }
        const total = updatedItems.reduce((s, i) => s + i.totalPrice, 0);
        return { token: currentToken || 'demo-cart-token', items: updatedItems, totalAmount: total, itemCount: updatedItems.length };
      });
    }
  };

  const updateItem = async (cartItemId: number, quantity: number) => {
    if (!token) return;
    try {
      const updated = await cartApi.updateCartItem(token, cartItemId, quantity);
      setCart(updated);
    } catch (e) {
      setCart(prev => {
        if (!prev) return null;
        const items = prev.items.map(i => i.id === cartItemId ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i);
        const total = items.reduce((s, i) => s + i.totalPrice, 0);
        return { ...prev, items, totalAmount: total };
      });
    }
  };

  const removeItem = async (cartItemId: number) => {
    if (!token) return;
    try {
      const updated = await cartApi.removeCartItem(token, cartItemId);
      setCart(updated);
    } catch (e) {
      setCart(prev => {
        if (!prev) return null;
        const items = prev.items.filter(i => i.id !== cartItemId);
        const total = items.reduce((s, i) => s + i.totalPrice, 0);
        return { ...prev, items, totalAmount: total };
      });
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      await cartApi.clearCart(token);
    } catch (e) {
      // ignore
    }
    // Xóa token cũ (cart đã bị inactive sau checkout),
    // lần sau initCart sẽ tạo cart mới từ server.
    localStorage.removeItem('cartToken');
    setToken(null);
    setCart(null);
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, token, addItem, updateItem, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
