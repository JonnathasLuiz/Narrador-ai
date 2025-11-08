import React from 'react';
import type { Segment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { SpeakerIcon } from '../components/icons/SpeakerIcon';
import ProgressBar from '../components/ProgressBar';
import AudioPlayer from '../components/AudioPlayer';
import { ZipIcon } from '../components/icons/ZipIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { SunIcon } from '../components/icons/SunIcon';

interface Step4Props {
    segments: Segment[];
    isLoading: boolean;
    onGenerateFullAudio: () => void;
    narrationProgress: { current: number; total: number; title: string; };
    fullPodcastAudio: string | null;
    onExportZip: () => void;
    onExportText: () => void;
    isWakeLockActive: boolean;
}

export const Step4_Export: React.FC<Step4Props> = ({
    segments,
    isLoading,
    onGenerateFullAudio,
    narrationProgress,
    fullPodcastAudio,
    onExportZip,
    onExportText,
    isWakeLockActive
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-6">
            <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-3"><span className="bg-indigo-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm">4</span> Revisão Final & Exportação</h2>

            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700/50 space-y-3">
                <h3 className="font-semibold text-gray-300">Ouvir o podcast completo</h3>
                <p className="text-sm text-gray-400">Gere e ouça um único áudio com todos os segmentos narrados em sequência.</p>
                <button onClick={onGenerateFullAudio} disabled={!segments.some(l => l.content) || isLoading} className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <LoadingSpinner /> : <SpeakerIcon className="h-5 w-5" />} Gerar Áudio Completo
                </button>
                {isLoading && narrationProgress.total > 0 && (
                    <div className="pt-2 space-y-2">
                        <ProgressBar
                            current={narrationProgress.current}
                            total={narrationProgress.total}
                            text={`Narrando: ${narrationProgress.title}`}
                        />
                         {isWakeLockActive && (
                            <div className="flex items-center justify-center gap-2 text-xs text-yellow-400/80">
                                <SunIcon className="h-4 w-4" />
                                <span>Mantendo o computador ativo durante a narração...</span>
                            </div>
                        )}
                    </div>
                )}
                {fullPodcastAudio && !isLoading && <AudioPlayer base64Pcm={fullPodcastAudio} />}
            </div>

            <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-gray-300">Opções de Download</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={onExportZip} disabled={!segments.some(l => l.generatedAudio)} className="flex-1 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <ZipIcon /> Baixar Áudios (.zip)
                    </button>
                    <button onClick={onExportText} disabled={segments.length === 0} className="flex-1 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <FileTextIcon /> Baixar Roteiro (.txt)
                    </button>
                </div>
            </div>
        </div>
    );
};