import React from 'react';

interface StatusIndicatorProps {
  status: 'empty' | 'script' | 'audio';
}

const STATUS_CONFIG = {
  empty: {
    color: 'bg-gray-500',
    tooltip: 'Sem roteiro',
  },
  script: {
    color: 'bg-blue-500',
    tooltip: 'Roteiro gerado',
  },
  audio: {
    color: 'bg-green-500',
    tooltip: 'Áudio narrado',
  },
};

/**
 * Exibe um ponto colorido indicando o status de um segmento do curso.
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const { color, tooltip } = STATUS_CONFIG[status];
  return (
    <span
      className={`h-3 w-3 rounded-full flex-shrink-0 transition-colors ${color}`}
      title={tooltip}
      aria-label={tooltip}
    />
  );
};