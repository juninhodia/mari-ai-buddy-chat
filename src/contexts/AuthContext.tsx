import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  gender: string;
  birthDate: string;
  state: string;
  city: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está logado ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = (): boolean => {
    try {
      const storedUser = localStorage.getItem('mari_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    }
    return false;
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('mari_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mari_user');
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      // Aqui você pode implementar a lógica de registro com API
      // Por enquanto, vamos simular um registro local
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender,
        birthDate: userData.birthDate,
        state: userData.state,
        city: userData.city,
      };

      // Salvar no localStorage (em produção, seria uma API)
      localStorage.setItem('mari_user', JSON.stringify(newUser));
      login(newUser);
      return true;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 