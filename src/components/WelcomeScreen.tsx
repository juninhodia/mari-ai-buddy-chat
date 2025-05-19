import React, { useState, useRef } from 'react';
import { Search, Mic, MessageSquare, Loader2 } from 'lucide-react';
import QuestionsCarousel from './QuestionsCarousel';

const N8N_AUDIO_WEBHOOK_URL = 'https://chatfy.app.n8n.cloud/webhook-test/53267980-a99f-47fc-81ea-29bce15f1481';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

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
      setError('Erro ao processar áudio: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setLoadingAudio(false);
      if (timeoutId) clearTimeout(timeoutId);
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

  // START recording when user presses the button
  const startRecording = async () => {
    if (isRecording || loadingAudio || playing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/webm;codecs=opus';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        await sendAudioToN8n(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError('Não foi possível acessar o microfone: ' + (err?.message || 'Erro desconhecido'));
    }
  };

  // STOP recording when user releases the button
  const stopRecording = () => {
    if (!isRecording) return;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
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
          <button
            className="mb-10 w-20 h-20 rounded-full bg-mari-primary-green text-white flex items-center justify-center shadow-lg text-3xl transition-all duration-200 hover:bg-mari-dark-green disabled:opacity-50 transform hover:scale-105"
            onMouseDown={startRecording}
            onTouchStart={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchEnd={stopRecording}
            disabled={loadingAudio || playing}
          >
            <Mic size={40} />
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
