import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MariChat from '../components/MariChat';
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';

type Screen = 'welcome' | 'login' | 'register' | 'chat';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    // Verificar se o usuário já está autenticado ao carregar a página
    const isLoggedIn = checkAuth();
    if (isLoggedIn) {
      setCurrentScreen('welcome');
    }
  }, [checkAuth]);

  const handleStartChat = (message: string) => {
    if (isAuthenticated) {
      // Se já está autenticado, vai direto para o chat
      setCurrentScreen('chat');
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
    if (pendingMessage) {
      // Se havia uma mensagem pendente, vai para o chat com ela
      setCurrentScreen('chat');
    } else {
      // Senão, volta para a tela de boas-vindas
      setCurrentScreen('welcome');
    }
  };

  const handleBackToWelcome = () => {
    setPendingMessage('');
    setCurrentScreen('welcome');
  };

  const handleGoToRegister = () => {
    setCurrentScreen('register');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const renderScreen = () => {
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
  };

  return (
    <div className="min-h-screen bg-mari-white">
      {renderScreen()}
    </div>
  );
};

export default Index;
