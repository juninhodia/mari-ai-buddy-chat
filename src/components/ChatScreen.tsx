
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, ToggleLeft, ToggleRight } from 'lucide-react';
import ChatMessage, { MessageProps } from './ChatMessage';
import { Toggle } from './ui/toggle';

interface ChatScreenProps {
  initialMessage?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAiResponse = (userMessage: string) => {
    let response = '';
    
    if (userMessage.toLowerCase().includes('ia') || userMessage.toLowerCase().includes('inteligência artificial')) {
      response = "A Inteligência Artificial está evoluindo rapidamente. Como assistente, estou aqui para ajudar com suas dúvidas e tarefas. Podemos conversar sobre produtividade, organização, e muitos outros assuntos!";
    } else if (userMessage.toLowerCase().includes('produtividade') || userMessage.toLowerCase().includes('eficiência')) {
      response = "Para aumentar sua produtividade, experimente técnicas como Pomodoro (25 minutos de foco, 5 de descanso), defina prioridades claras no início do dia, e elimine distrações durante períodos de trabalho intenso.";
    } else if (userMessage.toLowerCase().includes('agenda') || userMessage.toLowerCase().includes('organizar')) {
      response = "Para organizar melhor sua agenda, recomendo bloquear horários específicos para tarefas importantes, usar um sistema de calendário digital com lembretes, e revisar suas prioridades semanalmente.";
    } else {
      response = "Obrigada por sua mensagem! Estou aqui para ajudar com produtividade, organização de tarefas, e uso eficiente de tecnologia. Como posso auxiliar você hoje?";
    }
    
    return response;
  };

  const handleSendMessage = (messageContent = inputMessage) => {
    if (!messageContent.trim()) return;
    
    // Add user message
    const userMessage: MessageProps = {
      content: messageContent,
      isUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    
    // Simulate AI response with slight delay
    setTimeout(() => {
      const aiResponse: MessageProps = {
        content: generateAiResponse(messageContent),
        isUser: false
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const toggleMode = () => {
    setIsAudioMode(!isAudioMode);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Chat Header */}
      <div className="bg-mari-white border-b border-[#e0e0e0] py-4 px-5 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient">
          Mari
        </div>
        <Toggle 
          pressed={isAudioMode} 
          onPressedChange={toggleMode} 
          className="border border-mari-light-green p-1 rounded-md hover:bg-mari-very-light-green"
        >
          {isAudioMode ? (
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-mari-primary-green" />
              <span className="text-sm">Áudio</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ToggleLeft size={16} className="text-mari-primary-green" />
              <span className="text-sm">Chat</span>
            </div>
          )}
        </Toggle>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            content={message.content} 
            isUser={message.isUser} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      {isAudioMode ? (
        <div className="p-4 bg-mari-white border-t border-[#e0e0e0] flex flex-col items-center justify-center">
          <button 
            className="w-16 h-16 rounded-full bg-mari-primary-green text-white flex items-center justify-center cursor-pointer shadow-sm transition-all duration-200 hover:bg-mari-dark-green hover:scale-105 mb-2"
          >
            <Mic size={24} />
          </button>
          <p className="text-sm text-mari-gray opacity-70 animate-pulse">
            Toque para falar
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 bg-mari-white border-t border-[#e0e0e0] flex items-center">
          <input
            type="text"
            className="flex-1 py-3 px-4 border border-[#e0e0e0] rounded-[24px] text-sm outline-none transition-all duration-300 focus:border-mari-primary-green focus:shadow-mari-primary-green/20"
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button 
            type="submit"
            className="w-10 h-10 rounded-full border-none bg-mari-primary-green text-white flex items-center justify-center cursor-pointer ml-[10px] shadow-sm transition-all duration-200 hover:bg-mari-dark-green hover:scale-105"
            disabled={!inputMessage.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatScreen;
