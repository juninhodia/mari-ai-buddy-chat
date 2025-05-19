import React, { useState, useRef } from 'react';
import { Search, Mic, MessageSquare, Loader2 } from 'lucide-react';
import QuestionsCarousel from './QuestionsCarousel';

const N8N_AUDIO_WEBHOOK_URL = 'https://rstysryr.app.n8n.cloud/webhook-test/53267980-a99f-47fc-81ea-29bce15f1481';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

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
    // Prepare multipart/form-data with the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(N8N_AUDIO_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Erro ao receber resposta do n8n');
      // Check response type
      const contentType = response.headers.get('content-type') || '';
      let url = '';
      if (contentType.startsWith('audio/')) {
        // Direct audio
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
      } else if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.audioUrl) {
          url = data.audioUrl;
        } else if (data.audioBase64) {
          url = `data:audio/wav;base64,${data.audioBase64}`;
        } else {
          throw new Error('Formato de áudio não suportado');
        }
      } else {
        throw new Error('Formato de resposta não suportado');
      }
      setAudioUrl(url);
      playAudio(url);
    } catch (err: any) {
      // fallback: tenta enviar como JSON base64
      try {
        const base64 = await blobToBase64(audioBlob);
        const payload = { audioBase64: base64 };
        const jsonResp = await fetch(N8N_AUDIO_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!jsonResp.ok) throw new Error('n8n retornou erro');
        const data = await jsonResp.json();
        let url = '';
        if (data.audioUrl) url = data.audioUrl;
        else if (data.audioBase64) url = `data:audio/wav;base64,${data.audioBase64}`;
        if (url) {
          setAudioUrl(url);
          playAudio(url);
        } else {
          throw new Error('Resposta do n8n sem áudio');
        }
      } catch (e2: any) {
        setError('Erro ao processar áudio: ' + (e2?.message || err?.message || 'Erro desconhecido'));
      }
    } finally {
      setLoadingAudio(false);
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]); // remove prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  // Função para iniciar a gravação
  const startRecording = async () => {
    if (recordingStatus !== 'idle') return;
    
    console.log('Iniciando gravação...');
    setDebugInfo('Iniciando gravação...');
    setRecordingStatus('recording');
    setError(null);
    audioChunksRef.current = [];

    try {
      console.log('Solicitando permissão do microfone...');
      setDebugInfo('Solicitando permissão do microfone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      console.log('Permissão concedida, configurando MediaRecorder...');
      setDebugInfo('Permissão concedida, configurando MediaRecorder...');
      
      streamRef.current = stream;
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/ogg';
        }
      }
      
      console.log('MimeType selecionado:', mimeType);
      setDebugInfo(`MimeType selecionado: ${mimeType}`);
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 64000
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: any) => {
        console.log('Dados de áudio recebidos:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Gravação parada, processando áudio...');
        setDebugInfo('Gravação parada, processando áudio...');
        setRecordingStatus('processing');
        
        // Garantir que o stream seja liberado
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (audioChunksRef.current.length === 0) {
          console.log('Nenhum dado de áudio foi gravado');
          setDebugInfo('Nenhum dado de áudio foi gravado');
          setError('Nenhum áudio foi gravado. Tente novamente.');
          setRecordingStatus('idle');
          return;
        }
        
        console.log('Criando blob de áudio...');
        setDebugInfo('Criando blob de áudio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Tamanho do blob:', audioBlob.size, 'bytes');
        await sendAudioToN8n(audioBlob);
        setRecordingStatus('idle');
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('Erro na gravação:', event);
        setDebugInfo(`Erro na gravação: ${event.error?.message || 'Erro desconhecido'}`);
        setError('Erro durante a gravação. Tente novamente.');
        stopRecording();
      };

      // Solicitar dados a cada 1 segundo para feedback mais rápido
      mediaRecorder.start(1000);
      console.log('MediaRecorder iniciado com sucesso');
      setDebugInfo('MediaRecorder iniciado com sucesso');
      
      // Vibrar para feedback tátil em dispositivos móveis
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(200);
      }
    } catch (err: any) {
      console.error('Erro ao iniciar gravação:', err);
      let errorMsg = 'Não foi possível acessar o microfone: ';
      if (err.name === 'NotAllowedError') {
        errorMsg += 'Permissão negada. Por favor, permita o acesso ao microfone.';
      } else if (err.name === 'NotFoundError') {
        errorMsg += 'Nenhum microfone encontrado.';
      } else if (err.name === 'NotReadableError') {
        errorMsg += 'Microfone já em uso.';
      } else {
        errorMsg += err.message || 'Erro desconhecido';
      }
      setDebugInfo(`Erro: ${errorMsg}`);
      setError(errorMsg);
      setRecordingStatus('idle');
      
      // Garantir que o stream seja liberado em caso de erro
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Função para parar a gravação
  const stopRecording = () => {
    if (recordingStatus !== 'recording') return;
    
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      // Vibrar para feedback tátil em dispositivos móveis
      if (isMobile && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  // Handler do clique no botão: alterna entre gravar e parar
  const handleRecordButton = () => {
    if (recordingStatus === 'processing' || loadingAudio || playing) return;
    
    if (recordingStatus === 'idle') {
      startRecording();
    } else if (recordingStatus === 'recording') {
      stopRecording();
    }
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
            <button
              className={`mb-4 w-24 h-24 rounded-full flex items-center justify-center shadow-lg text-3xl transition-all duration-200 transform 
                ${recordingStatus === 'recording'
                  ? 'bg-red-600 animate-pulse scale-110' 
                  : recordingStatus === 'processing'
                  ? 'bg-yellow-500'
                  : 'bg-mari-primary-green hover:bg-mari-dark-green active:scale-95'
                } 
                text-white disabled:opacity-50 
                ${isMobile ? 'active:scale-95 touch-none' : 'hover:scale-105'}
                relative
              `}
              onClick={handleRecordButton}
              onTouchStart={(e) => e.preventDefault()}
              disabled={recordingStatus === 'processing' || loadingAudio}
            >
              <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity"></div>
              {recordingStatus === 'recording' ? (
                <Loader2 className="animate-spin" size={40} />
              ) : recordingStatus === 'processing' ? (
                <Loader2 className="animate-spin" size={40} />
              ) : (
                <Mic size={40} />
              )}
              {recordingStatus === 'recording' && (
                <div className="absolute -bottom-8 text-sm text-mari-gray animate-pulse">
                  Gravando...
                </div>
              )}
              {recordingStatus === 'processing' && (
                <div className="absolute -bottom-8 text-sm text-mari-gray animate-pulse">
                  Processando...
                </div>
              )}
            </button>
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
