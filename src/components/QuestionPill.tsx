import React from 'react';

interface QuestionPillProps {
  question: string;
  onClick: (question: string) => void;
}

const QuestionPill: React.FC<QuestionPillProps> = ({ question, onClick }) => {
  return (
    <span 
      className="bg-mari-very-light-green text-mari-dark-green px-[18px] py-2 rounded-full 
      mr-[15px] whitespace-nowrap cursor-pointer transition-all duration-200 
      shadow-sm border border-mari-light-green text-sm hover:bg-mari-primary-green 
      hover:text-mari-white hover:-translate-y-[3px] hover:shadow-md flex-shrink-0"
      onClick={() => onClick(question)}
    >
      {question}
    </span>
  );
};

export default QuestionPill;
