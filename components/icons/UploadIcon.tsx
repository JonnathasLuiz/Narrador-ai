import React from 'react';

export const UploadIcon: React.FC<{ className?: string }> = ({ className = 'h-10 w-10' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l-4-4m4 4l4-4" />
    </svg>
);
