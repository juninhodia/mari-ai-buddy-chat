import React from 'react';
import { MessageSquare, Mic } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'text' | 'audio';
  onModeChange: (mode: 'text' | 'audio') => void;
  isAudioSupported?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ 
  currentMode, 
  onModeChange, 
  isAudioSupported = true 
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={currentMode === 'audio'}
      onClick={() => onModeChange(currentMode === 'text' ? 'audio' : 'text')}
      disabled={!isAudioSupported}
      className={`relative flex items-center w-16 h-8 rounded-full transition-colors duration-200 focus:outline-none border border-mari-primary-green bg-mari-white ${currentMode === 'audio' ? 'bg-mari-primary-green/20' : 'bg-mari-white'}`}
      style={{ minWidth: 64 }}
    >
      <span className="flex items-center justify-center w-8 h-8">
        <MessageSquare size={18} className={currentMode === 'text' ? 'text-mari-primary-green' : 'text-mari-gray'} />
      </span>
      <span className="flex items-center justify-center w-8 h-8">
        <Mic size={18} className={currentMode === 'audio' ? 'text-mari-primary-green' : 'text-mari-gray'} />
      </span>
      {/* Bolinha animada */}
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-mari-primary-green shadow transition-transform duration-200 ${currentMode === 'audio' ? 'translate-x-8' : 'translate-x-0'}`}
        style={{ zIndex: 1 }}
      />
    </button>
  );
};

export default ModeToggle; 