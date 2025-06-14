import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, LogOut, ChevronDown, Mic } from 'lucide-react';
import ChatMessage, { MessageProps } from './ChatMessage';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModeToggle from './ModeToggle';

interface ChatScreenProps {
  initialMessage?: string;
  onBack?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessedRef = useRef(false);
  const { toast } = useToast();
  const { profile, logout } = useAuth();
  
  const N8N_WEBHOOK = "https://juninhodiazszsz.app.n8n.cloud/webhook/mariAI";
  
  const [currentMode, setCurrentMode] = useState<'text' | 'audio'>('text');
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Function to format birth date
  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return 'Não informado';
    try {
      return new Date(birthDate).toLocaleDateString('pt-BR');
    } catch {
      return 'Não informado';
    }
  };
  
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
          user: {
            id: profile?.id || 'anonymous',
            name: profile?.name || 'Usuário Anônimo',
            phone: profile?.phone || '',
            gender: profile?.gender || '',
            birthDate: profile?.birth_date || '',
            state: profile?.state || '',
            city: profile?.city || ''
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com N8N');
      }

      const data = await response.json();
      console.log("Resposta do N8N:", data);
      
      // Verificando a estrutura da resposta e extraindo o texto correto
      if (data && Array.isArray(data) && data.length > 0 && data[0].output) {
        return data[0].output;
      } else if (data && data.response) {
        return data.response;
      } else if (typeof data === 'string') {
        return data;
      }
      
      // Caso não encontre o formato esperado
      return "Recebi sua mensagem, mas não consegui processar a resposta corretamente.";
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

  const handleSendMessage = useCallback(async (messageContent = inputMessage) => {
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
  }, [inputMessage, profile]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const firstName = profile?.name ? getFirstName(profile.name) : null;
      const welcomeMessage = firstName 
        ? `Oi, ${firstName}! Como posso ajudar você hoje?`
        : "Olá! Como posso ajudar você hoje?";
        
      setMessages([{
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [profile]);

  // Separate useEffect for initial message to avoid re-execution
  useEffect(() => {
    if (initialMessage && !initialMessageProcessedRef.current) {
      initialMessageProcessedRef.current = true;
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, handleSendMessage]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  // Verificar suporte a áudio
  useEffect(() => {
    const checkAudioSupport = async () => {
      try {
        if (!window.AudioContext) {
          setIsAudioSupported(false);
          return;
        }
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsAudioSupported(true);
      } catch (error) {
        setIsAudioSupported(false);
        setCurrentMode('text');
      }
    };
    checkAudioSupport();
  }, []);

  // Funções de gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        handleSendAudio(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setIsRecording(false);
      toast({ title: 'Erro ao acessar o microfone', description: 'Verifique as permissões.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Envio do áudio para o N8N
  const handleSendAudio = async (audio: Blob) => {
    setIsTyping(true);
    try {
      const formData = new FormData();
      formData.append('audio', audio, 'audio.webm');
      formData.append('user', JSON.stringify({
        id: profile?.id || 'anonymous',
        name: profile?.name || 'Usuário Anônimo',
        phone: profile?.phone || '',
        gender: profile?.gender || '',
        birthDate: profile?.birth_date || '',
        state: profile?.state || '',
        city: profile?.city || ''
      }));
      const response = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Falha ao enviar áudio');
      const data = await response.json();
      if (data && data.audioUrl) {
        setIsAIPlaying(true);
        const audio = new window.Audio(data.audioUrl);
        audio.onended = () => setIsAIPlaying(false);
        audio.play();
      }
      setIsTyping(false);
    } catch (error) {
      setIsTyping(false);
      toast({ title: 'Erro ao enviar áudio', description: 'Tente novamente.' });
    }
  };

  // Função para alternar modo
  const handleModeChange = (mode: 'text' | 'audio') => {
    setCurrentMode(mode);
    console.log('Modo alterado para:', mode);
  };

  return (
    <div className="flex flex-col h-screen w-full relative bg-mari-white">
      {/* Chat Header */}
      <div className="bg-mari-white border-b border-[#e0e0e0] py-4 px-5 flex items-center justify-between">
        {/* Nome Mari centralizado */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient">
            Mari
          </div>
        </div>
        {/* User Profile Dropdown */}
        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-mari-very-light-green">
                <div className="w-8 h-8 bg-mari-primary-green rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-mari-black max-w-20 truncate">
                  {getFirstName(profile.name)}
                </span>
                <ChevronDown size={16} className="text-mari-gray" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-mari-primary-green rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-mari-black">{profile.name}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* User Data */}
              <div className="px-2 py-2 space-y-2">
                <div className="text-xs">
                  <p className="text-mari-gray font-medium">Telefone:</p>
                  <p className="text-mari-black">{profile.phone || 'Não informado'}</p>
                </div>
                
                <div className="text-xs">
                  <p className="text-mari-gray font-medium">Gênero:</p>
                  <p className="text-mari-black">{profile.gender || 'Não informado'}</p>
                </div>
                
                <div className="text-xs">
                  <p className="text-mari-gray font-medium">Data de Nascimento:</p>
                  <p className="text-mari-black">{formatBirthDate(profile.birth_date)}</p>
                </div>
                
                <div className="text-xs">
                  <p className="text-mari-gray font-medium">Localização:</p>
                  <p className="text-mari-black">
                    {profile.city && profile.state 
                      ? `${profile.city}, ${profile.state}`
                      : profile.state || profile.city || 'Não informado'
                    }
                  </p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Logout Button */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={16} className="mr-2" />
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
        {currentMode === 'text' ? (
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
        ) : (
          <div className="flex items-center justify-center w-full">
            <button
              type="button"
              className={`w-14 h-14 rounded-full flex items-center justify-center border-none outline-none transition-all duration-200 ${isRecording ? 'bg-mari-primary-green animate-pulse' : isAIPlaying ? 'bg-mari-dark-green animate-pulse' : 'bg-mari-light-green'}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              aria-label={isRecording ? 'Gravando...' : 'Segure para gravar áudio'}
            >
              <Mic size={32} className="text-white" />
            </button>
            <span className="ml-4 text-mari-gray text-sm">
              {isRecording ? 'Gravando... solte para enviar' : isAIPlaying ? 'A IA está respondendo em áudio...' : 'Segure o microfone para gravar'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
