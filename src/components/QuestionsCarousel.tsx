
import React from 'react';
import CarouselRow from './CarouselRow';

interface QuestionsCarouselProps {
  onQuestionClick: (question: string) => void;
}

const QuestionsCarousel: React.FC<QuestionsCarouselProps> = ({ onQuestionClick }) => {
  const row1Questions = [
    "Como fazer a IA aprender com o passar do tempo?",
    "Quais são as melhores práticas de produtividade?",
    "Como economizar tempo nas tarefas diárias?",
    "Dicas para melhorar o trabalho remoto",
    "Sugestões para organizar minha agenda",
    "Como otimizar meu fluxo de trabalho?"
  ];

  const row2Questions = [
    "Como escrever e-mails mais eficientes?",
    "Ideias para reuniões mais produtivas",
    "Dicas para melhorar minha concentração",
    "Como gerenciar projetos complexos?",
    "Técnicas de brainstorming eficazes",
    "Como automatizar tarefas repetitivas?"
  ];

  const row3Questions = [
    "Como usar a IA para criar conteúdo?",
    "Dicas para uma boa saúde mental no trabalho",
    "Como evitar procrastinação?",
    "Ferramentas para organização de tarefas",
    "Como implementar a metodologia GTD?",
    "Dicas para estudar de forma eficiente"
  ];

  return (
    <div className="w-full max-w-full relative mb-[30px] mt-5 animate-fadeInUp">
      <div className="w-full mx-auto overflow-hidden mb-5">
        <CarouselRow 
          questions={row1Questions} 
          animationClass="animate-slideRow" 
          onQuestionClick={onQuestionClick}
        />
        
        <CarouselRow 
          questions={row2Questions} 
          animationClass="animate-slideRowReverse" 
          onQuestionClick={onQuestionClick}
        />
        
        <CarouselRow 
          questions={row3Questions} 
          animationClass="animate-slideRowSlow" 
          onQuestionClick={onQuestionClick}
        />
      </div>
    </div>
  );
};

export default QuestionsCarousel;
