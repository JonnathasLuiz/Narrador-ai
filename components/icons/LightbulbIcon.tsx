import React from 'react';

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-7.5 0c-1.42 0-2.798-.31-4.125-.872a1.5 1.5 0 01-.625-1.472V12c0-3.042 1.135-5.824 3-7.938m7.5 0a7.5 7.5 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
    />
  </svg>
);
