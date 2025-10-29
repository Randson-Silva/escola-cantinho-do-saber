import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COMUM';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try {
      return JSON.parse(stored);
    } catch (err) {
      // se o conteúdo armazenado estiver corrompido, remove e retorna null
      console.error('AuthProvider: falha ao parsear user do localStorage', err, 'raw=', stored);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const login = useCallback((userData: User, authToken: string) => {
    // Log 1: Tentativa de Login
    console.log('[AuthContext] Tentativa de Login:', { user: userData, token: authToken });

    // Verificar se dados estão válidos
    if (!userData || !authToken) {
      console.error('[AuthContext] ❌ ERRO: userData ou authToken estão undefined!');
      console.error('[AuthContext] userData:', userData);
      console.error('[AuthContext] authToken:', authToken);
      return;
    }

    // Log de confirmação com detalhes
    console.log('[AuthContext] ✅ Login confirmado!');
    console.log('[AuthContext] 👤 Usuário:', userData.name);
    console.log('[AuthContext] 📧 Email:', userData.email);
    console.log('[AuthContext] 🔑 Nível de acesso:', userData.role);
    console.log('[AuthContext] 🎫 Token recebido:', authToken.substring(0, 30) + '...');

    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', authToken);
  }, []);

  const logout = useCallback(() => {
    // Log 3: Usuário deslogado
    console.log('[AuthContext] Usuário deslogado.');

    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  }, []);

  const isAuthenticated = !!token;

  // Log 2: Monitora mudanças no estado global
  useEffect(() => {
    console.log('[AuthContext] Estado global atualizado:', { user, token, isAuthenticated });
  }, [user, token, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

