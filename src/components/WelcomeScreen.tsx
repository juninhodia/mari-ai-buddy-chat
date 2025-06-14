import React, { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import QuestionsCarousel from './QuestionsCarousel';
import { useAuth } from '../contexts/AuthContext';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
  onStartAudioChat?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat, onStartAudioChat, onLogin, onRegister }) => {
  const [searchInput, setSearchInput] = useState('');
  const { profile, isAuthenticated } = useAuth();

  // Function to get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.trim().split(' ')[0];
  };

  // Function to determine greeting based on time of day
  const getTimeBasedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      return "Boa tarde";
    } else {
      return "Boa noite";
    }
  };

  // Generate greeting text based on authentication status
  const getGreetingText = () => {
    if (isAuthenticated && profile?.name) {
      const firstName = getFirstName(profile.name);
      const timeGreeting = getTimeBasedGreeting();
      return `${timeGreeting}, ${firstName}`;
    }
    return "Oi, sou a Mari";
  };

  const handleQuestionClick = (question: string) => {
    onStartChat(question);
  };

  const handleAudioClick = () => {
    if (onStartAudioChat) {
      onStartAudioChat();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onStartChat(searchInput);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full">
      {/* Top Section: Header */}
      <div className="w-full flex flex-col items-center pt-8 px-4 md:px-6">
        {/* Header Text - Centered */}
        <div className="w-full mb-10 animate-fadeInDown text-center">
          <div className="text-[48px] font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text mb-[10px] animate-gradient leading-tight">
            {getGreetingText()}
          </div>
          <p className="text-base font-light text-mari-gray tracking-wider text-center">
           Assistente da Naturalys para ajudar com suas dúvidas
          </p>
        </div>
      </div>

      {/* Middle Section: Questions Carousel */}
      <div className="w-full flex-grow flex items-center justify-center">
        <div className="w-full transition-all duration-300 ease-in-out">
          {/* Texto "O que você gostaria de saber?" */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium" style={{ color: '#9e9e9e' }}>
              O que você gostaria de saber?
            </p>
          </div>
          <QuestionsCarousel onQuestionClick={handleQuestionClick} />
          
          {/* Botões de Login/Cadastro para usuários não autenticados */}
          {!isAuthenticated && onLogin && onRegister && (
            <div className="w-full flex gap-2 justify-center mt-12 px-4">
              <button
                onClick={onLogin}
                className="px-6 py-2 bg-mari-primary-green text-white rounded-full hover:bg-mari-dark-green transition-colors shadow-lg"
              >
                Entrar
              </button>
              <button
                onClick={onRegister}
                className="px-6 py-2 border border-mari-primary-green text-mari-primary-green rounded-full hover:bg-mari-primary-green hover:text-white transition-colors shadow-lg bg-white"
              >
                Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Input Field */}
      {isAuthenticated && (
        <div className="w-full flex flex-col items-center justify-center mb-8 mt-4 px-4 md:px-6">
          {/* Footer Text for text mode */}
          <div className="w-full mb-3 text-center transition-opacity duration-300">
            <p className="text-sm text-mari-gray opacity-70 animate-pulse text-center">
              Digite uma pergunta para iniciar a conversa
            </p>
          </div>
          
          {/* Form for text input */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl relative transition-all duration-300 ease-in-out flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full py-4 px-8 rounded-[30px] border-2 border-mari-light-green text-base shadow-md outline-none transition-all duration-300 focus:border-mari-primary-green focus:shadow-lg focus:shadow-mari-primary-green/20 pl-8 pr-14"
                placeholder="Digite sua pergunta ou tópico para começar..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-mari-primary-green border-none w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-mari-white transition-all duration-200 hover:bg-mari-dark-green hover:scale-105"
              >
                <Send size={20} />
              </button>
            </div>
            <button 
              type="button"
              onClick={handleAudioClick}
              className="bg-mari-light-green border-none w-12 h-12 rounded-full flex items-center justify-center cursor-pointer text-mari-white transition-all duration-200 hover:bg-mari-primary-green hover:scale-105 shadow-md"
            >
              <Mic size={24} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
