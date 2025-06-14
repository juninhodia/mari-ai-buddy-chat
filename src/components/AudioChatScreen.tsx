import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, User, LogOut, ChevronDown } from 'lucide-react';
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

interface AudioChatScreenProps {
  onBack: () => void;
}

const AudioChatScreen: React.FC<AudioChatScreenProps> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { profile, logout } = useAuth();
  
  const N8N_WEBHOOK = "https://juninhodiazszsz.app.n8n.cloud/webhook/mariAI";

  // Função para iniciar gravação
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
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        title: 'Erro ao acessar o microfone',
        description: 'Verifique as permissões de áudio.',
        variant: 'destructive'
      });
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Envio do áudio para o N8N
  const handleSendAudio = async (audio: Blob) => {
    setIsAIPlaying(true);
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
        const audio = new window.Audio(data.audioUrl);
        audio.onended = () => setIsAIPlaying(false);
        audio.play();
      } else {
        setIsAIPlaying(false);
        toast({
          title: 'Resposta recebida',
          description: 'A IA processou seu áudio, mas não retornou áudio de resposta.',
        });
      }
    } catch (error) {
      setIsAIPlaying(false);
      toast({
        title: 'Erro ao enviar áudio',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  };

  // Formatar tempo de gravação
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="flex flex-col h-screen w-full relative bg-mari-white">
      {/* Header igual ao ChatScreen */}
      <div className="bg-mari-white border-b border-[#e0e0e0] py-4 px-5 flex items-center justify-between">
        {/* Botão voltar à esquerda */}
        <button
          onClick={onBack}
          className="p-2 hover:bg-mari-very-light-green rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-mari-primary-green" />
        </button>
        
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

      {/* Área principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Status */}
        <div className="text-center mb-8">
          {isRecording && (
            <div className="mb-4">
              <div className="text-lg font-medium text-mari-primary-green">
                Gravando... {formatTime(recordingTime)}
              </div>
            </div>
          )}
          
          {isAIPlaying && (
            <div className="mb-4">
              <div className="text-lg font-medium text-mari-primary-green">
                Mari está respondendo...
              </div>
            </div>
          )}
          
          {!isRecording && !isAIPlaying && (
            <div className="mb-4">
              <div className="text-lg font-medium text-mari-gray">
                Toque e segure para gravar sua pergunta
              </div>
            </div>
          )}
        </div>

        {/* Botão de gravação - Bola grande */}
        <div className="relative">
          <button
            type="button"
            className={`w-32 h-32 rounded-full flex items-center justify-center border-none outline-none transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                : isAIPlaying 
                ? 'bg-mari-dark-green animate-pulse shadow-lg shadow-mari-dark-green/50'
                : 'bg-mari-primary-green hover:bg-mari-dark-green hover:scale-105 shadow-lg'
            }`}
            onMouseDown={!isAIPlaying ? startRecording : undefined}
            onMouseUp={stopRecording}
            onTouchStart={!isAIPlaying ? startRecording : undefined}
            onTouchEnd={stopRecording}
            disabled={isAIPlaying}
          >
            {isRecording ? (
              <Square size={48} className="text-white" />
            ) : (
              <Mic size={48} className="text-white" />
            )}
          </button>
          
          {/* Ondas de áudio quando gravando */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-4 border-red-500/30 animate-ping"></div>
              <div className="absolute w-48 h-48 rounded-full border-4 border-red-500/20 animate-ping delay-75"></div>
            </div>
          )}
          
          {/* Ondas de áudio quando IA está falando */}
          {isAIPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-4 border-mari-dark-green/30 animate-ping"></div>
              <div className="absolute w-48 h-48 rounded-full border-4 border-mari-dark-green/20 animate-ping delay-75"></div>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="text-center mt-8 max-w-md">
          <p className="text-sm text-mari-gray">
            {isRecording 
              ? 'Solte o botão para enviar sua gravação'
              : isAIPlaying
              ? 'Aguarde a resposta da Mari'
              : 'Mantenha pressionado o botão para gravar sua pergunta'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioChatScreen; 