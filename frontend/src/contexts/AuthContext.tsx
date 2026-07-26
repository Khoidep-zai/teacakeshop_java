import React, { createContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { getMe } from '../api/auth';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<UserProfile | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (accessToken: string, refreshToken: string): Promise<UserProfile | null> => {
    sessionStorage.setItem('accessToken', accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Xóa local store cache cũ khi đăng nhập – để Profile lấy data thật từ API
    localStorage.removeItem('store_orders');
    localStorage.removeItem('store_reservations');
    try {
      const data = await getMe();
      setUser(data);
      setLoading(false);
      return data;
    } catch {
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
