import React, { useState, useRef } from 'react';
import { Search, Mic, MessageSquare, Loader2, Square } from 'lucide-react';
import QuestionsCarousel from './QuestionsCarousel';

const N8N_AUDIO_WEBHOOK_URL = 'https://rstysryr.app.n8n.cloud/webhook-test/53267980-a99f-47fc-81ea-29bce15f1481';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleQuestionClick = (question: string) => {
    onStartChat(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onStartChat(searchInput);
    }
  };

  // Function to send message to n8n webhook
  const sendAudioToN8n = async (audioBlob: Blob) => {
    setLoadingAudio(true);
    if (audioBlob.size === 0) {
      setError('Nada foi gravado. Tente novamente.');
      return;
    }
    setError(null);
    setAudioUrl(null);
    setPlaying(false);
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }

    try {
      console.log('Preparando áudio para envio...');
      setDebugInfo('Preparando áudio para envio...');
      
      // Criar FormData e adicionar o arquivo de áudio
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('language', 'pt-BR');
      formData.append('type', 'audio');
      formData.append('timestamp', new Date().toISOString());

      console.log('Enviando áudio para n8n...');
      setDebugInfo('Enviando áudio para n8n...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(N8N_AUDIO_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let url = '';

      if (contentType.startsWith('audio/')) {
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
      } else if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.audioUrl) {
          url = data.audioUrl;
        } else if (data.audioBase64) {
          url = `data:audio/wav;base64,${data.audioBase64}`;
        } else {
          throw new Error('Formato de áudio não suportado na resposta');
        }
      } else {
        throw new Error('Formato de resposta não suportado');
      }

      setAudioUrl(url);
      playAudio(url);
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error('Erro ao enviar áudio:', err);
      setDebugInfo(`Erro ao enviar áudio: ${err.message}`);
      setError('Erro ao processar áudio: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setLoadingAudio(false);
    }
  };

  // Function to play audio
  const playAudio = (url: string) => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }
    const audio = new Audio(url);
    setAudioInstance(audio);
    setPlaying(true);
    audio.play();
    audio.onended = () => {
      setPlaying(false);
      URL.revokeObjectURL(url);
      setAudioInstance(null);
    };
    audio.onerror = () => {
      setPlaying(false);
      setError('Erro ao reproduzir o áudio');
      setAudioInstance(null);
    };
  };

  // Função para enviar áudio de teste
  const handleTestAudio = async () => {
    if (isProcessing || loadingAudio || playing) return;
    
    setIsProcessing(true);
    setError(null);
    setDebugInfo('Enviando áudio de teste...');
    
    try {
      // Payload de teste
      const payload = {
        type: 'audio',
        message: 'Mensagem de teste de áudio',
        timestamp: new Date().toISOString(),
        test: true
      };

      const response = await fetch(N8N_AUDIO_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let url = '';

      if (contentType.startsWith('audio/')) {
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
      } else if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.audioUrl) {
          url = data.audioUrl;
        } else if (data.audioBase64) {
          url = `data:audio/wav;base64,${data.audioBase64}`;
        } else {
          throw new Error('Formato de áudio não suportado na resposta');
        }
      } else {
        throw new Error('Formato de resposta não suportado');
      }

      setAudioUrl(url);
      playAudio(url);
    } catch (err: any) {
      console.error('Erro ao enviar áudio de teste:', err);
      setDebugInfo(`Erro: ${err.message}`);
      setError('Erro ao processar áudio: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para iniciar a gravação
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
        sendAudioToN8n(audioBlob);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
        
        // Resetar o timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setDebugInfo('Gravando áudio...');

      // Iniciar timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Erro ao acessar o microfone: ' + (err?.message || 'Erro desconhecido'));
      setDebugInfo('Erro ao iniciar gravação');
    }
  };

  // Função para parar a gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDebugInfo('Processando áudio...');
    }
  };

  // Função para formatar o tempo de gravação
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-0">
      {/* Top Section: Toggle Button and Header */}
      <div className="w-full flex flex-col items-center pt-4">
        {/* Toggle Button */}
        <div className="w-full flex items-center justify-center mb-6">
          <div className="flex items-center justify-center gap-2 bg-mari-very-light-green rounded-full p-1">
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

        {/* Header Text - Always centered */}
        <div className="w-full mb-10 animate-fadeInDown text-center">
          <div className="text-[48px] font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text mb-[10px] animate-gradient">
            Oi, sou a Mari
          </div>
          <p className="text-base font-light text-mari-gray tracking-wider">
            Seu assistente de IA inteligente para ajudar no seu dia a dia
          </p>
        </div>
      </div>

      {/* Middle Section: Either Questions Carousel (text mode) or Audio Pulsing Ball (audio mode) */}
      <div className="w-full flex-grow flex items-center justify-center">
        {!isAudioMode ? (
          <div className="w-full transition-all duration-300 ease-in-out">
            <QuestionsCarousel onQuestionClick={handleQuestionClick} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
            <div className="w-32 h-32 rounded-full bg-mari-primary-green animate-pulse shadow-lg mb-8 flex items-center justify-center">
              {loadingAudio && <Loader2 className="animate-spin text-white" size={48} />}
              {playing && !loadingAudio && <Mic className="text-white animate-bounce" size={48} />}
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
          </div>
        )}
      </div>

      {/* Bottom Section: Input Field (text mode) or Audio Button (audio mode) */}
      <div className="w-full flex flex-col items-center justify-center mb-8 mt-4">
        {!isAudioMode ? (
          <>
            {/* Footer Text for text mode */}
            <div className="w-full mb-3 text-center transition-opacity duration-300">
              <p className="text-sm text-mari-gray opacity-70 animate-pulse">
                Digite uma pergunta para iniciar a conversa
              </p>
            </div>
            
            {/* Form for text mode */}
            <form onSubmit={handleSubmit} className="w-full max-w-xl relative transition-all duration-300 ease-in-out">
              <input
                type="text"
                className="w-full py-4 px-6 rounded-[30px] border-2 border-mari-light-green text-base shadow-md outline-none transition-all duration-300 focus:border-mari-primary-green focus:shadow-lg focus:shadow-mari-primary-green/20 pl-6 pr-12"
                placeholder="Digite sua pergunta ou tópico para começar..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-mari-primary-green border-none w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-mari-white transition-all duration-200 hover:bg-mari-dark-green hover:-translate-y-1/2 hover:scale-105"
              >
                <Search size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center gap-4">
              <button
                className={`mb-4 w-24 h-24 rounded-full flex items-center justify-center shadow-lg text-3xl transition-all duration-200 transform 
                  ${isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : isProcessing
                      ? 'bg-yellow-500'
                      : 'bg-mari-primary-green hover:bg-mari-dark-green'
                  } 
                  text-white disabled:opacity-50 
                  active:scale-95 hover:scale-105
                  relative
                `}
                onClick={isRecording ? stopRecording : startRecording}
                onTouchStart={(e) => e.preventDefault()}
                disabled={isProcessing || loadingAudio}
              >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity"></div>
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={40} />
                ) : isRecording ? (
                  <Square size={24} />
                ) : (
                  <Mic size={40} />
                )}
              </button>
              {isRecording && (
                <div className="text-sm text-mari-gray animate-pulse">
                  Gravando... {formatRecordingTime(recordingTime)}
                </div>
              )}
              {isProcessing && (
                <div className="text-sm text-mari-gray animate-pulse">
                  Processando...
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-500 mt-4 text-center max-w-xs">
                {error}
              </div>
            )}
            {debugInfo && (
              <div className="text-xs text-mari-gray mt-2 max-w-xs text-center">
                {debugInfo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
