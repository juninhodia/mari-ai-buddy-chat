
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatMessage, { MessageProps } from './ChatMessage';
import { useToast } from "@/hooks/use-toast";

interface ChatScreenProps {
  initialMessage?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const N8N_WEBHOOK = "https://rstysryr.app.n8n.cloud/webhook-test/mariAI";
  
  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        content: "Olá! Como posso ajudar você hoje?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const callN8nWebhook = async (userMessage: string) => {
    try {
      const response = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com N8N');
      }

      const data = await response.json();
      return data.response || "Desculpe, não consegui processar sua solicitação.";
    } catch (error) {
      console.error('Erro ao chamar webhook N8N:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao serviço. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return "Desculpe, estou com problemas para me conectar ao serviço. Tente novamente mais tarde.";
    }
  };

  const handleSendMessage = async (messageContent = inputMessage) => {
    if (!messageContent.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMessage: MessageProps = {
      content: messageContent,
      isUser: true,
      timestamp: currentTime
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Call N8N webhook and wait for response
      const aiResponseText = await callN8nWebhook(messageContent);
      
      // Hide typing indicator and add AI response
      setIsTyping(false);
      
      const aiResponse: MessageProps = {
        content: aiResponseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      setIsTyping(false);
      console.error("Erro ao processar mensagem:", error);
      
      // Add error message
      const errorResponse: MessageProps = {
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Get current date in Portuguese
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  
  // Capitalize the first letter of the date
  const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <div className="flex flex-col h-screen w-full relative bg-mari-white">
      {/* Chat Header */}
      <div className="bg-mari-white border-b border-[#e0e0e0] py-4 px-5 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient">
          Mari
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-mari-white">
        <div className="message-date text-center text-xs text-gray-500 my-2">
          {formattedDate}
        </div>
        
        {/* Render messages */}
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            content={message.content} 
            isUser={message.isUser} 
            timestamp={message.timestamp}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="assistant-bubble flex gap-2 items-start">
            <div className="assistant-avatar w-7 h-7 min-w-7 bg-mari-primary-green rounded-full flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div className="typing-indicator flex p-3 px-4 bg-gray-100 rounded-[18px] rounded-bl-[4px] self-start w-auto">
              <span className="w-2 h-2 mx-[1px] bg-gray-500 rounded-full inline-block opacity-40 animate-bounce"></span>
              <span className="w-2 h-2 mx-[1px] bg-gray-500 rounded-full inline-block opacity-40 animate-bounce delay-100"></span>
              <span className="w-2 h-2 mx-[1px] bg-gray-500 rounded-full inline-block opacity-40 animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="input-area p-3 bg-mari-white border-t border-[#e0e0e0]">
        <form onSubmit={handleSubmit} className="message-form flex items-center bg-mari-white rounded-3xl border border-[#e0e0e0] py-1.5 px-4">
          <input
            type="text"
            className="message-input flex-1 border-none outline-none bg-transparent text-sm py-2"
            placeholder="Digite uma mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button 
            type="submit"
            className="send-button w-8 h-8 rounded-full bg-mari-primary-green border-none text-white flex items-center justify-center cursor-pointer ml-2 transition-all duration-200 hover:bg-mari-dark-green disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputMessage.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
