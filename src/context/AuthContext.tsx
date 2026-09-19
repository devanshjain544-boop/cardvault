import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Address } from '../types.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, mobile?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; mobile?: string }) => Promise<void>;
  saveAddress: (address: Address) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => api.getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!api.getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const current = await api.getMe();
      setUser(current);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      api.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
  };

  const adminLogin = async (email: string, pass: string) => {
    const res = await api.adminLogin(email, pass);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string, mobile?: string) => {
    const res = await api.register(name, email, pass, mobile);
    setUser(res.user);
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
  };

  const updateProfile = async (data: { name: string; mobile?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  const saveAddress = async (address: Address) => {
    const addresses = await api.saveAddress(address);
    if (user) {
      setUser({ ...user, savedAddresses: addresses });
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        saveAddress,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
