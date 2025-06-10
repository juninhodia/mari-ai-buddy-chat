import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MariChat from '../components/MariChat';
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';

type Screen = 'welcome' | 'login' | 'register' | 'chat';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const { isAuthenticated, checkAuth, isLoading } = useAuth();

  useEffect(() => {
    // Debug logs para produção
    console.log('Environment:', {
      NODE_ENV: import.meta.env.MODE,
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      HAS_SUPABASE_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });
    
    console.log('Auth state:', { isAuthenticated, isLoading, currentScreen });
    
    // Aguardar o carregamento da autenticação
    if (!isLoading) {
      if (isAuthenticated) {
        // Se está autenticado, mostrar a tela de boas-vindas ou chat se há mensagem pendente
        if (pendingMessage) {
          setCurrentScreen('chat');
        } else {
          setCurrentScreen('welcome');
        }
      } else {
        // Se não está autenticado e não está na tela de login/registro, resetar para welcome
        if (currentScreen !== 'login' && currentScreen !== 'register') {
          setCurrentScreen('welcome');
          setPendingMessage('');
        }
      }
    }
  }, [isAuthenticated, isLoading, checkAuth, currentScreen, pendingMessage]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mari-white flex items-center justify-center">
        <div className="text-mari-primary-green">Carregando...</div>
      </div>
    );
  }

  const handleStartChat = (message: string) => {
    if (isAuthenticated) {
      // Se já está autenticado, vai direto para o chat
      setCurrentScreen('chat');
      setPendingMessage(message);
    } else {
      // Se não está autenticado, salva a mensagem e vai para o login
      setPendingMessage(message);
      setCurrentScreen('login');
    }
  };

  const handleLoginSuccess = () => {
    if (pendingMessage) {
      // Se havia uma mensagem pendente, vai para o chat com ela
      setCurrentScreen('chat');
    } else {
      // Senão, volta para a tela de boas-vindas
      setCurrentScreen('welcome');
    }
  };

  const handleRegisterSuccess = () => {
    // Após registro bem-sucedido, direcionar para login
    setCurrentScreen('login');
  };

  const handleBackToWelcome = () => {
    setPendingMessage('');
    if (isAuthenticated) {
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen('login');
    }
  };

  const handleGoToRegister = () => {
    setCurrentScreen('register');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    // Se está autenticado, mostrar apenas welcome ou chat
    if (isAuthenticated) {
      switch (currentScreen) {
        case 'chat':
          return (
            <MariChat 
              initialMessage={pendingMessage}
              onBack={handleBackToWelcome}
            />
          );
        
        case 'welcome':
        default:
          return (
            <MariChat 
              onStartChat={handleStartChat}
            />
          );
      }
    }

    // Se não está autenticado, mostrar telas de auth ou welcome
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onBack={handleBackToWelcome}
            onSuccess={handleLoginSuccess}
            onRegister={handleGoToRegister}
          />
        );
      
      case 'register':
        return (
          <RegisterScreen
            onBack={handleGoToLogin}
            onSuccess={handleRegisterSuccess}
          />
        );
      
      case 'welcome':
      default:
        return (
          <div className="min-h-screen bg-mari-white flex flex-col relative">
            <MariChat onStartChat={handleStartChat} />
            {/* Botões de Login/Cadastro para usuários não autenticados */}
            <div className="fixed bottom-4 left-4 right-4 flex gap-2 justify-center z-10">
              <button
                onClick={() => setCurrentScreen('login')}
                className="px-6 py-2 bg-mari-primary-green text-white rounded-full hover:bg-mari-dark-green transition-colors shadow-lg"
              >
                Entrar
              </button>
              <button
                onClick={() => setCurrentScreen('register')}
                className="px-6 py-2 border border-mari-primary-green text-mari-primary-green rounded-full hover:bg-mari-primary-green hover:text-white transition-colors shadow-lg bg-white"
              >
                Cadastrar
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-mari-white">
      {renderScreen()}
    </div>
  );
};

export default Index;
