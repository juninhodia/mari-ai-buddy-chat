import React from 'react';
import CarouselRow from './CarouselRow';

interface QuestionsCarouselProps {
  onQuestionClick: (question: string) => void;
}

const QuestionsCarousel: React.FC<QuestionsCarouselProps> = ({ onQuestionClick }) => {
  const naturalysQuestions = [
    "Onde fica a loja Naturalys?",
    "Qual o método de pagamento aceito na loja Naturalys?",
    "Quais produtos são vendidos na loja Naturalys?",
    "A loja Naturalys oferece entrega?",
    "Quais são os horários de funcionamento da loja Naturalys?",
    "tem produtos orgânicos?",
    "faz descontos?",
    "tem programa de fidelidade?",
    "aceita cartões de crédito?",
    "tem estacionamento?",
    "faz entregas em toda a cidade?",
    "tem produtos importados?"
  ];

  const row1Questions = naturalysQuestions.slice(0, 4);
  const row2Questions = naturalysQuestions.slice(4, 8);
  const row3Questions = naturalysQuestions.slice(8, 12);

  return (
    <div className="w-screen max-w-[100vw] relative mb-[30px] mt-5 animate-fadeInUp overflow-hidden">
      <div className="w-full overflow-hidden mb-5">
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
