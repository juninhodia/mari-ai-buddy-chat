import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';

interface MariChatProps {
  onStartChat?: (message: string) => void;
  initialMessage?: string;
  onBack?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

const MariChat: React.FC<MariChatProps> = ({ onStartChat, initialMessage: propInitialMessage, onBack, onLogin, onRegister }) => {
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
    }
  };

  const handleBackToWelcome = () => {
    if (onBack) {
      onBack();
    } else {
      setChatStarted(false);
      setInitialMessage('');
    }
  };

  return (
    <div className="h-screen bg-mari-white">
      {chatStarted ? (
        <ChatScreen 
          initialMessage={initialMessage} 
          onBack={handleBackToWelcome}
        />
      ) : (
        <WelcomeScreen 
          onStartChat={handleStartChat} 
          onLogin={onLogin}
          onRegister={onRegister}
        />
      )}
    </div>
  );
};

export default MariChat;
