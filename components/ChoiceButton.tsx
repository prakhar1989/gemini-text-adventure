
import React from 'react';

interface ChoiceButtonProps {
  choice: string;
  onChoose: (choice: string) => void;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onChoose }) => {
  return (
    <button
      onClick={() => onChoose(choice)}
      className="w-full text-left p-4 bg-slate-800/70 border border-slate-600 rounded-lg text-slate-200 font-lora hover:bg-amber-800/80 hover:border-amber-500 transition-all duration-300 transform hover:scale-105 shadow-md"
    >
      {choice}
    </button>
  );
};

export default ChoiceButton;
