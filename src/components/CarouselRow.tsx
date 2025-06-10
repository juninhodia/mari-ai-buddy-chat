import React from 'react';
import QuestionPill from './QuestionPill';

interface CarouselRowProps {
  questions: string[];
  animationClass: string;
  onQuestionClick: (question: string) => void;
}

const CarouselRow: React.FC<CarouselRowProps> = ({ 
  questions, 
  animationClass,
  onQuestionClick 
}) => {
  return (
    <div className={`flex w-full ${animationClass} opacity-90 mb-[15px]`}>
      <div className="flex w-full">
        <div className="flex min-w-full justify-start">
          {questions.map((question, index) => (
            <QuestionPill 
              key={`${question}-${index}`} 
              question={question} 
              onClick={onQuestionClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselRow;
