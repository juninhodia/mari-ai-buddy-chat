
import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';

const MariChat: React.FC = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const handleStartChat = (message: string) => {
    setInitialMessage(message);
    setChatStarted(true);
  };

  return (
    <div className="h-screen bg-mari-white">
      {chatStarted ? (
        <ChatScreen initialMessage={initialMessage} />
      ) : (
        <WelcomeScreen onStartChat={handleStartChat} />
      )}
    </div>
  );
};

export default MariChat;
