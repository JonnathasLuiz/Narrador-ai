
import React, { useState, useEffect } from 'react';
import { createWavBlob } from '../utils/audioUtils';

interface AudioPlayerProps {
  base64Pcm: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Pcm }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create a WAV blob and a URL for it when the base64 data changes.
    const wavBlob = createWavBlob(base64Pcm);
    const url = URL.createObjectURL(wavBlob);
    setAudioUrl(url);

    // Cleanup function to revoke the object URL when the component unmounts
    // or when the base64Pcm prop changes, preventing memory leaks.
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [base64Pcm]);

  if (!audioUrl) {
    return <p className="text-gray-400">Preparando áudio...</p>;
  }

  return (
    <audio controls src={audioUrl} className="w-full">
      Seu navegador não suporta o elemento de áudio.
    </audio>
  );
};

export default AudioPlayer;
