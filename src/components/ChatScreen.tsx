import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MessageSquare } from 'lucide-react';
import ChatMessage, { MessageProps } from './ChatMessage';

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

  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Chat Header */}
      <div className="bg-mari-white border-b border-[#e0e0e0] py-4 px-5 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient">
          Mari
        </div>
        
        {/* Toggle Button */}
        <div className="flex items-center gap-2 bg-mari-very-light-green rounded-full p-1">
          <button
            onClick={() => setIsAudioMode(false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
              !isAudioMode 
                ? 'bg-mari-primary-green text-white shadow-sm' 
                : 'text-mari-gray hover:bg-mari-light-green/50'
            }`}
          >
            <MessageSquare size={16} />
            Texto
          </button>
          <button
            onClick={() => setIsAudioMode(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
              isAudioMode 
                ? 'bg-mari-primary-green text-white shadow-sm' 
                : 'text-mari-gray hover:bg-mari-light-green/50'
            }`}
          >
            <Mic size={16} />
            Áudio
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center text-mari-gray opacity-70 animate-pulse mb-4">
              Digite uma pergunta para iniciar a conversa
            </div>
            <button 
              onClick={handleSubmit}
              className="w-12 h-12 rounded-full border-none bg-mari-primary-green text-white flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200 hover:bg-mari-dark-green hover:scale-105"
              disabled={!inputMessage.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                content={message.content} 
                isUser={message.isUser} 
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-[#e0e0e0] bg-mari-white">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            className="w-full py-3 px-4 border border-[#e0e0e0] rounded-[24px] text-sm outline-none transition-all duration-300 focus:border-mari-primary-green focus:shadow-mari-primary-green/20"
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
