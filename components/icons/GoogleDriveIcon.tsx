import React from 'react';

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 48 48">
        <path d="M33.4 34.5l5.6-9.8-13.3-22.9h-11.3l-5.7 9.8 13.4 22.9z" fill="#1e88e5"></path>
        <path d="M12.3 34.5l-5.7-9.8-3.1 5.4.1.1 8.6 14.9 5.7-9.8-5.6-9.8z" fill="#ffc107"></path>
        <path d="M36.5 13.5l-13.4-23-5.6 9.8 13.4 23 5.6-9.8z" fill="#4caf50"></path>
    </svg>
);