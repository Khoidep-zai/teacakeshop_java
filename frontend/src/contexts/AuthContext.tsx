import React, { createContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { getMe, logout as logoutApi, logoutAll as logoutAllApi } from '../api/auth';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
  logoutAll: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = sessionStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token && !refreshToken) {
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

  const logout = async () => {
    // Gọi backend để thu hồi token trước khi xóa local storage
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutApi({ accessToken: sessionStorage.getItem('accessToken') || '', refreshToken });
      }
    } catch {
      // Bỏ qua lỗi — vẫn xóa token phía client dù backend thất bại
    }
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const logoutAll = async () => {
    await logoutAllApi();
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, logoutAll }}>
      {children}
    </AuthContext.Provider>
  );
};
