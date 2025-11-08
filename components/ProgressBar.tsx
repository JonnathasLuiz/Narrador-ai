import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  text: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, text }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const displayPercentage = Math.min(100, Math.max(0, percentage)); // Garante que a % fique entre 0 e 100

  return (
    <div className="w-full bg-gray-700/50 rounded-lg p-4 space-y-2 border border-gray-600">
      <div className="flex justify-between items-baseline text-sm">
        <p className="font-semibold text-indigo-300 truncate pr-4" title={text}>{text}</p>
        <p className="text-gray-400 font-mono whitespace-nowrap">
          Aula {Math.min(current, total)} de {total}
        </p>
      </div>
      <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${displayPercentage}%` }}
        ></div>
         <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
            {displayPercentage}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;