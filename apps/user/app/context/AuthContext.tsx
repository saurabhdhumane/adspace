import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@adspace/shared';
import { api, userTokenStorage } from '../services/authStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string; company?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await userTokenStorage.getAccessToken();
        if (token) {
          const res = await api.getMe();
          if (res.success && res.data) {
            if (res.data.role !== 'advertiser') {
              await userTokenStorage.clearTokens();
              setUser(null);
            } else {
              setUser(res.data);
            }
          }
        }
      } catch (err) {
        await userTokenStorage.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.success && res.data) {
      if (res.data.user.role !== 'advertiser') {
        throw new Error('This account is registered as a Space Owner. Please use the Space Owner App.');
      }
      await userTokenStorage.setTokens(res.data.tokens);
      setUser(res.data.user);
    } else {
      throw new Error(res.error?.message || 'Login failed');
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string; company?: string }) => {
    const res = await api.register({
      ...data,
      role: 'advertiser',
    });
    if (res.success && res.data) {
      await userTokenStorage.setTokens(res.data.tokens);
      setUser(res.data.user);
    } else {
      throw new Error(res.error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    await userTokenStorage.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
