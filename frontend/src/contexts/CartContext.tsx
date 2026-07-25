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
      console.error('Failed to init cart:', e);
      // Reset if invalid token
      localStorage.removeItem('cartToken');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initCart();
  }, []);

  const addItem = async (itemType: CartItemType, targetId: number, quantity: number = 1) => {
    if (!token) {
      const newCart = await cartApi.createCart();
      const newToken = newCart.token;
      localStorage.setItem('cartToken', newToken);
      setToken(newToken);
      const updated = await cartApi.addCartItem(newToken, {
        itemType,
        productId: itemType === 'PRODUCT' ? targetId : undefined,
        comboId: itemType === 'COMBO' ? targetId : undefined,
        quantity
      });
      setCart(updated);
      return;
    }
    const updated = await cartApi.addCartItem(token, {
      itemType,
      productId: itemType === 'PRODUCT' ? targetId : undefined,
      comboId: itemType === 'COMBO' ? targetId : undefined,
      quantity
    });
    setCart(updated);
  };

  const updateItem = async (cartItemId: number, quantity: number) => {
    if (!token) return;
    const updated = await cartApi.updateCartItem(token, cartItemId, quantity);
    setCart(updated);
  };

  const removeItem = async (cartItemId: number) => {
    if (!token) return;
    const updated = await cartApi.removeCartItem(token, cartItemId);
    setCart(updated);
  };

  const clearCart = async () => {
    if (!token) return;
    await cartApi.clearCart(token);
    setCart(prev => prev ? { ...prev, items: [], totalAmount: 0, itemCount: 0 } : null);
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, token, addItem, updateItem, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
