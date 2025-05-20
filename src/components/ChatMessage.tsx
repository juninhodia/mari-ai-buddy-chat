
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<MessageProps> = ({ content, isUser, timestamp }) => {
  const currentTime = timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // URL regex pattern to identify links in message content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = content.match(urlRegex) || [];
  
  // Function to open the link in a new tab
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return isUser ? (
    <div className="message user-message max-w-[80%] p-3 px-4 rounded-[18px] rounded-br-[4px] mb-[15px] bg-mari-primary-green text-white self-end">
      {content}
      <div className="message-time text-xs text-white/70 mt-1 text-right">
        {currentTime}
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <div className="assistant-bubble flex gap-2 items-start">
        <div className="assistant-avatar w-7 h-7 min-w-7 bg-mari-primary-green rounded-full flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
        <div className="message assistant-message max-w-[80%] p-3 px-4 rounded-[18px] rounded-bl-[4px] mb-[4px] bg-gray-100 text-[#333] self-start">
          {content}
          <div className="message-time text-xs text-black/50 mt-1 text-right">
            {currentTime}
          </div>
        </div>
      </div>
      
      {/* Show link buttons if any links are found in the message */}
      {links.length > 0 && (
        <div className="ml-9 mb-[15px] flex flex-wrap gap-2">
          {links.map((link, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs text-mari-primary-green border-mari-primary-green hover:bg-mari-very-light-green"
              onClick={() => openLink(link)}
            >
              <ExternalLink size={14} />
              Visitar Link
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
