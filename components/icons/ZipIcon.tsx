import React from 'react';

export const ZipIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4M7 2v5h5M7 15h3v-2.5A1.5 1.5 0 0111.5 11h0A1.5 1.5 0 0113 12.5V15h3" />
    </svg>
);
