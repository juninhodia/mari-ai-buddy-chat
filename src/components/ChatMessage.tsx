
import React from 'react';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<MessageProps> = ({ content, isUser, timestamp }) => {
  const currentTime = timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return isUser ? (
    <div className="message user-message max-w-[80%] p-3 px-4 rounded-[18px] rounded-br-[4px] mb-[15px] bg-mari-primary-green text-white self-end">
      {content}
      <div className="message-time text-xs text-white/70 mt-1 text-right">
        {currentTime}
      </div>
    </div>
  ) : (
    <div className="assistant-bubble flex gap-2 items-start">
      <div className="assistant-avatar w-7 h-7 min-w-7 bg-mari-primary-green rounded-full flex items-center justify-center text-white font-bold text-sm">
        M
      </div>
      <div className="message assistant-message max-w-[80%] p-3 px-4 rounded-[18px] rounded-bl-[4px] mb-[15px] bg-gray-100 text-[#333] self-start">
        {content}
        <div className="message-time text-xs text-black/50 mt-1 text-right">
          {currentTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
