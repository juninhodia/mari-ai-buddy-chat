
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  gender: string;
  birth_date: string;
  state: string;
  city: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    gender: string;
    birthDate: string;
    state: string;
    city: string;
  }) => Promise<{ error?: string }>;
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

// Função para limpar estado de autenticação
const cleanupAuthState = () => {
  try {
    // Limpar todas as chaves relacionadas ao Supabase
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning auth state:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Buscar perfil do usuário após login bem-sucedido
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          cleanupAuthState();
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          name: data.name,
          phone: data.phone || '',
          gender: data.gender || '',
          birth_date: data.birth_date || '',
          state: data.state || '',
          city: data.city || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkAuth = (): boolean => {
    return !!session?.user && !isLoading;
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      
      // Limpar estado anterior
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignorar erros de logout
        console.log('Logout cleanup completed');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Tratar diferentes tipos de erro
        if (error.message === 'Email not confirmed') {
          return { error: 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.' };
        } else if (error.message === 'Invalid login credentials') {
          return { error: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.' };
        } else {
          return { error: error.message || 'Erro no login. Tente novamente.' };
        }
      }

      if (data.user && data.session) {
        console.log('Login successful:', data.user);
        // O estado será atualizado automaticamente pelo onAuthStateChange
        return {};
      }

      return { error: 'Login falhou. Tente novamente.' };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Erro inesperado no login. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Limpar storage
      cleanupAuthState();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Recarregar a página para garantir estado limpo
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo com erro, limpar estado local
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    gender: string;
    birthDate: string;
    state: string;
    city: string;
  }): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      
      // Limpar estado anterior
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            gender: userData.gender,
            birth_date: userData.birthDate,
            state: userData.state,
            city: userData.city,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        if (error.message === 'User already registered') {
          return { error: 'Este email já está cadastrado. Tente fazer login ou use outro email.' };
        } else {
          return { error: error.message || 'Erro no cadastro. Tente novamente.' };
        }
      }

      if (data.user) {
        console.log('Registration successful:', data.user);
        
        if (data.user.email_confirmed_at) {
          // Email já confirmado, usuário pode fazer login
          return {};
        } else {
          // Email precisa ser confirmado
          return { error: 'Cadastro realizado! Verifique seu email para confirmar sua conta antes de fazer login.' };
        }
      }

      return { error: 'Cadastro falhou. Tente novamente.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Erro inesperado no cadastro. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
