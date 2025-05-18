
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import QuestionsCarousel from './QuestionsCarousel';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleQuestionClick = (question: string) => {
    onStartChat(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onStartChat(searchInput);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-5 text-center">
      <div className="mb-10 animate-fadeInDown">
        <div className="text-[48px] font-bold bg-gradient-to-r from-mari-dark-green via-mari-primary-green to-mari-light-green to-mari-primary-green to-mari-dark-green bg-[length:200%_auto] text-transparent bg-clip-text mb-[10px] animate-gradient">
          Oi, sou a Mari
        </div>
        <p className="text-base font-light text-mari-gray tracking-wider">
          Seu assistente de IA inteligente para ajudar no seu dia a dia
        </p>
      </div>
      
      <QuestionsCarousel onQuestionClick={handleQuestionClick} />
      
      <form onSubmit={handleSubmit} className="relative w-full max-w-[500px] mt-10 animate-fadeIn flex flex-col items-center">
        <input
          type="text"
          className="w-full py-4 px-6 rounded-[30px] border-2 border-mari-light-green text-base shadow-md outline-none transition-all duration-300 focus:border-mari-primary-green focus:shadow-lg focus:shadow-mari-primary-green/20 pl-6 pr-12 mb-3"
          placeholder="Digite sua pergunta ou tópico para começar..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        
        <p className="text-sm text-mari-gray opacity-70 animate-pulse mb-6">
          Digite uma pergunta para iniciar a conversa
        </p>
        
        <button 
          type="submit"
          className="bg-mari-primary-green border-none h-12 w-12 rounded-full flex items-center justify-center cursor-pointer text-mari-white transition-all duration-200 hover:bg-mari-dark-green hover:scale-105"
          disabled={!searchInput.trim()}
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  );
};

export default WelcomeScreen;
