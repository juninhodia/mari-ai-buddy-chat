import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';
import AudioChatScreen from './AudioChatScreen';

interface MariChatProps {
  onStartChat?: (message: string) => void;
  initialMessage?: string;
  onBack?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

const MariChat: React.FC<MariChatProps> = ({ onStartChat, initialMessage: propInitialMessage, onBack, onLogin, onRegister }) => {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'chat' | 'audio'>('welcome');
  const [chatStarted, setChatStarted] = useState(!!propInitialMessage);
  const [initialMessage, setInitialMessage] = useState(propInitialMessage || '');

  const handleStartChat = (message: string) => {
    if (onStartChat) {
      // Se há um handler externo, usa ele (para verificar autenticação)
      onStartChat(message);
    } else {
      // Senão, inicia o chat diretamente
      setInitialMessage(message);
      setChatStarted(true);
      setCurrentScreen('chat');
    }
  };

  const handleStartAudioChat = () => {
    setCurrentScreen('audio');
  };

  const handleBackToWelcome = () => {
    if (onBack) {
      onBack();
    } else {
      setChatStarted(false);
      setInitialMessage('');
      setCurrentScreen('welcome');
    }
  };

  // Se há mensagem inicial, mostrar chat diretamente
  if (propInitialMessage && currentScreen === 'welcome') {
    return (
      <div className="h-screen bg-mari-white">
        <ChatScreen 
          initialMessage={propInitialMessage} 
          onBack={handleBackToWelcome}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-mari-white">
      {currentScreen === 'chat' ? (
        <ChatScreen 
          initialMessage={initialMessage} 
          onBack={handleBackToWelcome}
        />
      ) : currentScreen === 'audio' ? (
        <AudioChatScreen 
          onBack={handleBackToWelcome}
        />
      ) : (
        <WelcomeScreen 
          onStartChat={handleStartChat}
          onStartAudioChat={handleStartAudioChat}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      )}
    </div>
  );
};

export default MariChat;
