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

  const handleBackFromLogin = () => {
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
            onBack={handleBackFromLogin}
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
            <MariChat 
              onStartChat={handleStartChat} 
              onLogin={handleGoToLogin}
              onRegister={handleGoToRegister}
            />
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
