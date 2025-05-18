
import React from 'react';

export interface MessageProps {
  content: string;
  isUser: boolean;
}

const ChatMessage: React.FC<MessageProps> = ({ content, isUser }) => {
  return (
    <div 
      className={`max-w-[70%] p-3 px-4 rounded-[18px] mb-[15px] shadow-sm break-words
      ${isUser 
        ? 'bg-mari-primary-green text-white rounded-br-[5px] self-end' 
        : 'bg-mari-very-light-green text-mari-black rounded-bl-[5px] self-start'
      }`}
    >
      {content}
    </div>
  );
};

export default ChatMessage;
