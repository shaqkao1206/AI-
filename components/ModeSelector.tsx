
import React from 'react';
import { GenerationMode } from '../types';

interface ModeSelectorProps {
  currentMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = Object.values(GenerationMode);

  return (
    <div className="p-2 bg-gray-900 rounded-2xl flex flex-wrap gap-2">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex-1 text-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
            ${
              currentMode === mode
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
