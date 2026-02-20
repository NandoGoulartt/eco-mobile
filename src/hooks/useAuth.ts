import { useState, useEffect } from 'react';
import { authStorage } from '@/lib/authStorage';
import { User } from '@/shared';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        authStorage.getToken(),
        authStorage.getUser(),
      ]);

      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: User, rememberMe: boolean = true) => {
    try {
      await authStorage.setCredentials(token, userData, rememberMe);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const logout = async () => {
    try {
      await authStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
}
