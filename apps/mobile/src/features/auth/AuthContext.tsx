import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../../lib/api';
import { tokenStorage } from '../../lib/storage';
import { User, AuthResponse } from '@miniledger/shared';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestOtp: (phoneNumber: string) => Promise<{ message: string; cooldownSeconds: number }>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          const profile = await apiRequest<User>('/users/me');
          setUser(profile);
          await tokenStorage.setUser(profile);
        }
      } catch {
        // Token invalid or expired, clear local storage
        await tokenStorage.clearAll();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const requestOtp = async (phoneNumber: string) => {
    return apiRequest<{ message: string; cooldownSeconds: number }>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
      requiresAuth: false,
    });
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    const data = await apiRequest<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
      requiresAuth: false,
    });

    await tokenStorage.setAccessToken(data.tokens.accessToken);
    await tokenStorage.setRefreshToken(data.tokens.refreshToken);
    await tokenStorage.setUser(data.user);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
          requiresAuth: false,
        }).catch(() => {});
      }
    } finally {
      await tokenStorage.clearAll();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      requestOtp,
      verifyOtp,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
