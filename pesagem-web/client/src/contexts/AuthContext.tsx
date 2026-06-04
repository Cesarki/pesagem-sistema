import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'operador' | 'porteiro' | 'balanceiro';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, senha: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!email || !senha) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Modo demo: identificar tipo de usuário pelo email
      let role: 'admin' | 'operador' | 'porteiro' | 'balanceiro' = 'operador';
      let nome = 'Usuário';

      if (email.includes('admin')) {
        role = 'admin';
        nome = 'Admin Sistema';
      } else if (email.includes('porteiro')) {
        role = 'porteiro';
        nome = 'Porteiro';
      } else if (email.includes('balanceiro')) {
        role = 'balanceiro';
        nome = 'Balanceiro';
      }

      const mockUser: User = {
        id: 1,
        nome: nome,
        email: email,
        role: role,
      };

      const mockToken = 'demo_token_' + Math.random().toString(36).substr(2, 9);

      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('auth_token', mockToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
