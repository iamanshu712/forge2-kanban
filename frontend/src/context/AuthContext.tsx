import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/auth';

// ─── Context Types ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('kanban_user');
    const storedToken = localStorage.getItem('kanban_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('kanban_user');
        localStorage.removeItem('kanban_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('kanban_token', data.token);
    localStorage.setItem('kanban_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const { data } = await authApi.register(credentials);
    localStorage.setItem('kanban_token', data.token);
    localStorage.setItem('kanban_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('kanban_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
