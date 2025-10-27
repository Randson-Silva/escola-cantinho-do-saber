import { useState, useCallback } from 'react';

type User = { id: string; name: string; email: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try {
      return JSON.parse(stored);
    } catch (err) {
      // se o conteúdo armazenado estiver corrompido, remove e retorna null
      console.error('useAuth: falha ao parsear user do localStorage', err, 'raw=', stored);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const login = useCallback((userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  }, []);

  const isAuthenticated = !!token;

  return { user, token, isAuthenticated, login, logout };
}
